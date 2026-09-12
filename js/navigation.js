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
    // The sections are read from the nav itself and sorted into document
    // order. The hand-written list this replaces had drifted from the markup:
    // #recognition was missing entirely, so Recognition never lit up, and
    // #team sat second in a list the loop walks in order — every later entry
    // overwrote it, so Education never lit up either and Projects stayed
    // active all the way down to Timeline.
    var targets = $('.navbar-nav a.page-scroll[href^="#"]').map(function() {
        var href = this.getAttribute('href');
        var el = href.length > 1 ? document.querySelector(href) : null;
        return el ? {href: href, el: el} : null;
    }).get();

    targets.sort(function(a, b) {
        return (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    $(window).on('scroll', function() {
        var scrollTop = $(window).scrollTop() + 150; // Offset for fixed navbar

        // The last section whose top has passed the line is the one being read.
        var current = '';
        targets.forEach(function(t) {
            if (scrollTop >= $(t.el).offset().top - 50) {
                current = t.href;
            }
        });

        // Above the first section — the hero — hold the first item, rather
        // than leaving the whole navbar unlit for most of a tall header.
        if (!current && targets.length) {
            current = targets[0].href;
        }

        $('.navbar-nav li').removeClass('active');
        if (current) {
            $('.navbar-nav a[href="' + current + '"]').parent('li').addClass('active');
        }
    });

    // Trigger on page load
    $(window).trigger('scroll');
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});