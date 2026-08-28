// Site geometry for the featured homes, authored from published architectural
// dimensions and site plans. Emitted in the same shape the OSM pipeline consumes
// (ways with lon/lat geometry + Simple-3D-Buildings tags), so no network call is
// needed and live Overpass data can still override or supplement it.
//
// Local coordinates are metres: +x east, +z south, origin at the marker.

const M_LAT = 1 / 111132;
const mLon = lat => 1 / (111320 * Math.cos(lat * Math.PI / 180));

let nid = 1;
function way(pts, tags, lat, lon) {
  const dlo = mLon(lat);
  const geometry = pts.map(([x, z]) => ({ lon: lon + x * dlo, lat: lat - z * M_LAT }));
  geometry.push(geometry[0]);
  return { type: 'way', id: nid++, tags, geometry };
}
function node(x, z, tags, lat, lon) {
  return { type: 'node', id: nid++, tags, lon: lon + x * mLon(lat), lat: lat - z * M_LAT };
}
function line(pts, tags, lat, lon) {
  const dlo = mLon(lat);
  return { type: 'way', id: nid++, tags, geometry: pts.map(([x, z]) => ({ lon: lon + x * dlo, lat: lat - z * M_LAT })) };
}
const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/* ── 30 · Biltmore, Asheville NC ──────────────────────────────────────────
   Richard Morris Hunt, 1889–95. 780 ft (238 m) façade, 4 acres of floor,
   Indiana limestone, steep Châteauesque slate roofs, 250 rooms.            */
function biltmore(lat, lon) {
  const B = 'building', P = 'building:part';
  return [
    // main block, east façade
    way([[-84, -14], [-30, -14], [-30, -26], [8, -26], [8, -14], [84, -14],
         [84, 16], [30, 16], [30, 34], [-22, 34], [-22, 16], [-84, 16]],
        { [B]: 'yes', height: '34', 'building:levels': '4',
          'roof:shape': 'hipped', 'roof:height': '17', name: 'Biltmore House' }, lat, lon),
    // central entrance pavilion, twin gables over the loggia
    way(rect(-32, -26, 10, 12), { [P]: 'yes', height: '42', 'roof:shape': 'gabled', 'roof:height': '19' }, lat, lon),
    // grand staircase tower
    way([[-14, -30], [-2, -30], [2, -24], [2, -14], [-14, -14]],
        { [P]: 'yes', height: '52', 'roof:shape': 'pyramidal', 'roof:height': '20' }, lat, lon),
    // north wing tower
    way(rect(54, -12, 76, 10), { [P]: 'yes', height: '44', 'roof:shape': 'pyramidal', 'roof:height': '21' }, lat, lon),
    // library wing, south
    way(rect(-84, 16, -52, 40), { [P]: 'yes', height: '26', 'roof:shape': 'hipped', 'roof:height': '13' }, lat, lon),
    // service courtyard range, set back west
    way(rect(-70, -58, 30, -30), { [B]: 'yes', height: '20', 'building:levels': '2', 'roof:shape': 'hipped', 'roof:height': '9' }, lat, lon),
    way(rect(30, -58, 52, -34), { [B]: 'yes', height: '15', 'roof:shape': 'gabled', 'roof:height': '8' }, lat, lon),
    // stable block, further out
    way(rect(-140, -46, -96, -14), { [B]: 'yes', height: '13', 'building:levels': '2', 'roof:shape': 'hipped', 'roof:height': '7' }, lat, lon),
    // esplanade retaining wall + ramble hedges
    line([[-96, 52], [96, 52]], { barrier: 'hedge' }, lat, lon),
    line([[-96, 52], [-96, 96]], { barrier: 'hedge' }, lat, lon),
    line([[96, 52], [96, 96]], { barrier: 'hedge' }, lat, lon),
    // tulip poplars along the approach and around the house
    ...[[-124, 40], [-104, 66], [-72, 88], [-30, 96], [24, 94], [72, 82], [110, 60],
        [126, 20], [124, -30], [96, -76], [40, -92], [-30, -88], [-96, -80], [-136, -50],
        [-150, 8], [-146, 60], [-60, 120], [30, 124], [104, 108]]
      .map(([x, z]) => node(x, z, { natural: 'tree', height: '22' }, lat, lon)),
  ];
}

