let tagList = [];
let posts = [];
const loader = document.getElementById('loader');

async function loadTags() {
    loader.classList.add('active');
    try {
        const res = await fetch("../posts/posts.json");
        if (!res.ok) throw new Error('File not found');
        posts = await res.json();
        const tagMap = new Map();
        posts.forEach(p => {
            p.tags.forEach(tag => {
                tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
            });
        });
        tagList = [...tagMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        renderTags(tagList);
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('tagsGrid').innerHTML = `<p class="no-results">😕 Failed to load tags. Check the console for details.</p>`;
    } finally {
        setTimeout(() => {
            loader.classList.add('no-blur');
        }, 900);
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.classList.remove('active');
        }, 1200);
    }
}

function renderTags(list) {
    const tagsGrid = document.getElementById("tagsGrid");
    if (list.length === 0) {
        tagsGrid.innerHTML = '<p class="no-results">😕 No tags found.</p>';
        return;
    }
    tagsGrid.innerHTML = list.map(([tag, count]) => `
        <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">
          ${tag}<span class="tag-count">${count}</span>
        </a>
      `).join('');
}

document.getElementById("tagSearch").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    const filtered = tagList.filter(([tag]) => tag.toLowerCase().includes(q));
    renderTags(filtered);
});

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("pref-theme", document.body.classList.contains("dark") ? "dark" : "light");
});

const savedTheme = localStorage.getItem("pref-theme");
if (savedTheme) {
    document.body.classList.toggle("dark", savedTheme === "dark");
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add("dark");
}

window.addEventListener("scroll", () => {
    document.getElementById("scrollTop").style.display =
        window.scrollY > 200 ? "flex" : "none";
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

loadTags();