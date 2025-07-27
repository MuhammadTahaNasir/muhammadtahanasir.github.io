// ---------- 1. Global Variables ----------
let posts = []; // Array to store all posts
let currentPage = 1; // Current page for pagination
const postsPerPage = 5; // Number of posts per page
let activeTag = null; // Currently selected tag filter
let searchQuery = ''; // Current search query
const loader = document.getElementById('loader'); // Loader element
const container = document.getElementById("post-container"); // Post container element
const searchInput = document.getElementById("searchInput"); // Search input element
const pagination = document.getElementById("pagination"); // Pagination container
const tagFilter = document.getElementById("tagFilter"); // Tag filter container

// ---------- 2. Load Posts from JSON ----------
async function loadPosts() {
    loader.classList.add('active'); // Show loader
    try {
        const res = await fetch("posts/posts.json"); // Fetch posts JSON
        if (!res.ok) throw new Error('File not found'); // Handle fetch error
        let allPosts = await res.json(); // Parse JSON
        posts = allPosts.filter(p => !p.url.endsWith("posts.html")); // Filter out posts.html
        renderTags(); // Render tag filters
        // Check URL parameters to set initial state
        const urlParams = new URLSearchParams(window.location.search); // Get URL params
        currentPage = parseInt(urlParams.get('page')) || 1; // Set current page
        activeTag = urlParams.get('tag') || null; // Set active tag
        searchQuery = urlParams.get('search') || ''; // Set search query
        searchInput.value = searchQuery; // Update search input
        renderPosts(); // Render posts
    } catch (error) {
        console.error('Fetch error:', error); // Log error
        container.innerHTML = `<p class="no-results">😕 Failed to load posts. Check the console for details.</p>`; // Show error message
    } finally {
        setTimeout(() => {
            loader.classList.add('no-blur'); // Remove loader blur
        }, 600);
        setTimeout(() => {
            loader.classList.add('hidden'); // Hide loader
            loader.classList.remove('active'); // Deactivate loader
        }, 800);
    }
}

// ---------- 3. Calculate Read Time ----------
function calculateReadTime(text) {
    const words = text.split(/\s+/).length; // Count words
    const minutes = Math.ceil(words / 200); // Estimate read time
    return minutes > 0 ? ` ${minutes} min read` : "0 min read"; // Return formatted time
}

// ---------- 4. Render Tag Filters ----------
function renderTags() {
    const allTags = new Set(); // Collect unique tags
    posts.forEach(p => p.tags.forEach(tag => allTags.add(tag))); // Add tags to set
    const tagsArray = [...allTags]; // Convert to array
    const maxTags = 18; // Limit displayed tags
    const displayedTags = tagsArray.slice(0, maxTags); // Get first 18 tags
    tagFilter.innerHTML = displayedTags.map(tag =>
        `<button class="tag-btn${tag === activeTag ? ' active' : ''}" onclick="filterByTag('${tag}')">${tag}</button>`
    ).join('') + (tagsArray.length > maxTags ? `<a href="tags.html" class="view-more-tags">View More</a>` : ''); // Render tag buttons and view more link
}

