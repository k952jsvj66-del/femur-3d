/* NeuroScope — original procedural teaching models.
 * Dimensions, colours, organelle size and cell density are schematic. These
 * meshes are not a reconstruction of a histological specimen or a scale atlas.
 * Scientific provenance and the limits of each representation live in content
 * and anatomy-data; no course figure or third-party anatomical asset is used.
 */
import * as THREE from './assets/vendor/three.module.js';

const C = {
  neuron: 0x79c9ed, nucleus: 0x5c4a9d, nissl: 0x4c6ea8,
  axon: 0xf7cb7d, myelin: 0xd8e7f3, glia: 0x8c86d7,
  astro: 0x8aadee, micro: 0xb492ce, collagen: 0xb5c8d4,
  artery: 0xd87c8d, vein: 0x719bc6, tight: 0x55f2e3,
  csf: 0x73d5ff, cell: 0x99b4df, background: 0x7396b4,
};
const v = p => new THREE.Vector3(...p);
const mix = (a, b, t) => a.map((n, i) => n + (b[i] - n) * t);

function group(id, name) {
  const g = new THREE.Group();
  if (id) g.userData.structure = id;
  if (name) g.name = name;
  return g;
}

function material(color, opacity = 1, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: 0.6, metalness: 0.03,
    transparent: opacity < 1, opacity, depthWrite: opacity >= 0.45,
    side: THREE.DoubleSide, ...extra,
  });
}

function mesh(parent, geometry, color, id, label, tag, opacity = 1) {
  const m = new THREE.Mesh(geometry, material(color, opacity));
  if (id) m.userData.structure = id;
  if (label) m.userData.label = label;
  if (tag) m.userData.histology = tag;
  m.userData.baseColor = color;
  m.userData.originalColor = color;
  parent.add(m);
  return m;
}

function sphere(parent, at, scale, color, id, label, tag, opacity = 1) {
  const m = mesh(parent, new THREE.SphereGeometry(1, 16, 12), color, id, label, tag, opacity);
  m.position.copy(v(at));
  m.scale.set(...(Array.isArray(scale) ? scale : [scale, scale, scale]));
  return m;
}

function tube(parent, points, radius, color, id, label, tag, opacity = 1) {
  const curve = new THREE.CatmullRomCurve3(points.map(v));
  return mesh(parent, new THREE.TubeGeometry(curve, Math.max(8, points.length * 5), radius, 7, false), color, id, label, tag, opacity);
}

