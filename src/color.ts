const hexToHsl = (hex: string): [number, number, number] => {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.padStart(2, "0");
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixHslColors = (
  color1: string,
  color2: string,
  weight: number,
): string => {
  const [h1, s1, l1] = hexToHsl(color1);
  const [h2, s2, l2] = hexToHsl(color2);

  let h;
  const dh = h2 - h1;
  if (Math.abs(dh) > 180) {
    if (dh > 0) {
      h = h1 + (dh - 360) * weight;
    } else {
      h = h1 + (dh + 360) * weight;
    }
  } else {
    h = h1 + dh * weight;
  }
  h = (h + 360) % 360;

  const s = s1 + (s2 - s1) * weight;
  const l = l1 + (l2 - l1) * weight;

  return hslToHex(h, s, l);
};

export const getInterpolatedColor = (
  colors: string[],
  defaultColor: string,
  count: number,
  maxCount: number,
): string => {
  if (colors.length === 0 || maxCount == 0) return "";

  const pos = count / maxCount;
  const index = pos * colors.length;
  const left = Math.floor(index);
  const right = Math.ceil(index);
  const leftColor = left === 0 ? defaultColor : colors[left - 1];
  const rightColor = colors[right - 1];

  return mixHslColors(leftColor, rightColor, index - left);
};

