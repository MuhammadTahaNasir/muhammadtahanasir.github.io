(function() {
	var template = '' +
		'<div class="nav-container">' +
			'<div class="nav-indicator"></div>' +
			'<a href="/index.html" class="nav-item" data-index="0"><i class="fas fa-home"></i><span>Home</span></a>' +
			'<a href="/projects.html" class="nav-item" data-index="1"><i class="fas fa-rocket"></i><span>Projects</span></a>' +
			'<a href="/archives.html" class="nav-item" data-index="2"><i class="fas fa-archive"></i><span>Archives</span></a>' +
			'<a href="/resume.html" class="nav-item" data-index="3"><i class="fas fa-file-alt"></i><span>Resume</span></a>' +
			'<a href="/search.html" class="nav-item" data-index="4"><i class="fas fa-search"></i><span>Search</span></a>' +
		'</div>';

	function getActiveIndex() {
		var currentPath = window.location.pathname.toLowerCase();
		var currentHref = window.location.href.toLowerCase();
		let activeIndex = -1;

		// 1. Check folder pathnames or prefixes first (most accurate for subfolders)
		if (currentPath.includes('/projects/') || currentPath.endsWith('projects.html') || currentPath.endsWith('projects')) {
			return 1; // Projects
		}
		if (currentPath.includes('/posts/') || currentPath.includes('/tags/') || currentPath.endsWith('tags.html') || currentPath.endsWith('archives.html') || currentPath.endsWith('archives')) {
			return 2; // Archives / Posts
		}
		if (currentPath.endsWith('resume.html') || currentPath.endsWith('resume')) {
			return 3; // Resume
		}
		if (currentPath.endsWith('search.html') || currentPath.endsWith('search')) {
			return 4; // Search
		}
		if (currentPath === '/' || currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath.endsWith('index')) {
			return 0; // Home
		}

		// 2. Fallback normalization check
		let pageName = currentPath.split('/').pop() || 'index.html';
		if (pageName === '') pageName = 'index.html';

		const navItems = [
			{ href: 'index.html', base: 'index' },
			{ href: 'projects.html', base: 'projects' },
			{ href: 'archives.html', base: 'archives' },
			{ href: 'resume.html', base: 'resume' },
			{ href: 'search.html', base: 'search' }
		];

		navItems.forEach(function(item, index) {
			if (pageName === item.href || pageName === item.base) {
				activeIndex = index;
			} else if (currentHref.endsWith(item.href) || currentHref.endsWith(item.base)) {
				if (activeIndex === -1) activeIndex = index;
			}
		});

		return activeIndex;
	}

	function ensureBottomNav() {
		var nav = document.querySelector('body > nav.bottom-nav');
		if (!nav) {
			nav = document.createElement('nav');
			document.body.appendChild(nav);
		}
		nav.className = 'bottom-nav premium-nav';
		nav.innerHTML = template;
		
		const activeIndex = getActiveIndex();
		const links = nav.querySelectorAll('.nav-item');
		const indicator = nav.querySelector('.nav-indicator');

		if (activeIndex !== -1 && links[activeIndex]) {
			// Set initial position WITHOUT transition first to avoid jump from 0
			indicator.style.transition = 'none';
			indicator.style.transform = 'translateX(calc(' + activeIndex + ' * 100%))';
			
			// Force reflow
			indicator.offsetHeight;
			
			// Re-enable transition and add active class
			indicator.style.transition = '';
			links[activeIndex].classList.add('active');
			if (indicator) {
				indicator.style.opacity = '1';
			}
		} else {
			// Hide indicator if no active tab matches (e.g. contact or other pages)
			if (indicator) {
				indicator.style.opacity = '0';
			}
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', ensureBottomNav);
	} else {
		ensureBottomNav();
	}
})();


