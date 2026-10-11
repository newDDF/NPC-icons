import { normalizeHex, getContrastTextColor, hexToHsl } from './modules/colors.js';
import { initToolbar } from './modules/toolbar.js';
import { initShare } from './modules/share.js';
import { initModal } from './modules/modal.js';
import { initControls } from './modules/controls.js';
import { initUtils, showToast, copyToClipboard, downloadIcon } from './modules/utils.js';


let icons = [];
let displayLimit = 30;
const iconGrid = document.getElementById('iconGrid');
const sidebarMenu = document.getElementById('sidebarMenu');
const toggleMenuBtn = document.getElementById('toggleMenu');
const toast = document.getElementById('toast');
initUtils(toast);
const themeBtn = document.getElementById('themeBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const formatSelect = document.getElementById('formatSelect');
const densitySelect = document.getElementById('densitySelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');
initToolbar({
    toolbar: document.querySelector('.toolbar'),
    brandHeader: document.querySelector('.brand-header'),
    brandTitle: document.querySelector('.header-titles h1'),
    mainContainer: document.querySelector('.main-container')
});
initShare();
const openIconModal = initModal();
initControls({
    sidebarMenu,
    toggleMenuBtn,
    themeBtn,
    iconGrid,
    densitySelect
});
function renderGrid() {
    iconGrid.innerHTML = '';
    const searchTerm = searchInput.value.toLowerCase().trim();
    const format = formatSelect.value;
    const sort = sortSelect.value;
    let filtered = icons.filter(icon => {
        const matchesSearch = icon.name.toLowerCase().includes(searchTerm);
        const matchesFormat = format === 'all' || icon.format === format;
        return matchesSearch && matchesFormat;
    });
    filtered.sort((a, b) => {
        if (sort === 'color') {
            const colorA = hexToHsl(a.color);
            const colorB = hexToHsl(b.color);
            if (!colorA && !colorB) return a.name.localeCompare(b.name);
            if (!colorA) return 1;
            if (!colorB) return -1;
            return colorA.h - colorB.h ||
                   colorA.s - colorB.s ||
                   colorA.l - colorB.l ||
                   a.name.localeCompare(b.name);
        }
        return sort === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
    });
    const visibleIcons = filtered.slice(0, displayLimit);
    loadMoreBtn.style.display = visibleIcons.length >= filtered.length ? 'none' : 'inline-block';
    if (visibleIcons.length === 0) {
        iconGrid.innerHTML = `<div class="empty-state">No matching icons found</div>`;
        return;
    }
    visibleIcons.forEach(icon => {
        const card = document.createElement('div');
        let displayColor = icon.color;
        if (displayColor && !displayColor.startsWith('#') && displayColor !== 'none') {
            displayColor = `#${displayColor}`;
        }
        if (!displayColor || displayColor === 'none') displayColor = '#000000';
        card.className = icon.format === 'svg' ? 'icon-card' : 'icon-card no-color-card';
        const textColor = getContrastTextColor(displayColor);
        const bottomBarHtml = icon.format === 'svg'
            ? `<div class="color-block-btn" style="background:${displayColor}; color:${textColor};" title="Click to copy Hex">${displayColor}</div>`
            : `<div class="color-block-btn no-color">PNG</div>`;
        card.innerHTML = `
            <span class="format-badge">${icon.format}</span>
            <div class="icon-wrapper" title="Click to copy asset code"><img src="${icon.path}" alt="${icon.name}"></div>
            <div class="icon-name">${icon.name}</div>
            <div class="card-bottom-bar">
                ${bottomBarHtml}
                <div class="action-btn-zone">
                    <button class="action-btn view-btn" title="Inspect Detail">
                        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    </button>
                    <button class="action-btn down-btn" title="Download Asset">
                        <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
                    </button>
                </div>
            </div>
        `;
        card.querySelector('.icon-name').addEventListener('click', () => {
            copyToClipboard(icon.name, `Copied icon name: ${icon.name}!`);
        });
        const nameElement = card.querySelector('.icon-name');
        nameElement.title = icon.name;
        if (nameElement.scrollWidth > nameElement.clientWidth) {
            nameElement.classList.add('is-overflowing');
            nameElement.style.setProperty(
                '--name-scroll-distance',
                `-${nameElement.scrollWidth - nameElement.clientWidth}px`
            );
        }
        card.querySelector('.icon-wrapper').addEventListener('click', async () => {
            if (icon.format === 'svg') {
                try {
                    const response = await fetch(icon.path);
                    if (!response.ok) throw new Error('Failed to load SVG');
                    const svgCode = await response.text();
                    copyToClipboard(svgCode, `Copied SVG code of ${icon.name}!`);
                } catch (error) {
                    console.error(error);
                    showToast('Copy failed');
                }
            } else {
                copyToClipboard(icon.name, `Copied icon name: ${icon.name}!`);
            }
        });
        card.querySelector('.color-block-btn').addEventListener('click', () => {
            copyToClipboard(displayColor, `Copied color value: ${displayColor}!`);
        });
        card.querySelector('.view-btn').addEventListener('click', () => {
            openIconModal(icon, displayColor);
        });
        card.querySelector('.down-btn').addEventListener('click', () => {
            downloadIcon(icon.name, icon.format, icon.path);
        });
        iconGrid.appendChild(card);
    });
}
searchInput.addEventListener('input', () => { displayLimit = 30; renderGrid(); });
sortSelect.addEventListener('change', renderGrid);
formatSelect.addEventListener('change', () => { displayLimit = 30; renderGrid(); });
loadMoreBtn.addEventListener('click', () => { displayLimit += 30; renderGrid(); });
fetch('/api/icons.json')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load icons.json');
        return response.json();
    })
    .then(data => {
        icons = data;
        renderGrid();
    })
    .catch(error => {
        console.error('Icon data loading failed:', error);
        iconGrid.innerHTML = '<div class="load-error">Failed to load icon data.</div>';
    });
