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

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var row = entry.target;
            var delay = parseInt(row.dataset.revealDelay || '0', 10);
            setTimeout(function () {
                row.classList.add('is-revealed');
            }, delay);
            observer.unobserve(row);
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    Array.prototype.forEach.call(rows, function (row, i) {
        // Stagger only within a screenful; a long scroll shouldn't queue delays.
        row.dataset.revealDelay = String((i % 3) * 90);
        observer.observe(row);
    });

    // Safety net. If the observer never fires — a browser quirk, a throttled
    // background tab, anything — rows the visitor can already see would sit
    // blank. After a few seconds, reveal anything at or above the fold
    // regardless. A missed animation is nothing; a blank section is fatal.
    setTimeout(function () {
        Array.prototype.forEach.call(rows, function (row) {
            if (row.classList.contains('is-revealed')) return;
            if (row.getBoundingClientRect().top < window.innerHeight) {
                row.classList.add('is-revealed');
            }
        });
    }, 3000);
})();
