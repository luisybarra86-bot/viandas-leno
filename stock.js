// Articulo, Cantidad (parsed from Stock Actual report - Deposito Central)
const rows = [
["Mayonesa 8g x196 (caja)", 2.00],
["Savora 8g x196 und (caja)", 6.00],
["Mayonesa Hellmanns (kg)", 68.00],
["Barbacoa Hellmann's (kg)", 8.00],
["Harina 0000 x1kg (und)", 120.97],
["Toalla intercalada x10 pack (caja)", 14.00],
["Servilleta Eco 30x30 (caja)", 1.00],
["Folex 14x14 x 1kg (und)", 4.00],
["Pop it personajes (und)", 103.00],
["Azucar 1kg (und)", 93.00],
["Bobina papel 2x300 (und)", 35.01],
["Film Alimenticio 38x800 (und)", -1.00],
["Cazuela + tapa 55cc (und)", 165.00],
["Ketchup Hellmann's (kg)", -11.00],
["Sal dos anclas fina (Kg)", 12.00],
["Leche entera Ilolay 1lts (und)", 189.00],
["Bolsa arranque 50x70 (und)", 2.00],
["Fernet Branca 750ml (und)", 19.00],
["Vodka Absolut 700ml (und)", 1.00],
["Individuales (und)", -2000.00],
["Roquefort Lucrecia (kg)", 2.50],
["Rollo termico 80x45 (und)", -10.00],
["Gomillas (paq)", -1.70],
["Broches 26/6 (caja)", 23.00],
["Ketchup H. x196 (caja)", -3.00],
["Bidon agua 20 (lts)", 4.00],
["Savora Mostaza (kg)", 11.00],
["Gin Martina 750cc (und)", 2.00],
["Bolsa 90x110 (paq)", -8.00],
["Escoba ecomax (und)", -2.00],
["secador sacchi (und)", -2.00],
["Paño Microfibra", -3.00],
["Cofia descartable (und)", 201.00],
["Guante Nitrilo caja x 100 (und)", -1.00],
["Manteca 60x100gr (und)", 12.00],
["Caja Mate x 100 (und)", 5.00],
["Aperol 750ml (und)", 5.00],
["Campari 750ml (und)", 3.00],
["Sobre madera chico (und)", 20.00],
["Marcador Negro (und)", 21.00],
["Broches 10/50 (caja)", 8.00],
["Trapo de piso (und)", -2.00],
["caja de Te (und)", 17.00],
["Cheddar Pouch 3.5kg (und)", 1.00],
["Mumm Lata 269ml (und)", -24.00],
["Resma A4 (Paq)", 4.00],
["Anotador (und)", 10.00],
["Lapicera (und)", 26.00],
["Abrochadora (und)", 3.00],
["Cheddar Tonadita Americano x 168 bloque (und)", 17.00],
["Lavandina 5lts (und)", -1.00],
["Rollo termico posnet (und)", -7.00],
["Parafinado Golden 22X36 (und)", -43740.00],
["Pimienta negra (kg)", -0.50],
["Bolsas Kraft chicas (und)", 6800.00],
["Sobre de papas grande (und)", 2500.00],
["Luxe Desodorante 5lts (und)", -3.00],
["Parafinado Platos 16x25 (und)", -16106.50],
["Pop it personajes (und) [2]", -103.00],
["Aji cayena rojo (kg)", -1.60],
["Marcador verde (und)", 2.00],
["Marcador celeste (und)", 3.00],
["Bolsas Kraft Grandes (und)", 4200.00],
["Sobre de papas chicos (und)", 5800.00],
["Envio", 1.00],
["Caja Leno Kids (und)", 845.00],
["Almidon de Maiz (kg)", -12.50],
["Aceite Girasol (lts)", 1171.50],
["Servilleta LENO 33x33 (caja)", 14.00],
["Box Pollo 20x12x7 (und)", 870.00],
["Caja Panchos Roja 20x12x7 (und)", -190.00],
["Box Papas Roja 12x12x7 (und)", 2130.00],
["Vaso cafe Naranja 8 oz. (und)", 6150.00],
["Vaso cafe Naranja 12 oz. (und)", 5455.00],
["Tapa blanca cafe 12 oz. (und)", 5000.00],
["Pote Sides 250cc (und)", -32.00],
["Pote Sides 360cc (und)", 10.50],
["Pote Helado 360cc (und)", 6301.00],
["Tapa blanca polipapel 250cc / 360cc (und)", 1525.00],
["Uncle Sam - stickers (und)", -1065.00],
["Doble Cheese - Stickers (und)", -1556.00],
["Cheeseburger - Stickers (und)", -731.00],
["La Classic - Stickers (und)", 1275.00],
["D-D - Stickers (und)", 1131.00],
["Dos Treinta - Stickers (und)", 922.00],
["Triple Q. - Stickers (und)", 1278.00],
["Oklahoma - Stickers (und)", 496.00],
["Mix frutos rojos (und)", -3.00],
["Manteca 30x200gr (und)", -10.00],
["Circulo amarillo 1x1- Stickers (und)", 881.00],
["Chomba Leno (und)", -1.00],
["Remera Leno (und)", -2.00],
["Big Leno - Stickers (und)", 817.00],
["Bacon - Stickers (und)", 2601.00],
["Spicy Veg - Stickers (und)", 244.00],
["Uncle XL - Stickers (und)", 448.00],
["Chili Cheese - Stickers (und)", 1248.00],
["Tres cuarenta y cinco - Stickers (und)", 388.00],
["Elemmenthal - Stickers (und)", -1022.00],
["Alquimia Desengrasante 5lts (und)", -6.00],
["Crispy Veg - Stickers (und)", 1502.00],
["Granpa Sam - Stickers (und)", 2136.00],
["Tenedor descartable x100 (und)", -20.00],
["Nuggets Sadia (und)", 8.00],
["Sal celusal porcionada ( caja)", 5.00],
["Queso Pategras x bloque (kg)", 17.59],
["Tenedor descartable 3D reforzado (und)", 1371.00],
["Cuchara descartable koval (und)", 800.00],
["M.A.G.A - Stickers (und)", -918.00],
["Lenomole - Stickers (und)", 297.00],
["SDP 1 - Stickers (und)", 2255.00],
["SDP 2 - Stickers (und)", 1815.00],
["SDP 3 - Stickers (und)", 770.00],
["Circulo Naranja 1x1 - Stickers (und)", 1651.00],
["Circulo Verde 1x1 - Stickers (und)", 1330.00],
["Circulo Rosa 1x1 - Stickers (und)", 2125.00],
["Logo Leno - Stickers (und)", -174.00],
["Parafinado Violeta 22x36 SDP (und)", 2409.00],
["Parafinado base sin diseño 12x20 (und)", 53673.00],
["Gin Brigthon 700ml (und)", 2.00],
["Cinzano Segundo 750ml (und)", 1.00],
["Vaso cristal tapa Domo (und)", 227.00],
["Glutamato de sodio (kg)", -0.50],
["Sal celusal porcionada ( caja) [2]", -7.00],
["Parafinado termico negro (und)", -300.00],
["Jugo Naranja (lts)", -1.00],
["Jugo Limon (lts)", -1.00],
["Carteles publicidad vereda (und)", -1.00],
["Vinilo para cartel publicidad (und)", -2.00],
["Vinilo microperforado p/ sucursal (und)", -3.00],
["Lenit - Stickers (und)", -2.00],
["Cono papas Mcain (und)", -12200.00],
["Servilleta Helado LENO x100 (caja)", 68.00],
["Detergente x 5lts (und)", -6.00],
["Limon (kg)", 2.83],
["Pulpa Palta 450gr (und)", 4.00],
["Doble bacon (und)", 680.00],
["Papas surecrisp x2,5 (und)", 30.00],
["Crema de leche lac-cor 5lts (und)", 4.00],
["Juguete Leno Kids (und)", -70.00],
["Hielo bolsa (und)", 5.00],
["Albahaca (kg)", 2.00],
["Zanahoria (kg)", 10.00],
["Rollo termico 80x60 (und)", 133.00],
["Cebollon (kg)", 7.57],
["HB :) - Stickers (und)", 624.00],
["Polser - Stickers (und)", 201.00],
["Coney - Stickers (und)", 880.00],
["Super Bowl - Stickers (und)", 875.00],
["Cesar - Stickers (und)", 315.00],
["Espinaca - Stickers (und)", 700.00],
["Salchicha Debreczin x 4 und (paq)", 4.00],
["Pote 390cc (und)", 40.00],
["Salchicha Alemana x5 (paq)", 6.00],
["Papas pay (kg)", 0.80],
["Ensaladera 1050cc (und)", 156.00],
["Cazuela + tapa 125cc (und)", 130.00],
["Bana Split - stickers (und)", 144.00],
["Mega Cookie - stickers (und)", 192.00],
["Pink Cream - stickers (und)", 144.00],
["Super Nute - stickers (und)", 192.00],
["Sweet Berry - stickers (und)", 144.00],
["Summer Mix - stickers (und)", 72.00],
["Mini On - stickers (und)", 168.00],
["Tri pop - stickers (und)", 144.00],
["Bana Split (und)", -96.00],
["Mega Cookie (und)", -144.00],
["Pink Cream (und)", -72.00],
["Super Nute (und)", -144.00],
["Sweet Berry (und)", -72.00],
["Summer Mix (und)", -72.00],
["Tri Pop (und)", -72.00],
["Mini On (und)", -108.00],
["Cheddar Pouch Tonadita 3kg (und)", 2.00],
["Logo Leno pote Helados - stickers (und)", 210.00],
["Sal fina dos anclas x 500g (und)", 3.00],
["Carta menu Leno (und)", -15.00],
["Crema de leche Lac-cor lts (RECETA)", 15.00],
["Cheddar Tonadita Experto x 140 fetas (und)", 68.00],
["Manteca cotampo 20 x100gr (caja)", -3.00],
["UTDG - Stickers (und)", 70.00],
["Ecobucket (und)", -3370.00],
["Tapa cartulina 150 oz (und)", 1400.00],
["Manteca pilon Cotampo 2,5kg (und)", -29.00],
["New Yorker - Stickers (und)", -406.00],
["Papas Tradicional finas 2,25kg 7x7 (und)", -32.00],
["Blue Cheval - stickers (und)", -964.00],
["Conos papas (chico) und", 1540.00],
["Manteca Pilon Teodoro 2,5kg (und)", -2.00],
["Tonica Schweppes 310ml (und)", -6.00],
["Bolsa kraft chica - sin logo (und)", -1000.00],
["Parafinado Mcain (und)", -6300.00],
["Pan Generico Leno (und)", -1650.00],
["Shablones de impresion (und)", 4.00],
["Vaso reutilizable Leno Mundial (und)", 2000.00],
["Tapa ecobuckets (und)", -1700.00],
["Vaso - Leno bastones (und)", -370.00],
["Vaso - Leno filetes (und)", -390.00],
["Vaso - Cada dia te quiero mas (und)", -380.00],
["Vaso - Tierra de Diego y Lionel (und)", -340.00],
["Savora x kg (RECETA)", -1.00],
["Toalla intercalada blanca (und)", 1.00],
["Bolsa arranque 25x35 (und)", 3.00],
["Bolsa arranque 20x30 (und)", -3.00],
["Cono papas LENO (und)", -2100.00],
];

