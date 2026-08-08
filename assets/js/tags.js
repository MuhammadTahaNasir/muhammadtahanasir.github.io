// ---------- 0. Page Fade-in Animation ----------
document.addEventListener('DOMContentLoaded', function() {
  const main = document.querySelector('.post-container');
  if (main) main.classList.add('page-fade-in');
});

// ---------- 1. Tag Management and Data Loading ----------
let tagList = []; // Stores list of [tagName, count]
let activeCategory = 'all';
let currentPage = 1;
const ITEMS_PER_PAGE = 15; // 3 columns x 5 rows = 15 tiles per page (flawless height alignment with sidebar!)

// Helper: Determine category from tag name
function getTagCategory(tag) {
  const t = tag.toLowerCase();
  if (t.includes('c++') || t.includes('cpp') || t.includes('rocksdb') || t.includes('docker') || t.includes('aws') || t.includes('system') || t.includes('file')) {
    return 'systems';
  }
  if (t.includes('react') || t.includes('fastapi') || t.includes('flask') || t.includes('html') || t.includes('css') || t.includes('web') || t.includes('dashboard') || t.includes('php') || t.includes('mysql') || t.includes('streamlit')) {
    return 'web';
  }
  if (t.includes('data') || t.includes('nsga') || t.includes('genetic') || t.includes('analytics') || t.includes('scikit')) {
    return 'data';
  }
  return 'ai'; // Default to AI & ML
}

// Helper: Determine tech dot color from tag name
function getTagColor(tag) {
  const t = tag.toLowerCase();
  if (t.includes('python')) return '#3776ab';
  if (t.includes('c++') || t.includes('cpp')) return '#00599c';
  if (t.includes('react')) return '#61dafb';
  if (t.includes('fastapi')) return '#009688';
  if (t.includes('pytorch')) return '#ee4c2c';
  if (t.includes('agent') || t.includes('ai')) return '#a855f7';
  if (t.includes('rag') || t.includes('langchain')) return '#38bdf8';
  if (t.includes('rocksdb')) return '#f59e0b';
  if (t.includes('flask')) return '#64748b';
  if (t.includes('docker') || t.includes('aws')) return '#2496ed';
  if (t.includes('streamlit')) return '#ff4b4b';
  if (t.includes('openai')) return '#10a37f';
  if (t.includes('data') || t.includes('nsga')) return '#ec4899';
  return '#38bdf8';
}

// Safely escape HTML entities
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const loader = document.getElementById('loader');

async function loadTags() {
  if (loader) loader.classList.add('active');
  try {
    const [postsRes, projectsRes] = await Promise.all([
      fetch("posts/posts.json"),
      fetch("projects/projects.json")
    ]);
    
    let postsData = [];
    let projectsData = [];
    
    if (postsRes.ok) postsData = await postsRes.json();
    if (projectsRes.ok) projectsData = await projectsRes.json();

    const tagMap = new Map(); // tag => count

    // Aggregate tags from posts
    postsData.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(tag => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });

    // Aggregate features from projects as tags
    projectsData.forEach(proj => {
      if (Array.isArray(proj.features)) {
        proj.features.forEach(feature => {
          tagMap.set(feature, (tagMap.get(feature) || 0) + 1);
        });
      }
    });

    tagList = [...tagMap.entries()].sort((a, b) => a[0].localeCompare(b[0])); // Alphabetical default
    
    updateCategoryCounts(tagList);
    renderTags();
  } catch (error) {
    console.error('Fetch error:', error);
    const container = document.getElementById('tagsContainer');
    if (container) {
      container.innerHTML = `<div class="no-results">😕 Failed to load tags. Check console.</div>`;
    }
  } finally {
    const l = document.getElementById('loader');
    if (l) {
      l.classList.add('no-blur');
      setTimeout(() => {
        l.classList.add('hidden');
        l.classList.remove('active');
        l.style.display = 'none';
      }, 300);
    }
  }
}

// Global safety fallback to ensure loader never gets stuck on page load
function hidePageLoader() {
  const l = document.getElementById('loader');
  if (l) {
    l.classList.add('no-blur');
    setTimeout(() => {
      l.classList.add('hidden');
      l.classList.remove('active');
      l.style.display = 'none';
    }, 300);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hidePageLoader, 600);
});
window.addEventListener('load', () => {
  hidePageLoader();
});

