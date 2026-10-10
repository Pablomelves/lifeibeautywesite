# Static LiFei reference heroes

The homepage uses the three supplied 851 × 1848 reference artworks, including their original product photography, decorative elements, logo, icons, typography, and buttons. Assets in `public/hero` are lossless WebP conversions; the product-header assets are unaltered crops of the top 146 pixels. No artwork was generated or redesigned.

The red hero is present in the initial HTML and preloaded before the application starts. The React hero preserves the same composition. The artwork fits inside the stable small viewport height, with safe-area padding, without cropping or stretching. Screens with a different aspect ratio retain the entire reference, with matching-color space at the sides or bottom rather than a new layout. Exact full-screen pixel matching applies to the original reference aspect ratio.

Transparent, accessible controls align with the shopping buttons and header icons already drawn in the artwork. Both shopping links use the corresponding real product route on the current domain. Loaded Shopify handles take precedence over the verified initial handles. Search, account, bag, and menu controls use the existing store callbacks. Manual product controls sit below the artwork so they do not change the reference composition. There are no automatic slides, pointer or scroll listeners, transforms, animation frames, or animation timers in the hero.

The three Shopify product IDs in `src/data/referenceHeroes.ts` restrict the matching brand headers to their corresponding product details. Other products retain their previous detail header. Existing prices, variants, images, purchase controls, Shopify integration, and checkout logic are unchanged. The floating quick-add widget remains available after the homepage hero leaves the viewport, rather than covering the reference artwork.

## Verification

Run `npm run lint`, `npm run test:storefront`, and `npm run test:shopify` for type checking and regression tests. The platform performs the production build and deployment separately.

For visual comparison, use an 851 × 1848 viewport at device scale factor 1. Capture the initial red screen, then select yellow and pink using the controls below the artwork and return to the top. Compare each screenshot with the corresponding supplied reference. Local Chromium verification produced zero differing pixels for all three, including the red initial HTML before JavaScript ran.

Also check 320 × 568, 390 × 844, 430 × 932, 768 × 1024, and 1440 × 900 viewports. Confirm the artwork retains its aspect ratio, the header controls align, both shopping links remain in the first viewport, and there is no horizontal overflow. Wait longer than four seconds and move the pointer or scroll; the selected hero must not change.

After deployment, repeat the visual and navigation checks on `lifeibeauty.com`, including both shopping links, homepage logo, search, account, menu, bag, browser-back navigation, the three corresponding product headers, and an unrelated product page. Production verification remains necessary because the live site still served the previous implementation during this editing session.
