/**
 * Resources Page Script
 * Displays categorized and searchable learning resources (PDFs, videos, books, links)
 */

const loader = document.getElementById('loader');
const resourcesContainer = document.getElementById('resources-content'); // Resources container
const themeToggle = document.getElementById('theme-toggle'); // Theme toggle button
const searchInput = document.getElementById('searchInput'); // Search input
const clearSearchBtn = document.getElementById('clear-search'); // Clear search button
const sortSelect = document.getElementById('sort-select'); // Sort select
const showAllBtn = document.getElementById('show-all');
const showPdfsBtn = document.getElementById('show-pdfs');
const showImagesBtn = document.getElementById('show-images');
const showVideosBtn = document.getElementById('show-videos');
const showLinksBtn = document.getElementById('show-links');
const showBooksBtn = document.getElementById('show-books');
let currentPage = 1; // Current page for pagination
const itemsPerPage = 8; // Number of items per page
let searchQuery = ''; // Current search query
let sortBy = 'newest'; // Current sort method
let debounceTimeout = null; // Timer for debouncing search
let isResourcesLoaded = false; // Flag for resource loading status
let currentCategory = 'all';
let allResources = [];

/**
 * Update URL with current state for bookmarkable searches
 */
function updateURL() {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage); // Add page if not 1
    if (searchQuery) params.set('search', searchQuery); // Add search query if set
    if (currentCategory !== 'all') params.set('category', currentCategory); // Add category if set
    if (sortBy !== 'newest') params.set('sort', sortBy); // Add sort method if not default
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`; // Build URL
    console.log('Updating URL:', newURL, 'State:', { page: currentPage, search: searchQuery, sort: sortBy, category: currentCategory, path: window.location.pathname }); // Log URL and state
    history.pushState({ page: currentPage, search: searchQuery, sort: sortBy, category: currentCategory, path: window.location.pathname }, '', newURL); // Update browser history
}

/**
 * Load and filter resources with pagination
 * @param {number} page - Page number to load
 * @param {boolean} forceReload - Force data reload
 */
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

        let filteredResources = resources.filter(resource => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                resource.title.toLowerCase().includes(searchLower) ||
                (resource.description || resource.desc || '').toLowerCase().includes(searchLower);
            
            // Filter by category
            let matchesCategory = true;
            if (currentCategory === 'pdfs') {
                matchesCategory = resource.link && resource.link.toLowerCase().includes('.pdf');
            } else if (currentCategory === 'images') {
                matchesCategory = resource.link && (
                    resource.link.toLowerCase().includes('.png') ||
                    resource.link.toLowerCase().includes('.jpg') ||
                    resource.link.toLowerCase().includes('.jpeg') ||
                    resource.link.toLowerCase().includes('.gif')
                );
            } else if (currentCategory === 'videos') {
                matchesCategory = resource.type === 'Video' || 
                    (resource.link && (
                        resource.link.toLowerCase().includes('youtube.com') ||
                        resource.link.toLowerCase().includes('youtu.be') ||
                        resource.link.toLowerCase().includes('vimeo.com')
                    ));
            } else if (currentCategory === 'links') {
                matchesCategory = resource.type === 'Link' && 
                    !resource.link.toLowerCase().includes('.pdf') &&
                    !resource.link.toLowerCase().includes('.png') &&
                    !resource.link.toLowerCase().includes('.jpg') &&
                    !resource.link.toLowerCase().includes('.jpeg') &&
                    !resource.link.toLowerCase().includes('.gif');
            } else if (currentCategory === 'books') {
                matchesCategory = resource.type === 'Book';
            }
            
            return matchesSearch && matchesCategory;
        });

        // Sort resources
        filteredResources.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.date || '2024-01-01') - new Date(a.date || '2024-01-01');
                case 'a-z':
                    return a.title.localeCompare(b.title);
                case 'z-a':
                    return b.title.localeCompare(a.title);
                case 'type':
                    return a.type.localeCompare(b.type);
                default:
                    return new Date(b.date || '2024-01-01') - new Date(a.date || '2024-01-01');
            }
        });

        if (filteredResources.length === 0) {
            resourcesContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-folder-open"></i>
                    <h3>No resources found</h3>
                    <p>Try adjusting your search terms or filters</p>
                </div>
            `; // Show no results with same style as projects
            updateURL(); // Update URL
            isResourcesLoaded = true; // Mark as loaded
            return;
        }

        // Pagination logic
        const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedResources = filteredResources.slice(startIndex, endIndex);

        // Create resources grid
        const resourcesGrid = document.createElement('div');
        resourcesGrid.className = 'resources-grid';
        
        paginatedResources.forEach((r) => {
            const card = document.createElement("div"); // Create resource card
            card.className = "resource-card"; // Set card class
            
            // Determine if it should open in new tab
            const isExternalLink = r.link.startsWith('http://') || r.link.startsWith('https://');
            const targetAttr = isExternalLink ? 'target="_blank" rel="noopener noreferrer"' : '';
            
            card.innerHTML = `
        <i class="${r.thumbnail} card-thumb"></i> <!-- Thumbnail icon -->
        <h3 class="card-title">${r.title}</h3> <!-- Resource title -->
        <p class="card-desc">${r.description || r.desc || 'No description available'}</p> <!-- Resource description -->
        <a href="${r.link}" class="card-btn" ${targetAttr}>View</a> <!-- View button -->
      `;
            resourcesGrid.appendChild(card); // Append card to grid
        });

        // Create pagination
        let paginationHTML = '';
        if (totalPages > 1) {
            paginationHTML = '<div class="pagination">';
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
            paginationHTML += '</div>';
        }

        resourcesContainer.innerHTML = ''; // Clear container
        resourcesContainer.appendChild(resourcesGrid); // Add grid to container
        
        // Add pagination if needed
        if (paginationHTML) {
            resourcesContainer.appendChild(document.createElement('div')).innerHTML = paginationHTML;
        }
        
        updateURL(); // Update URL
        isResourcesLoaded = true; // Mark as loaded
    } catch (error) {
        console.error("Error loading resources:", error); // Log error
        resourcesContainer.innerHTML = "<div class='no-results'>Error loading resources. Please try again later.</div>"; // Show error message
    } finally {
        if (!isResourcesLoaded || forceReload) {
            setTimeout(() => {
                loader.classList.add('hidden'); // Hide loader
                loader.classList.remove('active'); // Deactivate loader
            }, 800);
        }
    }
}

