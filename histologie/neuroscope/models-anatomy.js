/** NeuroScope — volumes procéduraux originaux, schémas pédagogiques non métriques.
 * Aucun modèle tiers ni figure du cours n'est reproduit. Coordonnées : Y crânial,
 * Z antérieur. Les détails de trajet, les sillons et les proportions sont schématiques.
 */
import * as THREE from './assets/vendor/three.module.js';

const P = {
  central: 0x367bd6, cortex: 0x477cbd, white: 0xd6e9f5, gray: 0x767dae,
  peripheral: 0x55dbe6, ganglion: 0x8b90e9, bone: 0xd9e3e9,
  skin: 0x88aabd, muscle: 0x496b91, fluid: 0x70d9fa,
  dura: 0x8ba5c7, arachnoid: 0xa5bde8, pia: 0x679cb1,
  glia: 0xa38ce1, artery: 0xd77d91, vein: 0x6075be,
};
const V = p => new THREE.Vector3(...p);
const material = (color, opacity = 1, extra = {}) => new THREE.MeshStandardMaterial({
  color, roughness: .54, metalness: .06, transparent: opacity < 1, opacity,
  side: THREE.DoubleSide, depthWrite: opacity >= .38, ...extra,
});
function group(parent, name, layer) {
  const g = new THREE.Group(); g.name = name;
  if (layer) g.userData.layer = layer;
  if (parent) parent.add(g);
  return g;
}
function mark(mesh, id, label) {
  mesh.userData.structure = id;
  if (label) mesh.userData.label = label;
  return mesh;
}
function ell(parent, id, pos, scale, color, opacity = 1, label, detail = 22) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, detail, Math.max(10, Math.floor(detail * .68))), material(color, opacity));
  m.position.set(...pos); m.scale.set(...scale); mark(m, id, label); parent.add(m); return m;
}
function tube(parent, id, pts, radius, color, opacity = 1, label, segments = 36) {
  const c = new THREE.CatmullRomCurve3(pts.map(V));
  const m = new THREE.Mesh(new THREE.TubeGeometry(c, segments, radius, 7, false), material(color, opacity));
  mark(m, id, label); parent.add(m); return m;
}
function bone(parent, id, a, b, radius, color = P.bone, opacity = .8, label) {
  const av = V(a), bv = V(b), d = bv.clone().sub(av);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * .88, d.length(), 10), material(color, opacity));
  m.position.copy(av.add(bv).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  mark(m, id, label); parent.add(m); return m;
}
function torus(parent, id, pos, radius, thickness, color, rotation = [0, 0, 0], opacity = 1, label) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 7, 34), material(color, opacity));
  m.position.set(...pos); m.rotation.set(...rotation); mark(m, id, label); parent.add(m); return m;
}
function result(root, id, cameraDistance, scaleNote, options = {}) {
  root.userData.viewId = id;
  return { root, cameraDistance, scaleNote, ...options };
}
function foldedSphere(parent, id, pos, scale, color, opacity = .92, label, seed = 0) {
  const geo = new THREE.SphereGeometry(1, 54, 32);
  const attr = geo.attributes.position;
  for (let i = 0; i < attr.count; i++) {
    const x = attr.getX(i), y = attr.getY(i), z = attr.getZ(i);
    const u = Math.atan2(z, x), v = Math.acos(Math.max(-1, Math.min(1, y)));
    const fold = .026 * Math.sin(19 * v + 2 * Math.sin(5 * u + seed))
      + .019 * Math.sin(18 * u + 3 * Math.sin(4 * v + seed));
    const r = 1 + fold * Math.sin(v);
    attr.setXYZ(i, x * r, y * r, z * r);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material(color, opacity));
  mesh.position.set(...pos); mesh.scale.set(...scale); mark(mesh, id, label); parent.add(mesh); return mesh;
}
function brainParts(parent, { scale = 1, offset = [0, 0, 0], opacity = 1, layers = true } = {}) {
  const g = group(parent, 'Encéphale', layers ? 'nervous' : null);
  g.scale.setScalar(scale); g.position.set(...offset);
  const outer = group(g, 'Cortex cérébral', 'cortex');
  foldedSphere(outer, 'cortex', [-.79, .5, .18], [.83, 1.1, 1.48], P.cortex, opacity * .96, 'Cortex — hémisphères', .3);
  foldedSphere(outer, 'cortex', [.79, .5, .18], [.83, 1.1, 1.48], P.central, opacity * .96, null, 1.2);
  // Sillons originaux schématiques : reliefs de surface, sans attribution lobaire.
  for (const side of [-1, 1]) for (let band = 0; band < 10; band++) {
    const pts = [];
    for (let j = 0; j <= 46; j++) {
      const a = j / 46 * Math.PI * 2;
      const phi = .37 + band * .255 + .105 * Math.sin(a * 3 + band * .83);
      const r = 1.006 + .016 * Math.sin(a * 4 + band);
      pts.push([side * .79 + .83 * r * Math.sin(phi) * Math.cos(a), .5 + 1.1 * r * Math.cos(phi), .18 + 1.48 * r * Math.sin(phi) * Math.sin(a)]);
    }
    tube(outer, 'cortex', pts, .022, 0x294f82, opacity * .82, null, 56);
  }
  const white = group(g, 'Substance blanche sous-corticale', 'white-matter');
  ell(white, 'white-matter', [-.77, .49, .14], [.65, .88, 1.21], P.white, opacity, 'Substance blanche');
  ell(white, 'white-matter', [.77, .49, .14], [.65, .88, 1.21], P.white, opacity);
  const deep = group(g, 'Structures profondes', 'deep');
  for (const s of [-1, 1]) {
    ell(deep, 'basal-nuclei', [s * .48, .16, .32], [.23, .44, .48], P.gray, opacity, s === 1 ? 'Noyaux gris centraux' : null);
    tube(deep, 'basal-nuclei', [[s * .36, .63, .7], [s * .62, .72, .2], [s * .64, .45, -.38], [s * .48, .12, -.58]], .105, 0x867ac2, opacity);
  }
  // Le corps calleux est une commissure ; l'arche médiane n'est pas un noyau.
  tube(deep, 'corpus-callosum', [[0, .44, -.94], [0, .78, -.67], [0, .88, .0], [0, .77, .7], [0, .48, .98]], .16, P.white, opacity, 'Corps calleux');
  for (let k = -3; k <= 3; k++) tube(deep, 'corpus-callosum', [[-.53, .56, k * .23], [0, .8, k * .23], [.53, .56, k * .23]], .033, P.white, opacity, null, 14);
  const hind = group(g, 'Tronc cérébral et cervelet', 'hindbrain');
  brainstemParts(hind, opacity);
  cerebellumParts(hind, opacity);
  return g;
}
function brainstemParts(parent, opacity = 1) {
  ell(parent, 'brainstem', [0, -.6, .02], [.32, .65, .4], P.central, opacity, 'Tronc cérébral');
  ell(parent, 'brainstem', [0, -1.08, .16], [.42, .34, .38], 0x477ab8, opacity);
  ell(parent, 'brainstem', [0, -1.55, -.08], [.23, .56, .27], 0x5089c3, opacity);
  tube(parent, 'spinal-cord', [[0, -1.8, -.12], [0, -2.25, -.15], [0, -2.6, -.12]], .15, P.central, opacity);
}
function cerebellumParts(parent, opacity = 1) {
  for (const s of [-1, 1]) {
    foldedSphere(parent, 'cerebellum', [s * .59, -.8, -.96], [.67, .56, .71], 0x5c8dca, opacity, s === -1 ? 'Cervelet' : null, s * 2);
    for (let i = -4; i <= 4; i++) {
      const y = -.8 + i * .088;
      const f = Math.sqrt(Math.max(.05, 1 - (i / 5) ** 2));
      tube(parent, 'cerebellum', [[s * .18, y, -1.0], [s * .6, y + .025, -1.0 - .64 * f], [s * 1.12, y, -.95]], .022, 0x9abfe4, opacity, null, 18);
    }
  }
  ell(parent, 'cerebellum', [0, -.77, -1.0], [.19, .48, .62], 0x6387c1, opacity);
}
function torsoVolume(parent, color, opacity) {
  const rings = [[-.8,.86,.48],[-.4,1.07,.6],[.2,1.07,.59],[.95,.94,.5],[1.7,.96,.53],[2.5,1.14,.64],[3.25,1.3,.62],[3.85,1.34,.51],[4.08,1.14,.41],[4.2,.42,.31]];
  const n=40, positions=[], indices=[];
  for(const [y,rx,rz] of rings) for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;positions.push(Math.cos(a)*rx,y,Math.sin(a)*rz);}
  for(let r=0;r<rings.length-1;r++)for(let i=0;i<n;i++){const a=r*(n+1)+i,b=a+1,c=a+n+1;indices.push(a,b,c,b,c+1,c);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,material(color,opacity));mark(m,'body');parent.add(m);
}
function bodyModel(id) {
  const root = group(null, 'Corps humain adulte');
  const skin = group(root, 'Peau — silhouette adulte', 'skin');
  torsoVolume(skin, P.skin, .12);
  ell(skin, 'head', [0, 5.7, -.02], [.72, .99, .67], P.skin, .16, 'Tête');
  ell(skin, 'head', [0, 5.45, .47], [.42, .53, .32], P.skin, .14);
  ell(skin, 'head', [0, 4.55, 0], [.4, .58, .36], P.skin, .13);
  ell(skin, 'head', [0, 5.54, .73], [.12, .19, .15], P.skin, .23);
  const muscles = group(root, 'Volumes musculaires repères', 'muscles');
  for (const side of [-1,1]) {
    ell(muscles, 'body', [side*.58,3.2,.44],[.62,.42,.16],P.muscle,.1);
    for(let row=0;row<3;row++) ell(muscles,'body',[side*.27,2.55-row*.48,.48],[.24,.21,.09],P.muscle,.09);
  }
  const bones = group(root, 'Squelette de repérage', 'bones');
  const nervous = group(root, 'Système nerveux', 'nervous');
  for (const s of [-1, 1]) {
    const arm = [[s * 1.25, 3.85, 0], [s * 1.91, 2.13, .02], [s * 2.27, .48, .04]];
    const leg = [[s * .61, -.6, 0], [s * .69, -3.1, .13], [s * .65, -5.77, .04]];
    for (let i = 0; i < 2; i++) {
      bone(skin, 'upper-limb', arm[i], arm[i + 1], i ? .25 : .34, P.skin, .13);
      bone(muscles, 'upper-limb', arm[i], arm[i + 1], i ? .19 : .26, P.muscle, .16);
      bone(skin, 'lower-limb', leg[i], leg[i + 1], i ? .31 : .48, P.skin, .13);
      bone(muscles, 'lower-limb', leg[i], leg[i + 1], i ? .22 : .37, P.muscle, .16);
    }
    ell(skin, 'upper-limb', [s * 2.31, .03, .08], [.25, .44, .11], P.skin, .18, s === 1 ? 'Membre supérieur' : null);
    for (let f = 0; f < 4; f++) bone(skin, 'upper-limb', [s * (2.13 + .11 * f), -.22, .07], [s * (2.13 + .12 * f), -.72 + .06 * Math.abs(f - 1), .09], .045, P.skin, .19);
    bone(skin, 'upper-limb', [s * 2.08, .12, .08], [s * 1.96, -.18, .2], .067, P.skin, .2);
    ell(skin, 'lower-limb', [s * .66, -6.04, .35], [.32, .24, .7], P.skin, .16, s === -1 ? 'Membre inférieur' : null);
    bone(bones, 'upper-limb', arm[0], arm[1], .093);
    bone(bones, 'upper-limb', [s * 1.87, 2.07, -.06], [s * 2.21, .45, -.03], .055);
    bone(bones, 'upper-limb', [s * 2.01, 2.07, .07], [s * 2.36, .46, .09], .055);
    bone(bones, 'lower-limb', leg[0], leg[1], .13);
    bone(bones, 'lower-limb', [s * .65, -3.15, .13], [s * .62, -5.8, .03], .105);
    bone(bones, 'lower-limb', [s * .86, -3.25, .13], [s * .84, -5.74, .04], .05);
    ell(bones, 'lower-limb', [s * .7, -3.09, .34], [.18, .24, .08], P.bone, .68);
    ell(bones, 'body', [s * .66, -.22, -.07], [.62, .67, .32], P.bone, .3);
    bone(bones, 'body', [0, 3.96, .18], [s * 1.26, 3.85, .01], .08);
    for (let r = 0; r < 9; r++) {
      const y = 3.68 - .22 * r, width = .75 + .39 * Math.sin((r + 1) / 11 * Math.PI);
      tube(bones, 'body', [[s * .18, y, -.3], [s * width, y - .05, -.05], [s * width * .76, y - .11, .45], [s * .18, y - .13, .53]], .026, P.bone, .45, null, 16);
    }
    // Trajets tronculaires schématiques : trois grandes branches du membre supérieur.
    const shoulder = [s * .46, 3.78, -.08];
    for (let n = 0; n < 3; n++) {
      tube(nervous, 'nerve', [shoulder, [s * 1.28, 3.65 - .1 * n, .12], [s * (1.84 + n * .06), 2.12, .22], [s * (2.12 + n * .1), .5, .24], [s * (2.14 + n * .12), -.37, .2]], .025, P.peripheral, 1, s === 1 && n === 1 ? 'Nerfs périphériques — trajets schématiques' : null);
    }
    for (let n = 0; n < 4; n++) {
      tube(nervous, 'nerve', [[s * .18, .4 + .2 * n, -.27], [s * .47, -.35, -.17], [s * (.56 + n * .05), -1.2, n % 2 ? -.15 : .3], [s * (.61 + n * .05), -3.1, .23], [s * (.58 + n * .05), -5.76, .18], [s * (.58 + n * .05), -6.07, .6]], .025, P.peripheral, 1);
    }
    const plex = group(nervous, 'Plexus nerveux schématiques');
    for (let r = 0; r < 5; r++) {
      tube(plex, 'upper-limb', [[s * .16, 4.01 - r * .16, -.18], [s * .55, 3.75 - r * .08, .0], [s * 1.15, 3.63 - r * .04, .16]], .025, P.peripheral, 1, r === 2 && s === -1 ? 'Plexus brachial — schématique' : null, 18);
    }
    for (let r = 0; r < 15; r++) {
      const y = 3.98 - r * .27;
      tube(nervous, 'dorsal-root', [[0, y, -.25], [s * .23, y - .04, -.32], [s * .38, y - .06, -.21]], .018, P.peripheral, 1);
      ell(nervous, 'sensory-ganglion', [s * .3, y - .03, -.25], [.067, .045, .05], P.ganglion, 1, r === 6 && s === 1 ? 'Ganglions sensitifs' : null, 12);
      ell(nervous, 'autonomic-ganglion', [s * .46, y - .06, .0], [.044, .067, .04], 0xb5a2e3, 1, r === 8 && s === -1 ? 'Chaîne sympathique — schématique' : null, 10);
      if (r < 14) tube(nervous, 'autonomic-ganglion', [[s * .46, y, .0], [s * .46, y - .3, .0]], .012, P.ganglion, 1, null, 6);
      if (r > 3 && r < 12) tube(nervous, 'nerve', [[s * .35, y, -.12], [s * .82, y - .05, .12], [s * 1.0, y - .12, .38]], .013, P.peripheral, 1, null, 16);
    }
  }
  for (let i = 0; i < 24; i++) {
    const y = 4.24 - i * .185;
    ell(bones, 'spine', [0, y, -.22], [.22 + i * .001, .085, .22], P.bone, .45, i === 12 ? 'Rachis — repères osseux' : null, 12);
  }
  ell(bones, 'skull', [0, 5.83, -.09], [.67, .81, .61], P.bone, .14);
  brainParts(nervous, { scale: .38, offset: [0, 5.83, -.05], layers: false });
  tube(nervous, 'spinal-cord', [[0, 4.95, -.17], [0, 3.7, -.25], [0, 2.0, -.34], [0, .65, -.28]], .105, P.central, 1, 'Moelle spinale — fin lombaire schématique');
  for (let i = -3; i <= 3; i++) tube(nervous, 'spine', [[0, .8, -.3], [i * .036, -.05, -.33], [i * .1, -.72, -.2]], .012, P.peripheral, 1, i === 0 ? 'Racines de la queue de cheval — schéma' : null, 16);
  // Paroi digestive et réseau entérique volontairement simplifiés pour la vue corps.
  const gut = group(nervous, 'Tube digestif et réseau entérique');
  const gutPoints = [[-.53, 1.4, .22], [.47, 1.4, .24], [.55, 1.02, .24], [-.49, 1.0, .25], [-.48, .67, .26], [.45, .65, .26], [.48, .25, .25], [-.4, .22, .25]];
  tube(gut, 'digestive', gutPoints, .15, 0x7996a7, .3, 'Tube digestif — région entérique');
  tube(gut, 'enteric', gutPoints.map(p => [p[0], p[1], p[2] + .14]), .021, 0xaa98ed, 1);
  tube(nervous, 'digestive', [[-.17, 4.9, .02], [-.35, 3.8, .09], [-.31, 2.5, .17], [-.26, 1.5, .25]], .019, P.ganglion, 1, 'Voie autonome viscérale — schéma');
  const settings = {
    body: [19, [0, .1, 0]], head: [4.5, [0, 5.72, 0]], spine: [8, [0, 2.7, -.18]],
    'upper-limb': [7.2, [1.5, 2, 0]], 'lower-limb': [8.2, [.5, -3.25, .0]], digestive: [4.6, [0, .9, .17]],
  };
  const [distance, target] = settings[id] || settings.body;
  return result(root, id, distance, 'Corps adulte et trajets nerveux schématiques ; aucun inventaire exhaustif des nerfs. La moelle se termine avant le sacrum ; les racines inférieures poursuivent leur trajet.', { target: V(target), info: 'Peau, muscles et squelette sont des volumes de repérage simplifiés, non un atlas anatomique métrique.' });
}
function brainModel(id) {
  const root = group(null, 'Encéphale et structures profondes'); brainParts(root);
  let target = [0, -.05, 0], distance = 6.7;
  if (id === 'cerebellum') { target = [0, -.8, -.9]; distance = 3.8; }
  if (id === 'brainstem') { target = [0, -1.1, -.05]; distance = 3.7; }
  if (id === 'corpus-callosum' || id === 'basal-nuclei') {
    root.traverse(n => { if (n.isMesh && ['cortex', 'brain'].includes(n.userData.structure)) { n.material.opacity = .16; n.material.depthWrite = false; } });
    distance = 5.1;
  }
  return result(root, id, distance, 'Encéphale schématique : sillons, noyaux et commissures en volumes originaux simplifiés ; ils ne représentent pas une reconstruction d’IRM.', { target: V(target), info: 'La transparence révèle la substance blanche et les structures profondes. Une coupe 3D ouvre les surfaces ; ce rendu ne simule pas une image radiologique.' });
}
function grayButterfly() {
  const s = new THREE.Shape();
  s.moveTo(0, -.18);
  s.bezierCurveTo(-.13, -.13, -.23, -.48, -.36, -.73);
  s.bezierCurveTo(-.4, -.85, -.49, -.78, -.47, -.63);
  s.bezierCurveTo(-.43, -.34, -.32, -.1, -.33, .12);
  s.bezierCurveTo(-.43, .26, -.71, .47, -.63, .67);
  s.bezierCurveTo(-.54, .88, -.3, .72, -.18, .45);
  s.bezierCurveTo(-.1, .29, .1, .29, .18, .45);
  s.bezierCurveTo(.3, .72, .54, .88, .63, .67);
  s.bezierCurveTo(.71, .47, .43, .26, .33, .12);
  s.bezierCurveTo(.32, -.1, .43, -.34, .47, -.63);
  s.bezierCurveTo(.49, -.78, .4, -.85, .36, -.73);
  s.bezierCurveTo(.23, -.48, .13, -.13, 0, -.18);
  return s;
}
function spinalModel(id) {
  const root = group(null, 'Moelle spinale — volume et organisation transversale');
  const white = group(root, 'Substance blanche médullaire', 'white-matter');
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(1.07, 1.07, 5.4, 60, 1, false), material(P.white, .3));
  mark(outer, 'white-matter', 'Substance blanche périphérique'); white.add(outer);
  const shape = new THREE.ExtrudeGeometry(grayButterfly(), { depth: 5.42, bevelEnabled: false, curveSegments: 18 });
  shape.rotateX(Math.PI / 2); shape.translate(0, 2.71, 0);
  const sg = new THREE.Mesh(shape, material(P.gray, .96)); mark(sg, 'gray-matter', 'Substance grise centrale — papillon'); root.add(sg);
  tube(root, 'central-canal', [[0, -2.73, .12], [0, 0, .12], [0, 2.73, .12]], .046, P.fluid, 1, 'Canal central');
  // Disposition des cordons : axones longitudinaux, non trois cavités distinctes.
  for (let k = 0; k < 18; k++) {
    const a = k / 18 * Math.PI * 2, x = .89 * Math.cos(a), z = .89 * Math.sin(a);
    tube(white, 'white-matter', [[x, -2.65, z], [x * .98, 0, z * .98], [x, 2.65, z]], .022, 0xa2c5e4, .78, k === 13 ? 'Cordons postérieurs / latéraux / antérieurs' : null, 12);
  }
  for (const side of [-1, 1]) {
    // Postérieur Z négatif : cornes dorsales effilées ; antérieur positif : larges cornes ventrales.
    ell(root, 'gray-matter', [side * .4, 2.73, -.66], [.1, .034, .19], 0xaca6d4, 1, side === 1 ? 'Cornes dorsales — postérieures' : null);
    ell(root, 'gray-matter', [side * .48, 2.73, .56], [.18, .034, .2], 0xb5acd7, 1, side === -1 ? 'Cornes ventrales — antérieures' : null);
    for (let r = -1; r <= 1; r++) {
      const y = r * 1.5;
      tube(root, 'dorsal-root', [[side * .7, y, -.65], [side * 1.25, y + .08, -.67], [side * 1.77, y, -.37], [side * 2.12, y, .02]], .055, P.peripheral, 1, r === 0 && side === 1 ? 'Racine dorsale' : null);
      ell(root, 'sensory-ganglion', [side * 1.56, y + .03, -.5], [.24, .13, .13], P.ganglion, 1, r === 0 && side === -1 ? 'Ganglion spinal sensitif' : null);
      tube(root, 'ventral-root', [[side * .74, y, .62], [side * 1.27, y - .06, .61], [side * 1.75, y, .28], [side * 2.12, y, .02]], .055, 0x7cc6e9, 1, r === 0 && side === 1 ? 'Racine ventrale' : null);
      tube(root, 'nerve', [[side * 2.1, y, .02], [side * 2.6, y, .03]], .076, P.peripheral, 1, r === 0 && side === -1 ? 'Nerf spinal mixte' : null, 10);
    }
  }
  tube(root, 'spinal-cord', [[0, 2.75, 1.06], [0, 2.72, .83], [0, 2.71, .66]], .025, 0x60789b, 1, 'Fissure médiane antérieure', 8);
  return result(root, id, 9.2, 'Segment médullaire schématique, axe vertical ; face antérieure Z positif. La coupe supérieure expose le papillon de substance grise. Dimensions et niveau non métriques.', { target: V([0, .4, 0]), cameraDirection: [.25,.65,1] });
}
// Solide courbe (plaque à épaisseur réelle), pas un plan sans volume.
function curvedPlate(parent, id, width, depth, y, thickness, color, opacity, label, wavy = 0) {
  const n = 20, positions = [], indices = [];
  for (let side = 0; side < 2; side++) {
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const x = (i / n - .5) * width, z = (j / n - .5) * depth;
      const curve = .26 * (1 - (x / (width * .57)) ** 2) + .17 * (1 - (z / (depth * .57)) ** 2);
      const folds = wavy * Math.sin(3.8 * x + .35 * Math.sin(2.7 * z)) * Math.cos(2.1 * z);
      positions.push(x, y + curve + folds - side * thickness, z);
    }
  }
  const count = (n + 1) ** 2;
  for (let side = 0; side < 2; side++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = side * count + j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1;
    if (side === 0) indices.push(a, c, b, b, c, d); else indices.push(a, b, c, b, d, c);
  }
  const stitch = (a, b) => indices.push(a, b, a + count, b, b + count, a + count);
  for (let i = 0; i < n; i++) { stitch(i, i + 1); stitch(n * (n + 1) + i + 1, n * (n + 1) + i); }
  for (let j = 0; j < n; j++) { stitch((j + 1) * (n + 1), j * (n + 1)); stitch(j * (n + 1) + n, (j + 1) * (n + 1) + n); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setIndex(indices); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material(color, opacity)); mark(mesh, id, label); parent.add(mesh); return mesh;
}
function meningesModel(id) {
  const root = group(null, 'De la voûte crânienne au cortex');
  const order = ['scalp', 'periosteum', 'skull', 'dura', 'arachnoid', 'subarachnoid', 'pia', 'glia-limitans', 'cortex'];
  const specs = [
    ['scalp', 1.58, .3, 0x789eb6, .7, 'Cuir chevelu'],
    ['periosteum', 1.28, .055, 0xb1bdd0, .8, 'Périoste externe'],
    ['skull', 1.225, .4, P.bone, .85, 'Os de la voûte crânienne'],
    ['dura', .825, .16, P.dura, .86, 'Dure-mère crânienne — deux feuillets'],
    ['arachnoid', .665, .045, P.arachnoid, .65, 'Arachnoïde — barrière superficielle'],
    ['subarachnoid', .62, .62, P.fluid, .14, 'Espace sous-arachnoïdien — LCS'],
    ['pia', 0, .045, P.pia, .8, 'Pie-mère — suit les reliefs'],
    ['glia-limitans', -.045, .045, P.glia, .78, 'Glie limitante'],
    ['cortex', -.09, .58, P.cortex, .96, 'Cortex cérébral'],
  ];
  const groups = {};
  for (let i = 0; i < specs.length; i++) {
    const [key, y, t, color, op, label] = specs[i];
    const g = group(root, label, key); groups[key] = g;
    g.userData.explodeOffset = [0, (specs.length - i - 1) * .36, 0];
    curvedPlate(g, key, 6.4, 4.7, y, t, color, op, label, ['pia', 'glia-limitans', 'cortex'].includes(key) ? .075 : 0);
  }
  // Feuillets périosté et méningé de la dure-mère, accolés hors sinus.
  curvedPlate(groups.dura, 'dura', 6.4, 4.7, .745, .018, 0xb6c5dc, .96, 'Feuillet périosté / feuillet méningé');
  // Diploë : réseau trabéculaire original visible aux bords de coupe.
  for (let i = 0; i < 18; i++) {
    const x = -3 + i * .35;
    bone(groups.skull, 'skull', [x, 1.03, 2.34], [x + .16, 1.14, 2.34], .025, 0xadb9c7, .8);
    bone(groups.skull, 'skull', [x + .16, 1.14, 2.34], [x + .3, .96, 2.34], .022, 0xadb9c7, .8);
  }
  // Sinus : placé dans une duplication des feuillets duraux, pas dans le LCS.
  tube(groups.dura, 'dural-sinus', [[0, 1.04, -2.2], [0, 1.2, 0], [0, 1.04, 2.2]], .17, P.vein, .9, 'Sinus sagittal supérieur — entre feuillets');
  for (const s of [-1, 1]) tube(groups.dura, 'dura', [[s * .22, .87, -2.2], [s * .22, 1.1, 0], [s * .22, .87, 2.2]], .035, P.dura, 1);
  const falxGeo = new THREE.BoxGeometry(.055, 1.32, 3.8);
  const falx = new THREE.Mesh(falxGeo, material(P.dura, .64)); falx.position.set(0, .58, -.1); mark(falx, 'falx', 'Faux du cerveau — repli dural'); groups.dura.add(falx);
  const tent = curvedPlate(groups.dura, 'tentorium', 2.4, 1.25, .03, .055, P.dura, .7, 'Tente du cervelet — repli dural schématique'); tent.position.set(0, -.55, -1.35); tent.rotation.x = -.24;
  // Trabécules arachnoïdiennes, tissus et vaisseaux traversants dans le LCS.
  for (let i = 0; i < 22; i++) {
    const x = -2.85 + i % 11 * .56, z = i < 11 ? -.88 : 1.15;
    bone(groups.subarachnoid, 'subarachnoid', [x, .8, z], [x + .12 * Math.sin(i), .34, z + .1], .012, 0xadcbd8, .7);
  }
  for (const s of [-1, 1]) {
    const pts = [[s * .4, .47, -2.1], [s * .9, .58, -.8], [s * 1.65, .48, .35], [s * 2.65, .35, 1.25]];
    tube(groups.subarachnoid, 'subarachnoid', pts, .055, P.artery, 1, s === 1 ? 'Vaisseaux dans l’espace sous-arachnoïdien' : null);
    tube(groups.subarachnoid, 'subarachnoid', pts.map(p => [p[0] + s * .18, p[1] + .07, p[2]]), .045, P.vein, 1);
    tube(groups.dura, 'dura', [[s * 2.8, 1.1, -1.8], [s * 2.4, 1.12, 0], [s * 1.4, 1.16, 1.8]], .028, P.artery, .9, s === -1 ? 'Vaisseaux méningés — repère' : null);
    tube(groups.subarachnoid, 'dural-sinus', [[s * 2.1, .49, .5], [s * 1.1, .72, .68], [0, 1.08, .7]], .035, P.vein, .9, s === -1 ? 'Veine de pont — schématique' : null);
  }
  // Granulations sont des compléments explicités dans le panneau, sans reproduction.
  for (let i = -2; i <= 2; i++) ell(groups.arachnoid, 'granulations', [.04, 1.03, i * .64], [.13, .19, .13], 0xc7d9ed, .95, i === 0 ? 'Granulations arachnoïdiennes — complément' : null, 14);
  return result(root, id, 10, 'Coupe volumique schématique, épaisseurs exagérées. Les feuillets sont accolés avant l’écartement pédagogique ; aucun espace sous-dural normal n’est créé.', {
    target: V([0, .7, 0]), cameraDirection: [.3,.35,1], layerOrder: order,
    info: 'L’écartement des couches est artificiel. Les replis duraux et les vaisseaux servent à situer les rapports ; le LCS occupe l’espace sous-arachnoïdien. Le périoste externe est distinct du feuillet périosté dural.',
  });
}
function annularVolume(parent,id,inner,outer,height,color,opacity,label,start=2.35,end=Math.PI*2+.8) {
  const shape=new THREE.Shape();shape.moveTo(outer*Math.cos(start),outer*Math.sin(start));
  shape.absarc(0,0,outer,start,end,false);shape.lineTo(inner*Math.cos(end),inner*Math.sin(end));
  shape.absarc(0,0,inner,end,start,true);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:36});geo.rotateX(Math.PI/2);geo.translate(0,height/2,0);
  const mesh=new THREE.Mesh(geo,material(color,opacity));mark(mesh,id,label);parent.add(mesh);return mesh;
}
function spinalMeningesModel(id) {
  const root=group(null,'Enveloppes de la moelle et espace épidural spinal');
  const bones=group(root,'Canal vertébral','bones');
  annularVolume(bones,'spine',1.94,2.28,4.5,P.bone,.45,'Paroi osseuse du canal vertébral');
  for(const y of [-1.65,0,1.65]) {
    ell(bones,'spine',[0,y,2.5],[1.32,.57,.63],P.bone,.45,y===0?'Corps vertébral — antérieur':null);
    bone(bones,'spine',[-1.95,y,.14],[-1.12,y,2.14],.18,P.bone,.55);
    bone(bones,'spine',[1.95,y,.14],[1.12,y,2.14],.18,P.bone,.55);
    bone(bones,'spine',[0,y,-2.12],[0,y,-3.05],.17,P.bone,.55);
  }
  const epidural=group(root,'Espace épidural spinal — réel','spinal-epidural');
  annularVolume(epidural,'spinal-meninges',1.52,1.94,4.6,0x92a4b4,.1,'Espace épidural spinal réel');
  for(let k=0;k<28;k++) {
    const a=2.48+(k%7)/6*4.4,y=-1.7+Math.floor(k/7)*1.12,r=1.75;
    ell(epidural,'spinal-meninges',[Math.cos(a)*r,y,Math.sin(a)*r],[.17,.2,.16],0xe5d3aa,.7,k===8?'Graisse épidurale':null,12);
  }
  for(const side of [-1,1]) tube(epidural,'spinal-meninges',[[side*1.2,-2.25,-1.22],[side*1.3,-.8,-1.18],[side*1.2,.8,-1.22],[side*1.3,2.25,-1.15]],.07,P.vein,.95,side===1?'Plexus veineux épidural — schéma':null);
  const dura=group(root,'Dure-mère spinale','dura');
  annularVolume(dura,'dura',1.43,1.52,4.7,P.dura,.8,'Dure-mère spinale — un feuillet méningé');
  const arach=group(root,'Arachnoïde spinale','arachnoid');
  annularVolume(arach,'arachnoid',1.39,1.43,4.72,P.arachnoid,.6,'Arachnoïde accolée à la dure-mère');
  const sas=group(root,'LCS autour de la moelle','subarachnoid');
  annularVolume(sas,'subarachnoid',1.01,1.39,4.74,P.fluid,.16,'Espace sous-arachnoïdien spinal — LCS');
  for(let k=0;k<14;k++) {
    const a=2.6+k/13*4.1;bone(sas,'subarachnoid',[Math.cos(a)*1.37,.8,Math.sin(a)*1.37],[Math.cos(a+.03)*1.04,.66,Math.sin(a+.03)*1.04],.011,0xadcbd8,.7);
  }
  const pia=group(root,'Pie-mère spinale','pia');
  annularVolume(pia,'pia',.97,1.01,4.77,P.pia,.78,'Pie-mère au contact de la moelle');
  const cord=group(root,'Moelle spinale','nervous');
  const white=new THREE.Mesh(new THREE.CylinderGeometry(.96,.96,4.8,48),material(P.white,.36));mark(white,'spinal-cord','Moelle spinale');cord.add(white);
  const geo=new THREE.ExtrudeGeometry(grayButterfly(),{depth:4.82,bevelEnabled:false,curveSegments:14});geo.scale(.78,.78,1);geo.rotateX(Math.PI/2);geo.translate(0,2.41,0);
  const gray=new THREE.Mesh(geo,material(P.gray,.97));mark(gray,'gray-matter','Substance grise médullaire');cord.add(gray);
  tube(cord,'central-canal',[[0,-2.42,.1],[0,2.42,.1]],.035,P.fluid,1,null,10);
  for(const side of [-1,1]) {
    tube(root,'dorsal-root',[[side*.66,.3,-.45],[side*1.06,.28,-.65],[side*1.73,.25,-.62],[side*2.6,.17,-.2]],.06,P.peripheral,1,side===1?'Racine dorsale traversant les enveloppes':null);
    tube(root,'ventral-root',[[side*.64,.3,.47],[side*1.05,.25,.58],[side*1.75,.23,.39],[side*2.6,.17,-.2]],.06,0x7cc6e9,1,side===-1?'Racine ventrale':null);
    ell(root,'sensory-ganglion',[side*2.19,.2,-.39],[.23,.12,.14],P.ganglion,.95);
  }
  return result(root,id,10.5,'Coupe ouverte schématique des enveloppes spinales, épaisseurs agrandies. L’espace épidural spinal est réel et contient graisse et veines ; il n’est pas le LCS.',{
    target:V([0,.2,-.25]),cameraDirection:[.25,.55,1],
    layerOrder:['bones','spinal-epidural','dura','arachnoid','subarachnoid','pia','nervous'],
    info:'Dure-mère spinale : feuillet méningé séparé du canal osseux par l’espace épidural réel. Au crâne, les feuillets périosté et méningé sont normalement accolés hors sinus. La séparation sous-durale n’est pas un espace libre normal.',
  });
}
function csfModel(id) {
  const root = group(null, 'Système ventriculaire et circulation principale du LCS');
  const context = group(root, 'Encéphale de repérage', 'brain-context');
  for (const s of [-1, 1]) foldedSphere(context, 'brain', [s * .82, .55, .17], [.93, 1.31, 1.65], P.central, .085);
  ell(context, 'cerebellum', [0, -.94, -.92], [1.2, .58, .7], P.central, .1);
  tube(context, 'spinal-cord', [[0, -1.62, -.15], [0, -2.9, -.1], [0, -4.3, .01]], .21, P.central, .14);
  const cavities = group(root, 'Cavités et communications', 'csf');
  const lateralEnds = {};
  for (const s of [-1, 1]) {
    const pts = [[s * .49, .2, .96], [s * .65, 1.04, .94], [s * .82, 1.32, .08], [s * .86, .93, -.92], [s * .69, .17, -.98], [s * .62, -.09, -.23]];
    tube(cavities, 'lateral-ventricles', pts, .17, P.fluid, .88, s === 1 ? 'Ventricules latéraux' : null, 64);
    ell(cavities, 'lateral-ventricles', [s * .63, .74, .58], [.27, .33, .37], 0x8be5ff, .85);
    const monro = [[s * .57, .73, .55], [s * .26, .58, .46], [s * .1, .53, .4]];
    tube(cavities, 'monro', monro, .067, 0xa7f0ff, .95, s === -1 ? 'Foramina de Monro' : null, 18);
    lateralEnds[s] = [s * .64, 1.04, .84];
    // Plexus choroïde intraventriculaire : ruban bosselé, pas parenchyme producteur.
    const cp = [[s * .66, .84, .65], [s * .73, 1.12, .0], [s * .75, .85, -.78], [s * .64, .22, -.85]];
    tube(root, 'choroid-plexus', cp, .065, 0xc793d3, .95, s === 1 ? 'Plexus choroïdes' : null, 28);
    for (let k = 0; k < 9; k++) ell(root, 'choroid-plexus', [s * (.72 + .04 * Math.sin(k)), .99 - k * .073, -.15 - k * .07], [.08, .06, .07], 0xcba1d7, .96, null, 10);
  }
  ell(cavities, 'third-ventricle', [0, .3, .29], [.105, .48, .51], 0x74d2f6, .93, 'Troisième ventricule');
  tube(cavities, 'aqueduct', [[0, .12, -.06], [0, -.22, -.24], [0, -.65, -.37]], .055, 0xb2efff, 1, 'Aqueduc cérébral', 22);
  const diamond = new THREE.Shape(); diamond.moveTo(0, .64); diamond.lineTo(.42, .04); diamond.lineTo(0, -.5); diamond.lineTo(-.42, .04); diamond.closePath();
  const fourthGeo = new THREE.ExtrudeGeometry(diamond, { depth: .27, bevelEnabled: true, bevelSegments: 3, bevelSize: .04, bevelThickness: .04, steps: 1 });
  const fourth = new THREE.Mesh(fourthGeo, material(0x86dcfa, .88)); fourth.position.set(0, -1.12, -.65); mark(fourth, 'fourth-ventricle', 'Quatrième ventricule'); cavities.add(fourth);
  ell(root, 'choroid-plexus', [0, -1.33, -.42], [.29, .08, .07], 0xc793d3, .95);
  tube(cavities, 'median-aperture', [[0, -1.48, -.53], [0, -1.6, -.88], [0, -1.65, -1.05]], .075, P.fluid, .98, 'Ouverture médiane du IV', 16);
  for (const s of [-1, 1]) tube(cavities, 'lateral-apertures', [[s * .31, -1.08, -.49], [s * .64, -1.14, -.59], [s * .83, -1.25, -.63]], .068, P.fluid, .98, s === 1 ? 'Ouvertures latérales du IV' : null, 18);
  const sas = group(root, 'Espaces sous-arachnoïdiens', 'subarachnoid');
  // Deux couches transversales translucides font une enveloppe de repérage, sans masquer les cavités.
  for (const s of [-1, 1]) {
    tube(sas, 'subarachnoid', [[0, -1.65, -1.12], [s * 1.42, -.6, -1.0], [s * 1.78, .55, -.12], [s * 1.38, 1.54, .4], [0, 1.96, .22]], .14, P.fluid, .22, s === -1 ? 'Espace sous-arachnoïdien péri-encéphalique' : null, 60);
  }
  ell(sas, 'cisterns', [0, -1.67, -1.04], [.55, .24, .3], P.fluid, .35, 'Citerne cérébello-médullaire — schéma');
  ell(sas, 'cisterns', [0, -.73, .42], [.58, .2, .29], P.fluid, .22, 'Citerne basale — repère');
  for (const s of [-1, 1]) tube(sas, 'perimedullary', [[s * .36, -1.68, -.2], [s * .4, -2.7, -.13], [s * .38, -4.26, .0]], .12, P.fluid, .3, s === 1 ? 'Espaces sous-arachnoïdiens périmédullaires' : null, 36);
  // Canal étroit comme branche secondaire sans particules de flux principal.
  tube(cavities, 'central-canal', [[0, -1.62, -.31], [0, -2.62, -.1], [0, -4.24, .0]], .018, 0x9dd6e7, .7, 'Canal central — pas la voie principale adulte', 26);
  const resorb = group(root, 'Résorption — compléments', 'resorption');
  tube(resorb, 'dural-sinus', [[0, 2.0, -.8], [0, 2.09, .0], [0, 2.0, .8]], .12, P.vein, .85, 'Sinus veineux dural');
  for (let k = -2; k <= 2; k++) ell(resorb, 'granulations', [.07, 1.99, k * .29], [.11, .15, .1], 0xcbdcf0, .93, k === 0 ? 'Granulations arachnoïdiennes — complément' : null, 12);
  for (const s of [-1, 1]) tube(resorb, 'lymphatics', [[s * .3, 2.1, -.8], [s * .45, 2.05, .0], [s * .61, 1.84, .75], [s * .78, 1.23, 1.1]], .026, 0x72d0ba, .9, s === -1 ? 'Voies lymphatiques méningées — complément' : null, 28);
  const flowPaths = [];
  for (const s of [-1, 1]) {
    const shared = [lateralEnds[s], [s * .5, .75, .57], [s * .26, .58, .46], [0, .48, .36], [0, .12, -.06], [0, -.22, -.24], [0, -.65, -.37], [0, -1.05, -.48], [0, -1.48, -.53], [0, -1.6, -.88], [0, -1.65, -1.05]];
    flowPaths.push({ points: [...shared, [s * 1.4, -.6, -1], [s * 1.7, .5, -.12], [s * 1.35, 1.52, .4], [0, 1.94, .2]], label: 'Ventricule latéral → Monro → III → aqueduc → IV → ouverture médiane → citerne → espace sous-arachnoïdien' });
    flowPaths.push({ points: [...shared.slice(0, 8), [s * .31, -1.08, -.49], [s * .64, -1.14, -.59], [s * .83, -1.25, -.63], [s * .42, -1.7, -.2], [s * .4, -2.7, -.13], [s * .38, -4.25, .0]], label: 'IV → ouverture latérale → espace sous-arachnoïdien périmédullaire' });
  }
  return result(root, id, 9.7, 'Cavités en volumes schématiques agrandis. Les particules montrent un parcours pédagogique global ; elles ne mesurent ni la vitesse ni la pulsatilité réelle du LCS.', { target: V([0, -.7, 0]), flowPaths, info: 'Le canal central médullaire n’est pas une voie principale du LCS chez l’adulte. Granulations et lymphatiques : compléments scientifiques distincts du contenu principal du cours.' });
}
function digestiveModel(id) {
  const root = group(null, 'Paroi digestive et plexus nerveux entériques');
  // Segment de paroi ouvert (volume cylindrique partiel), lumiere au centre.
  const layers = [
    ['digestive', 1.04, .14, 0x8e92be, 'Muqueuse'],
    ['digestive', 1.23, .19, 0xa6b4cc, 'Sous-muqueuse'],
    ['digestive', 1.48, .21, 0x657fb2, 'Musculeuse — couche circulaire interne'],
    ['digestive', 1.76, .19, 0x638bba, 'Musculeuse — couche longitudinale externe'],
  ];
  for (const [key, radius, thick, color, name] of layers) {
    const g = group(root, name, name);
    const geo = new THREE.CylinderGeometry(radius + thick, radius + thick, 4.8, 52, 1, true, .15, Math.PI * 1.55);
    const outer = new THREE.Mesh(geo, material(color, .7)); mark(outer, key, name); g.add(outer);
    const innerGeo = new THREE.CylinderGeometry(radius, radius, 4.8, 52, 1, true, .15, Math.PI * 1.55);
    const inner = new THREE.Mesh(innerGeo, material(color, .62)); mark(inner, key); g.add(inner);
    for (const y of [-2.4, 2.4]) {
      const ringGeo = new THREE.RingGeometry(radius, radius + thick, 52, 1, .15, Math.PI * 1.55);
      const ring = new THREE.Mesh(ringGeo, material(color, .92)); ring.rotation.x = -Math.PI / 2; ring.position.y = y; mark(ring, key); g.add(ring);
    }
  }
  // Les filets suivent la paroi ; les corps neuronaux/ganglions sont posés aux intersections.
  const makePlexus = (key, radius, color, label) => {
    const net = group(root, label, key);
    const arcs = 8, levels = 7;
    for (let j = 0; j < levels; j++) {
      const y = -2.1 + j * .7;
      const points = [];
      for (let i = 0; i <= 20; i++) { const a = .23 + i / 20 * Math.PI * 1.48; points.push([Math.sin(a) * radius, y + .09 * Math.sin(a * 4 + j), Math.cos(a) * radius]); }
      tube(net, key, points, .022, color, 1, j === 3 ? label : null, 36);
      for (let k = 0; k < arcs; k++) {
        const a = .23 + k / (arcs - 1) * Math.PI * 1.48;
        const x = Math.sin(a) * radius, z = Math.cos(a) * radius;
        ell(net, key, [x, y, z], [.075, .075, .075], P.ganglion, 1, null, 10);
        if (j < levels - 1) tube(net, key, [[x, y, z], [Math.sin(a + .05) * radius, y + .35, Math.cos(a + .05) * radius], [x, y + .7, z]], .018, color, 1, null, 10);
      }
    }
  };
  makePlexus('meissner', 1.39, 0xa8e0ef, 'Plexus sous-muqueux de Meissner');
  makePlexus('auerbach', 1.72, 0xb99ce9, 'Plexus myentérique d’Auerbach');
  // Des cellules gliales schématiques accompagnent les réseaux ganglionnés.
  for (let k = 0; k < 18; k++) {
    const a = .35 + k % 6 / 6 * Math.PI * 1.4, y = -.9 + Math.floor(k / 6) * .9, r = k % 2 ? 1.72 : 1.39;
    ell(root, 'enteric', [Math.sin(a) * r, y, Math.cos(a) * r], [.04, .09, .045], 0x8879be, .94, k === 0 ? 'Cellules gliales entériques — schéma' : null, 10);
  }
  return result(root, id, 7.8, 'Segment de paroi digestive ouvert, dimensions et épaisseurs schématiques. Meissner est dans la sous-muqueuse ; Auerbach entre couches circulaire et longitudinale de la musculeuse.', { target: V([0, 0, 0]) });
}

