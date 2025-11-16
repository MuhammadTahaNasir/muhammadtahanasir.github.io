(function() {
	// Use root-relative links so the nav works from any nested path
	var template = '' +
		'<a href="/index.html"><i class="fas fa-home"></i><span>Home</span></a>' +
		'<a href="/resources.html"><i class="fas fa-book"></i><span>Resources</span></a>' +
		'<a href="/archives.html"><i class="fas fa-archive"></i><span>Archives</span></a>' +
		'<a href="/resume.html"><i class="fas fa-file-alt"></i><span>Resume</span></a>' +
		'<a href="/search.html"><i class="fas fa-search"></i><span>Search</span></a>';

	function getFileName(pathname) {
		if (!pathname || pathname === '/' || pathname === '/index.html') return 'index.html';
		const parts = pathname.split('/').filter(Boolean);
		const last = parts[parts.length - 1] || 'index.html';
		return last.includes('.') ? last : 'index.html';
	}

	function ensureBottomNav() {
		// Only use a body-level nav, ignore any header-contained nav
		var nav = document.querySelector('body > nav.bottom-nav');
		if (!nav) {
			nav = document.createElement('nav');
			nav.className = 'bottom-nav';
			nav.setAttribute('aria-label', 'Primary');
			document.body.appendChild(nav);
		}
		nav.innerHTML = template;
		
		// Immediately set active state after creating nav
		var current = getFileName(window.location.pathname);
		var links = nav.querySelectorAll('a');
		links.forEach(function(link) {
			var href = link.getAttribute('href');
			var linkFile = href.replace(/^\//, '') || 'index.html';
			if (linkFile === current) {
				link.classList.add('active');
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', ensureBottomNav);
	} else {
		ensureBottomNav();
	}
})();


