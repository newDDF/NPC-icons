let icons = [];

let displayLimit = 30;
const iconGrid = document.getElementById('iconGrid');
const sidebarMenu = document.getElementById('sidebarMenu');
const toggleMenuBtn = document.getElementById('toggleMenu');
const toast = document.getElementById('toast');
const themeBtn = document.getElementById('themeBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const formatSelect = document.getElementById('formatSelect');
const densitySelect = document.getElementById('densitySelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const toolbar = document.querySelector('.toolbar');
const brandHeader = document.querySelector('.brand-header');
const brandTitle = document.querySelector('.header-titles h1');
const mainContainer = document.querySelector('.main-container');

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

const detailModal = document.getElementById('detailModal');
const modalClose = document.getElementById('modalClose');
const modalPreview = document.getElementById('modalPreview');
const modalName = document.getElementById('modalName');
const modalInfo = document.getElementById('modalInfo');
const modalCategories = document.getElementById('modalCategories');

function showToast(message) {
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

async function copyToClipboard(text, message) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            showToast(message);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (!success) throw new Error('Copy command failed');

        showToast(message);
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Copy failed');
    }
}

const shareBtn = document.getElementById('shareBtn');
const shareMenu = document.getElementById('shareMenu');
const shareContainer = document.getElementById('shareContainer');

shareBtn.addEventListener('click', () => {
    shareMenu.classList.toggle('show');
});

shareMenu.querySelectorAll('[data-share]').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();

        const pageUrl = window.location.href;
        const shareText = 'NPC-icons';

        if (item.dataset.share === 'discord') {
            copyToClipboard(pageUrl, 'Link copied. Paste it into Discord.');
            shareMenu.classList.remove('show');
            return;
        }

        const shareUrls = {
            x: `https://x.com/intent/post?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
            reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(shareText)}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&description=${encodeURIComponent(shareText)}`,
            bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`
        };

        const url = shareUrls[item.dataset.share];
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
            shareMenu.classList.remove('show');
        }
    });
});

document.addEventListener('click', event => {
    if (!shareContainer.contains(event.target)) {
        shareMenu.classList.remove('show');
    }
});

async function downloadIcon(name, format, path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Download started: ${name}.${format}`);
    } catch (error) {
        console.error(error);
        showToast("Download failed");
    }
}
function normalizeHex(hex) {
    if (!hex || hex === 'none') return null;

    let value = hex.replace('#', '').trim();

    if (value.length === 3) {
        value = value.split('').map(c => c + c).join('');
    }

    return value.length === 6 && /^[0-9a-fA-F]{6}$/.test(value)
        ? value
        : null;
}

function getContrastTextColor(hexColor) {
    const value = normalizeHex(hexColor);
    if (!value) return '#ffffff';

    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);

    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#1c1c1e'
        : '#ffffff';
}

// Core rendering and filtering
function hexToHsl(hex) {
    const value = normalizeHex(hex);
    if (!value) return null;

    const r = parseInt(value.slice(0, 2), 16) / 255;
    const g = parseInt(value.slice(2, 4), 16) / 255;
    const b = parseInt(value.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;

    if (max === min) {
        return { h: 0, s: 0, l: lightness };
    }

    const delta = max - min;
    const saturation = lightness > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min);

    let hue;
    if (max === r) {
        hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
        hue = ((b - r) / delta + 2) / 6;
    } else {
        hue = ((r - g) / delta + 4) / 6;
    }

    return { h: hue, s: saturation, l: lightness };
}

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
            modalPreview.innerHTML = `<img src="${icon.path}" alt="${icon.name}">`;
            modalName.innerText = icon.name;

            modalCategories.innerHTML = (icon.category || [])
                .map(category => `<span class="modal-category">${category}</span>`)
                .join('');

            const sourceHtml = icon.source
                ? `<a class="modal-source-link" href="${icon.source}" target="_blank">Official Website</a>`
                : `<span class="modal-none">None</span>`;

            modalInfo.innerHTML = `
                Format: <b class="modal-format">${icon.format}</b><br>
                ${icon.format === 'svg' ? 'Hex Color: <b class="modal-color">' + displayColor + '</b><br>' : ''}
                Source: ${sourceHtml}<br><br>
                <div class="modal-info-scroll">
                    ${icon.info}
                </div>
            `;

            detailModal.classList.add('active');
        });
        card.querySelector('.down-btn').addEventListener('click', () => {
            downloadIcon(icon.name, icon.format, icon.path);
        });
        iconGrid.appendChild(card);
    });
}
modalClose.addEventListener('click', () => detailModal.classList.remove('active'));
detailModal.addEventListener('click', (e) => { if (e.target === detailModal) detailModal.classList.remove('active'); });

toggleMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); sidebarMenu.classList.toggle('active'); });
document.addEventListener('click', (e) => { if(!sidebarMenu.contains(e.target) && e.target !== toggleMenuBtn) sidebarMenu.classList.remove('active'); });

searchInput.addEventListener('input', () => { displayLimit = 30; renderGrid(); });
sortSelect.addEventListener('change', renderGrid);
formatSelect.addEventListener('change', () => { displayLimit = 30; renderGrid(); });
themeBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    themeBtn.innerText = isLight ? "Light Mode" : "Dark Mode";
    renderGrid();
});
densitySelect.addEventListener('change', () => densitySelect.value === 'dense' ? iconGrid.classList.add('dense') : iconGrid.classList.remove('dense'));
loadMoreBtn.addEventListener('click', () => { displayLimit += 30; renderGrid(); });

fetch('./data/icons.json')
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
