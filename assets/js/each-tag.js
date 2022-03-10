// ---------- 0. Page Fade-in Animation ----------
document.addEventListener('DOMContentLoaded', function() {
  // Page-wide fade-in
  const main = document.querySelector('.post-container');
  if (main) main.classList.add('page-fade-in');
});

// ---------- 1. Post Management and Initialization ----------
let posts = []; // Stores the fetched posts data
let currentPage = 1; // Tracks the current page for pagination
const postsPerPage = 5; // Number of posts to display per page
let activeTag = null; // Stores the currently selected tag from URL parameters

const loader = document.getElementById('loader'); // Reference to the loader element for displaying loading state
const params = new URLSearchParams(window.location.search); // Parse URL query parameters
activeTag = params.get('name'); // Extract the 'name' parameter for the active tag
document.getElementById('tagTitle').textContent = activeTag; // Set the tag title in the DOM
document.title = `Tag: ${activeTag} | Muhammad Taha Nasir`; // Update page title dynamically

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
    author: post.author || 'Muhammad Taha Nasir',
    tags: post.tags || []
  }));
  let mappedProjects = filteredProjects.map(project => ({
    type: 'project',
    date: project.date || '',
    time: '',
    title: project.title,
    url: '..' + project.url,
    thumbnail: project.thumbnail,
    summary: project.description,
    author: project.author || 'Muhammad Taha Nasir',
    tags: project.features || []
  }));
  // Merge and sort by date descending
  let combined = [...mappedPosts, ...mappedProjects].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const container = document.getElementById('post-container');
  container.innerHTML = '';
  
  if (combined.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No posts or projects found</h3>
        <p>No content found with the tag "${activeTag}"</p>
      </div>
    `;
    document.getElementById('pagination').innerHTML = '';
    return;
  }
  
  // Format date with month name
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  container.innerHTML = combined.map(item => {
    const hasThumbnail = item.thumbnail && item.thumbnail !== 'https://via.placeholder.com/300x150';
    
    return `
      <article class="post-card${!hasThumbnail ? ' no-thumbnail' : ''}${item.type === 'project' ? ' project-card' : ''}">
        ${hasThumbnail ? `
        <div class="post-image">
          <a href="${item.url}">
            <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
          </a>
        </div>
        ` : ''}
        <div class="post-content">
          <h2 class="post-title">
            <span class="${item.type === 'project' ? 'project-badge' : 'post-badge'}">${item.type === 'project' ? 'Project' : 'Post'}</span>
            <a href="${item.url}">${item.title}</a>
          </h2>
          <p class="post-summary">${item.summary || ''}</p>
          <div class="post-meta">
            <span class="post-date"><i class="fas fa-calendar"></i> ${formatDate(item.date)}</span>
            ${item.time ? `<span class="post-read-time"><i class="fas fa-book-open"></i> ${item.time}</span>` : ''}
            <span class="post-author"><i class="fas fa-user"></i> ${item.author}</span>
          </div>
          <div class="post-tags">
            ${item.tags.map(tag => `<a href="tag.html?name=${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')}
          </div>
        </div>
      </article>
    `;
  }).join('');
  
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
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme); // Set data-theme attribute
  html.classList.toggle('dark', newTheme === 'dark'); // Toggle dark class
  localStorage.setItem('pref-theme', newTheme); // Save theme preference
});

// ---------- 6. Scroll-to-Top Functionality ----------
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').style.display = window.scrollY > 200 ? 'flex' : 'none'; // Show/hide scroll-to-top button based on scroll position
});

document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Smoothly scroll to the top of the page
});

// ---------- 7. Initialize Post Loading ----------
loadPosts(); // Call loadPosts to fetch and display posts on page load