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

    themeBtn.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
        themeBtn.innerText = isLight ? 'Dark Mode' : 'Light Mode';
    });

    densitySelect.addEventListener('change', () => {
        if (densitySelect.value === 'dense') {
            iconGrid.classList.add('dense');
        } else {
            iconGrid.classList.remove('dense');
        }
    });
}
