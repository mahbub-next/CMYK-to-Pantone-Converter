document.addEventListener("DOMContentLoaded", function() {
    const cyan = document.getElementById('cyan');
    const magenta = document.getElementById('magenta');
    const yellow = document.getElementById('yellow');
    const black = document.getElementById('black');

    const cyanValue = document.getElementById('cyanValue');
    const magentaValue = document.getElementById('magentaValue');
    const yellowValue = document.getElementById('yellowValue');
    const blackValue = document.getElementById('blackValue');

    const colorBox = document.getElementById('colorBox');
    const colorPicker = document.getElementById('colorPicker');
    const hexValue = document.getElementById('hexValue');
    const pantoneResults = document.getElementById('pantoneResults');

    function cmykToRgb(c, m, y, k) {
        const r = 1 - Math.min(1, c * (1 - k) + k);
        const g = 1 - Math.min(1, m * (1 - k) + k);
        const b = 1 - Math.min(1, y * (1 - k) + k);
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    function rgbToHex(r, g, b) {
        const rHex = r.toString(16).padStart(2, '0');
        const gHex = g.toString(16).padStart(2, '0');
        const bHex = b.toString(16).padStart(2, '0');
        return `#${rHex}${gHex}${bHex}`;
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    function rgbToCmyk(r, g, b) {
        const c = 1 - (r / 255);
        const m = 1 - (g / 255);
        const y = 1 - (b / 255);
        const k = Math.min(c, m, y);
        const kPrime = 1 - k;
        const cPrime = (c - k) / kPrime;
        const mPrime = (m - k) / kPrime;
        const yPrime = (y - k) / kPrime;
        return {
            c: Math.round(cPrime * 100),
            m: Math.round(mPrime * 100),
            y: Math.round(yPrime * 100),
            k: Math.round(k * 100)
        };
    }

    function updateColor() {
        const c = cyan.value / 100;
        const m = magenta.value / 100;
        const y = yellow.value / 100;
        const k = black.value / 100;

        const { r, g, b } = cmykToRgb(c, m, y, k);
        const hexColor = rgbToHex(r, g, b);
        colorBox.style.backgroundColor = hexColor;
        colorPicker.value = hexColor;
        hexValue.value = hexColor;

        fetchPantone(hexColor);
    }

    function fetchPantone(hexColor) {
        fetch(`getPantone.php?hex=${hexColor}`)
            .then(response => response.json())
            .then(data => {
                pantoneResults.innerHTML = data.map(p => `<div class="pantone-color" style="background-color: ${p.hex}">${p.pantone} ${p.hex}</div>`).join('');
            });
    }

    function updateCMYKFromHex() {
        const hexColor = hexValue.value;
        const { r, g, b } = hexToRgb(hexColor);
        const { c, m, y, k } = rgbToCmyk(r, g, b);
        cyan.value = cyanValue.value = c;
        magenta.value = magentaValue.value = m;
        yellow.value = yellowValue.value = y;
        black.value = blackValue.value = k;
        colorBox.style.backgroundColor = hexColor;
        colorPicker.value = hexColor;
        fetchPantone(hexColor);
    }

    [cyan, magenta, yellow, black].forEach(input => {
        input.addEventListener('input', () => {
            cyanValue.value = cyan.value;
            magentaValue.value = magenta.value;
            yellowValue.value = yellow.value;
            blackValue.value = black.value;
            updateColor();
        });
    });

    [cyanValue, magentaValue, yellowValue, blackValue].forEach(input => {
        input.addEventListener('input', () => {
            cyan.value = cyanValue.value;
            magenta.value = magentaValue.value;
            yellow.value = yellowValue.value;
            black.value = blackValue.value;
            updateColor();
        });
    });

    colorPicker.addEventListener('input', () => {
        hexValue.value = colorPicker.value;
        updateCMYKFromHex();
    });

    hexValue.addEventListener('input', updateCMYKFromHex);

    updateColor();
});
