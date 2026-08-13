/**
 * Adaptive Dynamic Canvas Background: Mouse-Reactive Neon Energy Waves & Particle Constellation
 * Supports: Dark Mode & Light Mode Theme Adaptation
 * Author: Muhammad Taha Nasir (Terry)
 */

(function () {
  'use strict';

  function initBackgroundCanvas() {
    // Remove old static wave canvas if present on index.html
    const oldCanvas = document.getElementById('bg-waves');
    if (oldCanvas) oldCanvas.remove();

    // Remove old orb container if present
    const oldOrb = document.getElementById('orb-container');
    if (oldOrb) oldOrb.remove();

    let canvas = document.getElementById('bg-canvas');
    if (canvas && canvas.getAttribute('data-initialized') === 'true') return;

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bg-canvas';
      document.body.prepend(canvas);
    }
    canvas.setAttribute('data-initialized', 'true');
    canvas.style.cssText = 'position: fixed; inset: 0; z-index: -2; pointer-events: none; transition: background 0.5s ease;';

    let overlay = document.getElementById('bg-canvas-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'bg-canvas-overlay';
      overlay.style.cssText = 'position: fixed; inset: 0; z-index: -1; pointer-events: none; transition: background 0.5s ease;';
      document.body.prepend(overlay);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;
    let isLightMode = false;

    // Theme Color Configurations
    function updateThemeColors() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      isLightMode = currentTheme === 'light';

      if (isLightMode) {
        canvas.style.background = '#f8fafc';
        overlay.style.background = 'linear-gradient(to top, rgba(248, 250, 252, 0.92) 0%, rgba(248, 250, 252, 0.4) 50%, transparent 100%)';
      } else {
        canvas.style.background = '#06070d';
        overlay.style.background = 'linear-gradient(to top, rgba(6, 7, 13, 0.92) 0%, rgba(6, 7, 13, 0.4) 50%, transparent 100%)';
      }
    }

    function updateThemeIcons(theme) {
      const sun = document.getElementById('sun');
      const moon = document.getElementById('moon');
      if (sun) sun.style.display = theme === 'dark' ? 'none' : 'block';
      if (moon) moon.style.display = theme === 'dark' ? 'block' : 'none';
    }

    function setTheme(theme) {
      const validTheme = theme === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', validTheme);
      document.documentElement.style.backgroundColor = validTheme === 'dark' ? '#06070d' : '#f8fafc';
      try {
        localStorage.setItem('pref-theme', validTheme);
      } catch (e) {}
      updateThemeIcons(validTheme);
    }

    window.setTheme = setTheme;
    window.toggleTheme = function() {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    };

    updateThemeColors();
    updateThemeIcons(document.documentElement.getAttribute('data-theme') || 'dark');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') || 'dark';
          updateThemeColors();
          updateThemeIcons(newTheme);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // Universal Cross-Tab Theme Synchronization
    window.addEventListener('storage', (e) => {
      if (e.key === 'pref-theme' && e.newValue) {
        setTheme(e.newValue);
      }
    });

    // Single Intercepting Theme Toggle Click Handler (prevents duplicate handler conflicts)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#theme-toggle');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        window.toggleTheme();
      }
    }, true);

    let mouse = { x: null, y: null, radius: 220 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Particle Constellation
    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 13000), 70);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (isLightMode) {
          ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#0284c7';
        } else {
          ctx.fillStyle = 'rgba(0, 122, 255, 0.6)';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#007aff';
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            let angle = Math.atan2(dy, dx);
            let force = (mouse.radius - dist) / mouse.radius;
            this.x -= Math.cos(angle) * force * 2;
            this.y -= Math.sin(angle) * force * 2;
          }
        }
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      const maxDistance = 130;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            let opacity = (1 - dist / maxDistance) * (isLightMode ? 0.3 : 0.22);
            ctx.beginPath();
            ctx.strokeStyle = isLightMode 
              ? `rgba(2, 132, 199, ${opacity})`
              : `rgba(0, 122, 255, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // --- Cursor Reactive Glowing Neon Energy Waves ---
    function drawNeonWaves() {
      const darkWaves = [
        { amplitude: 45, wavelength: 0.008, speed: 0.015, offset: 0, color: 'rgba(0, 122, 255, 0.45)', glow: '#007aff' },
        { amplitude: 65, wavelength: 0.005, speed: 0.01, offset: Math.PI / 2, color: 'rgba(6, 182, 212, 0.4)', glow: '#06b6d4' },
        { amplitude: 35, wavelength: 0.012, speed: 0.02, offset: Math.PI, color: 'rgba(56, 189, 248, 0.35)', glow: '#38bdf8' }
      ];

      const lightWaves = [
        { amplitude: 45, wavelength: 0.008, speed: 0.015, offset: 0, color: 'rgba(2, 132, 199, 0.45)', glow: '#0284c7' },
        { amplitude: 65, wavelength: 0.005, speed: 0.01, offset: Math.PI / 2, color: 'rgba(14, 165, 233, 0.4)', glow: '#0ea5e9' },
        { amplitude: 35, wavelength: 0.012, speed: 0.02, offset: Math.PI, color: 'rgba(99, 102, 241, 0.35)', glow: '#6366f1' }
      ];

      const waves = isLightMode ? lightWaves : darkWaves;

      // Left Margin Mouse-Reactive Energy Wave
      waves.forEach((w) => {
        ctx.beginPath();
        ctx.shadowBlur = 18;
        ctx.shadowColor = w.glow;
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 2.5;

        for (let y = 0; y <= height; y += 4) {
          let baseX = 60 + Math.sin(y * w.wavelength + time * w.speed + w.offset) * w.amplitude;
          let x = baseX;

          if (mouse.x !== null && mouse.y !== null) {
            let dy = mouse.y - y;
            let dx = mouse.x - baseX;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              let force = (1 - dist / mouse.radius);
              x += Math.sign(dx) * force * 55;
            }
          }

          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Right Margin Mouse-Reactive Energy Wave
      waves.forEach((w) => {
        ctx.beginPath();
        ctx.shadowBlur = 18;
        ctx.shadowColor = w.glow;
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 2.5;

        for (let y = 0; y <= height; y += 4) {
          let baseX = (width - 60) + Math.cos(y * w.wavelength + time * w.speed + w.offset) * w.amplitude;
          let x = baseX;

          if (mouse.x !== null && mouse.y !== null) {
            let dy = mouse.y - y;
            let dx = mouse.x - baseX;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              let force = (1 - dist / mouse.radius);
              x += Math.sign(dx) * force * 55;
            }
          }

          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      drawNeonWaves();

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();

      requestAnimationFrame(animate);
    }

    initParticles();
    animate();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBackgroundCanvas();
  });

})();
