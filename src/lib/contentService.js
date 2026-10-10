// ==============================================================================
// BISHAL MISTRI PERSONAL CMS - UNIFIED CONTENT & MEDIA SERVICE
// ==============================================================================

import { supabaseRequest, getSupabaseConfig, getStoredSession } from './supabase';
import { portfolioData } from '../data/portfolioData';

const LOCAL_STORAGE_KEYS = {
  CONTENT: 'bm_cms_content_items_v2',
  TAGS: 'bm_cms_tags_v2',
  MEDIA: 'bm_cms_media_items_v2',
  SETTINGS: 'bm_cms_portal_settings_v2',
};

// NOTE: intentionally empty. Supabase is the single source of truth for content.
// Fictional fallback seeds used to render as real cards on the live site whenever
// a fetch failed, and shadowed real data. An empty store is honest.
function getInitialSeedContent() {
  return [];
}

// Initial realistic media library items
function getInitialSeedMedia() {
  return [];
}

// Local Storage Helper Functions
function getLocalItems(key, defaultFn) {
  if (typeof localStorage === 'undefined') return defaultFn();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = defaultFn();
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return defaultFn();
  }
}

function setLocalItems(key, items) {
  if (typeof localStorage === 'undefined') return;
  const write = (v) => localStorage.setItem(key, JSON.stringify(v));
  try {
    write(items);
  } catch {
    // Quota exceeded (~5MB browser limit): embedded data-URI file payloads
    // are the bloat — drop them first and keep only the newer half, then
    // retry once. This cache is best-effort (Supabase is the source of
    // truth), so a cache write must never fail the caller's upload.
    try {
      const arr = Array.isArray(items) ? items : [];
      const slim = arr.map((it) =>
        it && typeof it.url === 'string' && it.url.startsWith('data:')
          ? { ...it, url: '' }
          : it
      );
      write(slim.slice(0, Math.max(1, Math.ceil(slim.length / 2))));
    } catch {
      /* best-effort cache — give up silently */
    }
  }
}

