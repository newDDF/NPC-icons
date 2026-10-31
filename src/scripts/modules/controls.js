export function initControls({ sidebarMenu, toggleMenuBtn, themeBtn, iconGrid, densitySelect }) {
    toggleMenuBtn.addEventListener('click', event => {
        event.stopPropagation();
        sidebarMenu.classList.toggle('active');
    });

    document.addEventListener('click', event => {
        if (!sidebarMenu.contains(event.target) && event.target !== toggleMenuBtn) {
            sidebarMenu.classList.remove('active');
        }
    });

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    themeBtn.innerText = currentTheme === 'light' ? 'Dark Mode' : 'Light Mode';

    themeBtn.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const nextTheme = isLight ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', nextTheme);
        themeBtn.innerText = nextTheme === 'light' ? 'Dark Mode' : 'Light Mode';

        try {
            localStorage.setItem('npc-icons-theme', nextTheme);
        } catch (error) {
            console.warn('Unable to save theme preference:', error);
        }
    });

    densitySelect.addEventListener('change', () => {
        if (densitySelect.value === 'dense') {
            iconGrid.classList.add('dense');
        } else {
            iconGrid.classList.remove('dense');
        }
    });
}