// Update Category Counter Badges in Desktop Sidebar
function updateCategoryCounts(allTags) {
  const counts = { all: allTags.length, ai: 0, web: 0, systems: 0, data: 0 };
  allTags.forEach(([tag]) => {
    const cat = getTagCategory(tag);
    if (counts[cat] !== undefined) counts[cat]++;
  });

  const elAll = document.getElementById('countAll');
  const elAI = document.getElementById('countAI');
  const elWeb = document.getElementById('countWeb');
  const elSystems = document.getElementById('countSystems');
  const elData = document.getElementById('countData');

  if (elAll) elAll.textContent = counts.all;
  if (elAI) elAI.textContent = counts.ai;
  if (elWeb) elWeb.textContent = counts.web;
  if (elSystems) elSystems.textContent = counts.systems;
  if (elData) elData.textContent = counts.data;

  // Mobile counter badges
  const mobAll = document.getElementById('mobCountAll');
  const mobAI = document.getElementById('mobCountAI');
  const mobWeb = document.getElementById('mobCountWeb');
  const mobSystems = document.getElementById('mobCountSystems');
  const mobData = document.getElementById('mobCountData');

  if (mobAll) mobAll.textContent = counts.all;
  if (mobAI) mobAI.textContent = counts.ai;
  if (mobWeb) mobWeb.textContent = counts.web;
  if (mobSystems) mobSystems.textContent = counts.systems;
  if (mobData) mobData.textContent = counts.data;
}

// Main Render Function handling both Desktop & Mobile Views
function renderTags() {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    renderMobileView();
  } else {
    renderDesktopView();
  }
}

// ---------- Desktop Hybrid View Renderer ----------
function renderDesktopView() {
  const tagsContainer = document.getElementById("tagsContainer");
  const paginationBar = document.getElementById("bentoPagination");
  if (!tagsContainer) return;

  const searchQuery = (document.getElementById('tagSearch')?.value || '').toLowerCase().trim();

  // Filter list by category and search query
  let filtered = [...tagList];
  if (activeCategory !== 'all') {
    filtered = filtered.filter(([tag]) => getTagCategory(tag) === activeCategory);
  }
  if (searchQuery) {
    filtered = filtered.filter(([tag]) => tag.toLowerCase().includes(searchQuery));
  }

  if (filtered.length === 0) {
    tagsContainer.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--secondary);">
        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 12px; color: var(--accent);"></i>
        <h3 style="font-family:'Outfit',sans-serif; color:var(--primary); margin-bottom: 6px;">No tags found</h3>
        <p>Try adjusting your search query or select another category</p>
      </div>
    `;
    if (paginationBar) paginationBar.style.display = 'none';
    return;
  }

  const maxCount = Math.max(...tagList.map(t => t[1]), 1);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // Validate currentPage bounds
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // Slice items for current page
  const pageItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  tagsContainer.innerHTML = pageItems.map(([tag, count]) => {
    const safeName = escapeHtml(String(tag));
    const color = getTagColor(tag);
    const fillPercent = Math.min(100, Math.max(18, (count / maxCount) * 100));

    return `
      <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="bento-tile">
        <div class="bento-tile-left">
          <span class="tech-dot" style="background:${color}; color:${color};"></span>
          <span class="bento-tile-name">${safeName}</span>
        </div>
        <div class="bento-tile-progress">
          <div class="progress-track">
            <div class="progress-fill" style="width: ${fillPercent}%; background: ${color}; box-shadow: 0 0 10px ${color}90;"></div>
          </div>
        </div>
        <div class="bento-tile-right">
          <span class="bento-count-num">${count}</span>
          <i class="fas fa-chevron-right bento-arrow"></i>
        </div>
      </a>
    `;
  }).join('');

  // Render Pagination Bar Controls
  renderPaginationControls(totalPages);
}

// Render Pagination Bar (Prev, Next, Page Dots / Pills)
function renderPaginationControls(totalPages) {
  const paginationBar = document.getElementById("bentoPagination");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const indicators = document.getElementById("pageIndicators");

  if (!paginationBar || totalPages <= 1) {
    if (paginationBar) paginationBar.style.display = 'none';
    return;
  }

  paginationBar.style.display = 'flex';

  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;

  if (indicators) {
    if (totalPages <= 8) {
      // Render animated glass dots for pages
      indicators.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
        <span class="page-dot ${p === currentPage ? 'active' : ''}" data-page="${p}" title="Page ${p}"></span>
      `).join('');
    } else {
      // Render numbered pills for larger page counts
      let pagesToDisplay = [1];
      if (currentPage > 3) pagesToDisplay.push('...');
      for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
        pagesToDisplay.push(p);
      }
      if (currentPage < totalPages - 2) pagesToDisplay.push('...');
      if (totalPages > 1 && !pagesToDisplay.includes(totalPages)) pagesToDisplay.push(totalPages);

      indicators.innerHTML = pagesToDisplay.map(p => {
        if (p === '...') return `<span style="color:var(--secondary); font-size:0.85rem; padding:0 2px;">...</span>`;
        return `
          <button class="page-num-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
        `;
      }).join('');
    }
  }
}

