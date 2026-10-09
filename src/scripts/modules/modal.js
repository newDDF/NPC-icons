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
    };
}
