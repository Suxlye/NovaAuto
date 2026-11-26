import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
const selected = JSON.parse(
  await readFile('scripts/part-image-sources.json', 'utf8'),
);
const extra = {
  brakeFluid: 'Líquido para frenos Bardahl DOT 3, 1000cc.jpg',
  belt: 'Front of engine, serpentine belt, turbos, waste gates and air ducts, (7996565681).jpg',
};
const params = new URLSearchParams({
  action: 'query',
  format: 'json',
  titles: Object.values(extra)
    .map((t) => `File:${t}`)
    .join('|'),
  prop: 'imageinfo',
  iiprop: 'url|extmetadata',
  iiurlwidth: '600',
});
const response = await fetch(
  `https://commons.wikimedia.org/w/api.php?${params}`,
);
if (!response.ok) throw new Error(response.status);
const d = await response.json();
for (const [key, title] of Object.entries(extra)) {
  const p = Object.values(d.query.pages).find(
    (p) => p.title === `File:${title}`,
  );
  if (!p?.imageinfo) throw new Error(`Missing ${title}`);
  selected[key] = { title: p.title, ...p.imageinfo[0] };
}
await writeFile(
  'scripts/part-image-sources.json',
  JSON.stringify(selected, null, 2),
);
const mapping = [
  'pads',
  'disc',
  'brakeFluid',
  'oilFilter',
  'airFilter',
  'sparkPlug',
  'timingBelt',
  'shock',
  'tieRod',
  'bearing',
  'battery',
  'bulb',
  'alternator',
  'clutch',
  'cvJoint',
  'radiator',
  'waterPump',
  'coolant',
  'oil',
  'oil',
  'atf',
  'wiper',
  'cabinFilter',
  'belt',
];
const names = {
  pads: 'Pastillas de freno',
  disc: 'Discos de freno',
  brakeFluid: 'Envase de líquido de frenos',
  oilFilter: 'Filtro de aceite',
  airFilter: 'Filtro de aire',
  sparkPlug: 'Bujías NGK',
  timingBelt: 'Correa de distribución montada en un motor',
  shock: 'Amortiguador de automóvil',
  tieRod: 'Terminal de dirección',
  bearing: 'Rodamiento de bolas',
  battery: 'Batería de automóvil',
  bulb: 'Bombilla halógena H4',
  alternator: 'Alternador de automóvil',
  clutch: 'Disco de embrague',
  cvJoint: 'Junta homocinética y semieje',
  radiator: 'Radiador de automóvil',
  waterPump: 'Bomba de agua de automóvil',
  coolant: 'Envase de refrigerante',
  oil: 'Envase de aceite de motor',
  atf: 'Envase de fluido de transmisión automática',
  wiper: 'Limpiaparabrisas de automóvil',
  cabinFilter: 'Filtro de cabina',
  belt: 'Correa de accesorios instalada en un motor',
};
const strip = (value) =>
  (value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
await mkdir('public/images/parts', { recursive: true });
const images = {};
for (const key of [...new Set(mapping)]) {
  const p = selected[key];
  if (!p) throw new Error(`Missing selection ${key}`);
  const ext = new URL(p.url).pathname.split('.').pop().toLowerCase();
  const file = `images/parts/${key}.${ext}`;
  let exists = false;
  try {
    exists = (await stat(`public/${file}`)).size > 1000;
  } catch {}
  if (!exists) {
    let imageResponse = await fetch((p.thumburl || p.url).split('?')[0]);
    if (!imageResponse.ok) imageResponse = await fetch(p.url.split('?')[0]);
    for (let attempt = 0; !imageResponse.ok && attempt < 3; attempt++) {
      await new Promise((r) => setTimeout(r, 4000));
      imageResponse = await fetch(p.url.split('?')[0]);
    }
    if (!imageResponse.ok) throw new Error(`${key}: ${imageResponse.status}`);
    if (!imageResponse.headers.get('content-type')?.startsWith('image/'))
      throw new Error(`${key}: not image`);
    await writeFile(
      `public/${file}`,
      Buffer.from(await imageResponse.arrayBuffer()),
    );
  }
  images[key] = {
    file,
    alt: names[key],
    source: p.descriptionurl,
    author:
      strip(p.extmetadata.Artist?.value) ||
      'Autor indicado en la fuente original',
    license: strip(p.extmetadata.LicenseShortName?.value),
    licenseUrl: p.extmetadata.LicenseUrl?.value || p.descriptionurl,
  };
  console.log(`OK ${key} ${file}`);
  await new Promise((r) => setTimeout(r, 1000));
}
const partImages = Object.fromEntries(
  mapping.map((key, i) => [
    `NA-${String(i + 1).padStart(4, '0')}`,
    images[key],
  ]),
);
await writeFile(
  'src/data/partImages.js',
  `// Fotografías de referencia. Autoría y licencias disponibles en la página de créditos.\nexport const partImages = ${JSON.stringify(partImages, null, 2)};\n`,
);
await writeFile(
  'public/images/parts/credits.json',
  JSON.stringify(images, null, 2),
);
console.log('24 productos con fotografías locales; 23 archivos.');
