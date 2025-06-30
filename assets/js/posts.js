let posts = [];
let currentPage = 1;
const postsPerPage = 5;
let activeTag = null;
let searchQuery = '';

const loader = document.getElementById('loader');
const container = document.getElementById("post-container");
const searchInput = document.getElementById("searchInput");
const pagination = document.getElementById("pagination");
const tagFilter = document.getElementById("tagFilter");

async function loadPosts() {
    loader.classList.add('active');
    try {
        const res = await fetch("posts/posts.json");
        if (!res.ok) throw new Error('File not found');
        let allPosts = await res.json();
        posts = allPosts.filter(p => !p.url.endsWith("posts.html"));
        renderTags();
        // Check URL parameters to set initial state
        const urlParams = new URLSearchParams(window.location.search);
        currentPage = parseInt(urlParams.get('page')) || 1;
        activeTag = urlParams.get('tag') || null;
        searchQuery = urlParams.get('search') || '';
        searchInput.value = searchQuery;
        renderPosts();
    } catch (error) {
        console.error('Fetch error:', error);
        container.innerHTML = `<p class="no-results">😕 Failed to load posts. Check the console for details.</p>`;
    } finally {
        setTimeout(() => {
            loader.classList.add('no-blur');
        }, 900);
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.classList.remove('active');
        }, 1200);
    }
}

function calculateReadTime(text) {
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes > 0 ? ` ${minutes} min read` : "0 min read";
}

function renderTags() {
    const allTags = new Set();
    posts.forEach(p => p.tags.forEach(tag => allTags.add(tag)));
    const tagsArray = [...allTags];
    const maxTags = 18;
    const displayedTags = tagsArray.slice(0, maxTags);
    tagFilter.innerHTML = displayedTags.map(tag =>
        `<button class="tag-btn${tag === activeTag ? ' active' : ''}" onclick="filterByTag('${tag}')">${tag}</button>`
    ).join('') + (tagsArray.length > maxTags ? `<a href="tags.html" class="view-more-tags">View More</a>` : '');
}

function updateURL() {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (activeTag) params.set('tag', activeTag);
    if (searchQuery) params.set('search', searchQuery);
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    history.pushState({ page: currentPage, tag: activeTag, search: searchQuery }, '', newURL);
}

function renderPosts() {
    let filtered = posts.filter(post => {
        const tagString = post.tags.join(' ').toLowerCase();
        return (
            (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tagString.includes(searchQuery.toLowerCase())) &&
            (!activeTag || post.tags.includes(activeTag))
        );
    });

    const totalPages = Math.ceil(filtered.length / postsPerPage);
    const start = (currentPage - 1) * postsPerPage;
    const paginated = filtered.slice(start, start + postsPerPage);

    if (filtered.length === 0) {
        container.innerHTML = `<p class="no-results">😕 No results found.</p>`;
        pagination.innerHTML = '';
        updateURL();
        return;
    }

    container.innerHTML = paginated.map(post =>
        `<div class="post-card">
      ${post.thumbnail ? `<img src="${post.thumbnail}" alt="Thumbnail">` : ""}
      <div class="post-content">
        <h2><a href="${post.url}">${post.title}</a></h2>
        <div class="post-meta">${post.date.split('T')[0]} · ${post.time}</div>
        <p class="post-summary">${post.summary}</p>
      </div>
    </div>`
    ).join('');

    let paginationHTML = '';
    if (currentPage > 1) {
        paginationHTML += `<button onclick="goToPage(${currentPage - 1})">Prev</button>`;
    }
    paginationHTML += '<div class="page-buttons">';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    paginationHTML += '</div>';
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next »</button>`;
    }
    pagination.innerHTML = paginationHTML;

    updateURL();
}

function filterByTag(tag) {
    activeTag = activeTag === tag ? null : tag;
    document.querySelectorAll(".tag-btn").forEach(btn => {
        btn.classList.toggle("active", btn.textContent === activeTag);
    });
    currentPage = 1;
    renderPosts();
}

function goToPage(page) {
    currentPage = page;
    renderPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderPosts();
});

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
    document.getElementById("scrollTop").style.display =
        window.scrollY > 200 ? "flex" : "none";
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    const state = event.state || {};
    currentPage = state.page || 1;
    activeTag = state.tag || null;
    searchQuery = state.search || '';
    searchInput.value = searchQuery;
    renderPosts();
    // Update tag button active state
    document.querySelectorAll(".tag-btn").forEach(btn => {
        btn.classList.toggle("active", btn.textContent === activeTag);
    });
});

loadPosts();