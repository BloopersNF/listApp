const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const themeSource = fs.readFileSync(
    path.resolve(__dirname, '../src/context/ThemeContext.js'),
    'utf8'
);

const getLightThemeColor = (token) => {
    const match = themeSource.match(
        new RegExp(`${token}:\\s*isDarkMode\\s*\\?\\s*'#[0-9a-fA-F]{3,6}'\\s*:\\s*'(#[0-9a-fA-F]{3,6})'`)
    );

    assert.ok(match, `Expected a light theme value for ${token}`);
    return match[1];
};

const getRelativeLuminance = (hexColor) => {
    const normalizedHexColor = hexColor.length === 4
        ? `#${[...hexColor.slice(1)].map((character) => character.repeat(2)).join('')}`
        : hexColor;
    const channels = normalizedHexColor
        .slice(1)
        .match(/.{2}/g)
        .map((channel) => parseInt(channel, 16) / 255)
        .map((channel) => (
            channel <= 0.03928
                ? channel / 12.92
                : ((channel + 0.055) / 1.055) ** 2.4
        ));

    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
};

const getContrastRatio = (firstColor, secondColor) => {
    const firstLuminance = getRelativeLuminance(firstColor);
    const secondLuminance = getRelativeLuminance(secondColor);
    const lighter = Math.max(firstLuminance, secondLuminance);
    const darker = Math.min(firstLuminance, secondLuminance);

    return (lighter + 0.05) / (darker + 0.05);
};

test('light secondary and tertiary text meet normal-text contrast on app surfaces', () => {
    const textColors = [
        getLightThemeColor('textSecondary'),
        getLightThemeColor('textTertiary'),
    ];
    const surfaceColors = [
        getLightThemeColor('background'),
        getLightThemeColor('surface'),
    ];

    for (const textColor of textColors) {
        for (const surfaceColor of surfaceColors) {
            assert.ok(
                getContrastRatio(textColor, surfaceColor) >= 4.5,
                `${textColor} must have at least 4.5:1 contrast on ${surfaceColor}`
            );
        }
    }
});