const BODY = new Set(['body', 'head', 'spine', 'upper-limb', 'lower-limb', 'digestive']);
const BRAIN = new Set(['brain', 'cerebellum', 'brainstem', 'cortex', 'corpus-callosum', 'basal-nuclei']);
const MENINGES = new Set(['meninges', 'scalp', 'skull', 'periosteum', 'dura', 'dural-sinus', 'falx', 'tentorium', 'arachnoid', 'subarachnoid', 'pia', 'glia-limitans']);
const CSF = new Set(['csf', 'lateral-ventricles', 'monro', 'third-ventricle', 'aqueduct', 'fourth-ventricle', 'median-aperture', 'lateral-apertures', 'cisterns', 'perimedullary', 'central-canal', 'choroid-plexus', 'granulations', 'lymphatics']);
export function buildAnatomy(id) {
  if(id==='spinal-meninges') return spinalMeningesModel(id);
  if (BODY.has(id)) return bodyModel(id);
  if (BRAIN.has(id)) return brainModel(id);
  if (['spinal-cord', 'dorsal-root', 'ventral-root'].includes(id)) return spinalModel(id);
  if (MENINGES.has(id)) return meningesModel(id);
  if (CSF.has(id)) return csfModel(id);
  if (['enteric', 'meissner', 'auerbach'].includes(id)) return digestiveModel(id);
  return null;
}