// ---------- 5. Update URL Parameters ----------
function updateURL() {
    const params = new URLSearchParams(); // Create URL params
    if (currentPage > 1) params.set('page', currentPage); // Add page if not 1
    if (activeTag) params.set('tag', activeTag); // Add tag if set
    if (searchQuery) params.set('search', searchQuery); // Add search query if set
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`; // Build URL
    history.pushState({ page: currentPage, tag: activeTag, search: searchQuery }, '', newURL); // Update browser history
}

// ---------- 6. Render Posts ----------
function renderPosts() {
    let filtered = posts.filter(post => {
        const tagString = post.tags.join(' ').toLowerCase(); // Combine tags
        return (
            (post.title.toLowerCase().includes(searchQuery.toLowerCase()) || // Match title
                post.summary.toLowerCase().includes(searchQuery.toLowerCase()) || // Match summary
                tagString.includes(searchQuery.toLowerCase())) && // Match tags
            (!activeTag || post.tags.includes(activeTag)) // Match active tag
        );
    }); // Filter posts by search and tag

    const totalPages = Math.ceil(filtered.length / postsPerPage); // Calculate total pages
    const start = (currentPage - 1) * postsPerPage; // Start index
    const paginated = filtered.slice(start, start + postsPerPage); // Get posts for current page

    container.innerHTML = ''; // Clear container
    if (filtered.length === 0) {
        container.innerHTML = `<p class="no-results">😕 No results found.</p>`; // Show no results
        pagination.innerHTML = ''; // Clear pagination
        updateURL(); // Update URL
        return;
    }

    container.innerHTML = paginated.map(post =>
        `<div class="post-card">
      ${post.thumbnail ? `<img src="${post.thumbnail}" alt="Thumbnail">` : ""} <!-- Render thumbnail if available -->
      <div class="post-content">
        <h2><a href="${post.url}">${post.title}</a></h2> <!-- Post title -->
        <div class="post-meta">${post.date.split('T')[0]} · ${post.time}</div> <!-- Post meta -->
        <p class="post-summary">${post.summary}</p> <!-- Post summary -->
      </div>
    </div>`
    ).join(''); // Render post cards

    let paginationHTML = ''; // Build pagination
    if (currentPage > 1) {
        paginationHTML += `<button onclick="goToPage(${currentPage - 1})">Prev</button>`; // Previous button
    }
    paginationHTML += '<div class="page-buttons">'; // Page buttons container
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`; // Page buttons
    }
    paginationHTML += '</div>';
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next »</button>`; // Next button
    }
    pagination.innerHTML = paginationHTML; // Update pagination

    updateURL(); // Update URL with current state
}

// ---------- 7. Filter by Tag ----------
function filterByTag(tag) {
    activeTag = activeTag === tag ? null : tag; // Toggle active tag
    document.querySelectorAll(".tag-btn").forEach(btn => {
        btn.classList.toggle("active", btn.textContent === activeTag); // Update button states
    });
    currentPage = 1; // Reset to first page
    renderPosts(); // Re-render posts
}

// ---------- 8. Navigate to Page ----------
function goToPage(page) {
    currentPage = page; // Set current page
    renderPosts(); // Re-render posts
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
}

// ---------- 9. Search Input Handler ----------
searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value; // Update search query
    currentPage = 1; // Reset to first page
    renderPosts(); // Re-render posts
});

// ---------- 10. Theme Toggle ----------
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark"); // Toggle dark mode class on root element
    localStorage.setItem("pref-theme", document.documentElement.classList.contains("dark") ? "dark" : "light"); // Save theme preference to localStorage
});

// Loads saved theme or applies system preference
const savedTheme = localStorage.getItem("pref-theme"); // Retrieve saved theme from localStorage
if (savedTheme) {
    document.documentElement.classList.toggle("dark", savedTheme === "dark"); // Apply saved theme
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add("dark"); // Apply dark theme if system prefers dark mode
}

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) {
        if (e.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateThemeIcons();
    }
});

// ---------- 12. Scroll to Top Visibility ----------
window.addEventListener("scroll", () => {
    document.getElementById("scrollTop").style.display =
        window.scrollY > 200 ? "flex" : "none"; // Show/hide scroll-to-top button
});

// ---------- 13. Scroll to Top Handler ----------
document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
});

// ---------- 14. Browser Navigation Handler ----------
window.addEventListener('popstate', (event) => {
    const state = event.state || {}; // Get history state
    currentPage = state.page || 1; // Restore page
    activeTag = state.tag || null; // Restore tag
    searchQuery = state.search || ''; // Restore search query
    searchInput.value = searchQuery; // Update search input
    renderPosts(); // Re-render posts
    document.querySelectorAll(".tag-btn").forEach(btn => {
        btn.classList.toggle("active", btn.textContent === activeTag); // Update tag buttons
    });
});

// ---------- 15. Initialize Page ----------
loadPosts(); // Load posts on page load