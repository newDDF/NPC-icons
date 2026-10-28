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
const categorySelect = document.getElementById('categorySelect');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const categoryToggleBtn = document.getElementById('categoryToggleBtn');
const categoryCount = document.getElementById('categoryCount');
const categoryPanel = document.getElementById('categoryPanel');
const categoryOptions = document.getElementById('categoryOptions');
const selectedCategoriesContainer = document.getElementById('selectedCategories');
const clearCategoriesBtn = document.getElementById('clearCategoriesBtn');
const doneCategoryPanelBtn = document.getElementById('doneCategoryPanelBtn');
let allCategories = [];
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
function updateCategoryUI() {
    const selected = Array.from(categorySelect.selectedOptions);
    categoryCount.textContent = String(selected.length);
    categoryCount.hidden = selected.length === 0;
    clearCategoriesBtn.disabled = selected.length === 0;

    selectedCategoriesContainer.replaceChildren();
    selected.forEach(option => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'selected-category-chip';
        chip.textContent = option.value + ' ×';
        chip.title = `Remove category ${option.value}`;
        chip.setAttribute('aria-label', `Remove category ${option.value}`);
        chip.addEventListener('click', () => {
            option.selected = false;
            resetAndRender();
        });
        selectedCategoriesContainer.appendChild(chip);
    });

    categoryOptions.replaceChildren();
    const matching = allCategories;

    if (matching.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'category-empty';
        empty.textContent = 'No categories available';
        categoryOptions.appendChild(empty);
    } else {
        matching.forEach(category => {
            const option = Array.from(categorySelect.options)
                .find(item => item.value === category);
            if (!option) return;

            const label = document.createElement('label');
            label.className = 'category-option';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = option.selected;
            checkbox.addEventListener('change', () => {
                option.selected = checkbox.checked;
                resetAndRender();
            });
            const name = document.createElement('span');
            name.textContent = category;
            label.append(checkbox, name);
            categoryOptions.appendChild(label);
        });
    }
}


let activeDownloadMenu = null;
let activeDownloadTrigger = null;
let activeDownloadBar = null;
let activeDownloadLeaveHandler = null;

function closeDownloadMenu(restoreFocus = false) {
    if (!activeDownloadMenu) return;

    const card = activeDownloadMenu.closest('.icon-card');
    if (card) {
        const bottomBar = card.querySelector('.card-bottom-bar');
        if (bottomBar && activeDownloadMenu.parentElement === bottomBar) {
            bottomBar.classList.remove('download-options-open');
            bottomBar.querySelector('.download-options')?.remove();
            const trigger = bottomBar.querySelector('.down-btn');
            trigger?.setAttribute('aria-expanded', 'false');
            if (restoreFocus) trigger?.focus();
        }
    }

    if (activeDownloadBar && activeDownloadLeaveHandler) {
        activeDownloadBar.removeEventListener('mouseleave', activeDownloadLeaveHandler);
    }

    activeDownloadMenu = null;
    activeDownloadTrigger = null;
    activeDownloadBar = null;
    activeDownloadLeaveHandler = null;
}

document.addEventListener('click', event => {
    if (!activeDownloadMenu) return;
    if (activeDownloadMenu.contains(event.target) ||
        activeDownloadTrigger?.contains(event.target)) return;
    closeDownloadMenu();
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeDownloadMenu) {
        closeDownloadMenu(true);
    }
});

