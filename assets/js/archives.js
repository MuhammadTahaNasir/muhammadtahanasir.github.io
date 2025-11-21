/**
 * Archives Page Script
 * Displays chronological archive of posts and projects grouped by year and month
 */

const loader = document.getElementById('loader');
const header = document.querySelector('.header');

let lastScrollTop = 0;
let isScrolling = false;

document.addEventListener('DOMContentLoaded', () => {
  // Page-wide fade-in
  const main = document.querySelector('main.post-container');
  if (main) main.classList.add('page-fade-in');

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
  
  // Initialize header scroll behavior
  initHeaderScroll();
  
  // Show header initially on mobile
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      header.classList.add('show');
    }, 100);
  }
});

/**
 * Initialize mobile header scroll behavior
 * Hides header on scroll down, shows on scroll up
 */
function initHeaderScroll() {
  let lastScrollTop = 0;
  let ticking = false;

  function updateHeader() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Only apply on mobile
    if (window.innerWidth <= 768) {
      if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
        // Scrolling down - hide header
        header.classList.remove('show');
        header.classList.add('hide');
      } else if (currentScrollTop < lastScrollTop) {
        // Scrolling up - show header
        header.classList.remove('hide');
        header.classList.add('show');
      }
      
      // Show header when at the top
      if (currentScrollTop <= 100) {
        header.classList.remove('hide');
        header.classList.add('show');
      }
    } else {
      // On desktop, always show header
      header.classList.remove('hide', 'show');
    }
    
    lastScrollTop = currentScrollTop;
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  
  // Handle resize events
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      // Reset header state on desktop
      header.classList.remove('hide', 'show');
    }
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
});

/**
 * Generate archive view from posts and projects JSON
 * Groups items by year and month with collapsible sections
 */
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
        // Count total posts in this year, not just months
        const totalPostsInYear = Object.values(postsByYear[year]).reduce((total, monthPosts) => total + monthPosts.length, 0);
        postsHtml += `<div class="archive-year"><h3 id="posts-${year}">${year} <sup class="archive-count">${totalPostsInYear}</sup></h3>`;
        Object.keys(postsByYear[year])
          .sort((a, b) => new Date(`${b} 1, 2000`) - new Date(`${a} 1, 2000`))
          .forEach(month => {
            const monthPosts = postsByYear[year][month];
            monthPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            postsHtml += `<details><summary><span class="month-name">${month}</span><span class="month-count">${monthPosts.length}</span></summary>`;
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
        // Count total projects in this year, not just months
        const totalProjectsInYear = Object.values(projectsByYear[year]).reduce((total, monthProjects) => total + monthProjects.length, 0);
        projectsHtml += `<div class="archive-year"><h3 id="projects-${year}">${year} <sup class="archive-count">${totalProjectsInYear}</sup></h3>`;
        Object.keys(projectsByYear[year])
          .sort((a, b) => new Date(`${b} 1, 2000`) - new Date(`${a} 1, 2000`))
          .forEach(month => {
            const monthProjects = projectsByYear[year][month];
            monthProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
            projectsHtml += `<details><summary><span class="month-name">${month}</span><span class="month-count">${monthProjects.length}</span></summary>`;
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
        showPostsBtn.setAttribute('aria-selected', 'true');
        showProjectsBtn.classList.remove('active');
        showProjectsBtn.setAttribute('aria-selected', 'false');
      }
      function showProjects() {
        archiveContent.innerHTML = projectsHtml;
        showProjectsBtn.classList.add('active');
        showProjectsBtn.setAttribute('aria-selected', 'true');
        showPostsBtn.classList.remove('active');
        showPostsBtn.setAttribute('aria-selected', 'false');
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

// Theme toggle with persistence
const toggleBtn = document.getElementById('theme-toggle');

/**
 * Update theme icon visibility based on current theme
 */
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

// Scroll to top button visibility and handler
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').style.display =
    window.scrollY > 200 ? 'flex' : 'none';
});

document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});