/* ── 42 · Hearst Castle (Casa Grande), San Simeon CA ──────────────────────
   Julia Morgan, 1919–47. Mediterranean Revival, twin 43 m bell towers
   modelled on Santa María la Mayor at Ronda, 115 rooms.                    */
function hearst(lat, lon) {
  const B = 'building', P = 'building:part';
  return [
    way(rect(-30, -16, 30, 18), { [B]: 'yes', height: '22', 'building:levels': '3', 'roof:shape': 'hipped', 'roof:height': '6', name: 'Casa Grande' }, lat, lon),
    // twin bell towers
    way(rect(-19, -14, -7, -2), { [P]: 'yes', height: '43', 'roof:shape': 'pyramidal', 'roof:height': '5' }, lat, lon),
    way(rect(7, -14, 19, -2), { [P]: 'yes', height: '43', 'roof:shape': 'pyramidal', 'roof:height': '5' }, lat, lon),
    // belfry stages with tiled domes
    way(rect(-17.5, -12.5, -8.5, -3.5), { [P]: 'yes', min_height: '43', height: '50', 'roof:shape': 'dome', 'roof:height': '6' }, lat, lon),
    way(rect(8.5, -12.5, 17.5, -3.5), { [P]: 'yes', min_height: '43', height: '50', 'roof:shape': 'dome', 'roof:height': '6' }, lat, lon),
    // entry vestibule between the towers
    way(rect(-7, -18, 7, -2), { [P]: 'yes', height: '26', 'roof:shape': 'gabled', 'roof:height': '7' }, lat, lon),
    // Casa del Mar / Casa del Sol guest houses, set back so they frame rather than crop
    way(rect(-58, -34, -38, -12), { [B]: 'yes', height: '13', 'building:levels': '2', 'roof:shape': 'hipped', 'roof:height': '5' }, lat, lon),
    way(rect(38, -34, 58, -12), { [B]: 'yes', height: '13', 'building:levels': '2', 'roof:shape': 'hipped', 'roof:height': '5' }, lat, lon),
    line([[-40, -44], [40, -44]], { barrier: 'hedge' }, lat, lon),
    // Italian cypress, the signature planting
    ...[[-40, -26], [-24, -32], [24, -32], [40, -26],
        [-46, -6], [46, -6], [-52, 4], [52, 4],
        [-62, -20], [62, -20], [-34, -44], [34, -44]]
      .map(([x, z]) => node(x, z, { natural: 'tree', height: '14' }, lat, lon)),
  ];
}

/* ── 29 · Marble House, Newport RI ────────────────────────────────────────
   Richard Morris Hunt for Alva Vanderbilt, 1888–92. Beaux-Arts, modelled on
   the Petit Trianon; hexastyle Corinthian portico, 500,000 cu ft of marble. */
