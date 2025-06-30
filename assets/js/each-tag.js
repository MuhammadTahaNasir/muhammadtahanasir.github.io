let posts = [];
let currentPage = 1;
const postsPerPage = 5;
let activeTag = null;

const loader = document.getElementById('loader');
const params = new URLSearchParams(window.location.search);
activeTag = params.get('name');
document.getElementById('tagTitle').textContent = activeTag;

async function loadPosts() {
    loader.classList.add('active');
    try {
        const res = await fetch('../posts/posts.json');
        if (!res.ok) throw new Error('File not found');
        posts = await res.json();
        renderPosts();
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('post-container').innerHTML = `<p class="no-results">😕 Failed to load posts. Check the console for details.</p>`;
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

function renderPosts() {
    let filtered = posts.filter(post => post.tags.includes(activeTag));

    const totalPages = Math.ceil(filtered.length / postsPerPage);
    const start = (currentPage - 1) * postsPerPage;
    const paginated = filtered.slice(start, start + postsPerPage);

    const container = document.getElementById('post-container');
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-results">😕 No posts found.</p>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    container.innerHTML = paginated.map(post =>
        `<div class="post-card">
          ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${post.title}">` : ''}
          <div class="post-content">
            <h2><a href="../${post.url}">${post.title}</a></h2>
            <div class="post-meta">${post.date.split('T')[0]} · ${post.time}</div>
            <p class="post-summary">${post.summary}</p>
          </div>
        </div>`
    ).join('');

    const pagination = document.getElementById('pagination');
    let paginationHTML = '';

    // Add Prev button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="goToPage(${currentPage - 1})">Prev</button>`;
    }

    // Add page numbers together on the left
    paginationHTML += '<div class="page-buttons">';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    paginationHTML += '</div>';

    // Add Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next »</button>`;
    }

    pagination.innerHTML = paginationHTML;
}

function goToPage(page) {
    currentPage = page;
    renderPosts();
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('pref-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

const savedTheme = localStorage.getItem('pref-theme');
if (savedTheme) {
    document.body.classList.toggle('dark', savedTheme === 'dark');
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
}

window.addEventListener('scroll', () => {
    document.getElementById('scrollTop').style.display =
        window.scrollY > 200 ? 'flex' : 'none';
});

document.getElementById('scrollTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

loadPosts();