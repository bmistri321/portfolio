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

// Initial realistic seed items from Bishal's portfolio
function getInitialSeedContent() {
  const now = new Date().toISOString();
  
  return [
    {
      id: 'varcle-cloud-analytics',
      title: 'Varcle Cloud Analytics Dashboard',
      slug: 'varcle-cloud-analytics',
      type: 'work',
      status: 'published',
      excerpt: 'A real-time data visualization platform providing live telemetry, latency tracking, and autonomous anomaly detection across multi-cloud infrastructure.',
      content: `## Executive Overview\n\nVarcle Cloud Analytics is an enterprise observability and telemetry portal designed to eliminate diagnostic latency for distributed multi-cloud architectures.\n\n### The Problem\nModern microservice systems emit millions of metric points per minute. Engineers often struggle with alert fatigue and fragmented dashboards that take several minutes to locate the root cause of an outage.\n\n### Design & Architecture\n- Built with high-performance real-time WebSockets and Redis pub/sub streams.\n- Canvas-based chart rendering capable of sustaining 60fps at 50,000 datapoints.\n- Weightless, dark-first user interface with contextual AI anomaly drill-downs.\n\n### Impact\n- Reduced infrastructure incident diagnosis time by **45%** with sub-second streaming.\n- Adopted across critical cloud staging environments.`,
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
      author: 'Bishal Mistri',
      published_at: '2024-03-15T10:00:00Z',
      created_at: '2024-03-10T12:00:00Z',
      updated_at: '2024-03-15T10:00:00Z',
      archived_at: null,
      featured: true,
      tags: ['React', 'TypeScript', 'Node.js', 'Redis', 'Observability'],
      metadata: {
        client: 'Varcle Technologies',
        role: 'Lead Full Stack & Product Architect',
        year: '2024',
        duration: '4 Months',
        team: '3 Engineers, 1 Designer',
        tools: ['React', 'TypeScript', 'Node.js', 'Chart.js', 'Docker'],
        projectUrl: 'https://bishalmistri.com/#projects',
        repoUrl: 'https://github.com/bishalmistri/varcle-analytics',
        sections: [
          { title: 'Overview', body: 'Telemetry platform for distributed multi-cloud environments.' },
          { title: 'Problem', body: 'High diagnostic latency and alert fatigue in traditional monitoring.' },
          { title: 'Solution', body: 'Sub-second real-time streaming with intelligent anomaly clustering.' },
          { title: 'Outcome', body: '45% faster incident response and high engineer satisfaction.' }
        ]
      },
      seo_title: 'Varcle Cloud Analytics Dashboard — Case Study by Bishal Mistri',
      seo_description: 'Case study on building real-time telemetry streaming and anomaly detection for multi-cloud systems.',
      og_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'antigravity-dev-toolkit',
      title: 'Antigravity Cloud IDE Extension',
      slug: 'antigravity-dev-toolkit',
      type: 'work',
      status: 'published',
      excerpt: 'A developer productivity suite featuring floating AI context menus, real-time code refactoring suggestions, and zero-latency terminal commands.',
      content: `## The Concept of Weightless Intelligence\n\nTraditional IDE extensions crowd the screen with notifications and static sidebars. Antigravity was engineered to "float"—bringing contextual intelligence forward only when relevant.\n\n### Core Capabilities\n1. **Contextual Action Toolbar**: Floating context menu triggered upon code selection.\n2. **Zero-Latency In-line Suggestions**: Ghost text auto-completion with sub-20ms rendering.\n3. **Insight Drawer**: Slide-over analysis for Big-O complexity and security heuristics.`,
      cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      author: 'Bishal Mistri',
      published_at: '2024-05-20T14:30:00Z',
      created_at: '2024-05-01T08:00:00Z',
      updated_at: '2024-05-20T14:30:00Z',
      archived_at: null,
      featured: true,
      tags: ['TypeScript', 'AI', 'Developer Tools', 'React', 'Lucide'],
      metadata: {
        client: 'Open Source Studio',
        role: 'Creator & Lead Engineer',
        year: '2024',
        duration: '3 Months',
        team: 'Solo Project',
        tools: ['TypeScript', 'React', 'WebSockets', 'Vite', 'Lucide Icons'],
        projectUrl: 'https://bishalmistri.com/#projects',
        repoUrl: 'https://github.com/bishalmistri/antigravity-toolkit',
        sections: [
          { title: 'Philosophy', body: 'Weightless intelligence with zero-friction developer flow.' },
          { title: 'Architecture', body: 'Custom AST parsers running in background web workers.' }
        ]
      },
      seo_title: 'Antigravity Cloud IDE Extension — Case Study',
      seo_description: 'Building a frictionless AI assistant extension for modern cloud editors.',
      og_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fluid-mesh-shader-experiment',
      title: 'Interactive WebGL Fluid Mesh Shader',
      slug: 'fluid-mesh-shader-experiment',
      type: 'tinkering',
      status: 'published',
      excerpt: 'Exploring Navier-Stokes fluid simulation in GLSL shaders responding to cursor velocity and multi-touch gestures.',
      content: `## Experiment Notes\n\nAn experiment exploring GPU-accelerated fluid dynamics on an HTML5 canvas.\n\n- Uses double-buffered framebuffers for velocity and pressure solving.\n- Dynamic chromatic aberration tuned to pointer acceleration.\n- Runs at a solid 60 FPS even on mobile GPUs.`,
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      author: 'Bishal Mistri',
      published_at: '2024-08-10T09:15:00Z',
      created_at: '2024-08-09T18:00:00Z',
      updated_at: '2024-08-10T09:15:00Z',
      archived_at: null,
      featured: false,
      tags: ['WebGL', 'GLSL', 'Shaders', 'Creative Coding', 'Physics'],
      metadata: {
        tools: ['Three.js', 'GLSL', 'WebGL 2.0', 'Canvas API'],
        demoUrl: 'https://bishalmistri.com/playground',
        date: 'August 2024'
      },
      seo_title: 'Interactive WebGL Fluid Mesh Shader — Tinkering by Bishal Mistri',
      seo_description: 'GPU-accelerated interactive fluid dynamics and GLSL experiments.',
      og_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'principles-of-editorial-software-design',
      title: 'The Principles of Quiet & Editorial Software Design',
      slug: 'principles-of-editorial-software-design',
      type: 'writing',
      status: 'published',
      excerpt: 'Why modern tools are suffering from notification fatigue and how designing with editorial restraint creates more mindful digital spaces.',
      content: `## The Modern Noise Problem\n\nEvery application today wants your attention. Badges flash red, toast notifications slide in from all four corners, and progress bars shout at you to complete an onboarding checklist.\n\n### The Shift Toward Editorial Software\nEditorial software does not scream. It prioritizes:\n\n1. **Generous Whitespace**: Giving content room to breathe.\n2. **High-Contrast Typography**: Letting the written word speak first.\n3. **Elevated Surfaces**: Subtle depth rather than heavy outlines.\n\n> "Good design is as little design as possible. Great publishing tools get out of the way of the author."\n\n### Crafting Frictionless Experiences\nWhen building authoring tools, the primary metric is focus. The moment a tool demands you configure five modals before writing a sentence, the creative spark is extinguished.`,
      cover_image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80',
      author: 'Bishal Mistri',
      published_at: '2024-09-01T11:00:00Z',
      created_at: '2024-08-25T14:00:00Z',
      updated_at: '2024-09-01T11:00:00Z',
      archived_at: null,
      featured: true,
      tags: ['Design', 'UI/UX', 'Editorial', 'Philosophy', 'Product'],
      metadata: {
        subtitle: 'Crafting digital environments that respect focus and clarity.',
        readingTime: '4 min read'
      },
      seo_title: 'The Principles of Quiet & Editorial Software Design — Bishal Mistri',
      seo_description: 'An essay on designing mindful, distraction-free publishing experiences.',
      og_image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'draft-ai-workflow-orchestrator',
      title: 'Building Autonomous Multi-Agent Workflows in Node.js',
      slug: 'building-autonomous-multi-agent-workflows',
      type: 'writing',
      status: 'draft',
      excerpt: 'A practical deep dive into task planning, schema validation, and checkpoint protocol design for autonomous AI agents.',
      content: `## Introduction\n\nDesigning agentic AI loops requires strict determinism around nondeterministic LLM outputs.\n\n### Key Pillars\n- JSON Schema enforcement\n- State checkpoints and atomic transaction rollbacks\n- Persistent session hygiene`,
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      author: 'Bishal Mistri',
      published_at: null,
      created_at: now,
      updated_at: now,
      archived_at: null,
      featured: false,
      tags: ['AI', 'Node.js', 'Architecture', 'Agents'],
      metadata: {
        subtitle: 'Engineering reliability and bounded autonomy into modern LLM orchestrations.',
        readingTime: '3 min read'
      },
      seo_title: 'Building Autonomous Multi-Agent Workflows in Node.js',
      seo_description: 'Practical guide to multi-agent state machines and tools.',
      og_image: null
    }
  ];
}

