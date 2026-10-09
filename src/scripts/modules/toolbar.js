export function initToolbar({ toolbar, brandHeader, brandTitle, mainContainer }) {
    const HEADER_GAP = 14;
    const TOOLBAR_GAP = 24;
    const TOP_GAP = 20;

    let lastScrollY = window.scrollY;
    let toolbarVisible = true;
    let ticking = false;

    function updateToolbarLayout() {
        if (!toolbar || !brandHeader || !brandTitle || !mainContainer) {
            return;
        }

        const headerRect = brandHeader.getBoundingClientRect();
        const titleRect = brandTitle.getBoundingClientRect();
        const toolbarHeight = toolbar.offsetHeight;

        if (titleRect.bottom > 0) {
            const toolbarTop = Math.max(
                TOP_GAP,
                headerRect.bottom + HEADER_GAP
            );

            toolbar.style.top = `${toolbarTop}px`;

            const toolbarBottom = toolbarTop + toolbarHeight;

            mainContainer.style.paddingTop =
                `${Math.max(
                    0,
                    toolbarBottom + TOOLBAR_GAP - headerRect.bottom
                )}px`;

            return;
        }

        toolbar.style.top = `${TOP_GAP}px`;
        mainContainer.style.paddingTop =
            `${toolbarHeight + TOOLBAR_GAP}px`;
    }

    function requestToolbarLayout() {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            updateToolbarLayout();
            ticking = false;
        });
    }

    function showToolbar() {
        if (!toolbarVisible) {
            toolbar.classList.remove('toolbar-hidden');
            toolbarVisible = true;
        }

        requestToolbarLayout();
    }

    function hideToolbar() {
        if (!toolbarVisible) return;

        toolbar.classList.add('toolbar-hidden');
        toolbarVisible = false;
    }

    updateToolbarLayout();

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;

        if (currentScrollY <= TOP_GAP) {
            showToolbar();
        } else if (delta > 3) {
            hideToolbar();
        } else if (delta < -3) {
            showToolbar();
        }

        if (toolbarVisible) {
            requestToolbarLayout();
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    window.addEventListener('resize', requestToolbarLayout);
}
