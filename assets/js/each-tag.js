// ---------- 0. Page Fade-in Animation ----------
document.addEventListener('DOMContentLoaded', function() {
  const main = document.querySelector('.post-container');
  if (main) main.classList.add('page-fade-in');
});

// ---------- 1. State Management & Initialization ----------
let posts = []; 
let projects = [];
let combinedList = [];
let filteredList = [];
let currentPage = 1; 
const postsPerPage = 6; 
let activeTag = null; 
let searchQuery = '';
let currentSort = 'newest';

const loader = document.getElementById('loader'); 
const params = new URLSearchParams(window.location.search); 
activeTag = params.get('name') || 'Python'; 

// Update Titles & Breadcrumbs
document.getElementById('tagTitle').textContent = activeTag;
const breadcrumbTag = document.getElementById('breadcrumbTag');
if (breadcrumbTag) breadcrumbTag.textContent = activeTag;
document.title = `Tag: ${activeTag} | Muhammad Taha Nasir`;

// Helper: Technology Vector Icon Resolver
function getTagIcon(tag) {
  const t = tag.toLowerCase();
  if (t.includes('python')) return '<i class="fab fa-python"></i>';
  if (t.includes('c++') || t.includes('cpp')) return '<i class="fas fa-microchip"></i>';
  if (t.includes('react')) return '<i class="fab fa-react"></i>';
  if (t.includes('dock') || t.includes('aws')) return '<i class="fab fa-docker"></i>';
  if (t.includes('ai') || t.includes('agent') || t.includes('llm') || t.includes('rag')) return '<i class="fas fa-brain"></i>';
  if (t.includes('web') || t.includes('html') || t.includes('css') || t.includes('fastapi')) return '<i class="fas fa-globe"></i>';
  if (t.includes('data') || t.includes('sql') || t.includes('db')) return '<i class="fas fa-database"></i>';
  return '<i class="fas fa-tag"></i>';
}

// Helper: Category Resolver
function getTagCategory(tag) {
  const t = tag.toLowerCase();
  if (t.includes('c++') || t.includes('cpp') || t.includes('rocksdb') || t.includes('docker') || t.includes('system')) {
    return 'Systems & C++';
  }
  if (t.includes('react') || t.includes('fastapi') || t.includes('flask') || t.includes('web') || t.includes('html')) {
    return 'Web & Full-Stack';
  }
  if (t.includes('ai') || t.includes('agent') || t.includes('llm') || t.includes('rag') || t.includes('prompt') || t.includes('gpt')) {
    return 'AI & Machine Learning';
  }
  return 'Data & Science';
}

// ---------- 2. Post and Project Loading ----------
async function loadPosts() {
  if (loader) loader.classList.add('active'); 
  try {
    const [postsRes, projectsRes] = await Promise.all([
      fetch('../posts/posts.json'),
      fetch('../projects/projects.json')
    ]);
    if (!postsRes.ok) throw new Error('Posts file not found');
    if (!projectsRes.ok) throw new Error('Projects file not found');
    posts = await postsRes.json();
    projects = await projectsRes.json();
    
    processTagData();
    setupEventListeners();
    renderUnifiedList();
  } catch (error) {
    console.error('Fetch error:', error);
    const container = document.getElementById('post-container');
    if (container) {
      container.innerHTML = `<div class="no-results">😕 Failed to load posts. Check console for details.</div>`;
    }
  } finally {
    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
        loader.classList.remove('active');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }, 300);
    }
  }
}