function openDownloadMenu(icon, trigger) {
    const bottomBar = trigger.closest('.card-bottom-bar');
    if (!bottomBar) return;

    if (activeDownloadTrigger === trigger && activeDownloadMenu) {
        closeDownloadMenu();
        return;
    }

    closeDownloadMenu();

    const options = document.createElement('div');
    options.className = 'download-options';
    options.setAttribute('role', 'group');
    options.setAttribute('aria-label', `Download options for ${icon.name}`);

    const addOption = (iconMarkup, label, action, disabled = false) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'action-btn download-option';
        button.title = label;
        button.setAttribute('aria-label', label);
        button.innerHTML = iconMarkup;
        button.disabled = disabled;
        button.addEventListener('click', async event => {
            event.stopPropagation();
            closeDownloadMenu();
            await action();
        });
        options.appendChild(button);
    };

    addOption(
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 14 9l6.2 2-6.2 2-2 6.2-2-6.2-6.2-2L10 9l2-6.2Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg>',
        'Custom icon',
        () => {
            window.location.href = `/icons/${encodeURIComponent(icon.id || icon.name)}/`;
        }
    );

    addOption(
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h8l4 4v13h-12v-17Z"/><path d="M14.5 3.8v4h3.8M9 12h7M9 15.5h7M9 19h4"/></svg>',
        'Download SVG',
        () => downloadIcon(icon.name, 'svg', icon.path),
        icon.format !== 'svg'
    );

    addOption(
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><rect x="7.5" y="7.5" width="9" height="9" rx="1.5"/><circle cx="12" cy="12" r="2"/></svg>',
        'Download ICO',
        () => downloadConvertedIcon(icon, 'ico')
    );

    addOption(
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><circle cx="9" cy="9" r="1.5"/><path d="m5.5 17 4.2-4.3 3.1 2.8 2.7-3 3 4.5"/></svg>',
        'Download WebP',
        () => downloadConvertedIcon(icon, 'webp')
    );

    bottomBar.classList.add('download-options-open');
    bottomBar.appendChild(options);
    activeDownloadMenu = options;
    activeDownloadTrigger = trigger;
    activeDownloadBar = bottomBar;
    activeDownloadLeaveHandler = () => closeDownloadMenu();
    bottomBar.addEventListener('mouseleave', activeDownloadLeaveHandler);
    trigger.setAttribute('aria-expanded', 'true');
}

function saveGeneratedBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function downloadConvertedIcon(icon, targetFormat) {
    let sourceUrl;
    try {
        const response = await fetch(icon.path);
        if (!response.ok) throw new Error(`Asset request failed: ${response.status}`);

        const sourceBlob = await response.blob();
        sourceUrl = URL.createObjectURL(sourceBlob);

        const image = new Image();
        image.src = sourceUrl;
        await image.decode();

        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable');

        context.clearRect(0, 0, size, size);

        const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);

        const outputType = targetFormat === 'ico' ? 'image/png' : 'image/webp';
        const renderedBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, outputType, 0.92);
        });

        if (!renderedBlob) {
            throw new Error(`Browser could not encode ${targetFormat.toUpperCase()}`);
        }

        if (targetFormat === 'webp') {
            if (renderedBlob.type !== 'image/webp') {
                throw new Error('This browser does not support WebP encoding');
            }
            saveGeneratedBlob(renderedBlob, `${icon.name}.webp`);
        } else {
            // ICO container with a PNG-encoded 256 x 256 image.
            const pngBytes = new Uint8Array(await renderedBlob.arrayBuffer());
            const icoBytes = new Uint8Array(22 + pngBytes.length);
            const view = new DataView(icoBytes.buffer);

            view.setUint16(0, 0, true);              // Reserved
            view.setUint16(2, 1, true);              // Icon resource
            view.setUint16(4, 1, true);              // One image
            view.setUint8(6, 0);                     // Width: 256
            view.setUint8(7, 0);                     // Height: 256
            view.setUint8(8, 0);                     // Palette
            view.setUint8(9, 0);                     // Reserved
            view.setUint16(10, 1, true);             // Color planes
            view.setUint16(12, 32, true);            // Bits per pixel
            view.setUint32(14, pngBytes.length, true);
            view.setUint32(18, 22, true);            // Image data offset
            icoBytes.set(pngBytes, 22);

            saveGeneratedBlob(
                new Blob([icoBytes], { type: 'image/x-icon' }),
                `${icon.name}.ico`
            );
        }

        showToast(`Generated ${targetFormat.toUpperCase()}: ${icon.name}`);
    } catch (error) {
        console.error(`Failed to generate ${targetFormat}:`, error);
        showToast(`Could not generate ${targetFormat.toUpperCase()}`);
    } finally {
        if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    }
}

