/**
 * Projects Page Script
 * Displays filterable and searchable project portfolio with grid/list views
 */

/**
 * Format category name for display
 * @param {string} subcategory - Raw category name
 * @param {boolean} forDisplay - Whether to format for display
 * @returns {string} - Formatted category name
 */
const formatCategory = (subcategory, forDisplay = false) => {
    if (!forDisplay) return subcategory; // Return raw subcategory for dropdown
    return subcategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// Technology Icon Mapper
const technologyIcons = {
    'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'Flask': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
    'FastAPI': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
    'PHP': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    'MySQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    'CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    'Pandas': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg',
    'Scikit-learn': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg',
    'Streamlit': 'https://streamlit.io/images/brand/streamlit-mark-color.png',
    'Chart.js': 'https://www.chartjs.org/img/chartjs-logo.svg',
    'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    'Vue': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    'Angular': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
    'Django': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
    'PostgreSQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    'MongoDB': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    'Docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    'Git': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
};

/**
 * Get technology icon HTML
 * @param {string} technology - Technology name
 * @returns {string|null} - HTML for icon or null if not found
 */
const getTechnologyIcon = (technology) => {
    const icon = technologyIcons[technology];
    if (icon) {
        return `<img src="${icon}" alt="${technology}" title="${technology}">`;
    }
    return null;
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
const mobileToggleButtons = document.querySelectorAll('.mobile-toggle-btn');
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
        projectsGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-folder-open"></i>
                </div>
                <h3>No projects found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button class="reset-filters-btn" onclick="resetFilters()">
                    <i class="fas fa-redo"></i> Reset Filters
                </button>
            </div>
        `;
        return;
    }

    projectsGrid.classList.remove('empty');

    filteredProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-category', project.subcategory);
        card.setAttribute('data-title', project.title);
        card.setAttribute('data-date', project.date);

        // Determine status indicator (subtle dot)
        const projectState = project.state || 'active';
        const statusDot = `<span class="status-indicator ${projectState}" title="${projectState.charAt(0).toUpperCase() + projectState.slice(1)}"></span>`;

        // Create elegant overlay badges for image
        const isPublic = !project.hideWebLink || project.github;
        const statusBadge = isPublic 
            ? `<span class="overlay-badge status-public"><i class="fas fa-globe"></i> Public</span>`
            : `<span class="overlay-badge status-private"><i class="fas fa-lock"></i> Private</span>`;
        
        let stateBadge = '';
        if (projectState === 'active') {
            stateBadge = `<span class="overlay-badge state-active"><i class="fas fa-circle"></i> Active</span>`;
        } else if (projectState === 'completed') {
            stateBadge = `<span class="overlay-badge state-completed"><i class="fas fa-check"></i> Completed</span>`;
        } else if (projectState === 'closed') {
            stateBadge = `<span class="overlay-badge state-closed"><i class="fas fa-times"></i> Closed</span>`;
        }

        // Conditionally include web link based on hideWebLink
        const webLink = project.hideWebLink ? '' : `<a href="${project.web || project.url}" class="web-link" title="Visit Website"><i class="fas fa-external-link-alt"></i> Live</a>`;

        // Generate feature tags with icons where available
        let featureTags = '';
        if (project.features) {
            const maxFeatures = 3;
            const visibleFeatures = project.features.slice(0, maxFeatures);
            
            featureTags = visibleFeatures.map(feature => {
                const icon = getTechnologyIcon(feature);
                if (icon) {
                    return `<span class="feature-tag feature-with-icon">${icon}<span>${feature}</span></span>`;
                } else {
                    return `<span class="feature-tag">${feature}</span>`;
                }
            }).join('');

            if (project.features.length > maxFeatures) {
                featureTags += `<span class="feature-tag extra">+${project.features.length - maxFeatures}</span>`;
            }
        }

        card.innerHTML = `
            <div class="project-image-wrapper">
                <a href="${project.url}">
                    <img src="${project.thumbnail || 'https://via.placeholder.com/300x200'}" alt="${project.title}" loading="lazy">
                </a>
                <div class="project-badges">
                    ${statusBadge}
                    ${stateBadge}
                </div>
            </div>
            <div class="content-container">
                <div class="category-tag">${formatCategory(project.subcategory, true)}</div>
                <h3><a href="${project.url}">${project.title}</a></h3>
                <p>${project.description}</p>
                <div class="features-tags">
                    ${featureTags}
                </div>
                <div class="project-links">
                    ${webLink}
                    ${project.github ? `<a href="${project.github}" class="github-link" title="View on GitHub"><i class="fab fa-github"></i> Code</a>` : ''}
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
    localStorage.setItem('projects-search', searchQuery);
    applyFilter();
}, 300));

categorySelect.addEventListener('change', () => {
    currentCategory = categorySelect.value;
    localStorage.setItem('projects-category', currentCategory);
    applyFilter();
});

sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    localStorage.setItem('projects-sort', currentSort);
    applyFilter();
});

// Mobile Toggle Buttons Listener
mobileToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        mobileToggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');
        localStorage.setItem('projects-tab', currentTab);
        
        // Sync desktop toggle buttons
        toggleButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === currentTab);
        });
        
        categorySelect.value = 'all';
        currentCategory = 'all';
        applyFilter();
    });
});

toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');
        localStorage.setItem('projects-tab', currentTab);
        
        // Sync mobile toggle buttons
        mobileToggleButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === currentTab);
        });
        
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

// Reset Filters Function
function resetFilters() {
    // Reset all filter values
    searchInput.value = '';
    searchQuery = '';
    currentCategory = 'all';
    categorySelect.value = 'all';
    currentSort = 'newest';
    sortSelect.value = 'newest';
    currentTab = 'all';
    
    // Clear localStorage
    localStorage.removeItem('projects-tab');
    localStorage.removeItem('projects-search');
    localStorage.removeItem('projects-category');
    localStorage.removeItem('projects-sort');
    
    // Reset toggle buttons
    toggleButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'all');
    });
    mobileToggleButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'all');
    });
    
    // Reapply filters
    applyFilter();
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // Activate loader on page load
    loader.classList.add('active');
    
    // Restore filter states from localStorage
    const savedTab = localStorage.getItem('projects-tab') || 'all';
    const savedSearch = localStorage.getItem('projects-search') || '';
    const savedCategory = localStorage.getItem('projects-category') || 'all';
    const savedSort = localStorage.getItem('projects-sort') || 'newest';
    
    // Apply saved states
    currentTab = savedTab;
    searchQuery = savedSearch;
    currentCategory = savedCategory;
    currentSort = savedSort;
    
    // Update UI elements
    searchInput.value = savedSearch;
    categorySelect.value = savedCategory;
    sortSelect.value = savedSort;
    
    // Set active toggle buttons based on saved tab
    toggleButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === currentTab);
    });
    mobileToggleButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === currentTab);
    });
    
    gridViewBtn.classList.add('active');
    
    // Load projects after a short delay to show loader
    setTimeout(() => {
        loadProjects();
    }, 100);
});