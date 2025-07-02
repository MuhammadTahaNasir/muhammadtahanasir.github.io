// Theme handling
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("pref-theme");
    if (savedTheme) {
        document.body.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark");
    }
    updateThemeIcons();
});

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("pref-theme", document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeIcons();
});

function updateThemeIcons() {
    const isDark = document.body.classList.contains("dark");
    document.getElementById("sun").style.display = isDark ? "none" : "block";
    document.getElementById("moon").style.display = isDark ? "block" : "none";
}

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) {
        document.body.classList.toggle("dark", e.matches);
        updateThemeIcons();
    }
});

// Scroll to top
window.addEventListener("scroll", () => {
    const scrollTopButton = document.getElementById("scrollTop");
    if (scrollTopButton) {
        scrollTopButton.style.display = window.scrollY > 200 ? "flex" : "none";
    }
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Loader handling
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("active");
        setTimeout(() => {
            loader.classList.add("no-blur");
        }, 900);
        setTimeout(() => {
            loader.classList.add("hidden");
            loader.classList.remove("active");
        }, 1200);
    }
});
const cards = document.querySelectorAll('.timeline-card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
        } else {
            entry.target.classList.remove('reveal');
        }
    });
}, {
    threshold: 0.15,
});

cards.forEach(card => {
    observer.observe(card);
});
