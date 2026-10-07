/* ------------------------------------------------------------------
   Custom video player — replaces native browser controls on article
   videos with the designed player chrome.

   Two integrations:
   - Public article pages: enhanceVideos(root) wraps each
     <video controls> in the player (full takeover).
   - Admin editor: the editor renders <EditorVideoChrome>, which builds
     the same chrome as an overlay and calls wirePlayer(video, ui).
   ------------------------------------------------------------------ */

import './VideoPlayer.css';

export const ICONS = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pause:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/></svg>',
  replay:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.6-6.4"/><path d="M3 4v5h5" fill="none"/></svg>',
  volume:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9.4 9.4 0 0 1 0 13"/></svg>',
  muted:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>',
  fullscreen:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  fsExit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>',
};

export function fmt(t) {
  if (!isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return (h ? h + ':' : '') + mm + ':' + String(s).padStart(2, '0');
}

/** The chrome HTML. `ui` must be an element the caller positions. */
export function chromeHTML() {
  return `<div class="vp-clicklayer"></div>
     <div class="vp-chrome">
       <button type="button" class="vp-bigplay" aria-label="Play">${ICONS.play}</button>
       <div class="vp-spinner"></div>
       <div class="vp-flash vp-flash-left"></div>
       <div class="vp-flash vp-flash-right"></div>
       <div class="vp-bar">
         <div class="vp-seek" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
           <div class="vp-seek-track">
             <div class="vp-seek-buffered"></div>
             <div class="vp-seek-fill"></div>
             <div class="vp-seek-knob"></div>
           </div>
         </div>
         <div class="vp-row">
           <button type="button" class="vp-btn vp-playbtn" aria-label="Play">${ICONS.play}</button>
           <span class="vp-time"><span class="vp-cur">0:00</span><span class="vp-sep">/</span><span class="vp-dur">0:00</span></span>
           <span class="vp-spacer"></span>
           <button type="button" class="vp-btn vp-mutebtn" aria-label="Mute">${ICONS.volume}</button>
           <button type="button" class="vp-btn vp-fsbtn" aria-label="Fullscreen">${ICONS.fullscreen}</button>
         </div>
       </div>
     </div>`;
}

/**
 * Wire the chrome UI to a video element.
 * @param {HTMLVideoElement} video
 * @param {HTMLElement} ui      element with class "vp" containing the chrome
 * @param {object} opts         { fullscreenTarget?: HTMLElement }
 * @returns cleanup function
 */
export function wirePlayer(video, ui, opts = {}) {
  const q = (sel) => ui.querySelector(sel);
  const clickLayer = q('.vp-clicklayer');
  const bigplay = q('.vp-bigplay');
  const playBtn = q('.vp-playbtn');
  const muteBtn = q('.vp-mutebtn');
  const fsBtn = q('.vp-fsbtn');
  const seek = q('.vp-seek');
  const fill = q('.vp-seek-fill');
  const buffered = q('.vp-seek-buffered');
  const knob = q('.vp-seek-knob');
  const curEl = q('.vp-cur');
  const durEl = q('.vp-dur');
  const flashL = q('.vp-flash-left');
  const flashR = q('.vp-flash-right');
  const fsTarget = opts.fullscreenTarget || ui;

  const listeners = [];
  const on = (el, ev, fn, o) => {
    el.addEventListener(ev, fn, o);
    listeners.push([el, ev, fn, o]);
  };

  let idleTimer = null;
  let clickTimer = null;
  let scrubbing = false;

  const setState = () => {
    const playing = !video.paused && !video.ended;
    ui.classList.toggle('vp-playing', playing);
    ui.classList.toggle('vp-ended', video.ended);
    playBtn.innerHTML = video.ended ? ICONS.replay : playing ? ICONS.pause : ICONS.play;
    playBtn.setAttribute('aria-label', video.ended ? 'Replay' : playing ? 'Pause' : 'Play');
    bigplay.innerHTML = video.ended ? ICONS.replay : ICONS.play;
    bigplay.setAttribute('aria-label', video.ended ? 'Replay' : 'Play');
    muteBtn.innerHTML = video.muted || video.volume === 0 ? ICONS.muted : ICONS.volume;
    pokeIdle();
  };

  const pokeIdle = () => {
    clearTimeout(idleTimer);
    ui.classList.remove('vp-idle');
    if (!video.paused && !video.ended) {
      idleTimer = setTimeout(() => ui.classList.add('vp-idle'), 2600);
    }
  };

  const togglePlay = () => {
    if (video.ended) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const updateTime = () => {
    const d = video.duration || 0;
    const c = video.currentTime || 0;
    const pct = d > 0 ? (c / d) * 100 : 0;
    fill.style.width = pct + '%';
    knob.style.left = pct + '%';
    curEl.textContent = fmt(c);
    durEl.textContent = fmt(d);
    seek.setAttribute('aria-valuenow', String(Math.round(pct)));
  };

  const updateBuffered = () => {
    try {
      const d = video.duration || 0;
      const b = video.buffered;
      if (d > 0 && b.length) {
        buffered.style.width = Math.min(100, (b.end(b.length - 1) / d) * 100) + '%';
      }
    } catch {
      /* ignore */
    }
  };

  const seekToClientX = (clientX) => {
    const r = seek.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    if (video.duration) video.currentTime = ratio * video.duration;
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (fsTarget.requestFullscreen) {
      fsTarget.requestFullscreen().catch(() => {});
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  };

  on(video, 'play', setState);
  on(video, 'pause', setState);
  on(video, 'ended', setState);
  on(video, 'timeupdate', updateTime);
  on(video, 'loadedmetadata', () => {
    updateTime();
    updateBuffered();
  });
  on(video, 'progress', updateBuffered);
  on(video, 'durationchange', updateTime);
  on(video, 'volumechange', setState);
  on(video, 'waiting', () => ui.classList.add('vp-buffering'));
  on(video, 'playing', () => ui.classList.remove('vp-buffering'));
  on(video, 'canplay', () => ui.classList.remove('vp-buffering'));

  on(playBtn, 'click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  on(bigplay, 'click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  on(muteBtn, 'click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
  });
  on(fsBtn, 'click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });
  on(document, 'fullscreenchange', () => {
    const fs = !!document.fullscreenElement;
    fsBtn.innerHTML = fs ? ICONS.fsExit : ICONS.fullscreen;
    fsBtn.setAttribute('aria-label', fs ? 'Exit fullscreen' : 'Fullscreen');
  });

  on(seek, 'pointerdown', (e) => {
    e.stopPropagation();
    pokeIdle();
    scrubbing = true;
    seek.classList.add('vp-scrubbing');
    try {
      seek.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    seekToClientX(e.clientX);
  });
  on(seek, 'pointermove', (e) => {
    if (scrubbing) seekToClientX(e.clientX);
  });
  const endScrub = () => {
    scrubbing = false;
    seek.classList.remove('vp-scrubbing');
  };
  on(seek, 'pointerup', endScrub);
  on(seek, 'pointercancel', endScrub);
  on(seek, 'keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      const d = video.duration || 0;
      video.currentTime = Math.max(0, Math.min(d, video.currentTime + (e.key === 'ArrowRight' ? 5 : -5)));
    }
  });

  const flash = (el, label) => {
    el.textContent = label;
    el.classList.remove('vp-show');
    void el.offsetWidth;
    el.classList.add('vp-show');
  };
  on(clickLayer, 'click', () => {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(togglePlay, 240);
  });
  on(clickLayer, 'dblclick', (e) => {
    clearTimeout(clickTimer);
    const r = ui.getBoundingClientRect();
    const back = e.clientX < r.left + r.width / 2;
    const d = video.duration || Infinity;
    video.currentTime = Math.max(0, Math.min(d, video.currentTime + (back ? -10 : 10)));
    flash(back ? flashL : flashR, back ? '−10s' : '+10s');
  });

  on(ui, 'pointermove', pokeIdle);
  on(ui, 'pointerdown', pokeIdle);
  on(ui, 'touchstart', pokeIdle, { passive: true });

  on(ui, 'keydown', (e) => {
    if (e.target.closest && e.target.closest('.vp-seek')) return;
    // Let focused buttons handle Space/Enter natively (avoids double toggle).
    if (e.target.closest && e.target.closest('.vp-btn') && (e.key === ' ' || e.key === 'Enter')) return;
    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'ArrowRight':
        video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        video.muted = false;
        break;
      case 'ArrowDown':
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        break;
      case 'm':
      case 'M':
        video.muted = !video.muted;
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      default:
        return;
    }
    pokeIdle();
  });

  updateTime();
  setState();

  return () => {
    clearTimeout(idleTimer);
    clearTimeout(clickTimer);
    listeners.forEach(([el, ev, fn, o]) => el.removeEventListener(ev, fn, o));
  };
}

/** Full-takeover player for public pages: wraps the video. */
function createPlayer(video) {
  const wasPlaying = !video.paused && !video.ended;
  const resumeAt = video.currentTime || 0;
  video.removeAttribute('controls');
  video.setAttribute('data-vp', 'enhanced');
  if (!video.getAttribute('preload')) video.preload = 'metadata';

  const wrap = document.createElement('div');
  wrap.className = 'vp';
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', 'Video player');
  video.before(wrap);
  wrap.appendChild(video);
  wrap.insertAdjacentHTML('beforeend', chromeHTML());

  const cleanupWire = wirePlayer(video, wrap);

  if (resumeAt > 0 && isFinite(resumeAt)) {
    try {
      video.currentTime = resumeAt;
    } catch {
      /* ignore */
    }
  }
  if (wasPlaying || video.autoplay) {
    video.play().catch(() => {});
  }

  return () => {
    cleanupWire();
    wrap.before(video);
    wrap.remove();
    video.removeAttribute('data-vp');
    video.setAttribute('controls', '');
  };
}

/** Enhance every not-yet-enhanced <video controls> under root. */
export function enhanceVideos(root) {
  if (!root || !root.querySelectorAll) return () => {};
  const cleanups = [];
  root.querySelectorAll('video[controls]:not([data-vp])').forEach((v) => {
    try {
      cleanups.push(createPlayer(v));
    } catch {
      /* leave native controls on failure */
    }
  });
  return () => cleanups.forEach((fn) => fn());
}
