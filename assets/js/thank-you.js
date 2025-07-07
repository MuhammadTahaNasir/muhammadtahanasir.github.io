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