// Initial realistic media library items
function getInitialSeedMedia() {
  return [
    {
      id: 'm1',
      filename: 'varcle-dashboard-telemetry.png',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
      type: 'image',
      mime_type: 'image/png',
      size_bytes: 482000,
      alt_text: 'Varcle Cloud Analytics live data streaming interface',
      caption: 'Real-time telemetry stream overview',
      created_at: '2024-03-10T12:00:00Z'
    },
    {
      id: 'm2',
      filename: 'antigravity-code-intelligence.png',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80',
      type: 'image',
      mime_type: 'image/png',
      size_bytes: 612000,
      alt_text: 'Antigravity developer toolkit context floating menu',
      caption: 'Floating context menu with intelligent refactoring',
      created_at: '2024-05-01T08:00:00Z'
    },
    {
      id: 'm3',
      filename: 'editorial-desk-workspace.jpg',
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80',
      type: 'image',
      mime_type: 'image/jpeg',
      size_bytes: 845000,
      alt_text: 'Clean minimal writing desk with notebook and coffee',
      caption: 'Minimalist editorial workspace',
      created_at: '2024-08-25T14:00:00Z'
    }
  ];
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
  localStorage.setItem(key, JSON.stringify(items));
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
  const clean = content.replace(/[#*`_~[\]()]/g, '');
  const words = clean.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// Utility: Sanitize Content (prevent script injection)
export function sanitizeContent(htmlOrMarkdown) {
  if (!htmlOrMarkdown) return '';
  return String(htmlOrMarkdown)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:[^"']*/gi, '#');
}

// Content Service API
export const contentService = {
  // 1. Fetch all items (with optional filters)
  async getAll(filters = {}) {
    const { type, status, search, sort = 'updated_desc' } = filters;
    const config = getSupabaseConfig();

    let items = [];

    if (config.isConfigured) {
      try {
        let query = '/rest/v1/content?select=*';
        if (type && type !== 'all') {
          query += `&type=eq.${encodeURIComponent(type)}`;
        }
        if (status && status !== 'all') {
          query += `&status=eq.${encodeURIComponent(status)}`;
        }
        query += '&order=updated_at.desc';
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
    const id = data.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
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
      } catch (err) {
        console.warn('Supabase create failed, local item saved:', err.message);
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
      } catch (err) {
        console.warn('Supabase update failed, local item updated:', err.message);
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
        console.warn('Supabase delete failed:', err.message);
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
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
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
