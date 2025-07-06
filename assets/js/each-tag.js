// ---------- 1. Post Management and Initialization ----------
let posts = []; // Stores the fetched posts data
let currentPage = 1; // Tracks the current page for pagination
const postsPerPage = 5; // Number of posts to display per page
let activeTag = null; // Stores the currently selected tag from URL parameters

const loader = document.getElementById('loader'); // Reference to the loader element for displaying loading state
const params = new URLSearchParams(window.location.search); // Parse URL query parameters
activeTag = params.get('name'); // Extract the 'name' parameter for the active tag
document.getElementById('tagTitle').textContent = activeTag; // Set the tag title in the DOM

// ---------- 2. Post Loading ----------
async function loadPosts() {
    loader.classList.add('active'); // Show loader with active state
    try {
        const res = await fetch('../posts/posts.json'); // Fetch posts data from JSON file
        if (!res.ok) throw new Error('File not found'); // Handle fetch errors
        posts = await res.json(); // Parse JSON response into posts array
        renderPosts(); // Render the posts for the current tag
    } catch (error) {
        console.error('Fetch error:', error); // Log any fetch-related errors
        document.getElementById('post-container').innerHTML = `<p class="no-results">😕 Failed to load posts. Check the console for details.</p>`; // Display error message
    } finally {
        setTimeout(() => {
            loader.classList.add('no-blur'); // Add no-blur class to loader after 600ms
        }, 600);
        setTimeout(() => {
            loader.classList.add('hidden'); // Hide loader
            loader.classList.remove('active'); // Remove active state
        }, 800);
    }
}

// ---------- 3. Post Rendering and Pagination ----------
function renderPosts() {
    let filtered = posts.filter(post => post.tags.includes(activeTag)); // Filter posts by the active tag

    const totalPages = Math.ceil(filtered.length / postsPerPage); // Calculate total pages
    const start = (currentPage - 1) * postsPerPage; // Calculate start index for pagination
    const paginated = filtered.slice(start, start + postsPerPage); // Get posts for the current page

    const container = document.getElementById('post-container'); // Reference to the post container element
    container.innerHTML = ''; // Clear existing content

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-results">😕 No posts found.</p>'; // Display message if no posts are found
        document.getElementById('pagination').innerHTML = ''; // Clear pagination
        return;
    }

    container.innerHTML = paginated.map(post => `
        <div class="post-card">
            ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${post.title}">` : ''} <!-- Conditionally render thumbnail -->
            <div class="post-content">
                <h2><a href="../${post.url}">${post.title}</a></h2> <!-- Post title with link -->
                <div class="post-meta">${post.date.split('T')[0]} · ${post.time}</div> <!-- Post date and read time -->
                <p class="post-summary">${post.summary}</p> <!-- Post summary -->
            </div>
        </div>
    `).join(''); // Generate HTML for each post and join into a single string

    const pagination = document.getElementById('pagination'); // Reference to the pagination element
    let paginationHTML = ''; // Initialize pagination HTML

    if (currentPage > 1) {
        paginationHTML += `<button onclick="goToPage(${currentPage - 1})">Prev</button>`; // Add Previous button if not on first page
    }

    paginationHTML += '<div class="page-buttons">'; // Container for page number buttons
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`; // Add button for each page, highlight active page
    }
    paginationHTML += '</div>';

    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next »</button>`; // Add Next button if not on last page
    }

    pagination.innerHTML = paginationHTML; // Render pagination controls
}

// ---------- 4. Page Navigation ----------
function goToPage(page) {
    currentPage = page; // Update current page
    renderPosts(); // Re-render posts for the selected page
}

// ---------- 5. Theme Toggle ----------
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark'); // Toggle dark mode class on root element
    localStorage.setItem('pref-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); // Save theme preference to localStorage
});

// Loads saved theme or applies system preference
const savedTheme = localStorage.getItem('pref-theme'); // Retrieve saved theme from localStorage
if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark'); // Apply saved theme
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark'); // Apply dark theme if system prefers dark mode
}

// ---------- 6. Scroll-to-Top Functionality ----------
window.addEventListener('scroll', () => {
    document.getElementById('scrollTop').style.display = window.scrollY > 200 ? 'flex' : 'none'; // Show/hide scroll-to-top button based on scroll position
});

document.getElementById('scrollTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smoothly scroll to the top of the page
});

// ---------- 7. Initialize Post Loading ----------
loadPosts(); // Call loadPosts to fetch and display posts on page load