function rod(parent, a, b, radius, color, id, label, tag, opacity = 1) {
  const av = v(a), bv = v(b), delta = bv.clone().sub(av);
  const m = mesh(parent, new THREE.CylinderGeometry(radius, radius, delta.length(), 10), color, id, label, tag, opacity);
  m.position.copy(av.add(bv).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return m;
}

// A genuinely hollow shell, including annular end faces: a transparent solid
// cylinder would falsely fill the axonal lumen when inspected in cross-section.
function shell(parent, at, inner, outer, length, color, id, label, tag, opacity = 1, arc = Math.PI * 2) {
  const points = [new THREE.Vector2(inner, -length / 2), new THREE.Vector2(outer, -length / 2),
    new THREE.Vector2(outer, length / 2), new THREE.Vector2(inner, length / 2),
    new THREE.Vector2(inner, -length / 2)];
  const m = mesh(parent, new THREE.LatheGeometry(points, 28, 0, arc), color, id, label, tag, opacity);
  m.position.copy(v(at));
  return m;
}

function box(parent, at, size, color, id, label, tag, opacity = 1) {
  const m = mesh(parent, new THREE.BoxGeometry(...size), color, id, label, tag, opacity);
  m.position.copy(v(at));
  return m;
}

function finish(root, id, title, cameraDistance, info = '') {
  root.userData.viewId = id;
  return {root, title, cameraDistance, target: new THREE.Vector3(),
    scaleNote: 'Modèle 3D schématique : dimensions, densités cellulaires et distances non proportionnelles.', info};
}

function soma(parent, at, radius = 0.6, id = 'neuron', label, translucent = false) {
  const g = group(id);
  g.position.copy(v(at));
  parent.add(g);
  sphere(g, [0, 0, 0], [radius, radius * 0.88, radius * 0.82], C.neuron, id, label, 'cytoplasm', translucent ? 0.56 : 0.72);
  sphere(g, [0.04, 0.04, radius * 0.45], radius * 0.36, C.nucleus, id, null, 'nucleus');
  sphere(g, [0.08, 0.09, radius * 0.72], radius * 0.085, 0xd5b4ff, id, null, 'nucleus');
  return g;
}

function glialCell(parent, at, radius, id, color = C.glia, label) {
  const g = group(id);
  parent.add(g);
  g.position.copy(v(at));
  sphere(g, [0, 0, 0], [radius, radius * 0.88, radius * 0.85], color, id, label, 'cytoplasm');
  sphere(g, [0, 0, radius * 0.47], radius * 0.5, C.nucleus, id, null, 'nucleus');
  return g;
}

function branches(parent, origin, radius, id, color, count = 6, span = 2, depth = 2) {
  for (let i = 0; i < count; i++) {
    const a = i * Math.PI * 2 / count + 0.22;
    const dir = [Math.cos(a), Math.sin(a), Math.sin(i * 2.1) * 0.3];
    const mid = origin.map((x, k) => x + dir[k] * span * 0.55);
    const end = origin.map((x, k) => x + dir[k] * span);
    tube(parent, [origin, mid, end], radius, color, id, null, 'neuropil');
    if (depth > 0) {
      for (const side of [-1, 1]) {
        const end2 = [end[0] + Math.cos(a + side * 0.65) * span * 0.45,
          end[1] + Math.sin(a + side * 0.65) * span * 0.45, end[2] + side * 0.24];
        tube(parent, [mid, end, end2], radius * 0.55, color, id, null, 'neuropil');
      }
    }
  }
}

function myelinatedAxon(parent, at, length = 6, axis = 'x', id = 'axon', radius = 0.15, count = 3, label = false) {
  const g = group(id);
  g.position.copy(v(at));
  if (axis === 'x') g.rotation.z = -Math.PI / 2;
  if (axis === 'z') g.rotation.x = Math.PI / 2;
  parent.add(g);
  rod(g, [0, -length / 2, 0], [0, length / 2, 0], radius * 0.58, C.axon, 'axon', label ? 'Axone' : null, 'axon');
  const internode = length / count;
  for (let j = 0; j < count; j++) {
    shell(g, [0, -length / 2 + internode * (j + 0.5), 0], radius * 0.64, radius,
      internode * 0.84, C.myelin, 'myelin', label && j === 0 ? 'Gaine de myéline' : null, 'myelin');
    if (j < count - 1) {
      const ring = mesh(g, new THREE.TorusGeometry(radius * 0.6, radius * 0.11, 6, 14), C.tight,
        'node', label && j === 0 ? 'Nœud de Ranvier' : null, 'axon');
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -length / 2 + internode * (j + 1);
    }
  }
  return g;
}

function buildNeuron(id) {
  const root = group(id);
  soma(root, [-2.2, 0, 0], 1.05, 'neuron', 'Corps cellulaire neuronal', true);
  // Nissl bodies stay in the soma and proximal dendrites, never in the axon.
  for (let i = 0; i < 15; i++) {
    const a = i * 2.39996;
    sphere(root, [-2.2 + Math.cos(a) * (0.55 + (i % 3) * 0.1), Math.sin(a) * 0.62,
      0.44 + (i % 2) * 0.13], [0.15, 0.08, 0.045], C.nissl, 'neuron', i === 0 ? 'Corps de Nissl (soma)' : null, 'nucleus');
  }
  for (let i = 0; i < 6; i++) {
    const a = 0.9 + i * 0.88;
    const start = [-2.2 + Math.cos(a) * 0.65, Math.sin(a) * 0.65, 0];
    const mid = [-2.2 + Math.cos(a) * 1.8, Math.sin(a) * 1.9, Math.sin(i) * 0.3];
    const end = [-2.2 + Math.cos(a) * 2.8, Math.sin(a) * 2.6, Math.sin(i) * 0.6];
    tube(root, [start, mid, end], 0.09, C.neuron, 'dendrite', i === 0 ? 'Dendrites' : null, 'neuropil');
    for (const side of [-1, 1]) {
      tube(root, [mid, end, [end[0] + Math.cos(a + side * 0.65), end[1] + Math.sin(a + side * 0.65), end[2] + side * 0.3]],
        0.045, C.neuron, 'dendrite', null, 'neuropil');
    }
  }
  const cone = mesh(root, new THREE.ConeGeometry(0.38, 0.8, 16), C.axon, 'axon', 'Cône d’implantation', 'axon');
  cone.rotation.z = -Math.PI / 2;
  cone.position.set(-1.04, 0, 0);
  rod(root, [-0.8, 0, 0], [0.2, 0, 0], 0.1, 0xefb86c, 'axon', 'Segment initial — sans corps de Nissl', 'axon');
  myelinatedAxon(root, [2.4, 0, 0], 4.5, 'x', 'axon', 0.21, 3, true);
  for (const side of [-1, 1]) {
    const p = [[2.0, 0, 0], [2.6, side * 0.75, 0.2], [3.4, side * 1.4, 0.4]];
    tube(root, p, 0.055, C.axon, 'axon', side === -1 ? 'Collatérale axonale' : null, 'axon');
    sphere(root, p[2], 0.14, 0xf6ac7e, 'synapse', null, 'axon');
  }
  for (let i = 0; i < 5; i++) {
    const end = [5.6 + Math.cos(i * 1.8) * 0.25, (i - 2) * 0.68, Math.sin(i * 1.9) * 0.7];
    tube(root, [[4.6, 0, 0], [5.1, (i - 2) * 0.4, 0], end], 0.05, C.axon, 'axon', null, 'axon');
    sphere(root, end, [0.18, 0.15, 0.16], 0xf6ac7e, 'synapse', i === 0 ? 'Arborisation terminale et boutons' : null, 'axon');
  }
  root.position.x = -0.1;
  return finish(root, id, 'Neurone multipolaire et ses compartiments', 15,
    'La myélinisation est un exemple ; tous les axones ne sont pas myélinisés. Ultrastructure et dimensions agrandies, complément au TN1.');
}

function buildAstrocyte(id) {
  const root = group(id);
  glialCell(root, [-0.5, 0, 0], 0.7, 'astrocyte', C.astro, 'Astrocyte');
  branches(root, [-0.5, 0, 0], 0.09, 'astrocyte', C.astro, 7, 1.9, 1);
  tube(root, [[-4, -2, 0], [0, -2.3, 0.2], [4, -1.8, 0]], 0.38, C.artery, 'bbb', 'Capillaire sanguin', 'blood');
  for (let i = 0; i < 4; i++) {
    const x = -2.5 + i * 1.4;
    tube(root, [[-0.5, -0.3, 0.1], [x * 0.7, -1.2, 0.5], [x, -1.8, 0.3]], 0.085, C.astro, 'astrocyte', null, 'neuropil');
    sphere(root, [x, -1.85, 0.32], [0.6, 0.2, 0.47], C.astro, 'astrocyte', i === 0 ? 'Pieds périvasculaires astrocytaires' : null, 'cytoplasm', 0.83);
  }
  soma(root, [2.4, 1.8, 0], 0.55, 'neuron', 'Neurone voisin');
  tube(root, [[2.3, 1.4, 0], [2.2, 0.7, 0.2], [3, 0.2, 0]], 0.07, C.neuron, 'dendrite', null, 'neuropil');
  return finish(root, id, 'Astrocyte et rapports périvasculaires', 11,
    'Les pieds astrocytaires soutiennent l’unité neurovasculaire ; les jonctions serrées de la BHE sont endothéliales.');
}

function buildOligodendrocyte(id) {
  const root = group(id);
  glialCell(root, [0, 0, 0], 0.64, 'oligodendrocyte', C.glia, 'Oligodendrocyte (SNC)');
  const targets = [[-2.4, 1.6, 0], [2.3, 1.6, 0], [-1.5, -1.7, 0.6], [2, -1.7, 0.6]];
  for (let i = 0; i < 2; i++) {
    rod(root, [-4, i ? -1.7 : 1.6, i ? 0.6 : 0], [4, i ? -1.7 : 1.6, i ? 0.6 : 0], 0.13,
      C.axon, 'axon', i === 0 ? 'Axones du SNC' : null, 'axon');
  }
  for (let i = 0; i < targets.length; i++) {
    const [x, y, z] = targets[i];
    tube(root, [[0, 0, 0], [x * 0.5, y * 0.55, z + 0.3], [x, y, z]], 0.09, C.glia, 'oligodendrocyte', null, 'neuropil');
    const m = shell(root, [x, y, z], 0.16, 0.34, 1.65, C.myelin, 'myelin', i === 0 ? 'Plusieurs internœuds, sur plusieurs axones' : null, 'myelin');
    m.rotation.z = Math.PI / 2;
  }
  return finish(root, id, 'Un oligodendrocyte, plusieurs internœuds', 11,
    'La disposition et le nombre d’internœuds sont schématiques ; ils illustrent une propriété distincte de celle d’une cellule de Schwann myélinisante.');
}

function buildSchwann(id) {
  const root = group(id);
  myelinatedAxon(root, [0, 1.4, 0], 7, 'x', 'axon', 0.45, 3, true);
  // Only the middle internode is the selected Schwann cell, its neighbours are
  // deliberately separate. One Schwann cell never spans a node of Ranvier.
  sphere(root, [0, 1.95, 0.1], [0.5, 0.22, 0.23], C.glia, 'schwann', 'Une cellule de Schwann : un internœud', 'cytoplasm');
  sphere(root, [0, 2.01, 0.26], [0.25, 0.13, 0.07], C.nucleus, 'schwann', null, 'nucleus');
  sphere(root, [0, -1.65, 0], [2.8, 0.63, 0.6], C.glia, 'schwann', 'Cellule de Schwann non myélinisante — faisceau de Remak', 'cytoplasm', 0.45);
  sphere(root, [-0.4, -1.9, 0.48], [0.42, 0.18, 0.13], C.nucleus, 'schwann', null, 'nucleus');
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    rod(root, [-3.2, -1.6 + Math.cos(a) * 0.28, Math.sin(a) * 0.28], [3.2, -1.6 + Math.cos(a) * 0.28, Math.sin(a) * 0.28],
      0.075, C.axon, 'axon', i === 0 ? 'Plusieurs axones amyéliniques enveloppés, sans myéline compacte' : null, 'axon');
  }
  return finish(root, id, 'Schwann : myélinisation et fibres amyéliniques', 11,
    'Le faisceau inférieur est une représentation agrandie des rapports axone–Schwann non myélinisante ; il n’est pas une gaine de myéline commune.');
}

