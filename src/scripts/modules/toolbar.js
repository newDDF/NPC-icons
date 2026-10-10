export function initToolbar({ toolbar }) {
    if (!toolbar) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'toolbar-placeholder';
    toolbar.before(placeholder);

    let lastScrollY = window.scrollY;
    let ticking = false;
    let directionDistance = 0;
    let lastDirection = 0;
    let toolbarStart = toolbar.getBoundingClientRect().top + window.scrollY;

    function setFloating(enabled) {
        const isFloating = toolbar.classList.contains('toolbar-floating');
        if (enabled === isFloating) return;

        if (enabled) {
            toolbar.classList.add('toolbar-floating');
            placeholder.style.height = `${toolbar.offsetHeight}px`;
            placeholder.style.marginBottom = getComputedStyle(toolbar).marginBottom;
            placeholder.style.display = 'block';
        } else {
            toolbar.classList.remove('toolbar-floating');
            placeholder.style.display = 'none';
            placeholder.style.height = '';
            placeholder.style.marginBottom = '';
        }
    }

    function update() {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        const direction = Math.sign(delta);
        const isFloating = toolbar.classList.contains('toolbar-floating');

        if (currentY <= 4) {
            directionDistance = 0;
            lastDirection = 0;
            setFloating(false);
        } else if (Math.abs(delta) > 0) {
            if (direction !== lastDirection) directionDistance = 0;
            directionDistance += Math.abs(delta);
            lastDirection = direction;

            if (isFloating) {
                // 向下累计滚动 28px 才收起，避免微小反向滚动导致闪动
                if (direction === 1 && directionDistance >= 28) {
                    setFloating(false);
                    directionDistance = 0;
                }
            } else {
                const threshold = toolbarStart + toolbar.offsetHeight;

                // 向上累计滚动 8px 后唤出工具栏
                if (direction === -1 && directionDistance >= 8 && currentY > threshold) {
                    setFloating(true);
                    directionDistance = 0;
                }
            }
        }

        lastScrollY = currentY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (!toolbar.classList.contains('toolbar-floating')) {
            toolbarStart = toolbar.getBoundingClientRect().top + window.scrollY;
        }
    });

    setFloating(false);
}
