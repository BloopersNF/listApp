const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('keeps the displayed and native release versions aligned with package.json', () => {
    const packageVersion = require('../package.json').version;
    const appVersion = JSON.parse(read('app.json')).expo.version;
    const androidVersion = read('android/app/build.gradle').match(/versionName\s+"([^"]+)"/)?.[1];
    const iosVersions = [
        ...read('ios/MarketList.xcodeproj/project.pbxproj').matchAll(/MARKETING_VERSION\s*=\s*([^;]+);/g),
    ].map((match) => match[1]);
    const configScreen = read('src/screens/configScreen.js');

    assert.equal(appVersion, packageVersion);
    assert.equal(androidVersion, packageVersion);
    assert.ok(iosVersions.length > 0);
    assert.ok(iosVersions.every((version) => version === packageVersion));
    assert.match(configScreen, /v\{appPackage\.version\}/);
    assert.doesNotMatch(configScreen, /getText\(['"]version['"]\)/);
});