function buildMicroglia(id) {
  const root = group(id);
  const surveillance = group('microglia');
  const active = group('microglia');
  root.add(surveillance, active);
  glialCell(surveillance, [0, 0, 0], 0.65, 'microglia', C.micro, 'Microglie de surveillance — ramifiée');
  branches(surveillance, [0, 0, 0], 0.07, 'microglia', C.micro, 9, 2.1, 1);
  glialCell(active, [0, 0, 0], 1.05, 'microglia', 0xb18ac9, 'Microglie activée — schéma simplifié');
  branches(active, [0, 0, 0], 0.16, 'microglia', C.micro, 6, 1, 0);
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4;
    sphere(active, [Math.cos(a) * 0.65, Math.sin(a) * 0.65, 0.7], 0.13, 0x655c8d, 'microglia', null, 'cytoplasm');
  }
  active.visible = false;
  root.userData.setMicrogliaActive = value => {
    surveillance.visible = !value;
    active.visible = Boolean(value);
    root.userData.microgliaActive = Boolean(value);
  };
  return finish(root, id, 'Microglie : changement de morphologie', 9,
    'Deux états schématiques pour comparer les morphologies. Les états biologiques de la microglie forment un continuum ; « activée » ne désigne pas une morphologie unique.');
}

function ependymalSheet(parent, at = [0, 0, 0], choroid = false, label = true) {
  const g = group(choroid ? 'blood-csf' : 'ependyma');
  parent.add(g);
  g.position.copy(v(at));
  for (let ix = 0; ix < 6; ix++) {
    for (let iz = 0; iz < 3; iz++) {
      const x = (ix - 2.5) * 0.95, z = (iz - 1) * 0.95;
      const id = choroid ? 'blood-csf' : 'ependymocyte';
      box(g, [x, 0, z], [0.91, 0.95, 0.91], C.cell, id,
        label && ix === 0 && iz === 0 ? (choroid ? 'Épithélium choroïdien' : 'Épendymocytes — revêtement ordinaire') : null, 'cytoplasm', 0.92);
      sphere(g, [x, -0.02, z + 0.26], [0.22, 0.29, 0.16], C.nucleus, id, null, 'nucleus');
      if (choroid) {
        // Tight junction belts belong to the choroid epithelium, not to the
        // neighbouring fenestrated vascular endothelium.
        for (const side of [-1, 1]) {
          rod(g, [x - 0.43, 0.35, z + side * 0.43], [x + 0.43, 0.35, z + side * 0.43], 0.035,
            C.tight, 'blood-csf', label && ix === 0 && iz === 0 && side === -1 ? 'Jonctions serrées épithéliales : barrière sang–LCS' : null, 'junction');
          rod(g, [x + side * 0.43, 0.35, z - 0.43], [x + side * 0.43, 0.35, z + 0.43], 0.035,
            C.tight, 'blood-csf', null, 'junction');
        }
      }
      const cilia = choroid ? 0 : 4;
      for (let k = 0; k < cilia; k++) {
        const cx = x + (k % 2 ? 0.16 : -0.16), cz = z + (k < 2 ? -0.17 : 0.17);
        tube(g, [[cx, 0.48, cz], [cx + 0.05, 1, cz], [cx + 0.2, 1.24, cz + 0.08]],
          0.026, 0xa9daed, id, label && ix === 0 && iz === 0 && k === 0 ? 'Cils apicaux (agrandis)' : null, 'cytoplasm');
      }
      for (let k = 0; k < 4; k++) {
        rod(g, [x - 0.28 + k * 0.18, 0.47, z], [x - 0.28 + k * 0.18, 0.67, z], 0.035,
          0xa9daed, id, label && ix === 0 && iz === 0 && k === 0 ? 'Microvillosités (agrandies)' : null, 'cytoplasm');
      }
    }
  }
  return g;
}

