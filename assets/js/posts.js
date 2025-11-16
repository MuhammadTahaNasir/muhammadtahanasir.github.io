// ---------- 1. Global Variables ----------
let posts = []; // Array to store all posts
let currentPage = 1; // Current page for pagination
const postsPerPage = 5; // Number of posts per page
let activeTag = null; // Currently selected tag filter
let searchQuery = ''; // Current search query
let currentSort = 'newest'; // Current sort option
const loader = document.getElementById('loader'); // Loader element
const container = document.getElementById("post-container"); // Post container element
const searchInput = document.getElementById("searchInput"); // Search input element
const pagination = document.getElementById("pagination"); // Pagination container
const tagFilter = document.getElementById("tagFilter"); // Tag filter container
const sortSelect = document.getElementById("sortSelect"); // Sort dropdown

// ---------- 2. Debounce function ----------
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ---------- 3. Load Posts from JSON ----------
async function loadPosts() {
    loader.classList.remove('hidden');
    loader.classList.add('active'); // Show loader
    try {
        const res = await fetch("posts/posts.json"); // Fetch posts JSON
        if (!res.ok) throw new Error('File not found'); // Handle fetch error
        let allPosts = await res.json(); // Parse JSON
        posts = allPosts.filter(p => !p.url.endsWith("posts.html")); // Filter out posts.html
        initializeViewCounts(); // Initialize view counts for posts
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
        const noResults = document.getElementById('noResults');
        container.innerHTML = ''; // Clear container
        if (noResults) {
            noResults.querySelector('h3').textContent = 'Failed to load posts';
            noResults.querySelector('p').textContent = 'Check the console for details';
            noResults.style.display = 'block';
        }
    } finally {
        setTimeout(() => {
            loader.classList.remove('active'); // Deactivate loader
            loader.classList.add('hidden'); // Hide loader
        }, 600);
    }
}

// ---------- 4. View Count Management ----------
function getViewCount(postUrl) {
    const viewKey = `views-${postUrl}`;
    const views = localStorage.getItem(viewKey) || 0;
    return parseInt(views);
}

function incrementViewCount(postUrl) {
    const viewKey = `views-${postUrl}`;
    const currentViews = parseInt(localStorage.getItem(viewKey) || 0);
    const newViews = currentViews + 1;
    localStorage.setItem(viewKey, newViews);
    return newViews;
}

// Initialize view counts for posts that don't have them yet
function initializeViewCounts() {
    posts.forEach(post => {
        const viewKey = `views-${post.url}`;
        if (!localStorage.getItem(viewKey)) {
            // Set realistic initial view counts based on post recency
            const postDate = new Date(post.date);
            const now = new Date();
            const daysSincePost = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));
            
            let initialViews;
            if (daysSincePost <= 7) {
                // New posts (last 7 days): 5-15 views
                initialViews = Math.floor(Math.random() * 11) + 5;
            } else if (daysSincePost <= 30) {
                // Recent posts (last 30 days): 15-40 views
                initialViews = Math.floor(Math.random() * 26) + 15;
            } else if (daysSincePost <= 90) {
                // Older posts (last 90 days): 25-60 views
                initialViews = Math.floor(Math.random() * 36) + 25;
            } else {
                // Old posts (90+ days): 40-100 views
                initialViews = Math.floor(Math.random() * 61) + 40;
            }
            
            localStorage.setItem(viewKey, initialViews);
        }
    });
}

// ---------- 5. Render Tag Filters ----------
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

