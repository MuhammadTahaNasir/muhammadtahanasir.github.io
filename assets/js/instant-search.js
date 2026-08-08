/**
 * Apple Spotlight Style Real-Time Search Overlay Controller
 * Features: Instant live search across posts, projects, & topics with iOS Spotlight glass aesthetic.
 * Author: Muhammad Taha Nasir (Terry)
 */
(function() {
  'use strict';

  let searchIndex = [];
  let isDataLoaded = false;
  let spotlightOverlay = null;

  // Pre-load search index from posts.json & projects.json
  async function loadSearchData() {
    if (isDataLoaded) return;
    try {
      const [postsRes, projectsRes] = await Promise.all([
        fetch('posts/posts.json').catch(() => fetch('/posts/posts.json')).catch(() => null),
        fetch('projects/projects.json').catch(() => fetch('/projects/projects.json')).catch(() => null)
      ]);

      let posts = [];
      let projects = [];

      if (postsRes && postsRes.ok) posts = await postsRes.json();
      if (projectsRes && projectsRes.ok) projects = await projectsRes.json();

      searchIndex = [
        ...posts.map(p => ({
          title: p.title,
          summary: p.summary || p.description || '',
          url: p.url || (p.slug ? `posts/${p.slug}.html` : 'posts.html'),
          type: 'post',
          badge: 'Post',
          keywords: `${p.title} ${p.summary || ''} ${p.tags ? p.tags.join(' ') : ''} post blog`.toLowerCase()
        })),
        ...projects.map(pr => ({
          title: pr.title,
          summary: pr.summary || pr.description || '',
          url: pr.url || (pr.slug ? `projects/${pr.slug}.html` : 'projects.html'),
          type: 'project',
          badge: 'Project',
          keywords: `${pr.title} ${pr.summary || ''} ${pr.features ? pr.features.join(' ') : ''} ${pr.tags ? pr.tags.join(' ') : ''} project code`.toLowerCase()
        }))
      ];

      isDataLoaded = true;
    } catch (e) {
      console.error('Failed to load spotlight search data:', e);
    }
  }

  // Create Apple Spotlight Modal DOM
  function createSpotlightDOM() {
    if (document.getElementById('appleSpotlightOverlay')) return;

    spotlightOverlay = document.createElement('div');
    spotlightOverlay.id = 'appleSpotlightOverlay';
    spotlightOverlay.className = 'spotlight-overlay';
    spotlightOverlay.innerHTML = `
      <div class="spotlight-modal" role="dialog" aria-modal="true" aria-label="Spotlight Search">
        <div class="spotlight-search-header">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="spotlightInput" placeholder="Search posts, projects, topics..." aria-label="Search" autocomplete="off" />
          <button class="spotlight-cancel-btn" id="spotlightCancelBtn" type="button">Cancel</button>
        </div>
        <div class="spotlight-body" id="spotlightBody">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    document.body.appendChild(spotlightOverlay);

    // Event handlers inside Spotlight Modal
    const input = document.getElementById('spotlightInput');
    const cancelBtn = document.getElementById('spotlightCancelBtn');

    if (input) {
      input.addEventListener('input', (e) => {
        renderSpotlightResults(e.target.value);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeSpotlight);
    }

    spotlightOverlay.addEventListener('click', (e) => {
      if (e.target === spotlightOverlay) {
        closeSpotlight();
      }
    });
  }

  function openSpotlight() {
    loadSearchData();
    createSpotlightDOM();

    if (!spotlightOverlay) spotlightOverlay = document.getElementById('appleSpotlightOverlay');
    if (spotlightOverlay) {
      spotlightOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      const input = document.getElementById('spotlightInput');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 80);
      }
      renderSpotlightDefaultState();
    }
  }

  function closeSpotlight() {
    if (!spotlightOverlay) spotlightOverlay = document.getElementById('appleSpotlightOverlay');
    if (spotlightOverlay) {
      spotlightOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Render Default Suggestions State (Apple Siri Suggestions style)
  function renderSpotlightDefaultState() {
    const body = document.getElementById('spotlightBody');
    if (!body) return;

    body.innerHTML = `
      <div class="spotlight-section-title">
        <i class="fas fa-tags" style="color:var(--accent,#38bdf8);"></i> Suggested Topics
      </div>
      <div class="spotlight-pills-grid">
        <a href="tags.html" class="spotlight-pill"><i class="fas fa-brain" style="color:#a855f7;"></i> Agentic AI</a>
        <a href="tags.html" class="spotlight-pill"><i class="fab fa-python" style="color:#3776ab;"></i> Python</a>
        <a href="tags.html" class="spotlight-pill"><i class="fas fa-bolt" style="color:#009688;"></i> FastAPI</a>
        <a href="tags.html" class="spotlight-pill"><i class="fas fa-robot" style="color:#ee4c2c;"></i> PyTorch</a>
        <a href="tags.html" class="spotlight-pill"><i class="fas fa-layer-group" style="color:#38bdf8;"></i> RAG & LangChain</a>
        <a href="tags.html" class="spotlight-pill"><i class="fas fa-microchip" style="color:#f59e0b;"></i> Systems & C++</a>
      </div>

      <div class="spotlight-section-title">
        <i class="fas fa-compass" style="color:#38bdf8;"></i> Quick Navigation
      </div>
      <div class="spotlight-result-list">
        <a href="posts.html" class="spotlight-result-item">
          <div class="spotlight-item-left">
            <div class="spotlight-item-icon"><i class="fas fa-blog"></i></div>
            <div class="spotlight-item-info">
              <span class="spotlight-item-title">Browse All Posts</span>
              <span class="spotlight-item-desc">Explore deep-dive technical articles & AI guides</span>
            </div>
          </div>
          <span class="spotlight-item-badge">Posts</span>
        </a>
        <a href="projects.html" class="spotlight-result-item">
          <div class="spotlight-item-left">
            <div class="spotlight-item-icon" style="color:#38bdf8; background:rgba(56,189,248,0.15);"><i class="fas fa-code"></i></div>
            <div class="spotlight-item-info">
              <span class="spotlight-item-title">Explore All Projects</span>
              <span class="spotlight-item-desc">View production AI architectures & code repos</span>
            </div>
          </div>
          <span class="spotlight-item-badge">Projects</span>
        </a>
        <a href="tags.html" class="spotlight-result-item">
          <div class="spotlight-item-left">
            <div class="spotlight-item-icon" style="color:#a855f7; background:rgba(168,85,247,0.15);"><i class="fas fa-tags"></i></div>
            <div class="spotlight-item-info">
              <span class="spotlight-item-title">Explore All Technology Tags</span>
              <span class="spotlight-item-desc">Filter by technology, framework, or category</span>
            </div>
          </div>
          <span class="spotlight-item-badge">Tags</span>
        </a>
      </div>
    `;
  }

  // Render Real-Time Filtered Search Results
  function renderSpotlightResults(query) {
    const body = document.getElementById('spotlightBody');
    if (!body) return;

    const q = query.trim().toLowerCase();
    if (!q) {
      renderSpotlightDefaultState();
      return;
    }

    const matches = searchIndex.filter(item => item.keywords.includes(q));

    if (matches.length === 0) {
      body.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: var(--secondary, #94a3b8);">
          <i class="fas fa-search" style="font-size: 2rem; color: var(--accent, #38bdf8); margin-bottom: 12px;"></i>
          <h4 style="font-family:'Outfit',sans-serif; color: var(--primary,#ffffff); margin-bottom: 4px;">No results found for "${escapeHTML(query)}"</h4>
          <p style="font-size: 0.85rem;">Try searching for keywords like "Python", "Voice AI", or "RAG"</p>
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div class="spotlight-section-title">
        <i class="fas fa-search" style="color:#38bdf8;"></i> Top Matches (${matches.length})
      </div>
      <div class="spotlight-result-list">
        ${matches.slice(0, 10).map(item => `
          <a href="${item.url}" class="spotlight-result-item">
            <div class="spotlight-item-left">
              <div class="spotlight-item-icon" style="${item.type === 'project' ? 'color:#38bdf8; background:rgba(56,189,248,0.15);' : ''}">
                <i class="${item.type === 'project' ? 'fas fa-code' : 'fas fa-file-alt'}"></i>
              </div>
              <div class="spotlight-item-info">
                <span class="spotlight-item-title">${escapeHTML(item.title)}</span>
                ${item.summary ? `<span class="spotlight-item-desc">${escapeHTML(item.summary.slice(0, 70))}...</span>` : ''}
              </div>
            </div>
            <span class="spotlight-item-badge">${item.badge}</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Bind Triggers Across Document
  document.addEventListener('DOMContentLoaded', () => {
    // Intercept Header Search Bar Click / Focus
    const headerSearchBar = document.getElementById('headerAISearchBar');
    const headerInput = document.getElementById('headerSearchInput');

    if (headerSearchBar) {
      headerSearchBar.addEventListener('click', (e) => {
        e.preventDefault();
        openSpotlight();
      });
    }

    if (headerInput) {
      headerInput.addEventListener('focus', (e) => {
        e.preventDefault();
        openSpotlight();
      });
      headerInput.addEventListener('click', (e) => {
        e.preventDefault();
        openSpotlight();
      });
    }

    // Ctrl / Cmd + K Shortcut to open Apple Spotlight Search
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSpotlight();
      }
      if (e.key === 'Escape') {
        closeSpotlight();
      }
    });
  });

  // Expose global open methods
  window.openSpotlightSearch = openSpotlight;
  window.closeSpotlightSearch = closeSpotlight;

})();
