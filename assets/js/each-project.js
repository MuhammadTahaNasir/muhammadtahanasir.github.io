document.addEventListener("DOMContentLoaded", () => {
    // Apply saved or system theme
    const savedTheme = localStorage.getItem("pref-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
    updateThemeIcons();

    // Dynamically generate tool tags from meta features
    const featuresMeta = document.querySelector('meta[name="features"]');
    const toolsTagsDiv = document.getElementById('project-tools-tags');
    if (featuresMeta && toolsTagsDiv) {
        const features = featuresMeta.content.split(',').map(feature => feature.trim());
        toolsTagsDiv.innerHTML = features.map(feature => `
            <a href="/tags/tag.html?name=${encodeURIComponent(feature)}" class="tag">${feature}</a>
        `).join(' ');
    }
});

document.getElementById("theme-toggle").addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem("pref-theme", currentTheme);
    updateThemeIcons();
});

function updateThemeIcons() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.getElementById("sun").style.display = isDark ? "none" : "block";
    document.getElementById("moon").style.display = isDark ? "block" : "none";
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        updateThemeIcons();
    }
});

window.addEventListener("scroll", () => {
    const scrollTopButton = document.getElementById("scrollTop");
    if (scrollTopButton) {
        scrollTopButton.style.display = window.scrollY > 200 ? "flex" : "none";
    }
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll('.pill-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('#')) {
            history.pushState({ path: href }, '', href);
            window.location.assign(href);
        }
    });
});

window.addEventListener('popstate', (event) => {
    const state = event.state || {};
    if (state.path && state.path.includes('index.html')) {
        const savedTheme = localStorage.getItem('pref-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
        updateThemeIcons();
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
});