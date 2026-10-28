export function initModal() {
    const detailModal = document.getElementById('detailModal');
    const modalClose = document.getElementById('modalClose');
    const modalPreview = document.getElementById('modalPreview');
    const modalName = document.getElementById('modalName');
    const modalInfo = document.getElementById('modalInfo');
    const modalCategories = document.getElementById('modalCategories');

    if (!detailModal || !modalClose || !modalPreview ||
        !modalName || !modalInfo || !modalCategories) {
        console.warn('Icon detail modal elements not found.');
        return () => {};
    }

    const closeModal = () => detailModal.classList.remove('active');

    modalClose.addEventListener('click', closeModal);
    detailModal.addEventListener('click', event => {
        if (event.target === detailModal) closeModal();
    });

    return function openIconModal(icon, displayColor) {
        const detailLink = document.createElement('a');
        detailLink.className = 'modal-preview-link';
        detailLink.href = `/icons/${encodeURIComponent(icon.id || icon.name)}/`;
        detailLink.setAttribute('aria-label', `Open ${icon.name} icon details`);

        const previewImage = document.createElement('img');
        previewImage.src = icon.path;
        previewImage.alt = icon.name;

        detailLink.appendChild(previewImage);
        modalPreview.replaceChildren(detailLink);
        modalName.innerText = icon.name;

        modalCategories.innerHTML = (icon.category || [])
            .map(category => `<span class="modal-category">${category}</span>`)
            .join('');

        const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);

        const sourceHtml = icon.source
            ? `<a class="modal-source-link" href="${escapeHtml(icon.source)}" target="_blank" rel="noopener noreferrer">Official Website</a>`
            : `<span class="modal-none">None</span>`;

        modalInfo.innerHTML = `
            <div class="modal-meta-grid">
                <div class="modal-meta-item">
                    Format: <b class="modal-format">${escapeHtml(icon.format || 'Unknown')}</b>
                </div>
                ${icon.format === 'svg' ? `
                <div class="modal-meta-item">
                    Hex Color: <b class="modal-color">${escapeHtml(displayColor || icon.color || 'Unknown')}</b>
                </div>` : ''}
                <div class="modal-meta-item">
                    Origin: ${icon.origin ? escapeHtml(icon.origin) : '<span class="modal-none">Not provided</span>'}
                </div>
                <div class="modal-meta-item">
                    By: ${icon.by ? escapeHtml(icon.by) : '<span class="modal-none">Not provided</span>'}
                </div>
                <div class="modal-meta-item modal-meta-source">
                    Source: ${sourceHtml}
                </div>
            </div>
            <div class="modal-info-scroll">
                ${escapeHtml(icon.info || 'No additional information is available.')}
            </div>
        `;

        detailModal.classList.add('active');
    };
}