function buildEpendymocyte(id) {
  const root = group(id);
  ependymalSheet(root);
  box(root, [0, 1.8, 0], [6.7, 0.35, 3.4], C.csf, 'csf', 'LCS — face apicale', null, 0.1);
  box(root, [0, -0.75, 0], [6.7, 0.3, 3.4], C.background, 'neuropil', 'Tissu nerveux — face basale', 'neuropil', 0.32);
  return finish(root, id, 'Épendyme ordinaire et face ventriculaire', 10,
    'Revêtement épendymaire schématique, distinct de l’épithélium des plexus choroïdes. Les cils et microvillosités sont agrandis ; aucune ceinture étanche continue n’est figurée ici.');
}

function buildSatellite(id) {
  const root = group(id);
  soma(root, [0, 0, 0], 1.6, 'neuron', 'Soma neuronal ganglionnaire', true);
  for (let i = 0; i < 13; i++) {
    const a = i * Math.PI * 2 / 13;
    const x = Math.cos(a) * 1.85, y = Math.sin(a) * 1.85;
    const cell = sphere(root, [x, y, 0], [0.22, 0.48, 0.38], C.glia, 'satellite', i === 0 ? 'Cellules satellites du SNP' : null, 'cytoplasm');
    cell.rotation.z = a;
    const n = sphere(root, [x * 1.04, y * 1.04, 0.25], [0.11, 0.24, 0.14], C.nucleus, 'satellite', null, 'nucleus');
    n.rotation.z = a;
  }
  tube(root, [[0, -1.3, 0], [0, -2.6, 0], [2.3, -2.6, 0]], 0.13, C.axon, 'axon', 'Prolongement neuronal', 'axon');
  return finish(root, id, 'Cellules satellites autour d’un soma ganglionnaire', 9,
    'Exemple de ganglion sensitif périphérique. Les cellules satellites ne sont pas des cellules de Schwann et ne constituent pas une gaine de myéline autour du soma.');
}

function buildSynapse(id) {
  const root = group(id);
  tube(root, [[-3.8, 2.4, 0], [-2.2, 1.5, 0], [-1, 0.8, 0]], 0.28, C.axon, 'axon', 'Axone présynaptique', 'axon');
  sphere(root, [-0.95, 0.9, 0], [1.65, 0.9, 0.9], C.axon, 'synapse', 'Bouton présynaptique', 'axon', 0.4);
  // Opposed membrane patches and a visible cleft; not two intersecting blobs.
  const pre = box(root, [0.1, -0.02, 0], [3.35, 0.09, 1.8], 0xe7cda1, 'synapse', 'Membrane présynaptique', 'axon');
  pre.rotation.z = 0.08;
  const post = box(root, [0.1, -0.42, 0], [3.5, 0.12, 1.9], C.neuron, 'dendrite', 'Membrane postsynaptique', 'cytoplasm');
  post.rotation.z = 0.08;
  tube(root, [[-3.7, -1, 0], [-0.3, -1.2, 0], [3.8, -0.7, 0]], 0.6, C.neuron, 'dendrite', 'Dendrite postsynaptique', 'neuropil');
  for (let i = 0; i < 12; i++) {
    const x = -1.8 + (i % 4) * 0.6, y = 0.3 + Math.floor(i / 4) * 0.35;
    sphere(root, [x, y, 0.36], 0.15, 0xa7ddf1, 'synapse', i === 0 ? 'Vésicules synaptiques' : null, 'cytoplasm');
  }
  for (let i = 0; i < 7; i++) {
    const x = -1.2 + i * 0.4;
    sphere(root, [x, -0.22 + x * 0.08, 0.3], 0.046, C.tight, 'synapse', i === 0 ? 'Fente synaptique — disproportionnellement agrandie' : null, 'junction');
    rod(root, [x, -0.55 + x * 0.08, 0.65], [x, -0.33 + x * 0.08, 0.65], 0.06,
      0x6476c5, 'synapse', i === 0 ? 'Récepteurs postsynaptiques (schéma)' : null, 'cytoplasm');
  }
  return finish(root, id, 'Synapse chimique axodendritique', 10,
    'Complément ultrastructural. La fente, les membranes et les molécules sont agrandies. Les synapses ne sont pas résolues individuellement en microscopie optique conventionnelle.');
}

