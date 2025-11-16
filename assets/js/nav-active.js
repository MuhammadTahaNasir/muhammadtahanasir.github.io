// Normalize and set active state for header pill-nav and bottom-nav
(function() {
	function getFileName(pathname) {
		if (!pathname || pathname === '/' || pathname === '/index.html') return 'index.html';
		const parts = pathname.split('/').filter(Boolean);
		const last = parts[parts.length - 1] || 'index.html';
		return last.includes('.') ? last : 'index.html';
	}

	function normalizeHref(href) {
		try {
			// Handle both relative and absolute URLs
			if (!href) return '';
			// Remove leading slash if present
			const cleanHref = href.replace(/^\//, '');
			const url = new URL(cleanHref, window.location.origin);
			return getFileName(url.pathname);
		} catch (e) {
			// Fallback for simple filenames
			return href.replace(/^\//, '') || 'index.html';
		}
	}

	function updateActive(selector) {
		const container = document.querySelector(selector);
		if (!container) return;
		const links = Array.from(container.querySelectorAll('a'));
		const current = getFileName(window.location.pathname);
		
		links.forEach(a => {
			const href = a.getAttribute('href');
			if (!href) return;
			
			const target = normalizeHref(href);
			
			// Remove or add active class based on match
			if (target === current) {
				a.classList.add('active');
			} else {
				a.classList.remove('active');
			}
		});
	}

	function run() {
		updateActive('.pill-nav');
		updateActive('.bottom-nav');
	}

	// Run on load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run);
	} else {
		run();
	}
	
	// Also update on page show (for back/forward navigation)
	window.addEventListener('pageshow', run);
})();


