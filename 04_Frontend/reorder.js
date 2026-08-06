import fs from 'fs';

const path = 'C:/Users/raote/Documents/Duoc/Tesis/04_Frontend/src/pages/BodegaPage.tsx';
let txt = fs.readFileSync(path, 'utf8');

const opStart = txt.indexOf("{/* --- FILA OPERATIVA: Tránsito + En Bodega --- */}");
const eqStart = txt.indexOf("{/* --- PANEL EQUIPOS LISTOS PARA INSTALAR --- */}");
const invStart = txt.indexOf("{/* --- PANEL INVENTARIO GLOBAL --- */}");
const endPos = txt.lastIndexOf("</div>\r\n    );\r\n}");
if (endPos === -1 && txt.lastIndexOf("</div>\n    );\n}") !== -1) {
    // try formatting
}

// Instead of string index magic, we'll just slice the blocks
const p1 = txt.indexOf("{/* COLUMNA 1: EN TRÁNSITO */}");
const p2 = txt.indexOf("{/* COLUMNA 2: EN BODEGA */}");
const p3 = txt.indexOf("            </div>\r\n\r\n            {/* --- PANEL EQUIPOS");
if (p3 === -1 && txt.indexOf("            </div>\n\n            {/* --- PANEL EQUIPOS") !== -1) {
}

// It's much simpler to use regular expressions to match the blocks:
const rxTransito = /\{\/\* COLUMNA 1: EN TRÁNSITO \*\/\}.*?(?=\{\/\* COLUMNA 2: EN BODEGA \*\/})/s;
const rxBodega = /\{\/\* COLUMNA 2: EN BODEGA \*\/\}.*?(?=            <\/div>\r?\n\r?\n            \{\/\* --- PANEL EQUIPOS)/s;
const rxListos = /\{\/\* --- PANEL EQUIPOS LISTOS PARA INSTALAR --- \*\/\}.*?(?=\{\/\* --- PANEL INVENTARIO GLOBAL --- \*\/})/s;
const rxInv = /\{\/\* --- PANEL INVENTARIO GLOBAL --- \*\/\}.*?(?=        <\/div>\r?\n    \);\r?\n\})/s;

const transitoMatch = txt.match(rxTransito);
const bodegaMatch = txt.match(rxBodega);
const listosMatch = txt.match(rxListos);
const invMatch = txt.match(rxInv);

if (transitoMatch && bodegaMatch && listosMatch && invMatch) {
    const header = txt.substring(0, opStart);
    const footer = txt.substring(rxInv.exec(txt).index + invMatch[0].length);

    let listosRep = listosMatch[0].replace(/style={{ marginBottom: '24px' }}/g, 'style={{ paddingBottom: 0 }}');

    const newLayout = `
            {/* --- LAYOUT SPLIT: MÓDULOS A LA IZQUIERDA --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.3fr) minmax(200px, 1fr)', gap: '24px', marginBottom: '30px', alignItems: 'start' }}>
                
                {/* IZQUIERDA: LISTOS E INVENTARIO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
${listosRep}
${invMatch[0]}
                </div>

                {/* DERECHA: TRÁNSITO Y BODEGA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
${transitoMatch[0]}
${bodegaMatch[0]}
                </div>

            </div>
`;

    fs.writeFileSync(path, header + newLayout + footer);
    console.log("Success! File reordered.");
} else {
    console.log("Blocks not found", !!transitoMatch, !!bodegaMatch, !!listosMatch, !!invMatch);
}
