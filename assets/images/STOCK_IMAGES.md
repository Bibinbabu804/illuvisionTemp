# Temporary stock images

All photography on the site is **temporary** free stock from [Unsplash](https://unsplash.com/license) (free to use, no attribution required).
None of it shows an actual Illuvision product, installation or advertising location.

**To replace an image:** add the final file to `assets/images/` (WebP/AVIF preferred) and change the matching entry in `data/media.js`, e.g.

```js
import heroWall from "@/assets/images/hero-wall.webp";
heroCurvedWall: { src: heroWall, alt: "…" },
```

Components only reference these keys, so layouts do not change. Once all images are local, the Unsplash branch in `lib/imageLoader.js` and `remotePatterns` in `next.config.mjs` can be removed.

| Key | Used for | Unsplash photo | Description |
| --- | --- | --- | --- |
| `heroCurvedWall` | Homepage hero | [photo-1793081114216-915fde0cc53f](https://images.unsplash.com/photo-1793081114216-915fde0cc53f) | Large curved display wall showing ocean waves in a dark room |
| `outdoorLedFacade` | Outdoor LED category/product, Showcase | [photo-1757564591721-4105db68cd6e](https://images.unsplash.com/photo-1757564591721-4105db68cd6e) | Curved outdoor LED screen wrapping a building at night |
| `indoorVideoWall` | LED wall category/product, hero card | [photo-1663841366340-c0fee65c6a11](https://images.unsplash.com/photo-1663841366340-c0fee65c6a11) | Multi-panel indoor video wall in a dark blue room |
| `wallDisplay` | Indoor display category/product | [photo-1567690187548-f07b1d7bf5a9](https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9) | Wall-mounted flat display above a minimal white console |
| `brickWallDisplay` | Product gallery | [photo-1619233543829-665423afedc3](https://images.unsplash.com/photo-1619233543829-665423afedc3) | Flat display mounted on an exposed brick wall |
| `interactiveStandee` | Product galleries | [photo-1764795849694-34b3316b3de4](https://images.unsplash.com/photo-1764795849694-34b3316b3de4) | Two people using a freestanding interactive display |
| `standeeInStore` | Standee category/product, hero | [photo-1790156590226-5dc136fbf150](https://images.unsplash.com/photo-1790156590226-5dc136fbf150) | Portrait digital display on a wheeled stand in a cafeteria |
| `menuBoard` | Menu board category/product, Showcase | [photo-1790156591773-4d398ccbf38a](https://images.unsplash.com/photo-1790156591773-4d398ccbf38a) | Digital menu screens above a food service counter |
| `retailScreens` | Showcase, product galleries | [photo-1788347101903-ab6b0167dae5](https://images.unsplash.com/photo-1788347101903-ab6b0167dae5) | Clothing store with a portrait digital display near the entrance |
| `meetingRoom` | Interactive panel category/product, Showcase | [photo-1676275774895-7fbba85dce94](https://images.unsplash.com/photo-1676275774895-7fbba85dce94) | Meeting room with a large wall display and people at a table |
| `receptionScreen` | Product gallery | [photo-1788106324679-68fdeec8f471](https://images.unsplash.com/photo-1788106324679-68fdeec8f471) | Modern store interior with a large wall-mounted digital display |
| `airportAd` | Advertising intro | [photo-1771945038211-7f80e91ca24a](https://images.unsplash.com/photo-1771945038211-7f80e91ca24a) | Digital advertising screen in an airport walkway |
| `corridorAd` | Advertising intro | [photo-1687134287259-55a6cb1af12e](https://images.unsplash.com/photo-1687134287259-55a6cb1af12e) | Illuminated advertising display in a long transit corridor |
| `transitDisplay` | Spare | [photo-1790584163678-957ae0aad6f0](https://images.unsplash.com/photo-1790584163678-957ae0aad6f0) | Digital information display under a transit shelter canopy |
| `silhouetteScreen` | Advertising intro | [photo-1763256340568-c75b0e95029c](https://images.unsplash.com/photo-1763256340568-c75b0e95029c) | Person walking past a large bright screen in a dark space |
| `hallwayScreens` | Spare | [photo-1776333089054-bfed3bd9a1f4](https://images.unsplash.com/photo-1776333089054-bfed3bd9a1f4) | Two large landscape advertising screens on a white wall |
| `blueWall` | Product gallery | [photo-1785227908142-d25091b9eb23](https://images.unsplash.com/photo-1785227908142-d25091b9eb23) | People walking past a wide blue screen showing a beach scene |
| `ledMacro` | Why Illuvision, product galleries | [photo-1643642969389-6db6b7a0fa56](https://images.unsplash.com/photo-1643642969389-6db6b7a0fa56) | Close-up of LED pixels glowing in multiple colours |
| `cityBillboards` | Advertise page hero | [photo-1762417582191-e69cd1cb0609](https://images.unsplash.com/photo-1762417582191-e69cd1cb0609) | Bright digital billboards on buildings at night |
