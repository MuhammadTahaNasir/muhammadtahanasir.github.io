// ---------- 1. Global Variables ----------
const loader = document.getElementById('loader'); // Loader element
const resourcesGrid = document.getElementById('resourcesGrid'); // Resources grid container
const pagination = document.getElementById('pagination'); // Pagination container
const searchInput = document.getElementById('searchInput'); // Search input element
const themeToggle = document.getElementById('theme-toggle'); // Theme toggle button
const resourceTypePills = document.getElementById('resourceTypePills');
const sortSelect = document.getElementById('sortSelect');
let currentPage = 1; // Current page for pagination
const itemsPerPage = 8; // Number of items per page
let searchQuery = ''; // Current search query
let debounceTimeout = null; // Timer for debouncing search
let isResourcesLoaded = false; // Flag for resource loading status
let currentCategory = 'all';
let currentSort = '';
let allResources = [];

// ---------- 2. Update URL Parameters ----------
function updateURL() {
    const params = new URLSearchParams(); // Create URL params
    if (currentPage > 1) params.set('page', currentPage); // Add page if not 1
    if (searchQuery) params.set('search', searchQuery); // Add search query if set
    if (currentCategory !== 'all') params.set('category', currentCategory); // Add category if set
    if (currentSort !== 'newest') params.set('sort', currentSort); // Add sort if set
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`; // Build URL
    console.log('Updating URL:', newURL, 'State:', { page: currentPage, search: searchQuery, path: window.location.pathname }); // Log URL and state
    history.pushState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', newURL); // Update browser history
}

// ---------- 3. Load Resources Data ----------
async function loadResources(page = 1, forceReload = false) {
    if (!isResourcesLoaded || forceReload) {
        loader.classList.add('active'); // Show loader
    }

    try {
        console.log('Loading resources: page=', page); // Log page being loaded
        const res = await fetch("data/resources.json?t=" + Date.now()); // Fetch resources with cache-busting
        if (!res.ok) throw new Error("Failed to load resources"); // Handle fetch error
        const resources = await res.json(); // Parse resources JSON
        allResources = resources;
        resourcesGrid.innerHTML = ""; // Clear skeleton UI

        // Extract unique categories
        const uniqueCategories = ['all'];
        resources.forEach(resource => {
            if (resource.type && !uniqueCategories.includes(resource.type)) {
                uniqueCategories.push(resource.type);
            }
        });
        updateTypePills(uniqueCategories);

        let filteredResources = resources.filter(resource => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                resource.title.toLowerCase().includes(searchLower) ||
                (resource.description || resource.desc || '').toLowerCase().includes(searchLower);
            const matchesCategory = currentCategory === 'all' || (resource.type === currentCategory);
            return matchesSearch && matchesCategory;
        });

        // Sort resources
        filteredResources = filteredResources.slice(); // Make a shallow copy
        if (currentSort === 'a-z') {
            filteredResources.sort((a, b) => a.title.localeCompare(b.title));
        } else if (currentSort === 'z-a') {
            filteredResources.sort((a, b) => b.title.localeCompare(a.title));
        }

        if (filteredResources.length === 0) {
            resourcesGrid.innerHTML = `<p class="no-results">😕 No resources found.</p>`; // Show no results
            pagination.innerHTML = ''; // Clear pagination
            updateURL(); // Update URL
            isResourcesLoaded = true; // Mark as loaded
            return;
        }

        const totalPages = Math.ceil(filteredResources.length / itemsPerPage); // Calculate total pages
        const startIndex = (page - 1) * itemsPerPage; // Start index
        const endIndex = startIndex + itemsPerPage; // End index
        const paginatedResources = filteredResources.slice(startIndex, endIndex); // Get resources for current page

        paginatedResources.forEach((r) => {
            const card = document.createElement("div"); // Create resource card
            card.className = "resource-card"; // Set card class
            card.innerHTML = `
        <i class="${r.thumbnail} card-thumb"></i> <!-- Thumbnail icon -->
        <h3 class="card-title">${r.title}</h3> <!-- Resource title -->
        <p class="card-desc">${r.description || r.desc || 'No description available'}</p> <!-- Resource description -->
        <a href="${r.link}" class="card-btn" ${r.type === "Link" ? 'target="_blank"' : ''}>View</a> <!-- View button -->
      `;
            resourcesGrid.appendChild(card); // Append card to grid
        });

        let paginationHTML = ''; // Build pagination
        if (totalPages > 1) {
            console.log('Generating pagination: currentPage=', page, 'totalPages=', totalPages); // Log pagination details
            if (page > 1) {
                paginationHTML += `<button onclick="goToPage(${page - 1})">Prev</button>`; // Previous button
            }
            paginationHTML += '<div class="page-buttons">'; // Page buttons container
            const maxPagesToShow = 5; // Max pages to display
            let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2)); // Start page
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1); // End page
            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1); // Adjust start page
            }
            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `<button class="${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`; // Page buttons
            }
            if (endPage < totalPages) {
                paginationHTML += `<span>...</span>`; // Ellipsis for more pages
            }
            paginationHTML += '</div>';
            if (page < totalPages) {
                paginationHTML += `<button onclick="goToPage(${page + 1})">Next</button>`; // Next button
            }
        }
        pagination.innerHTML = paginationHTML; // Update pagination
        updateURL(); // Update URL
        isResourcesLoaded = true; // Mark as loaded
    } catch (error) {
        console.error("Error loading resources:", error); // Log error
        resourcesGrid.innerHTML = "<p>Error loading resources. Please try again later.</p>"; // Show error message
    } finally {
        if (!isResourcesLoaded || forceReload) {
            setTimeout(() => {
                loader.classList.add('no-blur'); // Remove loader blur
            }, 600);
            setTimeout(() => {
                loader.classList.add('hidden'); // Hide loader
                loader.classList.remove('active'); // Deactivate loader
            }, 800);
        }
    }
}

