let posts = [], resources = [], currentPage = 1, postsPerPage = 8;
let fuse;
let searchQuery = '';

const loader = document.getElementById('loader');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const pagination = document.getElementById('pagination');
const scrollTop = document.getElementById('scrollTop');
const themeToggle = document.getElementById('theme-toggle');

// Theme handling
function initializeTheme() {
    const savedTheme = localStorage.getItem('pref-theme');
    if (savedTheme) {
        document.body.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('pref-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('pref-theme')) {
        document.body.classList.toggle('dark', e.matches);
    }
});

window.addEventListener('scroll', () => {
    scrollTop.style.display = window.scrollY > 200 ? 'flex' : 'none';
});

scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function updateURL() {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (searchQuery) params.set('search', searchQuery);
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    history.replaceState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', newURL);
    console.log('Search: Updated URL:', newURL, 'State:', history.state);
}

async function loadPosts() {
    try {
        const res = await fetch('posts/posts.json');
        if (!res.ok) throw new Error('File not found');
        posts = await res.json();
    } catch (error) {
        console.error('Fetch error for posts:', error);
        posts = [];
    }
}

async function loadResources() {
    try {
        const res = await fetch('data/resources.json');
        if (!res.ok) throw new Error('Failed to load resources');
        resources = await res.json();
    } catch (error) {
        console.error('Fetch error for resources:', error);
        resources = [];
    }
}

async function initializeData() {
    loader.classList.add('active');
    await Promise.all([loadPosts(), loadResources()]);
    const startDate = new Date('2025-04-13T00:00:00Z');
    const allItems = [
        ...posts.map(p => ({ ...p, type: 'post', link: p.url || '#' })),
        ...resources.map((r, index) => {
            const pseudoDate = new Date(startDate.getTime() - (resources.length - 1 - index) * 24 * 60 * 60 * 1000);
            return {
                ...r,
                type: r.type || 'resource',
                link: r.link || '#',
                date: pseudoDate.toISOString()
            };
        })
    ];
    fuse = new Fuse(allItems, {
        keys: ['title', 'summary', 'desc'],
        threshold: 0.3
    });
    setTimeout(() => {
        loader.classList.add('no-blur');
    }, 900);
    setTimeout(() => {
        loader.classList.add('hidden');
        loader.classList.remove('active');
        renderResults();
    }, 1200);
}

let debounceTimer;
function debounceSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        renderResults();
    }, 500);
}

searchInput.addEventListener('input', debounceSearch);

function goToPage(page) {
    currentPage = page;
    renderResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderResults() {
    let filtered = [];
    let totalPages = 1;

    if (!searchQuery) {
        const allItems = [
            ...posts.map(p => ({ ...p, type: 'post', link: p.url || '#' })),
            ...resources.map((r, index) => ({
                ...r,
                type: r.type || 'resource',
                link: r.link || '#',
                date: new Date('2025-04-13T00:00:00Z').toISOString()
            }))
        ];
        filtered = allItems.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);
        totalPages = 1;
    } else {
        const fuseRes = fuse.search(searchQuery);
        filtered = fuseRes.map(r => r.item);
        totalPages = Math.ceil(filtered.length / postsPerPage) || 1;
    }

    const start = (currentPage - 1) * postsPerPage;
    const pageItems = filtered.slice(start, start + postsPerPage);

    searchResults.innerHTML = '';
    if (filtered.length === 0 && searchQuery) {
        searchResults.innerHTML = '<li class="no-results">😕 No results found.</li>';
        pagination.innerHTML = '';
        updateURL();
        return;
    }

    pageItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'post-card';
        li.innerHTML = `
            <div class="post-content">
                <h2><a href="${item.link}">${item.title || 'Untitled'}</a></h2>
                <div class="post-meta">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
            </div>
        `;
        searchResults.appendChild(li);
    });

    pagination.innerHTML = '';
    if (totalPages > 1 && searchQuery) {
        let paginationHTML = '';
        if (currentPage > 1) {
            paginationHTML += `<button onclick="goToPage(${currentPage - 1})">Prev</button>`;
        }
        paginationHTML += '<div class="page-buttons">';
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        }
        if (endPage < totalPages) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += '</div>';
        if (currentPage < totalPages) {
            paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next</button>`;
        }
        pagination.innerHTML = paginationHTML;
    }
    updateURL();
}

window.addEventListener('popstate', (event) => {
    const state = event.state || {};
    console.log('Search: Popstate event:', state);
    if (state.path && !state.path.includes('search.html')) {
        // Navigate to the correct page if the state is for another page
        window.location.assign(state.path);
        return;
    }
    currentPage = state.page || 1;
    searchQuery = state.search || '';
    searchInput.value = searchQuery;
    renderResults();
});

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = parseInt(urlParams.get('page')) || 1;
    searchQuery = urlParams.get('search') || '';
    searchInput.value = searchQuery;
    history.replaceState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', window.location.href);
    console.log('Search: Initial state:', history.state);
    initializeTheme();
    initializeData();
});

// Navigation links
document.querySelectorAll('.pill-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.href;
        console.log('Search: Navigating to:', href);
        history.pushState({ page: 1, search: '', path: href }, '', href);
        window.location.href = href; // Use href for cleaner navigation
    });
});