// ==============================================================================
// BISHAL MISTRI CMS - SUPABASE REST & AUTH CLIENT (ZERO DEPENDENCIES)
// ==============================================================================

const STORAGE_KEYS = {
  URL: 'bm_cms_supabase_url',
  ANON_KEY: 'bm_cms_supabase_anon_key',
  SESSION: 'bm_cms_auth_session',
  LOCAL_CONTENT: 'bm_cms_local_content_v1',
  LOCAL_MEDIA: 'bm_cms_local_media_v1',
  LOCAL_TAGS: 'bm_cms_local_tags_v1',
  SETTINGS: 'bm_cms_settings_v1',
};

// Retrieve configured or environment credentials
export function getSupabaseConfig() {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';
  
  const savedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.URL) : null;
  const savedKey = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ANON_KEY) : null;

  return {
    url: (savedUrl || envUrl || '').replace(/\/$/, ''),
    anonKey: savedKey || envKey || '',
    isConfigured: Boolean((savedUrl || envUrl) && (savedKey || envKey))
  };
}

export function saveSupabaseConfig(url, anonKey) {
  if (typeof localStorage === 'undefined') return;
  if (url) localStorage.setItem(STORAGE_KEYS.URL, url.trim().replace(/\/$/, ''));
  else localStorage.removeItem(STORAGE_KEYS.URL);
  
  if (anonKey) localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
}

// Session Management
// Sessions live in localStorage ("keep me logged in") or sessionStorage
// (session-only login). Readers check both; writers target one.
function readJsonStore(store, key) {
  if (typeof store === 'undefined' || store === null) return null;
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function activeStorages() {
  return [
    typeof localStorage !== 'undefined' ? localStorage : null,
    typeof sessionStorage !== 'undefined' ? sessionStorage : null,
  ].filter(Boolean);
}

export function getStoredSession() {
  const [persistentStore, sessionStore] = activeStorages();
  return (
    readJsonStore(persistentStore, STORAGE_KEYS.SESSION) ||
    readJsonStore(sessionStore, STORAGE_KEYS.SESSION)
  );
}

export function saveStoredSession(session, persistent = true) {
  const [persistentStore, sessionStore] = activeStorages();
  const target = persistent ? persistentStore : sessionStore;
  for (const store of [persistentStore, sessionStore]) {
    if (!store) continue;
    if (session && store === target) {
      store.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
      store.removeItem(STORAGE_KEYS.SESSION);
    }
  }
}

// PostgREST & Auth API Request Helper
export async function supabaseRequest(endpoint, options = {}) {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    throw new Error('Supabase is not configured. Please set your Supabase URL & Anon Key in Settings.');
  }

  const session = getStoredSession();
  const token = session?.access_token || anonKey;

  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...options.headers,
  };

  const fullUrl = `${url}${endpoint}`;
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail;
    try {
      errorDetail = await response.json();
    } catch {
      errorDetail = { message: response.statusText };
    }
    const err = new Error(errorDetail.message || errorDetail.error_description || `Supabase error: ${response.status}`);
    err.status = response.status;
    err.details = errorDetail;
    throw err;
  }

  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Auth API Methods

// Access tokens ever minted by the old client-side bypass (no password).
// Any stored session carrying one is rejected outright.
const LEGACY_FAKE_TOKENS = ['studio_pass_local', 'local_studio_session', 'local-admin'];

export const supabaseAuth = {
  async signInWithPassword(email, password) {
    const { url, anonKey } = getSupabaseConfig();
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.message || 'Authentication failed');
    }

    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      user: data.user
    };
    saveStoredSession(session);
    return session;
  },

  async signUp(email, password) {
    const { url, anonKey } = getSupabaseConfig();
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.message || 'Sign up failed');
    }

    if (data.access_token) {
      const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000),
        user: data.user
      };
      saveStoredSession(session);
      return session;
    }
    return data;
  },

  async signOut() {
    try {
      const { url, anonKey } = getSupabaseConfig();
      const session = getStoredSession();
      if (session?.access_token) {
        await fetch(`${url}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${session.access_token}`
          }
        });
      }
    } catch {
      // Ignored
    } finally {
      saveStoredSession(null);
    }
  },

  // Validate the stored session against the Supabase server.
  // Returns the user on success, clears the session and returns null otherwise.
  async validateSession() {
    const session = getStoredSession();
    if (!session || !session.access_token) return null;

    // Reject tokens minted by the old client-side bypass.
    if (LEGACY_FAKE_TOKENS.includes(session.access_token)) {
      saveStoredSession(null);
      return null;
    }

    // Reject locally-expired sessions before hitting the network.
    if (session.expires_at && Date.now() > session.expires_at) {
      saveStoredSession(null);
      return null;
    }

    const { url, anonKey } = getSupabaseConfig();
    if (!url || !anonKey) return null;

    try {
      const res = await fetch(`${url}/auth/v1/user`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) {
        saveStoredSession(null);
        return null;
      }
      return await res.json();
    } catch {
      // Fail closed on network error.
      return null;
    }
  },

  async getUser() {
    const session = getStoredSession();
    if (!session) return null;

    // Check local expiry
    if (session.expires_at && Date.now() > session.expires_at) {
      saveStoredSession(null);
      return null;
    }
    return session.user;
  }
};