function marble(lat, lon) {
  const B = 'building', P = 'building:part';
  return [
    way(rect(-27, -19, 27, 19), { [B]: 'yes', height: '20', 'building:levels': '2', 'roof:shape': 'flat', name: 'Marble House' }, lat, lon),
    // attic storey set back behind the balustrade
    way(rect(-19, -12, 19, 12), { [P]: 'yes', min_height: '20', height: '27', 'roof:shape': 'hipped', 'roof:height': '4' }, lat, lon),
    // portico
    way(rect(-14, 19, 14, 30), { [P]: 'yes', height: '24', 'roof:shape': 'gabled', 'roof:height': '5' }, lat, lon),
    // service wing to the north
    way(rect(-44, -14, -27, 8), { [B]: 'yes', height: '13', 'building:levels': '2', 'roof:shape': 'hipped', 'roof:height': '5' }, lat, lon),
    // Chinese Tea House on the cliff
    way(rect(-12, 74, 12, 90), { [B]: 'yes', height: '9', 'roof:shape': 'hipped', 'roof:height': '6' }, lat, lon),
    // gates and hedging along Bellevue Avenue
    line([[-56, -34], [56, -34]], { barrier: 'hedge' }, lat, lon),
    line([[-56, 56], [56, 56]], { barrier: 'hedge' }, lat, lon),
    ...[[-46, -22], [-46, 4], [-46, 30], [46, -22], [46, 4], [46, 30],
        [-30, -30], [0, -32], [30, -30], [-34, 48], [34, 48],
        [-64, -10], [64, -10], [-64, 26], [64, 26], [-20, 64], [20, 64]]
      .map(([x, z]) => node(x, z, { natural: 'tree', height: '15' }, lat, lon)),
  ];
}

/* ── 33 · Rogarshevsky Home, 97 Orchard Street, New York NY ───────────────
   Built 1863. Five-storey brick tenement, 25 ft (7.6 m) wide by 87 ft
   (26.5 m) deep, twenty apartments, in a continuous Lower East Side row.   */
function tenement(lat, lon) {
  const B = 'building';
  const els = [];
  // the row: the subject house plus its neighbours, all party-wall
  const widths = [8.2, 7.6, 7.6, 8.4, 7.6, 8.0, 7.6];
  const heights = [17, 16, 20, 16.5, 17.5, 16, 19];
  const levels = [5, 5, 6, 5, 5, 5, 6];
  let x = -widths.reduce((a, b) => a + b, 0) / 2;
  widths.forEach((w, i) => {
    els.push(way(rect(x, -13.2, x + w - 0.15, 13.2),
      { [B]: i === 3 ? 'apartments' : 'yes', height: String(heights[i]),
        'building:levels': String(levels[i]), 'roof:shape': 'flat',
        ...(i === 3 ? { name: 'Rogarshevsky Home' } : {}) }, lat, lon));
    x += w;
  });
  // the row opposite, across Orchard Street
  let x2 = -30;
  for (let i = 0; i < 5; i++) {
    els.push(way(rect(x2, 32, x2 + 7.4, 56), { [B]: 'yes', height: String(15 + (i % 3) * 2), 'building:levels': '5', 'roof:shape': 'flat' }, lat, lon));
    x2 += 7.8;
  }
  // rear yards and the taller corner building
  els.push(way(rect(-34, -34, -14, -16), { [B]: 'yes', height: '24', 'building:levels': '7', 'roof:shape': 'flat' }, lat, lon));
  els.push(way(rect(16, -32, 38, -15), { [B]: 'yes', height: '13', 'building:levels': '4', 'roof:shape': 'flat' }, lat, lon));
  // street trees in pits
  [[-24, 22], [-8, 22], [8, 22], [24, 22]].forEach(([tx, tz]) =>
    els.push(node(tx, tz, { natural: 'tree', height: '8' }, lat, lon)));
  return els;
}

const BUILDERS = { 30: biltmore, 42: hearst, 29: marble, 33: tenement };

// Rectified photographic elevations, mapped onto the front wall of the hero mass.
// wM/hM are the real dimensions the image spans; cz is the wall's local z in metres.
export const FACADES = {
  42: { img: 'facades/hearst-casa-grande.png', wM: 60, hM: 43, cx: 0, cz: 18, rotY: 0 },
};

export function localSite(ref, lat, lon) {
  const f = BUILDERS[ref];
  nid = 1;
  return f ? f(lat, lon) : null;
}
export const LOCAL_REFS = new Set(Object.keys(BUILDERS).map(Number));
