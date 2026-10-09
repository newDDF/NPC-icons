export function normalizeHex(hex) {
    if (!hex || hex === 'none') return null;

    let value = hex.replace('#', '').trim();

    if (value.length === 3) {
        value = value.split('').map(c => c + c).join('');
    }

    return value.length === 6 && /^[0-9a-fA-F]{6}$/.test(value)
        ? value
        : null;
}

export function getContrastTextColor(hexColor) {
    const value = normalizeHex(hexColor);
    if (!value) return '#ffffff';

    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);

    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#1c1c1e'
        : '#ffffff';
}

export function hexToHsl(hex) {
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
