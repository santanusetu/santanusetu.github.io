/**
 * Animated Header - Navbar shrink on scroll
 * Modernized to use native classList API
 */
(function() {
	'use strict';

	var header = document.querySelector('.navbar-default'),
		didScroll = false,
		changeHeaderOn = 300;

	function init() {
		if (!header) return;
		
		window.addEventListener('scroll', function() {
			if (!didScroll) {
				didScroll = true;
				setTimeout(scrollPage, 250);
			}
		}, false);
	}

	function scrollPage() {
		var scrollY = window.pageYOffset || document.documentElement.scrollTop;
		
		if (scrollY >= changeHeaderOn) {
			header.classList.add('navbar-shrink');
		} else {
			header.classList.remove('navbar-shrink');
		}
		
		didScroll = false;
	}

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();