// Helper: Tag Synonym Normalizer
function normalizeTag(tag) {
  if (!tag) return 'Python';
  const t = tag.trim().toLowerCase();
  if (t === 'react' || t === 'reactjs' || t === 'react 19') return 'React';
  if (t === 'python') return 'Python';
  if (t === 'fastapi') return 'FastAPI';
  if (t === 'pytorch') return 'PyTorch';
  if (t === 'gtts' || t === 'whisper' || t === 'webrtc' || t === 'voice ai' || t === 'pipecat' || t === 'voice assistant') return 'Voice AI';
  if (t === 'langgraph' || t === 'agentic ai' || t === 'agents' || t === 'crewai' || t === 'autogen' || t === 'emergency ai') return 'Agentic AI';
  if (t === 'vllm' || t === 'semantic caching') return 'vLLM';
  if (t === 'multi-agent systems' || t === 'multi-agent') return 'Multi-Agent Systems';
  if (t === 'docker' || t === 'aws' || t === 'devsecops') return 'DevSecOps';
  if (t === 'grafana' || t === 'mlops' || t === 'data drift') return 'MLOps';
  if (t === 'rag & langchain' || t === 'rag' || t === 'vector databases' || t === 'chroma db' || t === 'langchain') return 'RAG & LangChain';
  if (t === 'groq llama' || t === 'llm' || t === 'generative ai' || t === 'groq llama 3') return 'Generative AI';
  if (t === 'tailwind css' || t === 'tailwind' || t === 'css' || t === 'html5' || t === 'web & full-stack') return 'Web & Full-Stack';
  if (t === 'c++' || t === 'cpp' || t === 'rtl' || t === 'verilog' || t === 'systems & c++' || t === 'assembly') return 'Systems & C++';
  return tag;
}

// ---------- 3. Data Processing ----------
function processTagData() {
  const normTag = normalizeTag(activeTag);

  // Update Icon & Category Header
  const bigIconContainer = document.getElementById('tagBigIcon');
  if (bigIconContainer) bigIconContainer.innerHTML = getTagIcon(activeTag);
  
  const categoryElem = document.getElementById('tagCategory');
  if (categoryElem) categoryElem.textContent = getTagCategory(activeTag);

  // Filter posts and projects matching tag (exact + normalized case-insensitive)
  let filteredPosts = posts.filter(post => {
    if (!Array.isArray(post.tags)) return false;
    return post.tags.some(t => t.toLowerCase() === activeTag.toLowerCase() || t.toLowerCase() === normTag.toLowerCase());
  });
  let filteredProjects = projects.filter(project => {
    if (!Array.isArray(project.features)) return false;
    return project.features.some(f => f.toLowerCase() === activeTag.toLowerCase() || f.toLowerCase() === normTag.toLowerCase());
  });

  // Smart Fallback: If 0 items matched exact tags, search by keyword in titles, summaries & features
  if (filteredPosts.length === 0 && filteredProjects.length === 0) {
    const term = activeTag.toLowerCase();
    filteredPosts = posts.filter(p => 
      (p.title && p.title.toLowerCase().includes(term)) || 
      (p.summary && p.summary.toLowerCase().includes(term))
    );
    filteredProjects = projects.filter(pr => 
      (pr.title && pr.title.toLowerCase().includes(term)) || 
      (pr.summary && pr.summary.toLowerCase().includes(term)) || 
      (Array.isArray(pr.features) && pr.features.some(f => f.toLowerCase().includes(term)))
    );
  }

  // Update counts
  const postCountElem = document.getElementById('tagPostCount');
  if (postCountElem) postCountElem.textContent = filteredPosts.length;

  const projectCountElem = document.getElementById('tagProjectCount');
  if (projectCountElem) projectCountElem.textContent = filteredProjects.length;

  // Map into unified objects
  let mappedPosts = filteredPosts.map(post => ({
    type: 'post',
    date: post.date ? post.date.split('T')[0] : '',
    time: post.time || '',
    title: post.title,
    url: '../' + post.url,
    thumbnail: post.thumbnail,
    summary: post.summary,
    author: post.author || 'Muhammad Taha Nasir'
  }));

  let mappedProjects = filteredProjects.map(project => ({
    type: 'project',
    date: project.date || '',
    time: '',
    title: project.title,
    url: '..' + project.url,
    thumbnail: project.thumbnail,
    summary: project.description,
    author: project.author || 'Muhammad Taha Nasir'
  }));

  combinedList = [...mappedPosts, ...mappedProjects];
}

