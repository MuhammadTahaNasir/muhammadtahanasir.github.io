/* ---------- 1. Initialize Page ---------- */
const loader = document.getElementById('loader');

document.addEventListener('DOMContentLoaded', () => {
  // Only show loader if it's not already active
  if (!loader.classList.contains('active')) {
    loader.classList.add('active');
    setTimeout(() => {
      loader.classList.add('no-blur');
    }, 900);
    setTimeout(() => {
      loader.classList.add('hidden');
      loader.classList.remove('active');
    }, 1200);
  }
  generateArchive();
});

/* ---------- 2. Smooth Internal Links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ---------- 3. Archive Generator ---------- */
function generateArchive() {
  const archiveContent = document.getElementById('archive-content');
  const showPostsBtn = document.getElementById('show-posts');
  const showProjectsBtn = document.getElementById('show-projects');
  Promise.all([
    fetch('posts/posts.json').then(res => {
      if (!res.ok) throw new Error('Posts file not found');
      return res.json();
    }),
    fetch('projects/projects.json').then(res => {
      if (!res.ok) throw new Error('Projects file not found');
      return res.json();
    })
  ])
    .then(([posts, projects]) => {
      // --- POSTS SECTION ---
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const postsByYear = {};
      posts.forEach(post => {
        if (post.url && post.url.endsWith('posts.html')) return;
        const date = new Date(post.date);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        postsByYear[year] ??= {};
        postsByYear[year][month] ??= [];
        postsByYear[year][month].push(post);
      });
      let postsHtml = '';
      Object.keys(postsByYear).sort((a, b) => b - a).forEach(year => {
        const monthCount = Object.keys(postsByYear[year]).length;
        postsHtml += `<div class="archive-year"><h3 id="posts-${year}">${year} <sup class="archive-count">${monthCount}</sup></h3>`;
        Object.keys(postsByYear[year])
          .sort((a, b) => new Date(`${b} 1, 2000`) - new Date(`${a} 1, 2000`))
          .forEach(month => {
            const monthPosts = postsByYear[year][month];
            monthPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            postsHtml += `<details><summary>${month} <sup class="archive-count">${monthPosts.length}</sup></summary>`;
            monthPosts.forEach(post => {
              const dateStr = new Date(post.date).toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric'
              });
              postsHtml += `<div class="archive-post">
                <a href="${post.url}">${post.title || 'Untitled Post'}</a>
                <span class="meta">${dateStr} · ${post.time || 'N/A'}</span>
              </div>`;
            });
            postsHtml += `</details>`;
          });
        postsHtml += `</div>`;
      });

      // --- PROJECTS SECTION ---
      projects.sort((a, b) => new Date(b.date) - new Date(a.date));
      const projectsByYear = {};
      projects.forEach(project => {
        const date = new Date(project.date);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        projectsByYear[year] ??= {};
        projectsByYear[year][month] ??= [];
        projectsByYear[year][month].push(project);
      });
      let projectsHtml = '';
      Object.keys(projectsByYear).sort((a, b) => b - a).forEach(year => {
        const monthCount = Object.keys(projectsByYear[year]).length;
        projectsHtml += `<div class="archive-year"><h3 id="projects-${year}">${year} <sup class="archive-count">${monthCount}</sup></h3>`;
        Object.keys(projectsByYear[year])
          .sort((a, b) => new Date(`${b} 1, 2000`) - new Date(`${a} 1, 2000`))
          .forEach(month => {
            const monthProjects = projectsByYear[year][month];
            monthProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
            projectsHtml += `<details><summary>${month} <sup class="archive-count">${monthProjects.length}</sup></summary>`;
            monthProjects.forEach(project => {
              const dateStr = new Date(project.date).toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric'
              });
              projectsHtml += `<div class="archive-post">
                <a href="${project.url}">${project.title || 'Untitled Project'}</a>
                <span class="meta">${dateStr}</span>
              </div>`;
            });
            projectsHtml += `</details>`;
          });
        projectsHtml += `</div>`;
      });

      // --- TOGGLE LOGIC ---
      function showPosts() {
        archiveContent.innerHTML = postsHtml;
        showPostsBtn.classList.add('active');
        showProjectsBtn.classList.remove('active');
      }
      function showProjects() {
        archiveContent.innerHTML = projectsHtml;
        showProjectsBtn.classList.add('active');
        showPostsBtn.classList.remove('active');
      }
      // Default: show posts
      showPosts();
      showPostsBtn.onclick = showPosts;
      showProjectsBtn.onclick = showProjects;
    })
    .catch(error => {
      archiveContent.innerHTML = `<p style="text-align:center; color:var(--secondary)">😕 Failed to load archive.</p>`;
      console.error('Error fetching archives:', error);
    })
    .finally(() => {
      setTimeout(() => {
        loader.classList.add('no-blur');
      }, 900);
      setTimeout(() => {
        loader.classList.add('hidden');
        loader.classList.remove('active');
      }, 1200);
    });
}

/* ---------- 4. Theme Toggle (Persisted) ---------- */
const toggleBtn = document.getElementById('theme-toggle');

// Function to update theme icons
function updateThemeIcons() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.getElementById("sun").style.display = isDark ? "none" : "block";
  document.getElementById("moon").style.display = isDark ? "block" : "none";
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('pref-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcons();
});

toggleBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pref-theme', next);
  updateThemeIcons();
});

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!localStorage.getItem("pref-theme")) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    updateThemeIcons();
  }
});

/* ---------- 5. Scroll to Top Handler ---------- */
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').style.display =
    window.scrollY > 200 ? 'flex' : 'none';
});

document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});