function buildAxon(id) {
  const root = group(id);
  myelinatedAxon(root, [0, 0, 0], 8, 'x', 'axon', 0.72, 3, true);
  // Repeated lamellae on an exposed end clarify that compact myelin is a
  // multilamellar wrapping rather than a solid cellular cylinder.
  for (let i = 0; i < 6; i++) {
    const m = mesh(root, new THREE.TorusGeometry(0.45 + i * 0.047, 0.012, 5, 28),
      i % 2 ? 0x9eb6cc : 0xe0eaf5, 'myelin', i === 0 ? 'Lamelles de myéline — agrandies' : null, 'myelin');
    m.rotation.y = Math.PI / 2;
    m.position.set(-3.78, 0, 0);
  }
  sphere(root, [0, 0.8, 0], [0.46, 0.18, 0.3], C.glia, 'schwann', 'Noyau d’une cellule de Schwann — exemple SNP', 'cytoplasm');
  sphere(root, [0, 0.88, 0.18], [0.25, 0.1, 0.1], C.nucleus, 'schwann', null, 'nucleus');
  return finish(root, id, 'Axone myélinisé et nœuds de Ranvier', 11,
    'Exemple périphérique : chaque segment internodal dépend d’une cellule de Schwann différente. L’espace nodal n’interrompt pas la continuité de l’axone.');
}

function buildDendrite(id) {
  const root = group(id);
  tube(root, [[-4, -0.5, 0], [-2, 0, 0], [0, 0.5, 0], [3.7, 0.3, 0]], 0.24,
    C.neuron, 'dendrite', 'Dendrite — branche receptrice', 'neuropil');
  for (let i = 0; i < 10; i++) {
    const x = -3.2 + i * 0.7, side = i % 2 ? 1 : -1;
    const at = [x, 0.25 + side * 0.7, (i % 3 - 1) * 0.22];
    tube(root, [[x, 0.25, 0], [x + 0.06, 0.25 + side * 0.45, at[2]], at], 0.045,
      C.neuron, 'dendrite', null, 'neuropil');
    sphere(root, at, [0.18, 0.16, 0.15], C.neuron, 'dendrite', i === 0 ? 'Épines dendritiques (exemple)' : null, 'cytoplasm');
    if (i % 3 === 0) {
      const bouton = [at[0], at[1] + side * 0.35, at[2]];
      sphere(root, bouton, 0.21, C.axon, 'synapse', i === 0 ? 'Bouton synaptique au contact d’une épine' : null, 'axon');
      tube(root, [bouton, [x - 0.3, bouton[1] + side * 0.4, 0], [x - 0.9, bouton[1] + side * 0.9, 0.2]],
        0.06, C.axon, 'axon', null, 'axon');
    }
  }
  return finish(root, id, 'Dendrite et synapses sur des épines', 10,
    'Complément schématique : toutes les dendrites ne portent pas des épines ; il existe aussi des synapses sur les tiges dendritiques et d’autres compartiments.');
}

function histologySlab(root, id) {
  const m = box(root, [0, 0, -0.5], [8.4, 5.4, 2.1], C.background, id, null, 'neuropil', 0.08);
  // The support is deliberately not a selectable cell or a photographic stain.
  m.userData.support = true;
}

function buildGray(id) {
  const root = group(id);
  histologySlab(root, 'gray-matter');
  const somata = [[-2.7, 1.3, 0], [0.1, 0.4, 0.1], [2.4, -1.2, 0], [-1.6, -1.4, 0.1]];
  if (id !== 'neuropil') {
    somata.forEach((p, i) => {
      soma(root, p, 0.48 + (i % 2) * 0.14, 'neuron', i === 0 ? 'Soma neuronal — substance grise' : null);
      branches(root, p, 0.048, 'dendrite', C.neuron, 4, 0.9, 0);
    });
  }
  // Entangled neuronal and glial processes; no detached “neuropil cells”.
  for (let i = 0; i < 25; i++) {
    const y = -2.2 + (i % 9) * 0.55, z = -0.6 + (i % 5) * 0.22;
    const a = [-3.8, y, z], b = [-1.3, y + Math.sin(i * 1.9) * 1.4, z + 0.35];
    const c = [1.3, y - Math.sin(i * 1.4) * 1.2, z - 0.1], d = [3.8, y + Math.cos(i) * 0.5, z];
    const glial = i % 3 === 0;
    tube(root, [a, b, c, d], i % 4 === 0 ? 0.045 : 0.024, glial ? C.glia : C.neuron,
      glial ? 'astrocyte' : 'neuropil', i === 0 ? 'Neuropile : prolongements neuronaux et gliaux' : null, 'neuropil');
    if (!glial && i % 4 === 1) {
      sphere(root, c, 0.085, C.axon, 'synapse', i === 1 ? 'Synapse — symbole agrandi, non visible à cette échelle optique' : null, 'axon');
    }
  }
  const cells = [[-2.9, -0.4, 0.55, 'astrocyte'], [1.5, 1.8, 0.5, 'oligodendrocyte'], [3.1, 0.9, 0.4, 'microglia']];
  for (const [x, y, z, cellId] of cells) {
    glialCell(root, [x, y, z], 0.22, cellId, C.glia,
      cellId === 'astrocyte' ? 'Cellules gliales du SNC' : null);
  }
  tube(root, [[-3.8, -1.8, 0.85], [-1, -0.8, 0.9], [1.3, 0.6, 0.8], [3.7, 1.7, 0.8]],
    0.11, C.artery, 'bbb', 'Capillaire sanguin', 'blood');
  if (id !== 'neuropil') myelinatedAxon(root, [0, -2, -0.1], 5.5, 'x', 'axon', 0.11, 3);
  return finish(root, id, id === 'neuropil' ? 'Neuropile : réseau de prolongements et synapses' : 'Substance grise — volume histologique schématique', 11,
    'Illustration, pas une photographie. Les synapses et prolongements sont séparés et grossis pour expliquer leur organisation ; la substance grise contient aussi de la myéline.');
}

