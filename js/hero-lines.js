/**
 * Rotating hero.
 *
 * Each slide is a matched set — the quote, who said it, and the dry remark
 * under it — so a punchline is never left sitting under the wrong quote.
 *
 * The first slide is the one written into index.html. Crawlers, link-preview
 * scrapers and anyone with JS off see that and only that — the rotation is a
 * layer on top, not the source of truth.
 *
 * Accessibility: auto-updating content needs a stop (WCAG 2.2.2), so it pauses
 * on hover and keyboard focus, sits out entirely under prefers-reduced-motion,
 * and stops while the tab is hidden.
 */
(function () {
    'use strict';

    var rotor = document.querySelector('.intro-rotor');
    var quote = document.querySelector('.intro-quote');
    var head = document.querySelector('.intro-heading');
    var by = document.querySelector('.intro-by');
    var claim = document.querySelector('.intro-claim');
    if (!rotor || !quote || !head || !by || !claim) return;

    // [quote, who said it, the dry half]
    // Only quotes a general reader already knows: the joke lands on recognition,
    // not on explaining who someone is. Film lines credit the character and the
    // film, so "Jim Lovell, Apollo 13" doesn't read as the astronaut (who said
    // "we've had a problem"). Every remark points at something true further down
    // the page.
    var SLIDES = [
        ['“Trust, but verify.”', 'Ronald Reagan',
         'also, more or less, the job description'],

        ['“Do. Or do not. There is no try.”', 'Yoda, The Empire Strikes Back',
         'approve or decline. There is no maybe'],

        ['“Everyone has a plan until they get punched in the mouth.”', 'Mike Tyson',
         'which is roughly how fraud arrives'],

        ['“Follow the money.”', 'Deep Throat, All the President’s Men',
         'a decade at Visa, more or less literally'],

        ['“Any sufficiently advanced technology is indistinguishable from magic.”', 'Arthur C. Clarke',
         'a decision in under a tenth of a second is close enough'],

        ['“I’m sorry, Dave. I’m afraid I can’t do that.”', 'HAL 9000, 2001: A Space Odyssey',
         'a permission-scoped tool, working as intended'],

        ['“Life, uh, finds a way.”', 'Ian Malcolm, Jurassic Park',
         'so does fraud'],

        ['“Houston, we have a problem.”', 'Jim Lovell, Apollo 13',
         'now caught in under a day, not 3 weeks'],

        ['“Move fast and break things.”', 'Mark Zuckerberg',
         'not advised on the authorization path'],

        ['“Talk is cheap. Show me the code.”', 'Linus Torvalds',
         'fair. The projects are below']
    ];

    var i = 0;

    function show(s) {
        head.textContent = s[0];
        by.textContent = '— ' + s[1];
        claim.textContent = s[2];
        fit();
    }

    // Narrow the quote's box to its widest line, so the credit's right edge
    // lines up with the text rather than the column. inline-block alone only
    // manages that for a 1-line quote: once the text wraps, the box takes the
    // full available width.
    function fit() {
        quote.style.width = '';
        var range = document.createRange();
        range.selectNodeContents(head);
        var rects = range.getClientRects();
        var left = Infinity, right = -Infinity;
        for (var k = 0; k < rects.length; k++) {
            left = Math.min(left, rects[k].left);
            right = Math.max(right, rects[k].right);
        }
        if (right > left) quote.style.width = Math.ceil(right - left) + 1 + 'px';
    }

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reserve the tallest slide's height so rotation never nudges the layout.
    // It is reserved on the whole slide, so the spare space falls under the
    // remark: reserved on the headline alone, a short quote's credit floated a
    // line or two below it.
    // Must run after the webfonts land: measured against the fallback face the
    // numbers come out short and every swap jumps the page.
    function reserve() {
        var tallest = 0;
        rotor.style.minHeight = '';
        SLIDES.forEach(function (s) {
            show(s);
            tallest = Math.max(tallest, rotor.offsetHeight);
        });
        show(SLIDES[i]);
        rotor.style.minHeight = tallest + 'px';
    }

    reserve();                                    // something sensible immediately
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(reserve);       // then the real numbers
    }
    window.addEventListener('resize', reserve);   // and again if the column changes

    if (reduced || SLIDES.length < 2) return;

    var paused = false, timer;
    var INTERVAL = 6000;   // headlines need longer than a one-line sub
    var FADE = 380;

    rotor.setAttribute('aria-live', 'off');
    rotor.style.transition = 'opacity ' + FADE + 'ms ease';

    function next() {
        if (paused) return;
        rotor.style.opacity = '0';
        setTimeout(function () {
            i = (i + 1) % SLIDES.length;
            show(SLIDES[i]);
            rotor.style.opacity = '1';
        }, FADE);
    }

    function start() { timer = setInterval(next, INTERVAL); }
    function stop() { clearInterval(timer); }
    start();

    // Pause while someone is reading one.
    var zone = rotor.parentNode;
    ['mouseenter', 'focusin'].forEach(function (e) {
        zone.addEventListener(e, function () { paused = true; });
    });
    ['mouseleave', 'focusout'].forEach(function (e) {
        zone.addEventListener(e, function () { paused = false; });
    });

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stop(); } else { stop(); start(); }
    });
})();