// ---------- 4. Search and Sort Handlers ----------
function handleSearch() {
    searchQuery = searchInput.value.trim();
    clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
    currentPage = 1;
    loadResources(currentPage);
}

function handleClearSearch() {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.remove('visible');
    currentPage = 1;
    loadResources(currentPage);
}

function handleSort() {
    sortBy = sortSelect.value;
    currentPage = 1;
    loadResources(currentPage);
}

// Search input event listener with debouncing
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(handleSearch, 300);
});

// Clear search button
clearSearchBtn.addEventListener('click', handleClearSearch);

// Sort select event listener
sortSelect.addEventListener('change', handleSort);

// ---------- 5. Toggle Button Handlers ----------
function setActiveButton(activeBtn) {
    // Remove active class from all buttons
    showAllBtn.classList.remove('active');
    showPdfsBtn.classList.remove('active');
    showImagesBtn.classList.remove('active');
    showVideosBtn.classList.remove('active');
    showLinksBtn.classList.remove('active');
    showBooksBtn.classList.remove('active');
    
    // Add active class to clicked button
    activeBtn.classList.add('active');
}

showAllBtn.addEventListener('click', () => {
    setActiveButton(showAllBtn);
    currentCategory = 'all';
    currentPage = 1;
    loadResources(1);
});

showPdfsBtn.addEventListener('click', () => {
    setActiveButton(showPdfsBtn);
    currentCategory = 'pdfs';
    currentPage = 1;
    loadResources(1);
});

showImagesBtn.addEventListener('click', () => {
    setActiveButton(showImagesBtn);
    currentCategory = 'images';
    currentPage = 1;
    loadResources(1);
});

