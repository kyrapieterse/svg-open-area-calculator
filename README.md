# SVG open-area calculator

Estimate the percentage of a panel that is open, including a solid border around the artwork. This free browser tool works offline and processes files on your device.

## Run locally

Download the repository as a ZIP, extract it and open `index.html` in a modern browser. No build step, account or API key is required.

## Try the example

The bundled square has a dark left half. With a 1,000 × 1,000 mm panel, dark openings and zero border, the result is 50%. Set the solid border to 100 mm and the open area is about 32% of the full panel.

## How it works

The browser fits the drawing proportionally into the inner rectangle, composites it onto white and classifies luminance below 128 as dark. The border and any letterbox margins are always solid. The longest sample dimension is 960 pixels. Fine details near a pixel in width, gradients and strokes affect the estimate. Use filled two-tone artwork.

For related examples and project guidance, see the [Tint & Screen screen pattern density guide](https://tintandscreen.co.za/advice/architectural-screen-pattern-density/).

## License

The code and original sample geometry are available under the [MIT License](LICENSE). The Tint & Screen name and logo identify the publisher and are outside the code license. Artwork and photos you load keep their own rights.
