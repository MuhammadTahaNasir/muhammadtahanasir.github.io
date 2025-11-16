// Theme toggle logic and make body visible
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('theme-applied'); // Ensure body is visible
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        html.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('pref-theme', newTheme);
        // Update styles immediately
        html.style.background = newTheme === 'dark' ? '#1a1a1a' : '#f9fafc';
        html.style.color = newTheme === 'dark' ? '#d1d5db' : '#333';
    });
});

// ---------- Loader Handling ----------
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.classList.add("hidden");
        }, 800);
    }
});

// ---------- Header Scroll Effect ----------
window.addEventListener("scroll", () => {
    const header = document.querySelector('.header');
    const scrollTopBtn = document.getElementById('scrollTop');
    
    // Add/remove scrolled class to header for blur effect
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Show scroll to top button
    if (scrollTopBtn) {
        scrollTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
    }
});

// ---------- Scroll to Top Functionality ----------
document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});