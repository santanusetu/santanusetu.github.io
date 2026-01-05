// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$(document).ready(function() {
    // Manual scroll handler for nav highlighting
    $(window).on('scroll', function() {
        var scrollTop = $(window).scrollTop() + 150; // Offset for fixed navbar
        
        // Remove active from all nav items
        $('.navbar-nav li').removeClass('active');
        
        // Check each section
        var sections = ['#aboutMe', '#team', '#portfolio', '#about', '#contact'];
        var current = '';
        
        sections.forEach(function(section) {
            var $section = $(section);
            if ($section.length) {
                var sectionTop = $section.offset().top;
                if (scrollTop >= sectionTop - 50) {
                    current = section;
                }
            }
        });
        
        // Add active class to current section's nav item
        if (current) {
            $('.navbar-nav a[href="' + current + '"]').parent('li').addClass('active');
        } else {
            // If at top, highlight first item or none
            if ($(window).scrollTop() < 200) {
                $('.navbar-nav a[href="#aboutMe"]').parent('li').addClass('active');
            }
        }
    });
    
    // Trigger on page load
    $(window).trigger('scroll');
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});