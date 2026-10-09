let toast;

export function initUtils(toastElement) {
    toast = toastElement;
}

export function showToast(message) {
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

export async function copyToClipboard(text, message) {
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

export async function downloadIcon(name, format, path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Download started: ${name}.${format}`);
    } catch (error) {
        console.error(error);
        showToast('Download failed');
    }
}
