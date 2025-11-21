// Resume page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
  // Activate loader immediately on DOM ready
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('active');

  // Page-wide fade-in
  const main = document.querySelector('main.post-container');
  if (main) main.classList.add('page-fade-in');
  // Toggle functionality for resume sections
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  const contentSections = document.querySelectorAll('.content-section');
  
  // Function to activate a specific tab
  function activateTab(tabId, saveToStorage = true) {
    const targetSection = document.getElementById(tabId + '-section');
    const targetButton = document.getElementById('show-' + tabId);
    
    if (!targetSection || !targetButton) return;

    // Remove active class from all buttons and sections
    toggleButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });

    contentSections.forEach(section => {
      section.classList.remove('active');
    });

    // Add active class to target button and section
    targetButton.classList.add('active');
    targetButton.setAttribute('aria-selected', 'true');
    targetSection.classList.add('active');
    
    // Save active tab to localStorage
    if (saveToStorage) {
      localStorage.setItem('resume-active-tab', tabId);
    }
  }
  
  // Restore active tab immediately if saved
  const savedTab = window.__savedResumeTab;
  if (savedTab) {
    activateTab(savedTab, false);
  }
  
  // Map timeline cards to their corresponding milestones for precise hover highlight
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const cards = timeline.querySelectorAll('.timeline-card');
    const milestones = timeline.querySelectorAll('.milestone');
    // Ensure equal length pairing in order
    const pairCount = Math.min(cards.length, milestones.length);
    for (let i = 0; i < pairCount; i++) {
      const card = cards[i];
      const dot = milestones[i];
      card.addEventListener('mouseenter', () => {
        milestones.forEach(m => m.classList.remove('highlight'));
        dot.classList.add('highlight');
      });
      card.addEventListener('mouseleave', () => {
        dot.classList.remove('highlight');
      });
    }
  }

  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.id.replace('show-', '');
      activateTab(targetId);
    });
  });

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

  // Scroll-reveal animation for project cards
  function revealOnScroll() {
    const projectCards = document.querySelectorAll('.project-showcase-card');
    const windowHeight = window.innerHeight;
    const revealPoint = 100;

    projectCards.forEach(card => {
      const cardTop = card.getBoundingClientRect().top;
      
      if (cardTop < windowHeight - revealPoint) {
        card.classList.add('revealed');
      }
    });
  }

  // Run on scroll
  window.addEventListener('scroll', revealOnScroll);
  
  // Run on load to catch any cards already in viewport
  revealOnScroll();
});