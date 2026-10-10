import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../apps/desktop/package.json', import.meta.url));
const { zipSync, strToU8 } = require('fflate');
const directory = new URL('../.test-artifacts/', import.meta.url);
mkdirSync(directory, { recursive: true });
const ns = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const slide = (title, text) => `<p:sld ${ns}><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="F5F0FF"/></a:solidFill></p:bgPr></p:bg><p:spTree><p:sp><p:spPr><a:xfrm><a:off x="914400" y="914400"/><a:ext cx="10000000" cy="1200000"/></a:xfrm></p:spPr><p:txBody><a:p><a:r><a:rPr sz="4400" b="1"><a:solidFill><a:srgbClr val="51377A"/></a:solidFill></a:rPr><a:t>${title}</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:spPr><a:xfrm><a:off x="914400" y="3000000"/><a:ext cx="10000000" cy="1500000"/></a:xfrm></p:spPr><p:txBody><a:p><a:r><a:rPr sz="2600"/><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`;
const files = {
  '[Content_Types].xml': '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/></Types>',
  'ppt/presentation.xml': `<p:presentation ${ns}><p:sldSz cx="12192000" cy="6858000"/></p:presentation>`,
  'ppt/slides/slide1.xml': slide('Nova / shared presentation', 'One workplace. Every idea has a place.'),
  'ppt/slides/slide2.xml': slide('Made for being together', 'This second slide follows the presenter in every client.'),
};
writeFileSync(new URL('nova-demo.pptx', directory), zipSync(Object.fromEntries(Object.entries(files).map(([path,xml]) => [path,strToU8(xml)]))));
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 960 540] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>',
  'BT /F1 42 Tf 70 370 Td (Nova / shared presentation) Tj ET',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 960 540] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>',
  'BT /F1 42 Tf 70 370 Td (Made for being together) Tj ET',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];
let pdf = '%PDF-1.4\n'; const offsets = [0];
objects.forEach((object,i) => { offsets.push(Buffer.byteLength(pdf));const body=[3,5].includes(i)?`<< /Length ${Buffer.byteLength(object)} >>\nstream\n${object}\nendstream`:object;pdf+=`${i+1} 0 obj\n${body}\nendobj\n`; });
const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 8\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
writeFileSync(new URL('nova-demo.pdf',directory),pdf);
console.log(`Created smoke-test presentations in ${fileURLToPath(directory)}`);