// Utility: Generate RFC4122 v4 UUID
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Utility: Generate URL-safe slug
export function generateSlug(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Utility: Calculate Reading Time
export function calculateReadingTime(content) {
  if (!content) return '1 min read';
  const noHtml = String(content).replace(/<[^>]*>/g, ' ');
  const clean = noHtml.replace(/[#*`_~[\]()]/g, '');
  const words = clean.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// Lightweight column set for public list views (home, case-study index).
// Skips the heavy `content` HTML column the lists never render.
export const CONTENT_LIST_SELECT =
  'id,title,slug,type,status,excerpt,seo_description,cover_image,metadata,published_at,created_at,order_index,updated_at';

// Content Service API
export const contentService = {
  // 1. Fetch all items (with optional filters)
  async getAll(filters = {}) {
    const { type, status, search, sort = 'order_index', select = '*' } = filters;
    const config = getSupabaseConfig();

    let items = [];

    if (config.isConfigured) {
      try {
        let query = `/rest/v1/content?select=${select}`;
        if (type && type !== 'all') {
          query += `&type=eq.${encodeURIComponent(type)}`;
        }
        if (status && status !== 'all') {
          query += `&status=eq.${encodeURIComponent(status)}`;
        }
        query += '&order=order_index.asc.nullslast,updated_at.desc';
        items = await supabaseRequest(query);
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err.message);
        items = getLocalItems(LOCAL_STORAGE_KEYS.CONTENT, getInitialSeedContent);
      }
    } else {
      items = getLocalItems(LOCAL_STORAGE_KEYS.CONTENT, getInitialSeedContent);
    }

    // Apply Client-Side Filters & Search
    let result = [...items];

    if (type && type !== 'all') {
      result = result.filter(item => item.type === type);
    }
    if (status && status !== 'all') {
      result = result.filter(item => item.status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(item =>
        item.title?.toLowerCase().includes(q) ||
        item.slug?.toLowerCase().includes(q) ||
        item.excerpt?.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sort === 'order_index') {
        const ao = (typeof a.order_index === 'number' ? a.order_index : 2147483647);
        const bo = (typeof b.order_index === 'number' ? b.order_index : 2147483647);
        if (ao !== bo) return ao - bo;
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      }
      if (sort === 'updated_desc') return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      if (sort === 'published_desc') return new Date(b.published_at || 0) - new Date(a.published_at || 0);
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sort === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return result;
  },

  // 2. Fetch single item by ID
  async getById(id) {
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        const rows = await supabaseRequest(`/rest/v1/content?id=eq.${encodeURIComponent(id)}&select=*`);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {
        console.warn('Supabase getById failed, using local store:', err.message);
      }
    }
    const items = getLocalItems(LOCAL_STORAGE_KEYS.CONTENT, getInitialSeedContent);
    return items.find(item => item.id === id) || null;
  },

  // 3. Fetch single published item by slug (for public site)
  async getBySlug(slug, type = null) {
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        let query = `/rest/v1/content?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*`;
        if (type) query += `&type=eq.${encodeURIComponent(type)}`;
        const rows = await supabaseRequest(query);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {
        console.warn('Supabase getBySlug failed, using local store:', err.message);
      }
    }
    const items = getLocalItems(LOCAL_STORAGE_KEYS.CONTENT, getInitialSeedContent);
    return items.find(item => item.slug === slug && item.status === 'published' && (!type || item.type === type)) || null;
  },

  // 4. Create new content item
  async create(data) {
    const now = new Date().toISOString();
    const isValidUUID = data.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
    const id = isValidUUID ? data.id : generateUUID();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title || 'untitled');

    const newItem = {
      id,
      title: data.title || 'Untitled Piece',
      slug,
      type: data.type || 'work',
      status: data.status || 'draft',
      excerpt: data.excerpt || '',
      content: sanitizeContent(data.content || ''),
      cover_image: data.cover_image || null,
      thumbnail: data.thumbnail || data.cover_image || null,
      author: data.author || 'Bishal Mistri',
      published_at: data.status === 'published' ? (data.published_at || now) : null,
      created_at: now,
      updated_at: now,
      archived_at: null,
      featured: Boolean(data.featured),
      tags: Array.isArray(data.tags) ? data.tags : [],
      order_index: typeof data.order_index === 'number' ? data.order_index : 0,
      metadata: data.metadata || {},
      seo_title: data.seo_title || data.title || '',
      seo_description: data.seo_description || data.excerpt || '',
      og_image: data.og_image || data.cover_image || null,
      previous_type: null,
      previous_status: null
    };

    // Always update local store
    const localItems = getLocalItems(LOCAL_STORAGE_KEYS.CONTENT, getInitialSeedContent);
    localItems.unshift(newItem);
    setLocalItems(LOCAL_STORAGE_KEYS.CONTENT, localItems);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        const rows = await supabaseRequest('/rest/v1/content', {
          method: 'POST',
          body: JSON.stringify(newItem)
        });
        if (rows && rows.length > 0) return rows[0];
        throw new Error('Supabase did not return the created item.');
      } catch (err) {
        // The item is already kept in the local store above — but the cloud
        // save failed, so fail loudly instead of pretending it synced.
        // A silent failure here is how the admin and the live site diverge.
        throw new Error(`Cloud save failed (${err.message}). Kept locally on this device only — the live site is unchanged.`);
      }
    }

    return newItem;
  },

  // 5. Update existing content item
  async update(id, updates) {
    const now = new Date().toISOString();
    const sanitizedUpdates = {
      ...updates,
      updated_at: now
    };

    if (updates.slug) sanitizedUpdates.slug = generateSlug(updates.slug);
    if (updates.content) sanitizedUpdates.content = sanitizeContent(updates.content);

    // Update local store
    const localItems = getLocalItems(LOCAL_STORAGE_KEYS.CONTENT, getInitialSeedContent);
    const index = localItems.findIndex(item => item.id === id);
    let updatedItem = null;

    if (index !== -1) {
      localItems[index] = { ...localItems[index], ...sanitizedUpdates };
      updatedItem = localItems[index];
      setLocalItems(LOCAL_STORAGE_KEYS.CONTENT, localItems);
    }

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        const rows = await supabaseRequest(`/rest/v1/content?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(sanitizedUpdates)
        });
        if (rows && rows.length > 0) return rows[0];
        throw new Error('Supabase did not return the updated item.');
      } catch (err) {
        // Local copy is already updated above — fail loudly so the admin
        // never shows "Saved" while the live site still has old data.
        throw new Error(`Cloud save failed (${err.message}). Kept locally on this device only — the live site is unchanged.`);
      }
    }

    return updatedItem;
  },

  // 6. Workflow Actions: Publish, Unpublish, Archive, Restore, Delete
  async publish(id, customPublishDate = null) {
    const now = new Date().toISOString();
    return this.update(id, {
      status: 'published',
      published_at: customPublishDate || now,
      archived_at: null
    });
  },

  async unpublish(id) {
    return this.update(id, {
      status: 'draft',
      archived_at: null
    });
  },

  async archive(id) {
    const current = await this.getById(id);
    const now = new Date().toISOString();
    return this.update(id, {
      previous_type: current?.type || 'work',
      previous_status: current?.status || 'published',
      type: 'archive',
      status: 'archived',
      archived_at: now
    });
  },

  async restore(id) {
    const current = await this.getById(id);
    const targetType = current?.previous_type || 'work';
    const targetStatus = current?.previous_status || 'draft';
    return this.update(id, {
      type: targetType,
      status: targetStatus,
      archived_at: null
    });
  },

  async delete(id) {
    const localItems = getLocalItems(LOCAL_STORAGE_KEYS.CONTENT, getInitialSeedContent);
    const filtered = localItems.filter(item => item.id !== id);
    setLocalItems(LOCAL_STORAGE_KEYS.CONTENT, filtered);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabaseRequest(`/rest/v1/content?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
      } catch (err) {
        throw new Error(`Cloud delete failed (${err.message}). The item is still live on the site.`);
      }
    }
    return true;
  },

  // 7. Check Slug Uniqueness
  async isSlugUnique(slug, currentId = null) {
    const clean = generateSlug(slug);
    const all = await this.getAll();
    return !all.some(item => item.slug === clean && item.id !== currentId);
  },

  // 8. Overview Metrics
  async getMetrics() {
    const all = await this.getAll();
    return {
      total: all.length,
      work: all.filter(i => i.type === 'work').length,
      tinkering: all.filter(i => i.type === 'tinkering').length,
      writing: all.filter(i => i.type === 'writing').length,
      archived: all.filter(i => i.status === 'archived' || i.type === 'archive').length,
      drafts: all.filter(i => i.status === 'draft').length,
      published: all.filter(i => i.status === 'published').length,
    };
  }
};

