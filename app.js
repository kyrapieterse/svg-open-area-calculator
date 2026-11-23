"use strict";

const el = id => document.getElementById(id);

const fmt = (number, digits = 2) => number.toLocaleString("en-ZA", { maximumFractionDigits: digits });

function list(id, values) {
  el(id).replaceChildren(...values.map(value => {
    const line = document.createElement("li");
    line.textContent = value;
    return line;
  }));
}

function number(id) {
  const input = el(id);
  if (!input.validity.valid || !Number.isFinite(input.valueAsNumber)) {
    throw new Error("Check " + input.labels[0].textContent.trim().toLowerCase() + " and its allowed range.");
  }
  return input.valueAsNumber;
}

function refresh(draw) {
  try {
    draw();
    el("message").textContent = "";
    el("result").hidden = false;
  } catch (error) {
    el("message").textContent = error.message;
    el("result").hidden = true;
  }
}

function imageFrom(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be opened. Choose a valid local image."));
    image.src = source;
  });
}

const sample = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100" height="200"/></svg>');
let artwork, sourceNumber = 0;
function measure() {
  if (!artwork) return;
  const width = number("width"), height = number("height"), border = number("border");
  if (2*border >= Math.min(width,height)) throw new Error("Reduce the border so some space remains for the artwork.");
  const view = el("view");
  const scale = 960 / Math.max(width,height);
  const w = view.width = Math.max(1,Math.round(width*scale));
  const h = view.height = Math.max(1,Math.round(height*scale));
  const ctx = view.getContext("2d",{willReadFrequently:true});
  const artScale = Math.min((width-2*border)/artwork.naturalWidth,(height-2*border)/artwork.naturalHeight);
  const artW = artwork.naturalWidth*artScale/width*w, artH = artwork.naturalHeight*artScale/height*h;
  const x = (w-artW)/2, y = (h-artH)/2;
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,w,h);
  ctx.drawImage(artwork,x,y,artW,artH);
  const pixels = ctx.getImageData(0,0,w,h);
  const darkOpen = el("mode").value === "dark";
  let open = 0;
  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
      const i = (row*w + col)*4;
      const data = pixels.data;
      const inside = col+.5 >= x && col+.5 < x+artW && row+.5 >= y && row+.5 < y+artH;
      const dark = .2126*data[i] + .7152*data[i+1] + .0722*data[i+2] < 128;
      const hole = inside && dark === darkOpen;
      if (hole) open++;
      data[i] = hole ? 48 : 223; data[i+1] = hole ? 111 : 231; data[i+2] = hole ? 178 : 239;
    }
  }
  ctx.putImageData(pixels,0,0);
  view.style.maxHeight = "25rem";
  view.style.objectFit = "contain";
  const fraction = open/(w*h);
  el("summary").textContent = fmt(100*fraction,1) + "% open";
  list("details",["Open area ≈ " + fmt(width*height*fraction/1e6,4) + " m²","Solid area ≈ " + fmt(width*height*(1-fraction)/1e6,4) + " m²","Sample grid " + w + " × " + h + " pixels"]);
}
async function load(source) {
  const version = ++sourceNumber;
  try {
    const image = await imageFrom(source);
    if (version !== sourceNumber) return;
    artwork = image;
    refresh(measure);
  } catch (error) {
    if (version !== sourceNumber) return;
    artwork = null;
    el("result").hidden = true;
    el("message").textContent = error.message;
  }
}
el("art").onchange = event => {
  const file = event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(new Blob([file],{type:"image/svg+xml"}));
  load(url).finally(() => URL.revokeObjectURL(url));
};
el("sample").onclick = () => { el("art").value = ""; load(sample); };
el("controls").addEventListener("input",event => { if (event.target.type !== "file") refresh(measure); });
load(sample);