// ---------- 6. Update URL with current filters ----------
function updateURL() {
    const params = new URLSearchParams(); // Create URL params
    if (currentPage > 1) params.set('page', currentPage); // Add page param
    if (activeTag) params.set('tag', activeTag); // Add tag param
    if (searchQuery) params.set('search', searchQuery); // Add search param
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`; // Build new URL
    window.history.replaceState({}, '', newURL); // Update URL without reload
}

// ---------- 7. Apply Filters and Sort ----------
function applyFilter() {
    let filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.summary.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTag = !activeTag || post.tags.includes(activeTag);

        return matchesSearch && matchesTag;
    });

    // Sort posts
    filteredPosts.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        const dateA = a.date;
        const dateB = b.date;
        const timeA = parseInt(a.time);
        const timeB = parseInt(b.time);

        if (currentSort === 'newest') return dateB.localeCompare(dateA);
        if (currentSort === 'oldest') return dateA.localeCompare(dateB);
        if (currentSort === 'a-z') return titleA.localeCompare(titleB);
        if (currentSort === 'z-a') return titleB.localeCompare(titleA);
        if (currentSort === 'reading-time') return timeA - timeB;
        return 0;
    });

    return filteredPosts;
}

// ---------- 8. Render Posts ----------
function renderPosts() {
    const filteredPosts = applyFilter(); // Get filtered posts
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage); // Calculate total pages
    const startIndex = (currentPage - 1) * postsPerPage; // Calculate start index
    const endIndex = startIndex + postsPerPage; // Calculate end index
    const postsToShow = filteredPosts.slice(startIndex, endIndex); // Get posts for current page
    const noResults = document.getElementById('noResults'); // Get no results element

    if (filteredPosts.length === 0) {
        container.innerHTML = ''; // Clear container
        if (noResults) noResults.style.display = 'block'; // Show no results message
        pagination.innerHTML = ''; // Clear pagination
        return;
    }

    if (noResults) noResults.style.display = 'none'; // Hide no results message

    container.innerHTML = postsToShow.map(post => {
        const views = getViewCount(post.url); // Get view count
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }); // Format date

        // Check if post has a valid thumbnail
        const hasThumbnail = post.thumbnail && post.thumbnail !== 'https://via.placeholder.com/300x150';

        return `
            <article class="post-card${!hasThumbnail ? ' no-thumbnail' : ''}">
                ${hasThumbnail ? `
                <div class="post-image">
                    <a href="${post.url}">
                        <img src="${post.thumbnail}" alt="${post.title}" loading="lazy">
                    </a>
                </div>
                ` : ''}
      <div class="post-content">
                    <h2 class="post-title">
                        <a href="${post.url}">${post.title}</a>
                    </h2>
                    <p class="post-summary">${post.summary}</p>
        <div class="post-meta">
                        <span class="post-date"><i class="fas fa-calendar"></i> ${formattedDate}</span>
                        <span class="post-read-time"><i class="fas fa-book-open"></i> ${post.time}</span>
                        <span class="post-views"><i class="fas fa-chart-bar"></i> ${views} views</span>
                        <span class="post-author"><i class="fas fa-user"></i> ${post.author}</span>
                    </div>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')}
                    </div>
      </div>
            </article>
        `;
    }).join(''); // Render posts

    renderPagination(totalPages); // Render pagination
    updateURL(); // Update URL
}

// ---------- 9. Render Pagination ----------
function renderPagination(totalPages) {
    if (totalPages <= 1) {
        pagination.innerHTML = ''; // Hide pagination if only one page
        return;
    }

    let paginationHTML = ''; // Initialize pagination HTML
    const maxVisiblePages = 5; // Maximum visible page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2)); // Calculate start page
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1); // Calculate end page

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1); // Adjust start page
    }

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="goToPage(${currentPage - 1})" class="pagination-btn">Previous</button>`; // Add previous button
    }

    // First page
    if (startPage > 1) {
        paginationHTML += `<button onclick="goToPage(1)" class="pagination-btn">1</button>`; // Add first page
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`; // Add ellipsis
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button onclick="goToPage(${i})" class="pagination-btn${i === currentPage ? ' active' : ''}">${i}</button>`; // Add page number
    }

    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`; // Add ellipsis
        }
        paginationHTML += `<button onclick="goToPage(${totalPages})" class="pagination-btn">${totalPages}</button>`; // Add last page
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="goToPage(${currentPage + 1})" class="pagination-btn">Next</button>`; // Add next button
    }

    pagination.innerHTML = paginationHTML; // Set pagination HTML
}

// ---------- 10. Filter by Tag ----------
function filterByTag(tag) {
    activeTag = activeTag === tag ? null : tag; // Toggle tag filter
    currentPage = 1; // Reset to first page
    renderTags(); // Re-render tags to update active state
    renderPosts(); // Re-render posts
}

// ---------- 11. Go to Page ----------
function goToPage(page) {
    currentPage = page; // Set current page
    renderPosts(); // Re-render posts
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
}

// ---------- 12. Filter and Sort Listeners ----------
searchInput.addEventListener('input', debounce(() => {
    searchQuery = searchInput.value.trim();
    currentPage = 1;
    renderPosts();
}, 300));

sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    renderPosts();
});

// ---------- 13. Theme Toggle ----------
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    html.style.background = newTheme === 'dark' ? '#1a1a1a' : '#f9fafc';
    html.style.color = newTheme === 'dark' ? '#d1d5db' : '#333';
    html.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('pref-theme', newTheme);
});

// ---------- 14. Initial Load ----------
document.addEventListener('DOMContentLoaded', () => {
    // Activate loader on page load
    loader.classList.remove('hidden');
    loader.classList.add('active');
    
    // Initialize Scroll to Top Button
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
    }
    
    // Load posts after a short delay to show loader
    setTimeout(() => {
        loadPosts();
    }, 100);
});