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
    // [headline, attribution, the dry half]
    // The aside is set apart in gold so a reader can tell which half is the
    // famous person and which half is him.
    var PAIRS = [
        ['\u201CTrust, but verify.\u201D', 'Ronald Reagan',
         'also, more or less, the job description'],

        ['\u201CEveryone has a plan until they get punched in the mouth.\u201D', 'Mike Tyson',
         'which is roughly how fraud arrives'],

        ['\u201CIn God we trust. All others must bring data.\u201D', 'W. Edwards Deming',
         '8.34 million requests a month, all bringing data'],

        ['\u201CPremature optimization is the root of all evil.\u201D', 'Donald Knuth',
         'though under 100ms it stops being premature'],

        ['\u201CAny sufficiently advanced technology is indistinguishable from magic.\u201D', 'Arthur C. Clarke',
         'a decision in under a tenth of a second is close enough'],

        ['\u201CTalk is cheap. Show me the code.\u201D', 'Linus Torvalds',
         'fair. The projects are below']
    ];

    function claimHTML(p) {
        return '<span class="q-attr">' + p[1] + '</span> ' +
               '<span class="q-aside">' + p[2] + '</span>';
    }

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reserve the tallest pair's height so rotation never nudges the layout.
    // Must run after the webfonts land: measured against the fallback face the
    // numbers come out short and every swap jumps the page.
    function reserve() {
        var h = 0, c = 0;
        var hText = head.textContent, cHTML = claim.innerHTML;
        head.style.minHeight = claim.style.minHeight = '';
        PAIRS.forEach(function (p) {
            head.textContent = p[0];
            claim.innerHTML = claimHTML(p);
            h = Math.max(h, head.offsetHeight);
            c = Math.max(c, claim.offsetHeight);
        });
        head.textContent = hText;
        claim.innerHTML = cHTML;
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
            claim.innerHTML = claimHTML(PAIRS[i]);
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