// ---------- 4. Navigate to Page ----------
function goToPage(page) {
    console.log('Going to page:', page); // Log page navigation
    currentPage = page; // Set current page
    loadResources(currentPage); // Load resources for page
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
}

// ---------- 5. Debounced Search Handler ----------
function debounceSearch() {
    clearTimeout(debounceTimeout); // Clear existing timer
    debounceTimeout = setTimeout(() => {
        searchQuery = searchInput.value; // Update search query
        currentPage = 1; // Reset to first page
        loadResources(currentPage); // Load resources
    }, 500); // 500ms debounce delay
}

searchInput.addEventListener("input", debounceSearch); // Attach debounced search handler

// ---------- 6. Theme Toggle ----------
themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; // Toggle theme
    document.documentElement.setAttribute('data-theme', currentTheme); // Update theme
    localStorage.setItem('pref-theme', currentTheme); // Save theme
});

// ---------- 7. System Theme Change Handler ----------
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('pref-theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light'); // Update theme based on system preference
    }
});

// ---------- 8. Scroll Handling ----------
window.addEventListener("scroll", () => {
    document.getElementById("scrollTop").style.display = window.scrollY > 200 ? "flex" : "none"; // Show/hide scroll-to-top button
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
});

// ---------- 9. Browser Navigation Handler ----------
window.addEventListener('popstate', async (event) => {
    const state = event.state || {}; // Get history state
    console.log('Popstate event:', state, 'URL:', window.location.href); // Log state and URL
    if (state.path && state.path.includes('resources.html')) {
        currentPage = state.page || 1; // Restore page
        searchQuery = state.search || ''; // Restore search query
        currentCategory = state.category || 'all'; // Restore category
        currentSort = state.sort || 'newest'; // Restore sort
        if (searchInput) {
            searchInput.value = searchQuery; // Update search input
        }
        if (resourceTypePills) {
            // Find the active pill and set its class
            resourceTypePills.querySelectorAll('.toggle-btn').forEach(b => {
                if (b.getAttribute('data-type') === currentCategory) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
        }
        if (sortSelect) {
            sortSelect.value = currentSort; // Update sort select
        }
        isResourcesLoaded = false; // Reset loaded flag
        await loadResources(currentPage, true); // Load resources
        window.scrollTo({ top: 0, behavior: 'instant' }); // Instant scroll to top
    }
});

// ---------- 10. Page Load Initialization ----------
window.addEventListener("DOMContentLoaded", () => {
    if (!searchInput) {
        console.error('Search input not found'); // Log missing input error
        return;
    }
    const urlParams = new URLSearchParams(window.location.search); // Get URL params
    currentPage = parseInt(urlParams.get('page')) || 1; // Set current page
    searchQuery = urlParams.get('search') || ''; // Set search query
    currentCategory = urlParams.get('category') || 'all'; // Set category
    currentSort = urlParams.get('sort') || '';
    searchInput.value = searchQuery; // Update search input
    if (resourceTypePills) {
        // Find the active pill and set its class
        resourceTypePills.querySelectorAll('.toggle-btn').forEach(b => {
            if (b.getAttribute('data-type') === currentCategory) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }
    if (sortSelect) {
        sortSelect.value = currentSort;
        if (!currentSort) sortSelect.value = '';
    }
    console.log('Initial load: page=', currentPage, 'search=', searchQuery, 'category=', currentCategory, 'sort=', currentSort); // Log initial state
    history.replaceState({ page: currentPage, search: searchQuery, path: window.location.pathname, category: currentCategory, sort: currentSort }, '', window.location.href); // Set initial state
    document.documentElement.setAttribute('data-theme', localStorage.getItem('pref-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')); // Initialize theme
    isResourcesLoaded = false; // Reset loaded flag
    loadResources(currentPage, true); // Load resources
});

function updateTypePills(categories) {
    if (!resourceTypePills) return;
    resourceTypePills.innerHTML = '';
    categories.forEach(category => {
        let label = category.charAt(0).toUpperCase() + category.slice(1);
        if (category.toLowerCase() === 'link') label = 'Links';
        const btn = document.createElement('button');
        btn.className = 'toggle-btn' + (currentCategory === category ? ' active' : '');
        btn.textContent = label;
        btn.setAttribute('data-type', category);
        btn.onclick = () => {
            currentCategory = category;
            currentPage = 1;
            // Remove active from all, add to clicked
            resourceTypePills.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadResources(currentPage);
        };
        resourceTypePills.appendChild(btn);
    });
}

sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    loadResources(currentPage);
});