// Media Service API
export const mediaService = {
  async getAll(filters = {}) {
    const { type, search } = filters;
    const config = getSupabaseConfig();
    let items = [];

    if (config.isConfigured) {
      try {
        let query = '/rest/v1/media?select=*&order=created_at.desc';
        if (type && type !== 'all') query += `&type=eq.${encodeURIComponent(type)}`;
        items = await supabaseRequest(query);
      } catch (err) {
        console.warn('Supabase media fetch failed:', err.message);
        items = getLocalItems(LOCAL_STORAGE_KEYS.MEDIA, getInitialSeedMedia);
      }
    } else {
      items = getLocalItems(LOCAL_STORAGE_KEYS.MEDIA, getInitialSeedMedia);
    }

    let result = [...items];
    if (type && type !== 'all') {
      result = result.filter(item => item.type === type);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(item => item.filename?.toLowerCase().includes(q) || item.alt_text?.toLowerCase().includes(q));
    }
    return result;
  },

  // Upload File (Supports Drag & Drop, Paste, Picker)
  async upload(file, metadata = {}) {
    // 1. Validation
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds the 15MB limit.');
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const type = isImage ? 'image' : isVideo ? 'video' : 'document';

    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathName = `${Date.now()}_${safeFilename}`;
    const now = new Date().toISOString();

    const config = getSupabaseConfig();
    let finalUrl = '';

    if (config.isConfigured) {
      try {
        const session = getStoredSession();
        const token = session?.access_token || config.anonKey;
        const uploadRes = await fetch(`${config.url}/storage/v1/object/portfolio-media/${pathName}`, {
          method: 'POST',
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': file.type,
          },
          body: file
        });

        if (uploadRes.ok) {
          finalUrl = `${config.url}/storage/v1/object/public/portfolio-media/${pathName}`;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, converting to local data URI:', err.message);
      }
    }

    // Fallback if not live storage: generate base64 data URL for frictionless local preview
    if (!finalUrl) {
      finalUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const newMedia = {
      id: generateUUID(),
      filename: file.name,
      url: finalUrl,
      type,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: metadata.alt_text || file.name.split('.')[0],
      caption: metadata.caption || '',
      created_at: now
    };

    // Save to local store
    const localMedia = getLocalItems(LOCAL_STORAGE_KEYS.MEDIA, getInitialSeedMedia);
    localMedia.unshift(newMedia);
    setLocalItems(LOCAL_STORAGE_KEYS.MEDIA, localMedia);

    if (config.isConfigured) {
      try {
        await supabaseRequest('/rest/v1/media', {
          method: 'POST',
          body: JSON.stringify(newMedia)
        });
      } catch (err) {
        console.warn('Supabase media record insert failed:', err.message);
      }
    }

    return newMedia;
  },

  async delete(id) {
    const localMedia = getLocalItems(LOCAL_STORAGE_KEYS.MEDIA, getInitialSeedMedia);
    const filtered = localMedia.filter(m => m.id !== id);
    setLocalItems(LOCAL_STORAGE_KEYS.MEDIA, filtered);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabaseRequest(`/rest/v1/media?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Supabase media delete failed:', err.message);
      }
    }
    return true;
  }
};
