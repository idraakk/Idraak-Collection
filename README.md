# Idraak’s collection

A standalone gallery for Idraak's software. MicroGram is the first entry. The site uses build-time HTML, locally hosted fonts, and the original supplied screenshots.

## Preview locally

Requires Node.js 22+. Run from this folder:

    node build.mjs
    python -m http.server 4174 --directory dist

Open http://localhost:4174/. The project has no npm dependencies.

## Publish to GitHub Pages

1. Push gallery changes to main in [Idraak-Collection](https://github.com/idraakk/Idraak-Collection). The dist/ directory is generated in CI.
2. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. In **Actions**, run **Deploy gallery to GitHub Pages** if the first push happened before Pages was enabled. The workflow publishes future pushes to main.

The Pages URL is https://idraakk.github.io/Idraak-Collection/. Relative paths let the pages work at that subpath.

## Update the catalog

Edit products.mjs. Each entry gets a gallery card and a dedicated page at its slug. Add its icon and at least three screenshots under assets/<slug>/, then run node build.mjs to verify the files. Commit and push the source.

Get MicroGram downloads the APK in assets/microgram/downloads/. The current file is the debug-signed build used for phone testing. Before a public release, replace it with your release-signed APK and update the corresponding-source archive next to it. Both are linked from the product page.

For a same-Wi-Fi preview, run python -m http.server 4175 --bind 0.0.0.0 --directory dist, then open the laptop's Wi-Fi IPv4 address on port 4175 from your phone. Windows may require allowing the server on the private network.

The MicroGram screenshots are byte-for-byte copies of the supplied JPEGs. Their original 720 × 1600 resolution is available in the screenshot viewer.

## Design references

- [Panic](https://panic.com/) for a studio-led collection with product identities.
- [Teenage Engineering](https://teenage.engineering/products) for treating products as exhibited objects.
- [Linear](https://linear.app/changelog/2024-03-20-new-linear-ui) for visual hierarchy and contrast.
