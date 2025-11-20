/**
 * Tag-Colored Navigation
 * Applies tag accent colors to navigation items that link to tag pages
 */

(function() {
    'use strict';

    /**
     * Extract tag slug from a URL
     * @param {string} url - The URL to parse
     * @returns {string|null} - The tag slug or null if not a tag URL
     */
    function extractTagSlug(url) {
        if (!url) return null;

        // Match both absolute and relative tag URLs: /tag/slug/ or https://example.com/tag/slug/
        const tagPattern = /\/tag\/([^\/]+)\/?/;
        const match = url.match(tagPattern);

        return match ? match[1] : null;
    }

    /**
     * Apply tag colors to navigation items
     */
    function applyTagColors() {
        console.log('[Tag Navigation] Starting to apply tag colors...');

        // Get tag color data from the page
        const tagDataElement = document.getElementById('tag-color-data');
        if (!tagDataElement) {
            console.error('[Tag Navigation] No tag-color-data element found!');
            return;
        }
        console.log('[Tag Navigation] Found tag data element');

        let tagColors;
        try {
            tagColors = JSON.parse(tagDataElement.textContent);
            console.log('[Tag Navigation] Parsed tag colors:', tagColors);
        } catch (e) {
            console.error('[Tag Navigation] Failed to parse tag color data:', e);
            return;
        }

        // Find all navigation links
        const navigationSelectors = [
            '#gh-navigation .nav a',           // Desktop navigation
            '.gh-navigation-menu .nav a',      // Alternative selector
            '.gh-dropdown .nav a'              // Dropdown menu items
        ];

        let totalLinksProcessed = 0;
        let totalLinksColored = 0;

        navigationSelectors.forEach(selector => {
            const navLinks = document.querySelectorAll(selector);
            console.log(`[Tag Navigation] Found ${navLinks.length} links for selector: ${selector}`);

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                const tagSlug = extractTagSlug(href);

                console.log(`[Tag Navigation] Link href: ${href}, extracted slug: ${tagSlug}`);
                totalLinksProcessed++;

                if (tagSlug && tagColors[tagSlug]) {
                    const accentColor = tagColors[tagSlug];
                    console.log(`[Tag Navigation] ✓ Applying color ${accentColor} to link with slug: ${tagSlug}`);

                    // Apply color using inline style
                    // This ensures it works even if the link is moved to dropdown
                    link.style.color = accentColor;

                    // Add a data attribute for potential CSS targeting
                    link.setAttribute('data-tag-colored', 'true');
                    link.setAttribute('data-tag-slug', tagSlug);
                    totalLinksColored++;
                } else if (tagSlug) {
                    console.log(`[Tag Navigation] ✗ Tag slug "${tagSlug}" found but no color in data`);
                }
            });
        });

        console.log(`[Tag Navigation] Summary: Processed ${totalLinksProcessed} links, colored ${totalLinksColored} links`);
    }

    /**
     * Initialize when DOM is ready
     */
    function init() {
        console.log('[Tag Navigation] Script loaded, readyState:', document.readyState);

        // Apply colors on initial load
        if (document.readyState === 'loading') {
            console.log('[Tag Navigation] Waiting for DOMContentLoaded...');
            document.addEventListener('DOMContentLoaded', applyTagColors);
        } else {
            console.log('[Tag Navigation] DOM already loaded, applying colors now');
            applyTagColors();
        }

        // Re-apply colors when navigation dropdown is created
        // (the dropdown.js script may move items around)
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && (
                            node.classList?.contains('gh-dropdown') ||
                            node.querySelector?.('.gh-dropdown')
                        )) {
                            // Dropdown was added, re-apply colors
                            console.log('[Tag Navigation] Dropdown detected, re-applying colors...');
                            setTimeout(applyTagColors, 0);
                        }
                    });
                }
            });
        });

        // Observe the navigation container for dropdown creation
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    init();

    // Add debug functions to window object
    window.debugTagColoring = function() {
        console.log('=== Tag Navigation Debug Info ===\n');

        // Get tag color data
        const tagDataElement = document.getElementById('tag-color-data');
        if (!tagDataElement) {
            console.error('❌ No tag-color-data element found');
            return;
        }

        let tagColors;
        try {
            tagColors = JSON.parse(tagDataElement.textContent);
        } catch (e) {
            console.error('❌ Failed to parse tag color data:', e);
            return;
        }

        console.log('📊 Available Tag Colors:', tagColors);
        console.log('Tag Count:', Object.keys(tagColors).length);
        console.log('');

        // Find all navigation links
        const navigationSelectors = [
            '#gh-navigation .nav a',
            '.gh-navigation-menu .nav a',
            '.gh-dropdown .nav a'
        ];

        const linkInfo = [];

        navigationSelectors.forEach(selector => {
            const navLinks = document.querySelectorAll(selector);

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                const tagSlug = extractTagSlug(href);
                const hasColor = tagSlug && tagColors[tagSlug];
                const appliedColor = hasColor ? tagColors[tagSlug] : null;
                const currentColor = link.style.color || getComputedStyle(link).color;

                linkInfo.push({
                    text: link.textContent.trim(),
                    href: href,
                    tagSlug: tagSlug || 'N/A',
                    hasTagColor: !!hasColor,
                    tagAccentColor: appliedColor || 'N/A',
                    currentColor: currentColor,
                    selector: selector
                });
            });
        });

        // Remove duplicates (same link found by multiple selectors)
        const uniqueLinks = linkInfo.filter((link, index, self) =>
            index === self.findIndex(l => l.href === link.href && l.text === link.text)
        );

        console.log('🔗 Navigation Links:', uniqueLinks);
        console.log('');

        // Summary
        const coloredLinks = uniqueLinks.filter(l => l.hasTagColor).length;
        console.log('📈 Summary:');
        console.log({
            totalLinks: uniqueLinks.length,
            linksWithTagColors: coloredLinks,
            linksWithoutTagColors: uniqueLinks.length - coloredLinks
        });
    };

    console.log('💡 Debug function available: window.debugTagColoring()');
})();
