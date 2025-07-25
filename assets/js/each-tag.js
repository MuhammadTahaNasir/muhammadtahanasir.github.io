// ---------- 1. Post Management and Initialization ----------
let posts = []; // Stores the fetched posts data
let currentPage = 1; // Tracks the current page for pagination
const postsPerPage = 5; // Number of posts to display per page
let activeTag = null; // Stores the currently selected tag from URL parameters

const loader = document.getElementById('loader'); // Reference to the loader element for displaying loading state
const params = new URLSearchParams(window.location.search); // Parse URL query parameters
activeTag = params.get('name'); // Extract the 'name' parameter for the active tag
document.getElementById('tagTitle').textContent = activeTag; // Set the tag title in the DOM

let projects = []; // Stores the fetched projects data

// ---------- 2. Post and Project Loading ----------
async function loadPosts() {
    loader.classList.add('active'); // Show loader with active state
    try {
        // Fetch posts and projects in parallel
        const [postsRes, projectsRes] = await Promise.all([
            fetch('../posts/posts.json'),
            fetch('../projects/projects.json')
        ]);
        if (!postsRes.ok) throw new Error('Posts file not found');
        if (!projectsRes.ok) throw new Error('Projects file not found');
        posts = await postsRes.json();
        projects = await projectsRes.json();
        renderUnifiedList(); // Render both posts and projects for the current tag
    } catch (error) {
        console.error('Fetch error:', error); // Log any fetch-related errors
        document.getElementById('post-container').innerHTML = `<p class="no-results">😕 Failed to load posts. Check the console for details.</p>`; // Display error message
        document.getElementById('project-container').innerHTML = `<p class="no-results">😕 Failed to load projects. Check the console for details.</p>`;
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

// ---------- 3. Unified Rendering for Posts and Projects ----------
function renderUnifiedList() {
    // Filter posts and projects by tag
    let filteredPosts = posts.filter(post => post.tags.includes(activeTag));
    let filteredProjects = projects.filter(project => Array.isArray(project.features) && project.features.includes(activeTag));
    // Map both to a common format with a type field
    let mappedPosts = filteredPosts.map(post => ({
        type: 'post',
        date: post.date ? post.date.split('T')[0] : '',
        time: post.time || '',
        title: post.title,
        url: '../' + post.url,
        thumbnail: post.thumbnail,
        summary: post.summary,
    }));
    let mappedProjects = filteredProjects.map(project => ({
        type: 'project',
        date: project.date || '',
        time: '',
        title: project.title,
        url: '..' + project.url,
        thumbnail: project.thumbnail,
        summary: project.description,
    }));
    // Merge and sort by date descending
    let combined = [...mappedPosts, ...mappedProjects].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const container = document.getElementById('post-container');
    container.innerHTML = '';
    if (combined.length === 0) {
        container.innerHTML = '<p class="no-results">😕 No posts or projects found.</p>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    container.innerHTML = combined.map(item => `
        <div class="post-card${item.type === 'project' ? ' project-card' : ''}">
            ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}">` : ''}
            <div class="post-content">
                <h2><a href="${item.url}">${item.title}</a>
                    <span class="${item.type === 'project' ? 'project-badge' : 'post-badge'}">${item.type === 'project' ? 'Project' : 'Post'}</span>
                </h2>
                <div class="post-meta">${item.date}${item.time ? ' · ' + item.time : ''}</div>
                <p class="post-summary">${item.summary ? item.summary : ''}</p>
            </div>
        </div>
    `).join('');
    document.getElementById('pagination').innerHTML = '';
}

// ---------- 3b. Project Rendering ----------
// This function is no longer needed as projects are rendered directly in renderUnifiedList

// ---------- 4. Page Navigation ----------
function goToPage(page) {
    currentPage = page; // Update current page
    renderUnifiedList(); // Re-render posts for the selected page
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