function buildWhite(id) {
  const root = group(id);
  histologySlab(root, id);
  for (let iy = 0; iy < 5; iy++) {
    for (let iz = 0; iz < 3; iz++) {
      myelinatedAxon(root, [0, (iy - 2) * 0.95, (iz - 1) * 0.7], 7.7, 'x', 'axon', 0.22, 3,
        iy === 4 && iz === 2);
    }
  }
  const oligo = glialCell(root, [-0.3, 0.3, 1.2], 0.36, 'oligodendrocyte', C.glia, 'Oligodendrocyte — corps cellulaire glial');
  for (const at of [[-1.5, 0.95, 0.7], [1.2, 0, 0.7], [1.2, -0.95, 0.7]]) {
    tube(root, [[-0.3, 0.3, 1.2], mix([-0.3, 0.3, 1.2], at, 0.5), at], 0.055, C.glia, 'oligodendrocyte', null, 'neuropil');
  }
  glialCell(root, [2.6, 1.7, 1.05], 0.25, 'astrocyte', C.astro, 'Astrocyte');
  glialCell(root, [-2.5, -1.7, 1.05], 0.2, 'microglia', C.micro, 'Microglie');
  tube(root, [[-3.8, -2.3, 1.0], [0, -1.5, 1.2], [3.8, -2, 1.0]], 0.12,
    C.artery, 'bbb', 'Capillaire sanguin', 'blood');
  // Keep a reference for inspection without inventing a neuronal soma in SB.
  oligo.userData.isGlialSoma = true;
  return finish(root, id, 'Substance blanche — faisceaux axonaux et glie', 11,
    'Illustration histologique schématique. Les noyaux visibles sont gliaux ; aucun corps cellulaire neuronal ni synapse n’est ajouté dans ce modèle de substance blanche du cours.');
}

function buildNerve(id) {
  const root = group(id);
  const length = 6.5;
  // A longitudinally open outer capsule reveals the organisation before any
  // further user-controlled clipping. This is an opened specimen, not damage.
  const para = shell(root, [0, 0, 0], 2.29, 2.4, length, 0x93a6ba, 'paraneurium', 'Paranèvre — capsule externe', 'collagen', 0.54, Math.PI);
  const epi = shell(root, [0, 0, 0], 2.0, 2.28, length, 0xbccdd8, 'epineurium', 'Épinèvre — tissu conjonctif dense', 'collagen', 0.4, Math.PI);
  para.rotation.y = epi.rotation.y = Math.PI / 2;
  const fascicles = [[-0.84, -0.45], [0.84, -0.45], [0, 0.97]];
  fascicles.forEach(([x, z], fi) => {
    const g = group('fascicle');
    root.add(g);
    g.position.set(x, 0, z);
    for (let j = 0; j < 10; j++) {
      const peri = shell(g, [0, 0, 0], 0.704 + j * 0.009, 0.709 + j * 0.009, length - 0.18,
        j % 2 ? 0x7f9fc0 : 0xc1d0e1, 'perineurium', fi === 0 && j === 9 ? 'Périnèvre : couches de cellules périneurales' : null,
        'perineurium', 0.3, Math.PI);
      peri.rotation.y = Math.PI / 2;
    }
    // Flattened nuclei belong to the perineurial cell layers, not fibroblasts.
    for (let j = 0; j < 5; j++) {
      const a = Math.PI / 2 + (j + 0.5) * Math.PI / 5;
      const m = sphere(g, [Math.sin(a) * 0.78, (j - 2) * 1.05, Math.cos(a) * 0.78],
        [0.04, 0.18, 0.07], C.nucleus, 'perineurium', null, 'nucleus');
      m.rotation.y = a;
    }
    const endo = shell(g, [0, 0, 0], 0.01, 0.69, length - 0.12, 0xc3d4dc,
      'fascicle', fi === 0 ? 'Fascicule : fibres et endonèvre dans une gaine périneurale' : null, 'collagen', 0.075);
    endo.userData.fascicleInterior = true;
    for (let n = 0; n < 11; n++) {
      const a = n * 2.39996, r = n ? 0.5 * Math.sqrt(n / 10) : 0;
      const px = Math.cos(a) * r, pz = Math.sin(a) * r;
      myelinatedAxon(g, [px, 0, pz], length - 0.35, 'y', 'axon', 0.1, 3, fi === 0 && n === 0);
      if (n === 3 || n === 8) {
        sphere(g, [px + 0.1, 0.25, pz], [0.05, 0.21, 0.06], C.nucleus,
          'schwann', fi === 0 && n === 3 ? 'Cellule de Schwann' : null, 'nucleus');
      }
    }
    // Small unmyelinated axons remain associated with nonmyelinating Schwann.
    sphere(g, [0.38, 0, -0.32], [0.13, length / 2 - 0.2, 0.13], C.glia,
      'schwann', fi === 0 ? 'Fibres amyéliniques associées à Schwann' : null, 'cytoplasm', 0.4);
    for (let n = 0; n < 3; n++) {
      const a = n * Math.PI * 2 / 3;
      rod(g, [0.38 + Math.cos(a) * 0.055, -length / 2 + 0.15, -0.32 + Math.sin(a) * 0.055],
        [0.38 + Math.cos(a) * 0.055, length / 2 - 0.15, -0.32 + Math.sin(a) * 0.055], 0.026,
        C.axon, 'axon', null, 'axon');
    }
    rod(g, [-0.32, -3, 0.37], [-0.32, 3, 0.37], 0.045, C.artery,
      'endoneurium', fi === 0 ? 'Capillaire endoneural continu' : null, 'blood');
    for (let n = 0; n < 5; n++) {
      const cx = Math.cos(n * 1.9) * 0.6, cz = Math.sin(n * 1.9) * 0.6;
      rod(g, [cx, -3, cz], [cx + 0.04, 3, cz - 0.05], 0.01, C.collagen, 'endoneurium',
        fi === 0 && n === 0 ? 'Endonèvre — tissu conjonctif lâche intrafasciculaire' : null, 'collagen');
    }
    sphere(g, [-0.48, -1, 0.3], [0.05, 0.25, 0.09], C.nucleus,
      'endoneurium', fi === 0 ? 'Fibroblaste endoneural — noyau allongé' : null, 'nucleus');
  });
  tube(root, [[-1.6, -3, 0.8], [-1.7, 0, 0.6], [-1.55, 3.2, 0.9]], 0.12,
    C.artery, 'epineurium', 'Vasa nervorum dans l’épinèvre', 'blood');
  tube(root, [[1.65, -3, 0.65], [1.72, 0, 0.65], [1.5, 3, 0.85]], 0.14,
    C.vein, 'epineurium', null, 'blood');
  for (let j = 0; j < 9; j++) {
    const at = [Math.sin(j * 2.2) * 1.2, (j % 5 - 2) * 1.1, -1.25 + (j % 2) * 0.15];
    sphere(root, at, [0.25, 0.33, 0.25], 0xede5b8, 'epineurium', j === 0 ? 'Adipocytes épineuraux' : null, 'adipocyte', 0.7);
    sphere(root, [at[0] + 0.22, at[1], at[2]], [0.04, 0.11, 0.05], C.nucleus,
      'epineurium', null, 'nucleus');
  }
  for (let j = 0; j < 8; j++) {
    const a = j * 2.4;
    tube(root, [[Math.sin(a) * 2.05, -3.2, Math.cos(a) * 2.05],
      [Math.sin(a + 0.15) * 2.05, 0, Math.cos(a + 0.15) * 2.05],
      [Math.sin(a + 0.3) * 2.05, 3.2, Math.cos(a + 0.3) * 2.05]], 0.025,
      C.collagen, 'epineurium', j === 0 ? 'Faisceaux collagéniques épineuraux' : null, 'collagen');
  }
  root.rotation.x = 0.45;
  root.rotation.z = -0.2;
  return finish(root, id, 'Nerf périphérique ouvert et fascicules', 11,
    'Spécimen schématique ouvert longitudinalement. Dix couches périneurales sont figurées : cellules spécialisées aplaties, et non simple tissu conjonctif dense. Le nombre de fibres est volontairement réduit.');
}

