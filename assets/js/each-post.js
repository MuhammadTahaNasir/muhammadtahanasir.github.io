document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("pref-theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if (localStorage.getItem("pref-theme") === "light") {
    document.body.classList.remove("dark");
}
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const tagsMeta = document.querySelector('meta[name="tags"]');
    if (tagsMeta) {
        const tagsContainer = document.getElementById("dynamic-tags");
        const tags = tagsMeta.content.split(",").map(tag => tag.trim());
        let tagsHTML = "";
        tags.forEach(tag => {
            tagsHTML += `<a class="tag" href="/tags/tag.html?name=${encodeURIComponent(tag)}">${tag}</a>`;
        });
        tagsContainer.innerHTML = tagsHTML;
    }

    // Add copy button functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const code = button.nextElementSibling.innerText;
            navigator.clipboard.writeText(code).then(() => {
                button.innerText = "Copied!";
                setTimeout(() => button.innerText = "Copy", 1500);
            });
        });
    });
});
window.addEventListener('scroll', () => {
    document.getElementById('scrollTop').style.display =
        window.scrollY > 200 ? 'flex' : 'none';
});
document.getElementById('scrollTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