const agg = new Map();
for (const [rawName, qty] of rows) {
  const name = rawName.replace(/\s*\[\d+\]$/, "");
  agg.set(name, (agg.get(name) || 0) + qty);
}

const altas = [];
const bajas = [];
for (const [name, qty] of agg.entries()) {
  const rounded = Math.round(qty * 100) / 100;
  if (rounded > 0) bajas.push([name, rounded]);
  else if (rounded < 0) altas.push([name, Math.abs(rounded)]);
}

console.log("Total articulos unicos:", agg.size);
console.log("Bajas (stock positivo a dar de baja):", bajas.length);
console.log("Altas (stock negativo a dar de alta):", altas.length);

const XLSX = require("C:/Users/luisy/AppData/Local/Temp/xlsxgen/node_modules/xlsx");

function buildWorkbookBaja(items) {
  const data = [["Articulo", "Deposito", "Centro de costo", "Cantidad"]];
  for (const [name, qty] of items) {
    data.push([name, 1240, 8067, qty]);
  }
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Importar");
  return wb;
}

function buildWorkbookAlta(items) {
  // Test: include Centro de Costo as 3rd column (same shape as Baja) in case Cantidad needs to be the 4th column.
  const data = [["Articulo", "Deposito", "Centro de costo", "Cantidad"]];
  for (const [name, qty] of items) {
    data.push([name, 1240, 8067, qty]);
  }
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Importar");
  return wb;
}

const mid = Math.ceil(bajas.length / 2);
const bajas1 = bajas.slice(0, mid);
const bajas2 = bajas.slice(mid);

const wbBaja1 = buildWorkbookBaja(bajas1);
const wbBaja2 = buildWorkbookBaja(bajas2);
const wbAlta = buildWorkbookAlta(altas);

XLSX.writeFile(wbAlta, "C:/Users/luisy/Documents/ClaudeLuis/Proyectos/viandas-leno/Alta_DepositoCentral.xlsx");
// Baja files already imported successfully with the 4-column format; not rewritten here to avoid file lock issues.
// XLSX.writeFile(wbBaja1, "C:/Users/luisy/Documents/ClaudeLuis/Proyectos/viandas-leno/Baja_DepositoCentral_Lote1.xlsx");
// XLSX.writeFile(wbBaja2, "C:/Users/luisy/Documents/ClaudeLuis/Proyectos/viandas-leno/Baja_DepositoCentral_Lote2.xlsx");

console.log("Lote1:", bajas1.length, "Lote2:", bajas2.length, "Altas:", altas.length);
console.log("Archivos generados.");
