/* ---------- 1. Initialize Page ---------- */
const loader = document.getElementById('loader');

document.addEventListener('DOMContentLoaded', () => {
  loader.classList.add('active');
  setTimeout(() => {
    loader.classList.add('no-blur');
  }, 900);
  setTimeout(() => {
    loader.classList.add('hidden');
    loader.classList.remove('active');
  }, 1200);
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

  loader.classList.add('active');
  fetch('posts/posts.json')
    .then(res => {
      if (!res.ok) throw new Error('File not found');
      return res.json();
    })
    .then(posts => {
      // Sort posts newest → oldest
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Group by year & month
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

      // Build HTML with years & months descending
      let html = '';
      Object.keys(postsByYear).sort((a, b) => b - a).forEach(year => {
        // Count unique months for the year
        const monthCount = Object.keys(postsByYear[year]).length;
        html += `<div class="archive-year"><h2 id="${year}">${year} <sup class="archive-count">${monthCount}</sup></h2>`;

        Object.keys(postsByYear[year])
          .sort((a, b) => new Date(`${b} 1, 2000`) - new Date(`${a} 1, 2000`))
          .forEach(month => {
            const monthPosts = postsByYear[year][month];
            monthPosts.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first in month

            html += `<details><summary>${month} <sup class="archive-count">${monthPosts.length}</sup></summary>`;
            monthPosts.forEach(post => {
              const dateStr = new Date(post.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              html += `<div class="archive-post">
                         <a href="${post.url}">${post.title || 'Untitled Post'}</a>
                         <span class="meta">${dateStr} · ${post.time || 'N/A'}</span>
                       </div>`;
            });
            html += `</details>`;
          });

        html += `</div>`;
      });

      archiveContent.innerHTML = html;
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
toggleBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pref-theme', next);
});

/* ---------- 5. Scroll to Top Handler ---------- */
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').style.display =
    window.scrollY > 200 ? 'flex' : 'none';
});

document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});