function buildGanglion(id) {
  const sensory = id === 'sensory-ganglion';
  const root = group(id);
  sphere(root, [0, 0, 0], [3.7, 2.7, 1.8], C.collagen, id, 'Capsule conjonctive ganglionnaire', 'collagen', 0.13);
  const positions = [[-2, 1, 0.5], [0.1, 1.25, 0.3], [2, 0.55, 0.2], [-1.1, -1.1, 0.4], [1.2, -1.1, 0.5]];
  positions.forEach((p, i) => {
    const radius = sensory ? 0.61 : 0.54;
    soma(root, p, radius, 'neuron', i === 0 ? (sensory ? 'Neurone sensitif pseudounipolaire' : 'Neurone autonome multipolaire') : null);
    const satellites = sensory ? 9 : 4;
    for (let j = 0; j < satellites; j++) {
      const a = j * Math.PI * 2 / satellites;
      const x = p[0] + Math.cos(a) * (radius + 0.14), y = p[1] + Math.sin(a) * (radius + 0.14);
      const s = sphere(root, [x, y, p[2] + 0.03], [0.12, 0.2, 0.12], C.glia, 'satellite',
        i === 0 && j === 0 ? 'Cellules satellites' : null, 'cytoplasm');
      s.rotation.z = a;
      sphere(root, [x, y, p[2] + 0.13], 0.07, C.nucleus, 'satellite', null, 'nucleus');
    }
    if (sensory) {
      const stem = [p[0] - 0.4, p[1] - 1, p[2] - 0.35];
      tube(root, [p, [p[0] - 0.3, p[1] - 0.6, p[2] - 0.2], stem], 0.07,
        C.axon, 'axon', i === 0 ? 'Prolongement unique et bifurcation en T' : null, 'axon');
      // The two branches are continuous: no synaptic buttons are generated.
      tube(root, [[-4.1, stem[1], -0.4 - i * 0.14], stem, [4.1, stem[1] + 0.18, -0.4 - i * 0.14]],
        0.055, C.axon, 'axon', null, 'axon');
    } else {
      branches(root, p, 0.035, 'dendrite', C.neuron, 3, 0.8, 0);
      const bouton = [p[0] + 0.4, p[1] - 0.3, p[2] + 0.35];
      tube(root, [[-4.3, p[1] - 0.8, -0.6], [p[0] - 0.6, p[1] - 0.9, 0.2], bouton],
        0.055, C.axon, 'axon', i === 0 ? 'Fibre préganglionnaire' : null, 'axon');
      sphere(root, bouton, 0.15, 0xf7ac7e, 'synapse', i === 0 ? 'Synapse ganglionnaire' : null, 'axon');
      tube(root, [p, [p[0] + 0.8, p[1] + 0.3, -0.2], [4.2, p[1] + 0.7, -0.7]],
        0.055, C.axon, 'axon', i === 0 ? 'Axone postganglionnaire' : null, 'axon');
    }
  });
  return finish(root, id, sensory ? 'Ganglion sensitif : neurones pseudounipolaires' : 'Ganglion autonome : relais synaptique', 11,
    sensory ? 'Fibres de passage et bifurcations en T ; aucune synapse intraganglionnaire n’est figurée. Les cellules satellites entourent les somas.'
      : 'Des fibres préganglionnaires établissent des synapses avec les neurones ganglionnaires. Les nombres et la disposition des cellules sont schématiques.');
}

