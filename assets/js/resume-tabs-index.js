/**
 * Resume Section Tab Switcher Component for index.html & resume.html
 */
(function() {
  'use strict';

  function initResumeTabs() {
    const tabs = [
      { btnId: 'show-skills', secId: 'skills-section' },
      { btnId: 'show-experience', secId: 'experience-section' },
      { btnId: 'show-education', secId: 'education-section' }
    ];

    tabs.forEach(({ btnId, secId }) => {
      const btn = document.getElementById(btnId);
      const sec = document.getElementById(secId);
      if (!btn || !sec) return;

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        tabs.forEach(t => {
          const b = document.getElementById(t.btnId);
          const s = document.getElementById(t.secId);
          if (b) {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          }
          if (s) {
            s.classList.remove('active');
            s.style.display = 'none';
          }
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        sec.classList.add('active');
        sec.style.display = 'block';

        // Trigger timeline scroll position update on tab change
        setTimeout(() => {
          window.dispatchEvent(new Event('scroll'));
        }, 50);
      });
    });
  }

  // Tech Dock Bar Dynamic Spec HUD Interactor
  function initTechDock() {
    const dockItems = document.querySelectorAll('.tech-dock-item');
    const hudIcon = document.getElementById('tech-spec-icon');
    const hudTitle = document.getElementById('tech-spec-title');
    const hudCat = document.getElementById('tech-spec-category');
    const hudDesc = document.getElementById('tech-spec-desc');

    if (!dockItems.length || !hudTitle) return;

    function updateHUD(item) {
      const name = item.getAttribute('data-name');
      const cat = item.getAttribute('data-category');
      const desc = item.getAttribute('data-desc');
      const icon = item.getAttribute('data-icon');
      const itemImg = item.querySelector('img');
      const isDarkInvert = itemImg && itemImg.classList.contains('dark-invert');

      dockItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      if (hudIcon && icon) {
        hudIcon.src = icon;
        if (isDarkInvert) {
          hudIcon.classList.add('dark-invert');
        } else {
          hudIcon.classList.remove('dark-invert');
        }
      }
      if (hudTitle && name) hudTitle.textContent = name;
      if (hudCat && cat) hudCat.textContent = cat;
      if (hudDesc && desc) hudDesc.textContent = desc;
    }

    dockItems.forEach(item => {
      item.addEventListener('mouseenter', () => updateHUD(item));
      item.addEventListener('click', () => updateHUD(item));
    });
  }

  // Scroll-Driven Timeline Line Fill & Avatar Ball Animation
  function initTimelineScrollProgress() {
    const timelines = document.querySelectorAll('.timeline');
    if (!timelines.length) return;

    function updateScroll() {
      timelines.forEach(timeline => {
        // Skip hidden timeline sections
        if (timeline.offsetWidth === 0 && timeline.offsetHeight === 0) return;

        const fill = timeline.querySelector('.timeline-line-fill');
        const ball = timeline.querySelector('.timeline-avatar-ball');
        if (!fill || !ball) return;

        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const startPoint = windowHeight * 0.75;
        const totalHeight = rect.height;

        let scrollProgress = 0;
        if (rect.top <= startPoint) {
          const scrolledDistance = startPoint - rect.top;
          scrollProgress = Math.min(1, Math.max(0, scrolledDistance / (totalHeight + 80)));
        }

        const fillPercent = scrollProgress * 100;
        const ballTopPos = scrollProgress * totalHeight;

        fill.style.height = `${fillPercent}%`;
        ball.style.top = `${ballTopPos}px`;

        // Activate/Glow timeline cards when avatar ball is near them
        const cards = timeline.querySelectorAll('.timeline-card');
        cards.forEach(card => {
          const cardTop = card.offsetTop;
          const cardHeight = card.offsetHeight;
          const cardBottom = cardTop + cardHeight;

          // Activate card when ball is within vertical range of card
          if (ballTopPos >= (cardTop - 70) && ballTopPos <= (cardBottom + 40)) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        });
      });
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    updateScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initResumeTabs();
      initTechDock();
      initTimelineScrollProgress();
    });
  } else {
    initResumeTabs();
    initTechDock();
    initTimelineScrollProgress();
  }
})();
