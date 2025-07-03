const loader = document.getElementById('loader');
const resourcesGrid = document.getElementById('resourcesGrid');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');

let currentPage = 1;
const itemsPerPage = 8;
let searchQuery = '';
let debounceTimeout = null;
let isResourcesLoaded = false;

function updateURL() {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (searchQuery) params.set('search', searchQuery);
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Updating URL:', newURL, 'State:', { page: currentPage, search: searchQuery, path: window.location.pathname });
    history.pushState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', newURL);
}

async function loadResources(page = 1, forceReload = false) {
    if (!isResourcesLoaded || forceReload) {
        loader.classList.add('active');
    }

    try {
        console.log('Loading resources: page=', page);
        const res = await fetch("data/resources.json?t=" + Date.now());
        if (!res.ok) throw new Error("Failed to load resources");
        const resources = await res.json();
        resourcesGrid.innerHTML = "";

        let filteredResources = resources.filter(resource => {
            const searchLower = searchQuery.toLowerCase();
            return (
                resource.title.toLowerCase().includes(searchLower) ||
                (resource.description || resource.desc || '').toLowerCase().includes(searchLower)
            );
        });

        if (filteredResources.length === 0) {
            resourcesGrid.innerHTML = `<p class="no-results">😕 No resources found.</p>`;
            pagination.innerHTML = '';
            updateURL();
            isResourcesLoaded = true;
            return;
        }

        const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedResources = filteredResources.slice(startIndex, endIndex);

        paginatedResources.forEach((r) => {
            const card = document.createElement("div");
            card.className = "resource-card";
            card.innerHTML = `
                <i class="${r.thumbnail} card-thumb"></i>
                <h3 class="card-title">${r.title}</h3>
                <p class="card-desc">${r.description || r.desc || 'No description available'}</p>
                <a href="${r.link}" class="card-btn" ${r.type === "Link" ? 'target="_blank"' : ''}>View</a>
            `;
            resourcesGrid.appendChild(card);
        });

        let paginationHTML = '';
        if (totalPages > 1) {
            console.log('Generating pagination: currentPage=', page, 'totalPages=', totalPages);
            if (page > 1) {
                paginationHTML += `<button onclick="goToPage(${page - 1})">Prev</button>`;
            }
            paginationHTML += '<div class="page-buttons">';
            const maxPagesToShow = 5;
            let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }
            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `<button class="${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            }
            if (endPage < totalPages) {
                paginationHTML += `<span>...</span>`;
            }
            paginationHTML += '</div>';
            if (page < totalPages) {
                paginationHTML += `<button onclick="goToPage(${page + 1})">Next</button>`;
            }
        }
        pagination.innerHTML = paginationHTML;
        updateURL();
        isResourcesLoaded = true;
    } catch (error) {
        console.error("Error loading resources:", error);
        resourcesGrid.innerHTML = "<p>Error loading resources. Please try again later.</p>";
    } finally {
        if (!isResourcesLoaded || forceReload) {
            setTimeout(() => {
                loader.classList.add('no-blur');
            }, 900);
            setTimeout(() => {
                loader.classList.add('hidden');
                loader.classList.remove('active');
            }, 1200);
        }
    }
}

function goToPage(page) {
    console.log('Going to page:', page);
    currentPage = page;
    loadResources(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function debounceSearch() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        searchQuery = searchInput.value;
        currentPage = 1;
        loadResources(currentPage);
    }, 500);
}

searchInput.addEventListener("input", debounceSearch);

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("pref-theme", document.body.classList.contains("dark") ? "dark" : "light");
});

const savedTheme = localStorage.getItem("pref-theme");
if (savedTheme) {
    document.body.classList.toggle("dark", savedTheme === "dark");
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add("dark");
}

window.addEventListener("scroll", () => {
    document.getElementById("scrollTop").style.display = window.scrollY > 200 ? "flex" : "none";
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener('popstate', (event) => {
    const state = event.state || {};
    console.log('Popstate event:', state, 'URL:', window.location.href);

    // Always handle state for resources.html
    currentPage = state.page || 1;
    searchQuery = state.search || '';
    searchInput.value = searchQuery;
    isResourcesLoaded = false;
    loadResources(currentPage, true);
});

window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = parseInt(urlParams.get('page')) || 1;
    searchQuery = urlParams.get('search') || '';
    searchInput.value = searchQuery;
    console.log('Initial load: page=', currentPage, 'search=', searchQuery);
    history.replaceState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', window.location.href);
    isResourcesLoaded = false;
    loadResources(currentPage, true);
});

document.querySelectorAll('.pill-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        console.log('Navigating to:', href);

        if (href && href !== '#' && !href.startsWith('#')) {
            // Cross-page navigation
            history.pushState({ page: 1, search: '', path: href }, '', href);
            window.location.assign(href);
        } else if (href === '#search') {
            // In-page search action
            console.log('In-page action: Focusing search input');
            document.getElementById('searchInput').focus();
            // Push state to allow back/forward navigation for search focus
            history.pushState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', window.location.href);
        } else {
            console.error('Invalid href:', href);
        }
    });
});