// ---------- 4. Event Listeners for Live Search & Sorting ----------
function setupEventListeners() {
  const searchInput = document.getElementById('tagSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      currentPage = 1;
      renderUnifiedList();
    });
  }

  const sortSelect = document.getElementById('tagSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderUnifiedList();
    });
  }
}

// ---------- 5. Filter & Sort Logic ----------
function applyFilterAndSort() {
  let list = combinedList.filter(item => {
    if (!searchQuery) return true;
    return item.title.toLowerCase().includes(searchQuery) ||
           (item.summary && item.summary.toLowerCase().includes(searchQuery));
  });

  list.sort((a, b) => {
    if (currentSort === 'newest') return (b.date || '').localeCompare(a.date || '');
    if (currentSort === 'oldest') return (a.date || '').localeCompare(b.date || '');
    if (currentSort === 'a-z') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  return list;
}

// ---------- 6. Render Unified Bento Grid ----------
function renderUnifiedList() {
  filteredList = applyFilterAndSort();
  
  const countLabel = document.getElementById('tagItemsCount');
  if (countLabel) {
    countLabel.innerHTML = `Showing <strong>${filteredList.length}</strong> items tagged with <strong>${activeTag}</strong>`;
  }

  const container = document.getElementById('post-container');
  container.innerHTML = '';
  
  if (filteredList.length === 0) {
    container.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
        <i class="fas fa-search" style="font-size: 2rem; color: var(--secondary); margin-bottom: 12px;"></i>
        <h3>No matching items found</h3>
        <p style="color: var(--secondary);">Try adjusting your search filter.</p>
      </div>
    `;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const itemsToShow = filteredList.slice(startIndex, startIndex + postsPerPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  container.innerHTML = itemsToShow.map(item => {
    const hasThumbnail = item.thumbnail && item.thumbnail !== 'https://via.placeholder.com/300x150';

    return `
      <a href="${item.url}" class="card-a glass-panel">
        ${hasThumbnail ? `<img src="${item.thumbnail}" class="card-a-thumb" alt="${item.title}" loading="lazy" />` : ''}
        <div class="card-a-body">
          <div>
            <span class="card-type-badge ${item.type === 'project' ? 'type-project' : 'type-post'}">
              <i class="${item.type === 'project' ? 'fas fa-code' : 'fas fa-file-alt'}"></i> ${item.type === 'project' ? 'Project' : 'Post'}
            </span>
            <h3 class="card-a-title">${item.title}</h3>
            <p class="card-a-summary">${item.summary || ''}</p>
          </div>
          <div class="card-a-footer">
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(item.date)}${item.time ? ` • ${item.time}` : ''}</span>
            <span><i class="fas fa-arrow-right"></i></span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  renderPagination(totalPages);
}

// ---------- 7. Render Pagination Controls ----------
function renderPagination(totalPages) {
  const container = document.getElementById('pagination');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  const isMobile = window.innerWidth <= 768;
  let pages = [];

  if (totalPages <= (isMobile ? 3 : 5)) {
    for (let p = 1; p <= totalPages; p++) pages.push(p);
  } else {
    pages.push(1);
    if (isMobile) {
      if (currentPage > 2) pages.push('...');
      if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
      if (currentPage < totalPages - 1) pages.push('...');
    } else {
      if (currentPage > 3) pages.push('...');
      for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
        pages.push(p);
      }
      if (currentPage < totalPages - 2) pages.push('...');
    }
    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  let html = `
    <button class="bento-page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
      <i class="fas fa-chevron-left"></i> Prev
    </button>
    <div class="page-buttons">
  ` +
  pages.map(p => {
    if (p === '...') return `<span class="page-ellipsis">...</span>`;
    return `<button class="page-num-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
  }).join('') +
  `
    </div>
    <button class="bento-page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
      Next <i class="fas fa-chevron-right"></i>
    </button>
  `;

  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderUnifiedList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- 8. Theme Toggle & Scroll ----------
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('pref-theme', newTheme);
  });
}

window.addEventListener('scroll', () => {
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) scrollBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
});

const scrollBtn = document.getElementById('scrollTop');
if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- 9. Initialize ----------
loadPosts();