let mobCurrentPage = 1;

// ---------- Mobile Desktop-Adapted View Renderer (Variant 1) ----------
function renderMobileView() {
  const container = document.getElementById('mobileTagsContainer');
  if (!container) return;

  const searchQuery = (document.getElementById('mobileTagSearch')?.value || '').toLowerCase().trim();

  // Filter tagList by category and search query
  let filtered = [...tagList];
  if (activeCategory !== 'all') {
    filtered = filtered.filter(([tag]) => getTagCategory(tag) === activeCategory);
  }
  if (searchQuery) {
    filtered = filtered.filter(([tag]) => tag.toLowerCase().includes(searchQuery));
  }

  renderPopularTags(tagList);

  const mobPaginationBar = document.getElementById('mobileBentoPagination');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; color: var(--secondary);">
        <i class="fas fa-search" style="font-size: 1.8rem; margin-bottom: 10px; color: var(--accent);"></i>
        <h3 style="font-family:'Outfit',sans-serif; color:var(--primary); margin-bottom: 4px;">No tags found</h3>
        <p>Try adjusting your search or selecting another category</p>
      </div>
    `;
    if (mobPaginationBar) mobPaginationBar.style.display = 'none';
    return;
  }

  const MOB_ITEMS_PER_PAGE = 10;
  const totalMobPages = Math.ceil(filtered.length / MOB_ITEMS_PER_PAGE);

  if (mobCurrentPage > totalMobPages) mobCurrentPage = totalMobPages || 1;
  if (mobCurrentPage < 1) mobCurrentPage = 1;

  const pageItems = filtered.slice((mobCurrentPage - 1) * MOB_ITEMS_PER_PAGE, mobCurrentPage * MOB_ITEMS_PER_PAGE);

  container.innerHTML = pageItems.map(([tag, count]) => {
    const safeName = escapeHtml(String(tag));
    return `
      <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">
        <span class="tag-name"># ${safeName}</span>
        <span class="tag-count">${count} ${count === 1 ? 'Item' : 'Items'}</span>
      </a>
    `;
  }).join('');

  // Render Mobile Pagination Controls
  if (mobPaginationBar) {
    if (totalMobPages <= 1) {
      mobPaginationBar.style.display = 'none';
    } else {
      mobPaginationBar.style.display = 'flex';
      const prevBtn = document.getElementById('mobPrevPageBtn');
      const nextBtn = document.getElementById('mobNextPageBtn');
      const mobIndicators = document.getElementById('mobPageIndicators');

      if (prevBtn) prevBtn.disabled = (mobCurrentPage === 1);
      if (nextBtn) nextBtn.disabled = (mobCurrentPage === totalMobPages);

      if (mobIndicators) {
        let pages = [];
        if (totalMobPages <= 3) {
          for (let p = 1; p <= totalMobPages; p++) pages.push(p);
        } else {
          pages.push(1);
          if (mobCurrentPage > 2) pages.push('...');
          if (mobCurrentPage > 1 && mobCurrentPage < totalMobPages) pages.push(mobCurrentPage);
          if (mobCurrentPage < totalMobPages - 1) pages.push('...');
          if (!pages.includes(totalMobPages)) pages.push(totalMobPages);
        }

        mobIndicators.innerHTML = pages.map(p => {
          if (p === '...') return `<span class="page-ellipsis">...</span>`;
          return `<button class="page-num-btn ${p === mobCurrentPage ? 'active' : ''}" data-mobpage="${p}">${p}</button>`;
        }).join('');
      }
    }
  }
}

// Render popular tags section (top 6 by count)
function renderPopularTags(list) {
  const popularContainer = document.getElementById('popularTagsPills');
  if (!popularContainer) return;

  const topTags = [...list].sort((a, b) => b[1] - a[1]).slice(0, 6);

  popularContainer.innerHTML = topTags.map(([tag, count]) => {
    const safeName = escapeHtml(String(tag));
    return `
      <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="popular-tag-pill">
        <i class="fas fa-hashtag"></i>
        <span>${safeName}</span>
        <span class="pill-count">${count}</span>
      </a>
    `;
  }).join('');
}

// Render alphabet navigation A-Z
function renderAlphabetNav(list) {
  const alphabetNav = document.getElementById('alphabetNav');
  if (!alphabetNav) return;

  const letters = [...new Set(list.map(([tag]) => tag[0].toUpperCase()))].sort();

  alphabetNav.innerHTML = letters.map(letter => {
    return `<button class="alphabet-btn" data-letter="${letter}">${letter}</button>`;
  }).join('');

  alphabetNav.querySelectorAll('.alphabet-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const letter = btn.dataset.letter;
      const section = document.getElementById(`section-${letter}`);
      if (section) {
        const headerOffset = 90;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        alphabetNav.querySelectorAll('.alphabet-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 600);
      }
    });
  });
}

// ---------- 2. Event Listeners ----------
document.addEventListener('DOMContentLoaded', () => {
  // Category buttons in desktop sidebar & mobile category track
  const catButtons = document.querySelectorAll('.hybrid-cat-item');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-cat') || 'all';
      currentPage = 1; // Reset to page 1 on category change
      renderTags();
    });
  });

  const mobCatButtons = document.querySelectorAll('.mob-cat-pill');
  mobCatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      mobCatButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-cat') || 'all';
      renderTags();
    });
  });

  // Search input handlers
  const desktopSearch = document.getElementById('tagSearch');
  if (desktopSearch) {
    desktopSearch.addEventListener('input', () => {
      currentPage = 1; // Reset to page 1 on search
      renderTags();
    });
  }

  const mobileSearch = document.getElementById('mobileTagSearch');
  if (mobileSearch) {
    mobileSearch.addEventListener('input', () => renderTags());
  }

  // Pagination Prev / Next Buttons & Indicators Listeners
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pageIndicators = document.getElementById('pageIndicators');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTags();
        scrollToBentoTop();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      renderTags();
      scrollToBentoTop();
    });
  }

  if (pageIndicators) {
    pageIndicators.addEventListener('click', (e) => {
      const target = e.target.closest('[data-page]');
      if (!target) return;
      const p = parseInt(target.getAttribute('data-page'), 10);
      if (!isNaN(p)) {
        currentPage = p;
        renderTags();
        scrollToBentoTop();
      }
    });
  }

  // Mobile Pagination Prev / Next Buttons & Indicators Listeners
  const mobPrevBtn = document.getElementById('mobPrevPageBtn');
  const mobNextBtn = document.getElementById('mobNextPageBtn');
  const mobIndicators = document.getElementById('mobPageIndicators');

  if (mobPrevBtn) {
    mobPrevBtn.addEventListener('click', () => {
      if (mobCurrentPage > 1) {
        mobCurrentPage--;
        renderTags();
        scrollToMobileTagsTop();
      }
    });
  }

  if (mobNextBtn) {
    mobNextBtn.addEventListener('click', () => {
      mobCurrentPage++;
      renderTags();
      scrollToMobileTagsTop();
    });
  }

  if (mobIndicators) {
    mobIndicators.addEventListener('click', (e) => {
      const target = e.target.closest('[data-mobpage]');
      if (!target) return;
      const p = parseInt(target.getAttribute('data-mobpage'), 10);
      if (!isNaN(p)) {
        mobCurrentPage = p;
        renderTags();
        scrollToMobileTagsTop();
      }
    });
  }
});

function scrollToMobileTagsTop() {
  const container = document.getElementById('mobileTagsContainer');
  if (container) {
    const topPos = container.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: topPos, behavior: 'smooth' });
  }
}

function scrollToBentoTop() {
  const container = document.querySelector('.desktop-hybrid-view');
  if (container) {
    const topPos = container.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: topPos, behavior: 'smooth' });
  }
}

// Theme Toggle Handler
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    html.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('pref-theme', newTheme);
  });
}

// Header Scroll Handler
const headerEl = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (headerEl) {
    if (window.scrollY > 20) {
      headerEl.classList.add('scrolled');
    } else {
      headerEl.classList.remove('scrolled');
    }
  }
});

// Scroll-to-Top Handler
const scrollTopBtn = document.getElementById("scrollTop");
if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    scrollTopBtn.style.display = window.scrollY > 200 ? "flex" : "none";
  });
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Window resize handler to seamlessly update desktop/mobile rendering
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    renderTags();
  }, 200);
});

// ---------- 3. Initialize Page ----------
loadTags();