function bbbUnit(parent, offset = [0, 0, 0], scale = 1) {
  const root = group('bbb');
  root.position.copy(v(offset));
  root.scale.setScalar(scale);
  parent.add(root);
  const cap = group('bbb');
  root.add(cap);
  cap.rotation.z = Math.PI / 2;
  rod(cap, [0, -3.5, 0], [0, 3.5, 0], 0.53, C.artery, 'bbb', 'Lumière capillaire sanguine', 'blood', 0.55);
  for (let i = 0; i < 6; i++) {
    const m = shell(cap, [0, 0, 0], 0.56, 0.69, 6.9, i % 2 ? 0xc68ba0 : 0xd3a2b4,
      'bbb', i === 0 ? 'Endothélium capillaire continu' : null, 'endothelium', 0.8, Math.PI / 3 - 0.025);
    m.rotation.y = i * Math.PI / 3;
    const a = i * Math.PI / 3;
    rod(cap, [Math.sin(a) * 0.7, -3.45, Math.cos(a) * 0.7], [Math.sin(a) * 0.7, 3.45, Math.cos(a) * 0.7],
      0.032, C.tight, 'bbb', i === 0 ? 'Jonctions serrées entre cellules endothéliales' : null, 'junction');
  }
  shell(cap, [0, 0, 0], 0.71, 0.76, 7, C.collagen, 'bbb', 'Lame basale', 'collagen', 0.25);
  sphere(root, [0.8, -0.72, 0.32], [0.72, 0.16, 0.25], 0x9686b7,
    'bbb', 'Péricyte, au contact de la lame basale', 'cytoplasm');
  tube(root, [[0.7, -0.68, 0.3], [-0.6, -0.8, 0.3], [-1.8, -0.5, 0.6]], 0.085,
    0x9686b7, 'bbb', null, 'cytoplasm');
  glialCell(root, [0, 2.4, 0], 0.6, 'astrocyte', C.astro, 'Astrocyte périvasculaire');
  for (let i = 0; i < 4; i++) {
    const x = -2.5 + i * 1.65;
    tube(root, [[0, 2.3, 0], [x * 0.6, 1.4, 0.4], [x, 0.8, 0.3]], 0.1,
      C.astro, 'astrocyte', null, 'neuropil');
    sphere(root, [x, 0.75, 0.25], [0.73, 0.2, 0.51], C.astro, 'astrocyte',
      i === 0 ? 'Pieds astrocytaires — hors de l’endothélium' : null, 'cytoplasm', 0.8);
  }
  return root;
}

function bloodCsfUnit(parent, offset = [0, 0, 0], scale = 1) {
  const root = group('blood-csf');
  root.position.copy(v(offset));
  root.scale.setScalar(scale);
  parent.add(root);
  ependymalSheet(root, [0, 0.5, 0], true);
  box(root, [0, 1.85, 0], [6.5, 0.25, 3.4], C.csf, 'csf', 'LCS du ventricule — face apicale', null, 0.1);
  box(root, [0, -0.12, 0], [6.3, 0.22, 3.1], C.collagen,
    'choroid-plexus', 'Stroma conjonctif du plexus choroïde', 'collagen', 0.25);
  tube(root, [[-3.1, -1.1, 0], [0, -1.25, 0.2], [3.1, -1.1, 0]], 0.36,
    C.artery, 'choroid-plexus', 'Capillaire choroïdien fenestré', 'blood', 0.72);
  for (let i = 0; i < 13; i++) {
    const m = mesh(root, new THREE.TorusGeometry(0.07, 0.02, 5, 10), 0xf5dce3,
      'choroid-plexus', i === 0 ? 'Fenestrations capillaires — symboles agrandis' : null, 'endothelium');
    m.position.set(-2.7 + i * 0.45, -1.04, 0.36);
  }
  return root;
}

function buildInterfaces(id) {
  const root = group(id);
  if (id === 'bbb') {
    bbbUnit(root);
    return finish(root, id, 'BHE : endothélium et unité neurovasculaire', 11,
      'Les jonctions serrées sont celles des cellules endothéliales. Péricytes et pieds astrocytaires accompagnent la barrière ; ces derniers ne remplacent pas ses jonctions endothéliales.');
  }
  if (id === 'blood-csf') {
    bloodCsfUnit(root);
    return finish(root, id, 'Barrière sang–LCS au plexus choroïde', 11,
      'Les jonctions serrées sont celles de l’épithélium choroïdien. Le capillaire sous-jacent est fenestré : il n’est pas représenté comme l’endothélium étanche de la BHE.');
  }
  bbbUnit(root, [-4.4, 0, 0], 0.85);
  bloodCsfUnit(root, [4.4, 0, 0], 0.85);
  return finish(root, id, 'Comparer BHE (gauche) et barrière sang–LCS (droite)', 18,
    'Deux interfaces distinctes, juxtaposées sans continuité anatomique et à des dimensions pédagogiques. L’épendyme ordinaire dispose de sa propre vue.');
}

const nerveIds = new Set(['nerve', 'paraneurium', 'epineurium', 'perineurium', 'endoneurium', 'fascicle']);
const axonIds = new Set(['axon', 'myelin', 'node']);

/** Build only microscopic representatives owned by this module. Unsupported
 * IDs deliberately return null so the scene can select an anatomical builder.
 */
export function buildMicro(id) {
  if (id === 'neuron') return buildNeuron(id);
  if (id === 'astrocyte') return buildAstrocyte(id);
  if (id === 'oligodendrocyte') return buildOligodendrocyte(id);
  if (id === 'schwann') return buildSchwann(id);
  if (id === 'microglia') return buildMicroglia(id);
  if (id === 'ependymocyte' || id === 'ependyma') return buildEpendymocyte(id);
  if (id === 'satellite') return buildSatellite(id);
  if (id === 'synapse') return buildSynapse(id);
  if (id === 'dendrite') return buildDendrite(id);
  if (axonIds.has(id)) return buildAxon(id);
  if (id === 'gray-matter' || id === 'neuropil') return buildGray(id);
  if (id === 'white-matter') return buildWhite(id);
  if (nerveIds.has(id)) return buildNerve(id);
  if (id === 'sensory-ganglion' || id === 'autonomic-ganglion') return buildGanglion(id);
  if (id === 'interfaces' || id === 'bbb' || id === 'blood-csf') return buildInterfaces(id);
  return null;
}
