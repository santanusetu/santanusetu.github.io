/**
 * Ledger reveal.
 *
 * Each Featured Projects row is ruled in as it enters the viewport: the hairline
 * above it draws left to right, then the row's content settles. One effect, one
 * place — it echoes the section's own line, "every entry carries the number it
 * moved", rather than decorating.
 *
 * No jQuery. Does nothing at all if the visitor asked for reduced motion, or if
 * IntersectionObserver is unavailable — in both cases the rows are already in
 * their final state, because the CSS only hides them once this class is set.
 */
(function () {
    'use strict';

    var rows = document.querySelectorAll('.ledger-row');
    if (!rows.length) return;

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) return;

    // Only arm the animation once we know we can finish it.
    document.documentElement.classList.add('ledger-armed');

    function reveal(row, delay) {
        if (row.classList.contains('is-revealed')) return;
        if (delay) {
            setTimeout(function () { row.classList.add('is-revealed'); }, delay);
        } else {
            row.classList.add('is-revealed');
        }
        observer.unobserve(row);
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            reveal(entry.target, parseInt(entry.target.dataset.revealDelay || '0', 10));
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    Array.prototype.forEach.call(rows, function (row, i) {
        // Stagger only within a screenful; a long scroll shouldn't queue delays.
        row.dataset.revealDelay = String((i % 3) * 90);
        observer.observe(row);
    });

    // Catch-up pass: reveal anything the visitor can actually see, now, with no
    // stagger. The observer's threshold and its -12% bottom margin leave a band
    // where a row is on screen but does not qualify — and because a row is only
    // unobserved once it reveals, a page that then sits still is never
    // re-evaluated. That is the anchor-jump case: click PROJECTS or EDUCATION,
    // land mid-section, and the rows stay blank until something happens to
    // scroll. A missed animation is nothing; an empty section is fatal.
    function revealVisible() {
        Array.prototype.forEach.call(rows, function (row) {
            if (row.classList.contains('is-revealed')) return;
            var box = row.getBoundingClientRect();
            if (box.top < window.innerHeight && box.bottom > 0) reveal(row, 0);
        });
    }

    // Every way the viewport can change without the observer settling it.
    window.addEventListener('hashchange', function () {
        // Let the browser finish the jump before measuring.
        setTimeout(revealVisible, 60);
    });
    window.addEventListener('resize', revealVisible);
    window.addEventListener('load', revealVisible);

    // A deep link lands mid-page before this script runs.
    if (window.location.hash) setTimeout(revealVisible, 120);

    // Final backstop, unchanged in spirit: if anything above went wrong, the
    // fold is legible a few seconds in regardless.
    setTimeout(revealVisible, 3000);
})();
