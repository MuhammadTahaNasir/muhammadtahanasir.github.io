(function() {
	function updateHeader() {
		var header = document.querySelector('.header');
		if (!header) return;
		if (window.scrollY > 10) header.classList.add('scrolled');
		else header.classList.remove('scrolled');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', updateHeader);
	} else {
		updateHeader();
	}

	window.addEventListener('scroll', updateHeader, { passive: true });
})();