function renderGrid() {
    updateCategoryUI();
    iconGrid.innerHTML = '';
    const searchTerm = searchInput.value.toLowerCase().trim();
    const format = formatSelect.value;
    const selectedCategories = Array.from(categorySelect.selectedOptions)
        .map(option => option.value.toLowerCase());
    const sort = sortSelect.value;
    let filtered = icons.filter(icon => {
        const categories = Array.isArray(icon.category) ? icon.category : [];
        const searchableText = [icon.name, icon.info, ...categories]
            .filter(Boolean).join(' ').toLowerCase();
        const matchesSearch = searchableText.includes(searchTerm);
        const matchesFormat = format === 'all' || icon.format === format;
        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.some(category =>
                categories.some(item => item.toLowerCase() === category)
            );
        return matchesSearch && matchesFormat && matchesCategory;
    });

    clearSearchBtn.hidden = searchInput.value.length === 0;
    clearFiltersBtn.disabled =
        searchInput.value.length === 0 &&
        formatSelect.value === 'all' &&
        selectedCategories.length === 0;
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
            <div class="card-bottom-bar" style="--bar-color:${icon.format === "svg" ? displayColor : "var(--bg-secondary, transparent)"}; --bar-text-color:${icon.format === "svg" ? textColor : "var(--text-color)"};">
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
        card.querySelector('.down-btn').setAttribute('aria-label', `Download options for ${icon.name}`);
        card.querySelector('.down-btn').setAttribute('aria-expanded', 'false');
        card.querySelector('.down-btn').addEventListener('click', event => {
            event.stopPropagation();
            openDownloadMenu(icon, event.currentTarget);
        });
        iconGrid.appendChild(card);
    });
}
function resetAndRender() {
    displayLimit = 30;
    renderGrid();
}

searchInput.addEventListener('input', resetAndRender);
sortSelect.addEventListener('change', renderGrid);
formatSelect.addEventListener('change', resetAndRender);
categorySelect.addEventListener('change', resetAndRender);

function setCategoryPanelOpen(open) {
    categoryPanel.hidden = !open;
    categoryToggleBtn.setAttribute('aria-expanded', String(open));
}

categoryToggleBtn.addEventListener('click', () => {
    setCategoryPanelOpen(categoryPanel.hidden);
});
doneCategoryPanelBtn.addEventListener('click', () => setCategoryPanelOpen(false));

document.addEventListener('click', event => {
    if (!categoryPanel.hidden && !event.target.closest('.category-menu-item')) {
        setCategoryPanelOpen(false);
    }
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !categoryPanel.hidden) {
        setCategoryPanelOpen(false);
        categoryToggleBtn.focus();
    }
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    resetAndRender();
    searchInput.focus();
});

function clearSelectedCategories() {
    Array.from(categorySelect.options).forEach(option => { option.selected = false; });
    resetAndRender();
}
clearCategoriesBtn.addEventListener('click', clearSelectedCategories);

clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    formatSelect.value = 'all';
    clearSelectedCategories();
    resetAndRender();
});

loadMoreBtn.addEventListener('click', () => { displayLimit += 30; renderGrid(); });
fetch('/api/icons.json')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load icons.json');
        return response.json();
    })
    .then(data => {
        icons = data;
        allCategories = [...new Set(
            icons.flatMap(icon => Array.isArray(icon.category) ? icon.category : [])
                .filter(category => typeof category === 'string' && category.trim())
        )].sort((a, b) => a.localeCompare(b));

        categorySelect.replaceChildren();
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        updateCategoryUI();
        renderGrid();
    })
    .catch(error => {
        console.error('Icon data loading failed:', error);
        iconGrid.innerHTML = '<div class="load-error">Failed to load icon data.</div>';
    });
