// Patch the Capacitor-generated android/app/build.gradle to add release
// signing (from CI env vars) and bump the version. Run after `cap sync`.
import fs from "node:fs";

const file = process.argv[2] || "android/app/build.gradle";
let g = fs.readFileSync(file, "utf8");

const vc = process.env.FOLIO_VERSION_CODE || "1";
const vn = process.env.FOLIO_VERSION_NAME || "1.0.0";

if (!g.includes("signingConfigs {")) {
  g = g.replace(
    /android\s*\{/,
    `android {
    signingConfigs {
        release {
            storeFile file("folio-release.keystore")
            storePassword System.getenv("FOLIO_KEYSTORE_PASSWORD")
            keyAlias System.getenv("FOLIO_KEY_ALIAS")
            keyPassword System.getenv("FOLIO_KEY_PASSWORD")
        }
    }
`
  );
}

g = g.replace(/versionCode\s+\d+/, `versionCode ${vc}`);
g = g.replace(/versionName\s+"[^"]*"/, `versionName "${vn}"`);

if (
  !/buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release/.test(
    g
  )
) {
  g = g.replace(
    /(buildTypes\s*\{[\s\S]*?release\s*\{)/,
    `$1\n            signingConfig signingConfigs.release`
  );
}

fs.writeFileSync(file, g);
console.log(`patched ${file}: versionCode=${vc} versionName=${vn}`);
