// Resume page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
  // Activate loader immediately on DOM ready
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('active');

  // Page-wide fade-in
  const main = document.querySelector('main.post-container');
  if (main) main.classList.add('page-fade-in');
  // Toggle functionality for resume sections with URL Hash support
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  const contentSections = document.querySelectorAll('.content-section');
  
  function activateSection(targetId) {
    const targetSection = document.getElementById(targetId + '-section');
    if (!targetSection) return;

    // Remove active class from all buttons and sections
    toggleButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      if (btn.id === `show-${targetId}`) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      }
    });

    contentSections.forEach(section => {
      section.classList.remove('active');
    });

    // Add active class to target section
    targetSection.classList.add('active');
    
    // Smooth scroll to top of content if it's mobile or just for better UX
    if (window.innerWidth < 768) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Handle Hash Changes and Initial Load
  function handleNavigation() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      activateSection(hash);
    } else {
      // Default to bio if no hash
      activateSection('bio');
    }
  }

  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.id.replace('show-', '');
      // Update URL hash without jumping
      history.pushState(null, null, `#${targetId}`);
      activateSection(targetId);
    });
  });

  // Listen for back/forward navigation
  window.addEventListener('popstate', handleNavigation);
  
  // Initial check
  handleNavigation();

  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun');
  const moonIcon = document.getElementById('moon');

  function updateThemeIcon() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }

  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pref-theme', newTheme);
    updateThemeIcon();
  });

  // Initialize theme icon
  updateThemeIcon();

  // Scroll to top functionality
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', function() {
    if (!scrollTopBtn) return;
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  });

  scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Loader hide after full load
  window.addEventListener('load', function() {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 500);
  });

  // Header scroll effect
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ---------- Project Grid Logic (Bento Style) ----------
  async function initProjectGrid() {
    const projectGrid = document.getElementById('project-grid-container');
    if (!projectGrid) return;

    try {
      const response = await fetch('projects/projects.json');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const allProjects = await response.json();
      
      // Get top 3 projects (either marked as featured or the latest ones)
      const featuredProjects = allProjects.filter(p => p.featured).slice(0, 3);
      const displayProjects = featuredProjects.length >= 3 ? featuredProjects : allProjects.slice(0, 3);

      projectGrid.innerHTML = ''; // Clear loading state

      displayProjects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        // Tech to Icon Mapping Helper
        const getTechIcon = (name) => {
          const n = name.toLowerCase();
          if (n.includes('python')) return 'fab fa-python';
          if (n.includes('javascript') || n === 'js') return 'fab fa-js';
          if (n.includes('flask')) return 'fas fa-flask';
          if (n.includes('react')) return 'fab fa-react';
          if (n.includes('html')) return 'fab fa-html5';
          if (n.includes('css')) return 'fab fa-css3-alt';
          if (n.includes('node')) return 'fab fa-node-js';
          if (n.includes('database') || n.includes('sql') || n.includes('mysql')) return 'fas fa-database';
          if (n.includes('chart') || n.includes('analysis') || n.includes('pandas')) return 'fas fa-chart-line';
          if (n.includes('ai') || n.includes('learning') || n.includes('ml')) return 'fas fa-microchip';
          return 'fas fa-check'; // Fallback
        };

        // Get tech stack from features with specific icons
        const features = (project.features || []).slice(0, 4).map(feat => `<li><i class="${getTechIcon(feat)}"></i> ${feat}</li>`).join('');

        // Link buttons
        let linksHtml = '';
        if (project.github) {
          linksHtml += `<a href="${project.github}" target="_blank" class="project-link-icon" title="GitHub"><i class="fab fa-github"></i></a>`;
        }
        if (project.web && !project.hideWebLink) {
          linksHtml += `<a href="${project.web}" target="_blank" class="project-link-icon" title="Live Demo"><i class="fas fa-external-link-alt"></i></a>`;
        }

        card.innerHTML = `
          <div class="project-card-image">
            <img src="${project.thumbnail || 'assets/images/placeholder.jpg'}" alt="${project.title}" loading="lazy">
          </div>
          <div class="project-card-content">
            <h3>${project.title.split(':')[0]}</h3>
            <p class="summary">${project.description}</p>
            <ul class="feature-list">
              ${features || '<li><i class="fas fa-check"></i> Innovation</li><li><i class="fas fa-check"></i> Performance</li>'}
            </ul>
            <div class="card-footer">
              <div class="project-links">
                ${linksHtml}
              </div>
              <a href="${project.url}" class="card-arrow" title="View Details">
                <i class="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        `;
        
        projectGrid.appendChild(card);
      });

    } catch (error) {
      console.error('Error loading projects:', error);
      projectGrid.innerHTML = '<div class="error">Unable to load projects at this time.</div>';
    }
  }

  // Initialize
  initProjectGrid();
});