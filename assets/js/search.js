// ---------- 1. Global Variables ----------
let posts = []; // Array to store posts
let resources = []; // Array to store resources
let currentPage = 1; // Current page for pagination
const postsPerPage = 8; // Number of items per page
let fuse; // Fuse.js instance for search
let searchQuery = ''; // Current search query
const loader = document.getElementById('loader'); // Loader element
const searchInput = document.getElementById('searchInput'); // Search input element
const searchResults = document.getElementById('searchResults'); // Search results container
const pagination = document.getElementById('pagination'); // Pagination container
const scrollTop = document.getElementById('scrollTop'); // Scroll to top button
const themeToggle = document.getElementById('theme-toggle'); // Theme toggle button

// ---------- 2. Theme Handling ----------
function initializeTheme() {
    const savedTheme = localStorage.getItem('pref-theme'); // Get saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Check system dark mode
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme); // Apply saved theme
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark'); // Apply dark theme
    } else {
        document.documentElement.setAttribute('data-theme', 'light'); // Apply light theme
    }
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; // Toggle theme
    document.documentElement.setAttribute('data-theme', currentTheme); // Update theme
    localStorage.setItem('pref-theme', currentTheme); // Save theme
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('pref-theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light'); // Update theme based on system preference
    }
});

// ---------- 3. Scroll Handling ----------
window.addEventListener('scroll', () => {
    scrollTop.style.display = window.scrollY > 200 ? 'flex' : 'none'; // Show/hide scroll-to-top button
});

scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
});

