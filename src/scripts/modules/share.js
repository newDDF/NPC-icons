import { copyToClipboard } from './utils.js';

export function initShare() {
    const shareBtn = document.getElementById('shareBtn');
    const shareMenu = document.getElementById('shareMenu');
    const shareContainer = document.getElementById('shareContainer');

    if (!shareBtn || !shareMenu || !shareContainer) return;

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
                pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent("https://icons.x0u0x.xyz/assets/share-preview.png")}&description=${encodeURIComponent(shareText)}`,
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
}
