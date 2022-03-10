// Normalize and set active state for header pill-nav and bottom-nav
(function() {
	function updateActive() {
		const currentUrl = window.location.href.toLowerCase();
		const currentPath = window.location.pathname.toLowerCase();
		const selectors = ['.pill-nav'];
		
		selectors.forEach(selector => {
			const container = document.querySelector(selector);
			if (!container) return;
			
			const links = container.querySelectorAll('a');
			let activeIndex = -1;

			links.forEach((a, index) => {
				const href = a.getAttribute('href').toLowerCase();
				const base = href.replace('.html', '');
				const pageName = currentPath.split('/').pop() || 'index.html';

				if (pageName === href || pageName === base) {
					activeIndex = index;
				} else if (currentPath.endsWith(href) || currentUrl.includes(href)) {
					if (activeIndex === -1) activeIndex = index;
				}
			});

			// No fallback for Home page in pill-nav since Home is not an item there


			links.forEach((a, index) => {
				if (index === activeIndex) {
					a.classList.add('active');
					a.setAttribute('aria-selected', 'true');
				} else {
					a.classList.remove('active');
					a.setAttribute('aria-selected', 'false');
				}
			});
		});
	}

	function run() {
		updateActive();
		// Re-run to catch dynamically loaded content
		setTimeout(updateActive, 100);
		setTimeout(updateActive, 1000);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run);
	} else {
		run();
	}
	window.addEventListener('pageshow', run);
})();


