/**
 * Rotating hero.
 *
 * Headline and sub-line move together as matched pairs, so a punchline is never
 * left sitting on top of the wrong backing line.
 *
 * The first pair is the one written into index.html. Crawlers, link-preview
 * scrapers and anyone with JS off see that and only that — the rotation is a
 * layer on top, not the source of truth.
 *
 * Accessibility: auto-updating content needs a stop (WCAG 2.2.2), so it pauses
 * on hover and keyboard focus, sits out entirely under prefers-reduced-motion,
 * and stops while the tab is hidden.
 */
(function () {
    'use strict';

    var head = document.querySelector('.intro-heading');
    var claim = document.querySelector('.intro-claim');
    if (!head || !claim) return;

    // [headline, sub-line]
    var PAIRS = [
        ['The rollback plan is to not be wrong.',
         'no canary · no rollback · 100% of live traffic'],

        ['There is no staging. There is production.',
         '800+ active rules · 8.34M requests a month · one environment'],

        ['I’ve never used a canary deploy. I hear they’re nice.',
         'real-time fraud decisioning · sub-100ms · ships to everyone at once'],

        ['I write the code that decides if your card works.',
         'inline on the card authorization path · sub-100ms'],

        ['Fraud never sleeps. I do, occasionally.',
         'real-time fraud decisioning · 8.34 million requests a month'],

        ['Good observability means nobody thanks you.',
         'SLA-miss detection: three weeks → under a day']
    ];

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reserve the tallest pair's height so rotation never nudges the layout.
    // Must run after the webfonts land: measured against the fallback face the
    // numbers come out short and every swap jumps the page.
    function reserve() {
        var h = 0, c = 0;
        var hText = head.textContent, cText = claim.textContent;
        head.style.minHeight = claim.style.minHeight = '';
        PAIRS.forEach(function (p) {
            head.textContent = p[0];
            claim.textContent = p[1];
            h = Math.max(h, head.offsetHeight);
            c = Math.max(c, claim.offsetHeight);
        });
        head.textContent = hText;
        claim.textContent = cText;
        head.style.minHeight = h + 'px';
        claim.style.minHeight = c + 'px';
    }

    reserve();                                    // something sensible immediately
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(reserve);       // then the real numbers
    }
    window.addEventListener('resize', reserve);   // and again if the column changes

    if (reduced || PAIRS.length < 2) return;

    var i = 0, paused = false, timer;
    var INTERVAL = 6000;   // headlines need longer than a one-line sub
    var FADE = 380;

    head.setAttribute('aria-live', 'off');
    claim.setAttribute('aria-live', 'off');
    head.style.transition = claim.style.transition = 'opacity ' + FADE + 'ms ease';

    function next() {
        if (paused) return;
        head.style.opacity = claim.style.opacity = '0';
        setTimeout(function () {
            i = (i + 1) % PAIRS.length;
            head.textContent = PAIRS[i][0];
            claim.textContent = PAIRS[i][1];
            head.style.opacity = claim.style.opacity = '1';
        }, FADE);
    }

    function start() { timer = setInterval(next, INTERVAL); }
    function stop() { clearInterval(timer); }
    start();

    // Pause while someone is reading one.
    var zone = head.parentNode;
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
