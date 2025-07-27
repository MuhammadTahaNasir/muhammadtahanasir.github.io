const formatCategory = (subcategory, forDisplay = false) => {
    if (!forDisplay) return subcategory; // Return raw subcategory for dropdown
    return subcategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// Global Variables
let projects = [];
let currentTab = 'all';
let searchQuery = '';
let currentCategory = 'all';
let currentSort = 'newest';
let isListView = false;

const projectsGrid = document.getElementById('projects-grid');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const scrollTopBtn = document.getElementById('scrollTop');
const themeToggle = document.getElementById('theme-toggle');
const loader = document.getElementById('loader');

// Debounce function to limit rapid calls
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Function to update category dropdown dynamically
function updateCategoryDropdown(categories) {
    categorySelect.innerHTML = ''; // Clear existing options
    
    // Ensure 'all' is the first option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categorySelect.appendChild(allOption);

    // Sort remaining categories alphabetically
    const sortedCategories = categories
        .filter(category => category !== 'all')
        .sort((a, b) => a.localeCompare(b));

    // Add sorted categories to dropdown
    sortedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = formatCategory(category); // Use raw subcategory
        categorySelect.appendChild(option);
    });
}

// Load Projects
async function loadProjects() {
    loader.classList.add('active');
    try {
        const response = await fetch('/projects/projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        projects = await response.json();

        // Extract unique subcategories and update dropdown
        const uniqueCategories = ['all', ...new Set(projects.map(project => project.subcategory))];
        updateCategoryDropdown(uniqueCategories);

        // Check URL parameters for search query
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            searchQuery = searchParam;
            searchInput.value = searchQuery;
        }

        applyFilter();
    } catch (error) {
        console.error('Fetch error:', error);
        projectsGrid.innerHTML = `<p class="no-results">😕 Failed to load projects. Check the console for details.</p>`;
    } finally {
        setTimeout(() => {
            loader.classList.add('no-blur');
        }, 600);
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.classList.remove('active');
        }, 800);
    }
}

// Apply Filter and Sort with Document Fragment
function applyFilter() {
    let filteredProjects = projects.filter(project => {
        const matchesSearch = !searchQuery ||
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = currentCategory === 'all' || project.subcategory === currentCategory;
        const matchesTab = currentTab === 'all' || project.tab === currentTab;

        return matchesSearch && matchesCategory && matchesTab;
    });

    filteredProjects.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        const dateA = a.date;
        const dateB = b.date;

        if (currentSort === 'newest') return dateB.localeCompare(dateA);
        if (currentSort === 'oldest') return dateA.localeCompare(dateB);
        if (currentSort === 'a-z') return titleA.localeCompare(titleB);
        if (currentSort === 'z-a') return titleB.localeCompare(titleA);
        return 0;
    });

    const fragment = document.createDocumentFragment();
    projectsGrid.innerHTML = '';
    projectsGrid.className = 'projects-grid' + (isListView ? ' list-view' : '');

    if (filteredProjects.length === 0) {
        projectsGrid.classList.add('empty');
        return;
    }

    projectsGrid.classList.remove('empty');

    filteredProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-category', project.subcategory);
        card.setAttribute('data-title', project.title);
        card.setAttribute('data-date', project.date);

        // Conditionally include web link based on hideWebLink
        const webLink = project.hideWebLink ? '' : `<a href="${project.url}" target="_blank" class="web-link"><i class="fas fa-globe"></i></a>`;

        card.innerHTML = `
            <a href="${project.url}" target="_blank">
                <img src="${project.thumbnail || 'https://via.placeholder.com/300x150'}" alt="${project.title}" loading="lazy">
            </a>
            <div class="content-container">
                <div class="category-tag">${formatCategory(project.subcategory, true)}</div>
                <h3><a href="${project.url}" target="_blank">${project.title}</a></h3>
                <p><a href="${project.url}" target="_blank">${project.description}</a></p>
                <div class="features-tags">
                    ${project.features ? (project.features.length > 3 ? project.features.slice(0, 3).map(feature => `<span class="feature-tag">${feature}</span>`).join('') + `<span class="feature-tag extra">+${project.features.length - 3}</span>` : project.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')) : ''}
                </div>
                <div class="project-links">
                    ${webLink}
                    ${project.github ? `<a href="${project.github}" target="_blank" class="github-link"><i class="fab fa-github"></i></a>` : ''}
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    projectsGrid.appendChild(fragment);
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    html.style.background = newTheme === 'dark' ? '#1a1a1a' : '#f9fafc';
    html.style.color = newTheme === 'dark' ? '#d1d5db' : '#333';
    html.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('pref-theme', newTheme);
});

// View Toggle
gridViewBtn.addEventListener('click', () => {
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    isListView = false;
    projectsGrid.classList.remove('list-view');
    applyFilter();
});

listViewBtn.addEventListener('click', () => {
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    isListView = true;
    projectsGrid.classList.add('list-view');
    applyFilter();
});

// Filter and Sort Listeners
searchInput.addEventListener('input', debounce(() => {
    searchQuery = searchInput.value.trim();
    applyFilter();
}, 300));

categorySelect.addEventListener('change', () => {
    currentCategory = categorySelect.value;
    applyFilter();
});

sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    applyFilter();
});

toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');
        categorySelect.value = 'all';
        searchInput.value = '';
        searchQuery = '';
        applyFilter();
    });
});

// Scroll to Top Button
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // Activate loader on page load
    loader.classList.add('active');
    
    const defaultToggle = document.querySelector('.toggle-btn[data-tab="all"]');
    if (defaultToggle) defaultToggle.classList.add('active');
    gridViewBtn.classList.add('active');
    
    // Load projects after a short delay to show loader
    setTimeout(() => {
        loadProjects();
    }, 100);
});