// ---------- 4. Update URL Parameters ----------
function updateURL() {
    const params = new URLSearchParams(); // Create URL params
    if (currentPage > 1) params.set('page', currentPage); // Add page if not 1
    if (searchQuery) params.set('search', searchQuery); // Add search query if set
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`; // Build URL
    return newURL; // Return new URL
}

// ---------- 5. Load Posts Data ----------
async function loadPosts() {
    try {
        const res = await fetch('posts/posts.json'); // Fetch posts JSON
        if (!res.ok) throw new Error('File not found'); // Handle fetch error
        posts = await res.json(); // Parse and store posts
    } catch (error) {
        console.error('Fetch error for posts:', error); // Log error
        posts = []; // Set empty array on failure
    }
}

// ---------- 6. Load Resources Data ----------
async function loadResources() {
    try {
        const res = await fetch('data/resources.json'); // Fetch resources JSON
        if (!res.ok) throw new Error('Failed to load resources'); // Handle fetch error
        resources = await res.json(); // Parse and store resources
    } catch (error) {
        console.error('Fetch error for resources:', error); // Log error
        resources = []; // Set empty array on failure
    }
}

// ---------- 7. Initialize Data and Search ----------
async function initializeData() {
    loader.classList.add('active'); // Show loader
    await Promise.all([loadPosts(), loadResources()]); // Load posts and resources concurrently
    const startDate = new Date('2025-04-13T00:00:00Z'); // Base date for resources
    const allItems = [
        ...posts.map(p => ({ ...p, type: 'post', link: p.url || '#' })), // Map posts with type and link
        ...resources.map((r, index) => {
            const pseudoDate = new Date(startDate.getTime() - (resources.length - 1 - index) * 24 * 60 * 60 * 1000); // Generate pseudo date
            return {
                ...r,
                type: r.type || 'resource', // Set type
                link: r.link || '#', // Set link
                date: pseudoDate.toISOString() // Assign date
            };
        })
    ]; // Combine posts and resources
    fuse = new Fuse(allItems, {
        keys: ['title', 'summary', 'desc'], // Searchable fields
        threshold: 0.3 // Search sensitivity
    }); // Initialize Fuse.js
    setTimeout(() => {
        loader.classList.add('no-blur'); // Remove loader blur
    }, 600);
    setTimeout(() => {
        loader.classList.add('hidden'); // Hide loader
        loader.classList.remove('active'); // Deactivate loader
        renderResults(); // Render search results
    }, 800);
}

// ---------- 8. Debounced Search Handler ----------
let debounceTimer; // Timer for debouncing
function debounceSearch() {
    clearTimeout(debounceTimer); // Clear existing timer
    debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value.trim(); // Update search query
        currentPage = 1; // Reset to first page
        renderResults(); // Render results
        const newURL = updateURL(); // Update URL
        history.pushState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', newURL); // Update browser history
        console.log('Search: Updated URL (search):', newURL, 'State:', history.state); // Log URL and state
    }, 500); // 500ms debounce delay
}

searchInput.addEventListener('input', debounceSearch); // Attach debounced search handler

// ---------- 9. Navigate to Page ----------
function goToPage(page) {
    currentPage = page; // Set current page
    renderResults(); // Render results
    const newURL = updateURL(); // Update URL
    history.pushState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', newURL); // Update browser history
    console.log('Search: Updated URL (page):', newURL, 'State:', history.state); // Log URL and state
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
}

// ---------- 10. Render Search Results ----------
function renderResults() {
    searchResults.innerHTML = ''; // Clear results container
    let filtered = []; // Filtered items
    let totalPages = 1; // Total pages

    if (!searchQuery) {
        const allItems = [
            ...posts.map(p => ({ ...p, type: 'post', link: p.url || '#' })), // Map posts
            ...resources.map((r, index) => ({
                ...r,
                type: r.type || 'resource', // Set type
                link: r.link || '#', // Set link
                date: new Date('2025-04-13T00:00:00Z').toISOString() // Set date
            }))
        ]; // Combine posts and resources
        filtered = allItems.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7); // Sort and limit to 7
        totalPages = 1; // Single page for no query
    } else {
        const fuseRes = fuse.search(searchQuery); // Perform search
        filtered = fuseRes.map(r => r.item); // Extract items
        totalPages = Math.ceil(filtered.length / postsPerPage) || 1; // Calculate pages
    }

    const start = (currentPage - 1) * postsPerPage; // Start index
    const pageItems = filtered.slice(start, start + postsPerPage); // Get items for current page

    if (filtered.length === 0 && searchQuery) {
        searchResults.innerHTML = '<li Forma de archivo: .html no admitida por este navegador.<li class="no-results">😕 No results found.</li>'; // Show no results
        pagination.innerHTML = ''; // Clear pagination
        return;
    }

    pageItems.forEach(item => {
        const li = document.createElement('li'); // Create result item
        li.className = 'post-card'; // Set class
        li.innerHTML = `
      <div class="post-content">
        <h2><a href="${item.link}">${item.title || 'Untitled'}</a></h2> <!-- Item title -->
        <div class="post-meta">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div> <!-- Item type -->
      </div>
    `; // Render item
        searchResults.appendChild(li); // Append to results
    });

    pagination.innerHTML = ''; // Clear pagination
    if (totalPages > 1 && searchQuery) {
        let paginationHTML = ''; // Build pagination
        if (currentPage > 1) {
            paginationHTML += `<button onclick="goToPage(${currentPage - 1})">Prev</button>`; // Previous button
        }
        paginationHTML += '<div class="page-buttons">'; // Page buttons container
        const maxPagesToShow = 5; // Max pages to display
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2)); // Start page
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1); // End page
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1); // Adjust start page
        }
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`; // Page buttons
        }
        if (endPage < totalPages) {
            paginationHTML += `<span>...</span>`; // Ellipsis for more pages
        }
        paginationHTML += '</div>';
        if (currentPage < totalPages) {
            paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next</button>`; // Next button
        }
        pagination.innerHTML = paginationHTML; // Update pagination
    }
}

// ---------- 11. Browser Navigation Handler ----------
window.addEventListener('popstate', async (event) => {
    const state = event.state || {}; // Get history state
    console.log('Search: Popstate event, state:', state, 'URL:', window.location.href); // Log state and URL
    if (state.path && state.path.includes('search.html')) {
        currentPage = state.page || 1; // Restore page
        searchQuery = state.search || ''; // Restore search query
        if (searchInput) {
            searchInput.value = searchQuery; // Update search input
        }
        if (!fuse) {
            await initializeData(); // Initialize data if needed
        }
        renderResults(); // Render results
        window.scrollTo({ top: 0, behavior: 'instant' }); // Instant scroll to top
    }
});

// ---------- 12. Page Load Initialization ----------
window.addEventListener('DOMContentLoaded', () => {
    if (!searchInput) {
        console.error('Search input not found'); // Log missing input error
        return;
    }
    const urlParams = new URLSearchParams(window.location.search); // Get URL params
    currentPage = parseInt(urlParams.get('page')) || 1; // Set current page
    searchQuery = urlParams.get('search') || ''; // Set search query
    searchInput.value = searchQuery; // Update search input
    history.replaceState({ page: currentPage, search: searchQuery, path: window.location.pathname }, '', window.location.href); // Set initial state
    console.log('Search: Initial state set:', history.state); // Log initial state
    initializeTheme(); // Initialize theme
    initializeData(); // Initialize data
});

// ---------- 13. Navigation Link Handlers ----------
document.querySelectorAll('.pill-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default navigation
        const href = link.getAttribute('href'); // Get link href
        console.log('Search: Navigating to:', href); // Log navigation
        if (href && href !== '#' && !href.startsWith('#')) {
            history.pushState({ page: 1, search: '', path: href }, '', href); // Update history
            window.location.assign(href); // Navigate to href
        } else {
            console.error('Invalid href:', href); // Log invalid href
        }
    });
});