/* Initialize Page */
const loader = document.getElementById('loader');
const header = document.querySelector('.header');

// Header scroll behavior variables
let lastScrollTop = 0;
let isScrolling = false;

document.addEventListener('DOMContentLoaded', () => {
  // Page-wide fade-in
  const main = document.querySelector('main.post-container');
  if (main) main.classList.add('page-fade-in');

  if (loader && !loader.classList.contains('active')) {
    loader.classList.add('active');
    setTimeout(() => {
      loader.classList.add('no-blur');
    }, 700);
    setTimeout(() => {
      loader.classList.add('hidden');
      loader.classList.remove('active');
    }, 1000);
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

/* Header Scroll Behavior */
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

/* Smooth Internal Links */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ---------- VS Code / Warp IDE Workspace Generator ---------- */
let allItems = [];
let activeFilter = 'all'; // 'all', 'posts', 'projects'
let selectedYear = null;  // null = all years
let selectedMonth = null; // null = all months
let expandedYears = new Set(); // tracks expanded year folders in tree
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

function generateArchive() {
  const archiveContent = document.getElementById('archive-content');
  const treeFoldersContainer = document.getElementById('treeFoldersContainer');
  const showAllBtn = document.getElementById('show-all');
  const showPostsBtn = document.getElementById('show-posts');
  const showProjectsBtn = document.getElementById('show-projects');
  const searchInput = document.getElementById('archiveSearchInput');
  const idePathText = document.getElementById('idePathText');
  const paneTitle = document.getElementById('paneTitle');
  const paneCountBadge = document.getElementById('paneCountBadge');

  Promise.all([
    fetch('posts/posts.json').then(res => res.ok ? res.json() : []),
    fetch('projects/projects.json').then(res => res.ok ? res.json() : [])
  ])
    .then(([posts, projects]) => {
      // Normalize posts
      const normalizedPosts = posts
        .filter(p => p.url && !p.url.endsWith('posts.html'))
        .map(p => ({
          type: 'post',
          title: p.title || 'Untitled Post',
          url: p.url,
          date: new Date(p.date),
          tags: p.tags || []
        }));

      // Normalize projects
      const normalizedProjects = projects.map(p => ({
        type: 'project',
        title: p.title || 'Untitled Project',
        url: p.url,
        date: new Date(p.date),
        tags: p.features || p.tags || []
      }));

      allItems = [...normalizedPosts, ...normalizedProjects].sort((a, b) => b.date - a.date);

      // Build Collapsible Sidebar Directory Tree (Years & Collapsible Month Subdirectories)
      function buildSidebarTree() {
        if (!treeFoldersContainer) return;

        // Group by Year -> Month
        const treeData = {};
        allItems.forEach(item => {
          const year = isNaN(item.date.getFullYear()) ? 'Other' : item.date.getFullYear();
          const month = isNaN(item.date.getTime()) ? 'Other' : item.date.toLocaleString('default', { month: 'long' });
          
          treeData[year] ??= { count: 0, months: {} };
          treeData[year].count++;
          treeData[year].months[month] ??= 0;
          treeData[year].months[month]++;
        });

        let treeHtml = `
          <div class="tree-year-node">
            <button class="tree-year-btn ${selectedYear === null ? 'active' : ''}" onclick="selectTreeFolder(null, null)">
              <span><i class="fas fa-folder-open" style="color:#0a84ff;"></i> All Archives</span>
              <span class="count-badge">${allItems.length}</span>
            </button>
          </div>
        `;

        Object.keys(treeData).sort((a, b) => b - a).forEach(year => {
          const yearNum = Number(year);
          const isYearActive = selectedYear === yearNum && selectedMonth === null;
          const isExpanded = expandedYears.has(yearNum);
          const yearData = treeData[year];

          treeHtml += `
            <div class="tree-year-node">
              <button class="tree-year-btn ${isYearActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}" onclick="toggleYearNode(${yearNum}, event)">
                <span>
                  <i class="fas ${isYearActive || isExpanded ? 'fa-folder-open' : 'fa-folder'}" style="color:${isYearActive || isExpanded ? '#0a84ff' : 'var(--secondary)'};"></i>
                  ${year} Archive
                </span>
                <span style="display:flex; align-items:center;">
                  <span class="count-badge">${yearData.count}</span>
                  <i class="fas fa-chevron-right chevron-icon"></i>
                </span>
              </button>`;

          if (isExpanded) {
            treeHtml += `<div class="tree-month-list">`;
            Object.keys(yearData.months)
              .sort((a, b) => new Date(`${b} 1, 2000`) - new Date(`${a} 1, 2000`))
              .forEach(month => {
                const isMonthActive = selectedYear === yearNum && selectedMonth === month;
                const monthCount = yearData.months[month];

                treeHtml += `
                  <button class="tree-month-btn ${isMonthActive ? 'active' : ''}" onclick="selectTreeFolder(${yearNum}, '${month}', event)">
                    <span><i class="fas ${isMonthActive ? 'fa-folder-open' : 'fa-folder-minus'}" style="color:${isMonthActive ? '#0a84ff' : 'var(--secondary)'};"></i> ${month}</span>
                    <span class="count-badge">${monthCount}</span>
                  </button>
                `;
              });
            treeHtml += `</div>`;
          }

          treeHtml += `</div>`;
        });

        treeFoldersContainer.innerHTML = treeHtml;
      }

      // Render Content Stream Pane with Equal Items & Pagination
      function renderContentPane() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const filtered = allItems.filter(item => {
          const matchesType = (activeFilter === 'all') || (activeFilter === 'posts' && item.type === 'post') || (activeFilter === 'projects' && item.type === 'project');
          const matchesYear = selectedYear === null || item.date.getFullYear() === selectedYear;
          const matchesMonth = selectedMonth === null || item.date.toLocaleString('default', { month: 'long' }) === selectedMonth;
          const matchesQuery = !query || item.title.toLowerCase().includes(query) || item.tags.some(t => String(t).toLowerCase().includes(query));
          return matchesType && matchesYear && matchesMonth && matchesQuery;
        });

        // Calculate Pagination
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
        const paginatedItems = filtered.slice(startIndex, endIndex);

        // Update Path & Headers
        if (idePathText) {
          let path = '~/terry/archives';
          if (selectedYear) path += `/${selectedYear}`;
          if (selectedMonth) path += `/${selectedMonth}`;
          idePathText.textContent = path;
        }

        if (paneTitle) {
          let title = 'All Archive Files';
          if (selectedYear && !selectedMonth) title = `${selectedYear} Archive Files`;
          else if (selectedYear && selectedMonth) title = `${selectedMonth} ${selectedYear} Files`;
          paneTitle.textContent = title;
        }

        if (mobileSubdirText) {
          let subText = 'All Archives';
          if (selectedYear) subText = `${selectedYear} Archive`;
          if (selectedMonth) subText += ` (${selectedMonth})`;
          mobileSubdirText.textContent = subText;
        }

        // Update Glass Month Dropdown Menu & Button Label
        const glassMonthLabel = document.getElementById('glassMonthLabel');
        const glassMonthDropdown = document.getElementById('glassMonthDropdown');

        if (glassMonthDropdown) {
          const months = new Set();
          allItems.forEach(item => {
            if (selectedYear === null || item.date.getFullYear() === selectedYear) {
              const m = item.date.toLocaleString('default', { month: 'long' });
              if (m && m !== 'Invalid Date') months.add(m);
            }
          });

          let optHtml = `
            <button class="glass-month-opt ${selectedMonth === null ? 'active' : ''}" onclick="selectGlassMonth(null)">
              <span>All Months</span>
              <i class="fas fa-check" style="font-size:0.75rem; opacity:${selectedMonth === null ? 1 : 0};"></i>
            </button>
          `;

          months.forEach(m => {
            const isActive = selectedMonth === m;
            optHtml += `
              <button class="glass-month-opt ${isActive ? 'active' : ''}" onclick="selectGlassMonth('${m}')">
                <span>${m}</span>
                <i class="fas fa-check" style="font-size:0.75rem; opacity:${isActive ? 1 : 0};"></i>
              </button>
            `;
          });

          glassMonthDropdown.innerHTML = optHtml;
        }

        if (glassMonthLabel) {
          glassMonthLabel.textContent = selectedMonth ? selectedMonth : 'Filter Month';
        }

        if (paneCountBadge) {
          paneCountBadge.textContent = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;
        }

        if (totalItems === 0) {
          archiveContent.innerHTML = `<div style="text-align:center; padding:40px; color:var(--secondary)">😕 No files found matching this directory view.</div>`;
          return;
        }

        let html = '';
        const isMobile = window.innerWidth <= 850;
        paginatedItems.forEach(item => {
          const dateStr = isNaN(item.date.getTime()) ? 'N/A' : (isMobile 
            ? item.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) 
            : item.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
          const yearStr = isNaN(item.date.getFullYear()) ? '2026' : item.date.getFullYear();
          const monthStr = isNaN(item.date.getMonth()) ? '01' : String(item.date.getMonth() + 1).padStart(2, '0');
          const hashTag = `#${yearStr}.${monthStr}`;

          const fileIcon = item.type === 'post'
            ? `<i class="fas fa-file-code" style="color:#0a84ff; font-size:1.05rem;"></i>`
            : `<i class="fas fa-microchip" style="color:#c084fc; font-size:1.05rem;"></i>`;

          const typeBadge = item.type === 'post'
            ? `<span class="arch-type-tag arch-post-type">Post</span>`
            : `<span class="arch-type-tag arch-project-type">Project</span>`;

          html += `
            <a href="${item.url}" class="ide-log-row">
              <div class="ide-log-left">
                ${fileIcon}
                <span class="ide-commit-hash">${hashTag}</span>
                ${typeBadge}
                <span class="ide-log-title">${item.title}</span>
              </div>
              <div class="ide-log-date">${dateStr}</div>
            </a>
          `;
        });

                // Add Pagination Controls if totalPages > 1
        if (totalPages > 1) {
          const isMobile = window.innerWidth <= 768;
          let pages = [];
          
          if (totalPages <= (isMobile ? 3 : 5)) {
            for (let p = 1; p <= totalPages; p++) pages.push(p);
          } else {
            pages.push(1);
            if (isMobile) {
              if (currentPage > 2) pages.push('...');
              if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
              if (currentPage < totalPages - 1) pages.push('...');
            } else {
              if (currentPage > 3) pages.push('...');
              for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
                pages.push(p);
              }
              if (currentPage < totalPages - 2) pages.push('...');
            }
            if (!pages.includes(totalPages)) pages.push(totalPages);
          }

          html += `
            <div class="pagination">
              <button ${currentPage === 1 ? 'disabled' : ''} onclick="changeArchivePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i> Prev
              </button>

              <div class="page-buttons">` +
              pages.map(p => {
                if (p === '...') return `<span class="page-ellipsis">...</span>`;
                return `<button class="${p === currentPage ? 'active' : ''}" onclick="changeArchivePage(${p})">${p}</button>`;
              }).join('') +
              `</div>

              <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changeArchivePage(${currentPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          `;
        }

        archiveContent.innerHTML = html;
      }

      // Toggle Year Folder Expansion
      window.toggleYearNode = function(year, event) {
        if (event) event.stopPropagation();
        if (expandedYears.has(year)) {
          expandedYears.delete(year);
        } else {
          expandedYears.add(year);
        }
        selectedYear = year;
        selectedMonth = null;
        currentPage = 1;
        buildSidebarTree();
        renderContentPane();
      };

      // Select Tree Folder
      window.selectTreeFolder = function(year, month, event) {
        if (event) event.stopPropagation();
        selectedYear = year;
        selectedMonth = month;
        if (year !== null && !expandedYears.has(year)) {
          expandedYears.add(year);
        }
        currentPage = 1;
        buildSidebarTree();
        renderContentPane();
      };

      // Change Page
      window.changeArchivePage = function(page) {
        currentPage = page;
        renderContentPane();
        const mainPane = document.querySelector('.ide-content-pane');
        if (mainPane) mainPane.scrollTop = 0;
      };

      // Tab switching
      function setTab(type, btn) {
        activeFilter = type;
        currentPage = 1;
        [showAllBtn, showPostsBtn, showProjectsBtn].forEach(b => {
          if (b) {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          }
        });
        if (btn) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        }
        renderContentPane();
      }

      if (showAllBtn) showAllBtn.onclick = () => setTab('all', showAllBtn);
      if (showPostsBtn) showPostsBtn.onclick = () => setTab('posts', showPostsBtn);
      if (showProjectsBtn) showProjectsBtn.onclick = () => setTab('projects', showProjectsBtn);

      // Expose Glass Month selection function globally
      window.selectGlassMonth = function(month) {
        selectedMonth = month;
        currentPage = 1;
        const dropdown = document.getElementById('glassMonthDropdown');
        if (dropdown) dropdown.classList.remove('show');
        buildSidebarTree();
        renderContentPane();
      };

      const glassMonthBtn = document.getElementById('glassMonthBtn');
      if (glassMonthBtn) {
        glassMonthBtn.onclick = (e) => {
          e.stopPropagation();
          const dropdown = document.getElementById('glassMonthDropdown');
          if (dropdown) dropdown.classList.toggle('show');
        };
        document.addEventListener('click', () => {
          const dropdown = document.getElementById('glassMonthDropdown');
          if (dropdown) dropdown.classList.remove('show');
        });
      }

      // Initial Render
      buildSidebarTree();
      renderContentPane();
    })
    .catch(error => {
      archiveContent.innerHTML = `<p style="text-align:center; color:var(--secondary)">😕 Failed to load archive.</p>`;
      console.error('Error fetching archives:', error);
    })
    .finally(() => {
      if (loader) {
        loader.classList.add('hidden');
        loader.classList.remove('active');
      }
    });
};

/* Theme Toggle (Persisted) */
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

/* Scroll to Top Handler */
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').style.display =
    window.scrollY > 200 ? 'flex' : 'none';
});

document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});