showVideosBtn.addEventListener('click', () => {
    setActiveButton(showVideosBtn);
    currentCategory = 'videos';
    currentPage = 1;
    loadResources(1);
});

showLinksBtn.addEventListener('click', () => {
    setActiveButton(showLinksBtn);
    currentCategory = 'links';
    currentPage = 1;
    loadResources(1);
});

showBooksBtn.addEventListener('click', () => {
    setActiveButton(showBooksBtn);
    currentCategory = 'books';
    currentPage = 1;
    loadResources(1);
});

// ---------- 5. Navigate to Page ----------
function goToPage(page) {
    console.log('Going to page:', page);
    currentPage = page;
    loadResources(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- 7. Theme Toggle ----------
themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; // Toggle theme
    document.documentElement.setAttribute('data-theme', currentTheme); // Update theme
    localStorage.setItem('pref-theme', currentTheme); // Save theme
});

// ---------- 8. System Theme Change Handler ----------
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('pref-theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light'); // Update theme based on system preference
    }
});

// ---------- 9. Scroll Handling ----------
window.addEventListener("scroll", () => {
    document.getElementById("scrollTop").style.display = window.scrollY > 200 ? "flex" : "none"; // Show/hide scroll-to-top button
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
});

// ---------- 10. Browser Navigation Handler ----------
window.addEventListener('popstate', async (event) => {
    const state = event.state || {}; // Get history state
    console.log('Popstate event:', state, 'URL:', window.location.href); // Log state and URL
    if (state.path && state.path.includes('resources.html')) {
        currentPage = state.page || 1; // Restore page
        searchQuery = state.search || ''; // Restore search query
        sortBy = state.sort || 'newest'; // Restore sort method
        currentCategory = state.category || 'all'; // Restore category
        
        // Update UI elements
        searchInput.value = searchQuery;
        sortSelect.value = sortBy;
        clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
        
        // Set active button based on category
        if (currentCategory === 'pdfs') {
            setActiveButton(showPdfsBtn);
        } else if (currentCategory === 'images') {
            setActiveButton(showImagesBtn);
        } else if (currentCategory === 'videos') {
            setActiveButton(showVideosBtn);
        } else if (currentCategory === 'links') {
            setActiveButton(showLinksBtn);
        } else if (currentCategory === 'books') {
            setActiveButton(showBooksBtn);
        } else {
            setActiveButton(showAllBtn);
        }
        
        isResourcesLoaded = false; // Reset loaded flag
        await loadResources(currentPage, true); // Load resources
        window.scrollTo({ top: 0, behavior: 'instant' }); // Instant scroll to top
    }
});

// ---------- 11. Page Load Initialization ----------
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search); // Get URL params
    currentPage = parseInt(urlParams.get('page')) || 1; // Set current page
    searchQuery = urlParams.get('search') || ''; // Set search query
    sortBy = urlParams.get('sort') || 'newest'; // Set sort method
    currentCategory = urlParams.get('category') || 'all'; // Set category
    
    // Update UI elements
    searchInput.value = searchQuery;
    sortSelect.value = sortBy;
    clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
    
    // Set active button based on category
    if (currentCategory === 'pdfs') {
        setActiveButton(showPdfsBtn);
    } else if (currentCategory === 'images') {
        setActiveButton(showImagesBtn);
    } else if (currentCategory === 'videos') {
        setActiveButton(showVideosBtn);
    } else if (currentCategory === 'links') {
        setActiveButton(showLinksBtn);
    } else if (currentCategory === 'books') {
        setActiveButton(showBooksBtn);
    } else {
        setActiveButton(showAllBtn);
    }
    
    console.log('Initial load: page=', currentPage, 'search=', searchQuery, 'sort=', sortBy, 'category=', currentCategory); // Log initial state
    history.replaceState({ page: currentPage, search: searchQuery, sort: sortBy, path: window.location.pathname, category: currentCategory }, '', window.location.href); // Set initial state
    document.documentElement.setAttribute('data-theme', localStorage.getItem('pref-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')); // Initialize theme
    isResourcesLoaded = false; // Reset loaded flag
    loadResources(currentPage, true); // Load resources
});