import * as THREE from './assets/vendor/three.module.js';
import { OrbitControls } from './assets/vendor/OrbitControls.js';

// The scene owns only display state. Scientific names and geometry are supplied
// by the lazily loaded builders; changing magnification replaces the model.
const ANATOMY = new Set(['body', 'head', 'spine', 'upper-limb', 'lower-limb', 'digestive',
  'brain', 'cerebellum', 'brainstem', 'spinal-cord', 'dorsal-root', 'ventral-root',
  'cortex', 'corpus-callosum', 'basal-nuclei', 'meninges', 'spinal-meninges', 'scalp', 'skull',
  'periosteum', 'dura', 'dural-sinus', 'falx', 'tentorium', 'arachnoid',
  'subarachnoid', 'pia', 'glia-limitans', 'csf', 'lateral-ventricles', 'monro',
  'third-ventricle', 'aqueduct', 'fourth-ventricle', 'median-aperture',
  'lateral-apertures', 'cisterns', 'perimedullary', 'central-canal',
  'choroid-plexus', 'granulations', 'lymphatics', 'enteric', 'meissner', 'auerbach']);
const AXES = { sagittal: 'x', coronal: 'z', axial: 'y' };
const BODY_LABELS = new Set(['body', 'head', 'spine', 'upper-limb', 'lower-limb', 'digestive', 'spinal-cord', 'nerve', 'sensory-ganglion']);
const clamp = (number, min, max) => Math.min(max, Math.max(min, number));
const vec = value => value?.isVector3 ? value.clone() : new THREE.Vector3(...(value || [0, 0, 0]));

function release(root) {
  if (!root) return;
  const geometries = new Set(), materials = new Set();
  root.traverse(node => {
    if (node.geometry) geometries.add(node.geometry);
    if (node.material) for (const material of [].concat(node.material)) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  root.removeFromParent();
}

export class NeuroScene {
  constructor(container, { onSelect, onStatus, onChange } = {}) {
    this.container = container;
    this.onSelect = onSelect || (() => {});
    this.onStatus = onStatus || (() => {});
    this.onChange = onChange || (() => {});
    this.disposed = false;
    this.error = null;
    this.viewId = null;
    this.selectionId = null;
    this.labelsEnabled = true;
    this.layers = new Map();
    this.labelNodes = [];
    this.meshes = [];
    this.animators = [];
    this.flow = { playing: false, speed: 1, time: 0 };
    this.flowParticles = [];
    this.flowPaths = [];
    this.section = { enabled: false, axis: 'sagittal', position: 0 };
    this.explode = 0;
    this.stain = 'natural';
    this.microgliaActive = false;
    this.nervousOnly = false;
    this.frameCount = 0;
    this._generation = 0;
    this._raf = null;
    this._lastFrame = null;
    this._lastNotify = 0;
    this._dirty = true;
    this._settleFrames = 0;
    this.renderedViewId = null;
    this._pointers = new Map();
    this._gesture = false;
    this._motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._reduced = this._motion.matches;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, .01, 1000);
    this.camera.position.set(0, 2, 24);
    this.raycaster = new THREE.Raycaster();
    this.bounds = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
    this.cutPlane = new THREE.Plane();
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
      this.renderer.localClippingEnabled = true;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const canvas = this.renderer.domElement;
      canvas.className = 'neuro-canvas';
      canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
      canvas.tabIndex = 0;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Modèle 3D interactif. Glisser pour tourner, pincer pour zoomer, deux doigts pour déplacer.');
      this.container.append(canvas);
      this.controls = new OrbitControls(this.camera, canvas);
      this.controls.enableDamping = !this._reduced;
      this.controls.dampingFactor = .1;
      this.controls.rotateSpeed = .65;
      this.controls.panSpeed = .8;
      this.controls.minDistance = .1;
      this.controls.maxDistance = 120;
      this.controls.touches.ONE = THREE.TOUCH.ROTATE;
      this.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
      this._controlChange = () => this.requestRender();
      this._controlStart = () => { this._cameraAnimation = null; };
      this.controls.addEventListener('change', this._controlChange);
      this.controls.addEventListener('start', this._controlStart);
      this._pointerDown = event => {
        this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, moved: false });
        if (this._pointers.size > 1) this._gesture = true;
      };
      this._pointerMove = event => {
        const start = this._pointers.get(event.pointerId);
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 8) start.moved = true;
      };
      this._pointerUp = event => {
        const start = this._pointers.get(event.pointerId);
        this._pointers.delete(event.pointerId);
        if (start && !start.moved && !this._gesture && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 8) this._pick(event);
        if (!this._pointers.size) this._gesture = false;
      };
      this._pointerCancel = event => {
        this._pointers.delete(event.pointerId);
        if (!this._pointers.size) this._gesture = false;
      };
      canvas.addEventListener('pointerdown', this._pointerDown);
      canvas.addEventListener('pointermove', this._pointerMove);
      canvas.addEventListener('pointerup', this._pointerUp);
      canvas.addEventListener('pointercancel', this._pointerCancel);
      this._contextLost = event => {
        event.preventDefault();
        this.error = 'Le contexte WebGL a été interrompu. Rechargez la page pour rétablir la vue 3D.';
        this.onStatus(this.error, 'error');
      };
      canvas.addEventListener('webglcontextlost', this._contextLost);
      this.labelLayer = document.createElement('div');
      this.labelLayer.className = 'neuro-labels';
      this.labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1;';
      this.container.append(this.labelLayer);
      if (getComputedStyle(this.container).position === 'static') this.container.style.position = 'relative';
      this.scene.add(new THREE.HemisphereLight(0xb7dafa, 0x20345c, 2));
      const key = new THREE.DirectionalLight(0xe1f3ff, 3.1);
      key.position.set(9, 15, 14);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.bias = -.0005;
      key.shadow.camera.left = key.shadow.camera.bottom = -12;
      key.shadow.camera.right = key.shadow.camera.top = 12;
      this.scene.add(key);
      const rim = new THREE.DirectionalLight(0x5994ff, 2.1);
      rim.position.set(-9, 4, -10);
      this.scene.add(rim);
      this._resizeObserver = new ResizeObserver(() => this.resize());
      this._resizeObserver.observe(this.container);
      // WebKit may suspend presentation of an off-screen WebGL canvas. Redraw
      // when it enters the viewport instead of displaying an old backing store.
      this._intersectionObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) this.requestRender(2);
      });
      this._intersectionObserver.observe(this.container);
      this._visibilityChange = () => {
        this._lastFrame = null;
        if (document.hidden && this._raf !== null) { cancelAnimationFrame(this._raf); this._raf = null; }
        else this.requestRender();
      };
      document.addEventListener('visibilitychange', this._visibilityChange);
      this._motionChange = event => {
        this._reduced = event.matches;
        this.controls.enableDamping = !this._reduced;
        this._cameraAnimation = null;
        this.requestRender();
      };
      this._motion.addEventListener('change', this._motionChange);
      this.resize();
    } catch (error) {
      this.error = 'La 3D WebGL est indisponible dans ce navigateur. Les fiches et la navigation restent accessibles.';
      this.renderer?.dispose();
      this.renderer?.domElement.remove();
      this.renderer = null;
      const fallback = document.createElement('p');
      fallback.className = 'neuro-webgl-fallback scene-fallback';
      fallback.textContent = this.error;
      fallback.setAttribute('role', 'status');
      this.container.append(fallback);
      this.fallback = fallback;
      this.onStatus(this.error, 'error');
    }
  }

  async show(id) {
    const generation = ++this._generation;
    if (!this.renderer || this.disposed) return false;
    this.onStatus('Chargement du modèle 3D…', 'loading');
    try {
      const anatomyFirst = ANATOMY.has(id);
      const module = await (anatomyFirst ? import('./models-anatomy.js') : import('./models-micro.js'));
      let model = anatomyFirst ? module.buildAnatomy(id) : module.buildMicro(id);
      if (!model) {
        const alternate = await (anatomyFirst ? import('./models-micro.js') : import('./models-anatomy.js'));
        model = anatomyFirst ? alternate.buildMicro(id) : alternate.buildAnatomy(id);
      }
      if (!model?.root?.isObject3D) throw new Error(`Modèle non disponible : ${id}`);
      if (generation !== this._generation || this.disposed) { release(model.root); return false; }
      this._clearModel();
      this.viewId = id;
      this.model = model;
      this.root = model.root;
      this.root.updateMatrixWorld(true);
      this.scene.add(this.root);
      this.explode = 0;
      this.nervousOnly = false;
      this.flow.time = 0;
      this.meshes = [];
      this.layers.clear();
      this.animators = [];
      const originals = new Set();
      this.root.traverse(node => {
        if (typeof node.userData.animate === 'function') this.animators.push(node);
        if (node.userData.layer) {
          const layerId = node.userData.layer;
          let layer = this.layers.get(layerId);
          if (!layer) {
            layer = { id: layerId, label: node.userData.label || node.name || layerId, visible: true, opacity: 1, nodes: [] };
            this.layers.set(layerId, layer);
          }
          layer.nodes.push(node);
          node.userData._neuroBasePosition = node.position.clone();
          node.userData._neuroOriginalVisible = node.visible;
        }
        if (node.isMesh || node.isLine || node.isPoints) {
          if (node.material) {
            const mapped = [].concat(node.material).map(original => {
              originals.add(original);
              const material = original.clone();
              material.userData = { ...original.userData };
              material.userData._neuroOriginal = {
                color: material.color?.getHex(), opacity: material.opacity,
                transparent: material.transparent, depthWrite: material.depthWrite,
                emissive: material.emissive?.getHex(), emissiveIntensity: material.emissiveIntensity,
              };
              material.clipShadows = true;
              return material;
            });
            node.material = Array.isArray(node.material) ? mapped : mapped[0];
          }
          if (node.isMesh) {
            node.castShadow = [].concat(node.material).some(material => material.opacity >= .9);
            node.receiveShadow = true;
            this.meshes.push(node);
          }
        }
      });
      for (const material of originals) material.dispose();
      this.root.updateMatrixWorld(true);
      this.bounds.setFromObject(this.root);
      const size = this.bounds.getSize(new THREE.Vector3());
      this._modelExtent = Math.max(size.x, size.y, size.z, .1);
      this.controls.minDistance = this._modelExtent * .09;
      this.controls.maxDistance = this._modelExtent * 14;
      this.camera.near = Math.max(.001, this._modelExtent / 1000);
      this.camera.far = this._modelExtent * 120;
      this.camera.updateProjectionMatrix();
      this._homeTarget = model.target ? vec(model.target) : this.bounds.getCenter(new THREE.Vector3());
      this._homeDirection = model.cameraDirection ? vec(model.cameraDirection).normalize() : new THREE.Vector3(.12, .07, 1).normalize();
      this._homeDistance = model.cameraDistance || this._modelExtent * 1.8;
      if (id === 'body') {
        const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
        this._homeDistance = Math.max(this._homeDistance, size.y / (2 * Math.tan(halfFov)) * 1.13 + size.z / 2);
      }
      this._createLabels();
      this._createFlow(model.flowPaths || []);
      this.setSection(this.section);
      this.setStain(this.stain);
      this.setMicrogliaActive(this.microgliaActive);
      this.setSelection(this.selectionId);
      this.reset(true);
      this.error = null;
      this.requestRender(3);
      this.onStatus(model.scaleNote || 'Modèle schématique interactif.', 'ready');
      this._notify(true);
      return true;
    } catch (error) {
      if (generation !== this._generation || this.disposed) return false;
      this.error = error.message || 'Impossible de charger le modèle 3D.';
      this.onStatus(this.error, 'error');
      this._notify(true);
      return false;
    }
  }

  _clearModel() {
    if (this.root) release(this.root);
    this.root = null;
    this.model = null;
    this.labelLayer?.replaceChildren();
    this.labelNodes = [];
    this.flowParticles = [];
    this.flowPaths = [];
    this.animators = [];
    this.meshes = [];
    this.layers.clear();
    this._cameraAnimation = null;
  }

  _createLabels() {
    const seen = new Set();
    this.root.traverse(node => {
      const id = node.userData.structure;
      const text = node.userData.label;
      if (!id || !text || seen.has(id)) return;
      if (this.viewId === 'body' && !BODY_LABELS.has(id)) return;
      seen.add(id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'neuro-label scene-label';
      button.textContent = text;
      button.dataset.structure = id;
      button.setAttribute('aria-label', `Sélectionner : ${text}`);
      button.style.cssText = 'position:absolute;pointer-events:auto;transform:translate(-50%,-50%);touch-action:manipulation;';
      button.addEventListener('pointerdown', event => event.stopPropagation());
      button.addEventListener('click', event => { event.stopPropagation(); this._select(id); });
      const leader = document.createElement('span');
      leader.className = 'neuro-label-leader';
      leader.setAttribute('aria-hidden', 'true');
      leader.style.cssText = 'position:absolute;height:1px;background:#7cbcd180;transform-origin:0 0;pointer-events:none;';
      this.labelLayer.append(leader, button);
      const center = new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3());
      node.worldToLocal(center);
      this.labelNodes.push({ id, text, button, leader, node, center, visible: false });
    });
  }

  _createFlow(paths) {
    this.flowPaths = paths.filter(path => path.isMain !== false && path.points?.length > 1);
    if (!this.flowPaths.length) return;
    const group = new THREE.Group();
    group.name = 'Circulation schématique du LCS';
    const geometry = new THREE.SphereGeometry(this._modelExtent * .009, 8, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0xa9eeff, transparent: true, opacity: .92, depthWrite: false });
    this.flowPaths.forEach((path, pathIndex) => {
      const curve = new THREE.CatmullRomCurve3(path.points.map(vec), false, 'centripetal');
      for (let index = 0; index < 18; index++) {
        const particle = new THREE.Mesh(geometry, material);
        particle.userData.flowParticle = true;
        particle.position.copy(curve.getPointAt(index / 18));
        group.add(particle);
        this.flowParticles.push({ particle, curve, offset: index / 18, path: pathIndex, label: path.label || '' });
      }
    });
    this.root.add(group);
    this.flowGroup = group;
  }

  _select(id) {
    this.setSelection(id);
    this.onSelect(id);
  }

  _pick(event) {
    if (!this.root || !this.renderer) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    this.raycaster.setFromCamera(pointer, this.camera);
    this.root.updateMatrixWorld(true);
    for (const hit of this.raycaster.intersectObjects(this.meshes, false)) {
      let node = hit.object, id;
      let visible = true;
      for (let ancestor = node; ancestor && ancestor !== this.scene; ancestor = ancestor.parent) {
        if (!ancestor.visible) visible = false;
        if (!id && ancestor.userData.structure) id = ancestor.userData.structure;
      }
      if (!visible || !id || ![].concat(node.material).some(material => material.opacity > .025)) continue;
      if (this.section.enabled && this.cutPlane.distanceToPoint(hit.point) < 0) continue;
      this._select(id);
      break;
    }
  }

  setSelection(id) {
    this.selectionId = id || null;
    for (const mesh of this.meshes) {
      let selected = false;
      for (let node = mesh; node && node !== this.scene; node = node.parent) {
        if (node.userData.structure === id) selected = true;
      }
      for (const material of [].concat(mesh.material)) {
        if (!material.emissive) continue;
        const original = material.userData._neuroOriginal;
        material.emissive.setHex(selected ? 0x1896bf : original.emissive || 0);
        material.emissiveIntensity = selected ? .38 : original.emissiveIntensity ?? 1;
      }
    }
    for (const label of this.labelNodes) label.button.setAttribute('aria-pressed', String(label.id === id));
    this.requestRender();
  }

  resize() {
    if (!this.renderer || this.disposed) return;
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  reset(transition = false) {
    if (!this.controls || !this._homeTarget) return;
    const target = this._homeTarget.clone();
    // A portrait viewport needs more distance to fit the same model horizontally.
    const distance = this._homeDistance * Math.max(1, .85 / this.camera.aspect);
    const position = target.clone().add(this._homeDirection.clone().multiplyScalar(distance));
    if (transition && !this._reduced && this.frameCount) {
      this._cameraAnimation = { from: this.camera.position.clone(), to: position,
        targetFrom: this.controls.target.clone(), targetTo: target, start: performance.now(), duration: 520 };
    } else {
      this._cameraAnimation = null;
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      this.controls.update();
    }
    this.requestRender();
  }

  zoom(factor) {
    if (!this.controls || !Number.isFinite(Number(factor)) || Number(factor) <= 0) return;
    this._cameraAnimation = null;
    const delta = this.camera.position.clone().sub(this.controls.target);
    delta.setLength(clamp(delta.length() / Number(factor), this.controls.minDistance, this.controls.maxDistance));
    this.camera.position.copy(this.controls.target).add(delta);
    this.controls.update();
    this.requestRender();
  }

  setLabels(enabled) {
    this.labelsEnabled = Boolean(enabled);
    this.requestRender();
    this._notify(true);
  }

  setLayer(id, { visible, opacity } = {}) {
    const layer = this.layers.get(id);
    if (!layer) return false;
    if (visible !== undefined) layer.visible = Boolean(visible);
    if (Number.isFinite(Number(opacity))) layer.opacity = clamp(Number(opacity), 0, 1);
    this._applyLayers();
    this._notify(true);
    return true;
  }

  _applyLayers() {
    for (const layer of this.layers.values()) {
      const excluded = this.nervousOnly && ['skin', 'muscles', 'bones'].includes(layer.id);
      for (const node of layer.nodes) node.visible = node.userData._neuroOriginalVisible && layer.visible && !excluded;
    }
    for (const mesh of this.meshes) {
      let opacity = 1;
      for (let node = mesh; node && node !== this.scene; node = node.parent) {
        if (node.userData.layer && this.layers.has(node.userData.layer)) opacity *= this.layers.get(node.userData.layer).opacity;
      }
      for (const material of [].concat(mesh.material)) {
        const original = material.userData._neuroOriginal;
        material.opacity = original.opacity * opacity;
        material.transparent = original.transparent || material.opacity < .995;
        material.depthWrite = material.opacity < .25 ? false : original.depthWrite;
        material.needsUpdate = true;
      }
    }
    this.requestRender();
  }

  isolateNervous(enabled) {
    this.nervousOnly = Boolean(enabled);
    this._applyLayers();
    this._notify(true);
  }

  setSection({ enabled = this.section.enabled, axis = this.section.axis, position = this.section.position } = {}) {
    this.section = { enabled: Boolean(enabled), axis: AXES[axis] ? axis : 'sagittal', position: clamp(Number(position) || 0, -1, 1) };
    const coordinate = AXES[this.section.axis];
    const minimum = this.bounds.min[coordinate], maximum = this.bounds.max[coordinate];
    const cutPosition = minimum + (this.section.position + 1) / 2 * (maximum - minimum);
    const normal = new THREE.Vector3();
    normal[coordinate] = -1;
    this.cutPlane.set(normal, cutPosition);
    this.root?.traverse(node => {
      if (!node.material) return;
      for (const material of [].concat(node.material)) {
        material.clippingPlanes = this.section.enabled ? [this.cutPlane] : [];
        material.needsUpdate = true;
      }
    });
    this.requestRender();
    this._notify(true);
  }

  setExplode(value) {
    this.explode = clamp(Number(value) || 0, 0, 1);
    for (const layer of this.layers.values()) {
      for (const node of layer.nodes) {
        const supplied = node.userData.explodeOffset || node.userData.explodeDirection;
        const index = this.model?.layerOrder?.indexOf(layer.id) ?? -1;
        const offset = supplied ? vec(supplied) : new THREE.Vector3(0, index < 0 ? 0 : (this.model.layerOrder.length - index) * .35, 0);
        node.position.copy(node.userData._neuroBasePosition).addScaledVector(offset, this.explode);
      }
    }
    this.root?.updateMatrixWorld(true);
    this.requestRender();
    this._notify(true);
  }

  setFlow({ playing = this.flow.playing, speed = this.flow.speed } = {}) {
    this.flow.playing = Boolean(playing);
    this.flow.speed = clamp(Number(speed) || 1, .1, 5);
    this._lastFrame = null;
    this.requestRender();
    this._notify(true);
  }

  setStain(stain) {
    this.stain = ['natural', 'hes', 'toluidine', 'luxol', 'masson'].includes(stain) ? stain : 'natural';
    const palettes = {
      hes: { myelin: 0xe3c8db, nucleus: 0x55437c, cytoplasm: 0xd388a0, axon: 0xd88eaa, perineurium: 0xd388a0, collagen: 0xe2a4a0, blood: 0xc64d63, neuropil: 0xc4a0c4 },
      toluidine: { myelin: 0xb8c6e2, nucleus: 0x313d90, cytoplasm: 0x7797d2, axon: 0x6684bf, perineurium: 0x7797d2, collagen: 0xb7cae1, blood: 0x6889bd, neuropil: 0x9cadd9 },
      luxol: { myelin: 0x167fb1, nucleus: 0x544672, cytoplasm: 0xd0acd3, axon: 0xd593aa, perineurium: 0xd0acd3, collagen: 0xb4c4d5, blood: 0xb36c97, neuropil: 0xc2b7ce },
      masson: { myelin: 0xddc6c9, nucleus: 0x3c365c, cytoplasm: 0xc87585, axon: 0xbb5969, perineurium: 0xc87585, collagen: 0x3b9baf, blood: 0xbc394d, neuropil: 0xc4a7bc },
    };
    for (const mesh of this.meshes) {
      const tag = mesh.userData.histology;
      for (const material of [].concat(mesh.material)) {
        const original = material.userData._neuroOriginal;
        if (!material.color || original.color === undefined) continue;
        material.color.setHex(this.stain !== 'natural' && palettes[this.stain]?.[tag] !== undefined ? palettes[this.stain][tag] : original.color);
      }
    }
    this.requestRender();
    this._notify(true);
  }

  setMicrogliaActive(active) {
    this.microgliaActive = Boolean(active);
    this.root?.userData.setMicrogliaActive?.(this.microgliaActive);
    this.requestRender();
    this._notify(true);
  }

  _updateLabels() {
    const world = new THREE.Vector3(), projected = new THREE.Vector3();
    const pending = [];
    for (const label of this.labelNodes) {
      let visible = true;
      for (let node = label.node; node && node !== this.scene; node = node.parent) {
        if (!node.visible) visible = false;
        if (node.userData.layer && this.layers.get(node.userData.layer)?.opacity === 0) visible = false;
      }
      world.copy(label.center).applyMatrix4(label.node.matrixWorld);
      projected.copy(world).project(this.camera);
      if (Math.abs(projected.x) > .98 || Math.abs(projected.y) > .97 || Math.abs(projected.z) > 1) visible = false;
      if (this.section.enabled && this.cutPlane.distanceToPoint(world) < 0) visible = false;
      label.anchorVisible = visible;
      label.x = (projected.x * .5 + .5) * this.width;
      label.y = (-projected.y * .5 + .5) * this.height;
      visible = visible && this.labelsEnabled;
      label.visible = visible;
      label.button.hidden = !visible;
      label.leader.hidden = true;
      if (visible) {
        label.button.style.zIndex = String(Math.round((1 - projected.z) * 1000));
        pending.push(label);
      }
    }
    // Labels stay attached to projected geometry. When labels collide, move the
    // button a short distance and draw a leader back to its exact anchor.
    pending.sort((a, b) => (a.id === this.selectionId ? -1 : b.id === this.selectionId ? 1 : a.y - b.y));
    const occupied = [];
    for (const label of pending) {
      const width = Math.min(label.button.offsetWidth || 140, this.width - 12);
      const height = label.button.offsetHeight || 32;
      const direction = label.x < this.width / 2 ? -1 : 1;
      const offsets = [[0, 0]];
      for (const dy of [0, -40, 40, -80, 80, -120, 120]) {
        offsets.push([direction * (width / 2 + 35), dy], [-direction * (width / 2 + 35), dy]);
      }
      let chosen;
      for (const [dx, dy] of offsets) {
        const x = clamp(label.x + dx, width / 2 + 5, this.width - width / 2 - 5);
        const y = clamp(label.y + dy, height / 2 + 35, this.height - height / 2 - 30);
        const rect = { left: x - width / 2 - 3, right: x + width / 2 + 3, top: y - height / 2 - 3, bottom: y + height / 2 + 3 };
        if (!occupied.some(other => rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top)) {
          chosen = { x, y, rect };
          break;
        }
      }
      if (!chosen) {
        // The structure remains selectable through the adjacent atlas selector.
        label.visible = false;
        label.button.hidden = true;
        continue;
      }
      occupied.push(chosen.rect);
      label.button.style.left = `${chosen.x}px`;
      label.button.style.top = `${chosen.y}px`;
      const dx = chosen.x - label.x, dy = chosen.y - label.y;
      if (Math.hypot(dx, dy) > 6) {
        label.leader.hidden = false;
        label.leader.style.left = `${label.x}px`;
        label.leader.style.top = `${label.y}px`;
        label.leader.style.width = `${Math.hypot(dx, dy)}px`;
        label.leader.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      }
    }
  }

  requestRender(frames = 1) {
    this._dirty = true;
    this._settleFrames = Math.max(this._settleFrames, frames);
    if (this.disposed || !this.renderer || document.hidden || this._raf !== null) return;
    this._raf = requestAnimationFrame(time => this._render(time));
  }

  _render(time) {
    this._raf = null;
    if (this.disposed || !this.renderer || document.hidden) return;
    this._settleFrames = Math.max(0, this._settleFrames - 1);
    const delta = this._lastFrame === null ? 0 : Math.min((time - this._lastFrame) / 1000, .06);
    this._lastFrame = time;
    let moving = Boolean(this._cameraAnimation);
    if (this._cameraAnimation) {
      const animation = this._cameraAnimation;
      const progress = clamp((time - animation.start) / animation.duration, 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      this.camera.position.lerpVectors(animation.from, animation.to, eased);
      this.controls.target.lerpVectors(animation.targetFrom, animation.targetTo, eased);
      if (progress === 1) this._cameraAnimation = null;
    }
    moving = this.controls.update() || moving;
    const flowing = this.flow.playing && this.flowParticles.length > 0;
    if (flowing) {
      this.flow.time += delta * this.flow.speed;
      for (const entry of this.flowParticles) entry.particle.position.copy(entry.curve.getPointAt((entry.offset + this.flow.time * .055) % 1));
    }
    const localAnimation = this.animators.length > 0 && (!this._reduced || flowing);
    if (localAnimation) for (const node of this.animators) node.userData.animate(delta, time / 1000);
    this.scene.updateMatrixWorld(true);
    this._updateLabels();
    this.renderer.render(this.scene, this.camera);
    this.renderedViewId = this.viewId;
    this.frameCount++;
    this._dirty = false;
    this._notify();
    if (moving || flowing || localAnimation || this._settleFrames > 0) this.requestRender();
    else this._lastFrame = null;
  }

  _notify(force = false) {
    const now = performance.now();
    if (force || now - this._lastNotify > 140) {
      this._lastNotify = now;
      this.onChange(this.snapshot());
    }
  }

  snapshot() {
    return {
      viewId: this.viewId, selectionId: this.selectionId,
      renderedViewId: this.renderedViewId,
      scaleNote: this.model?.scaleNote || '', info: this.model?.info || '',
      meshCount: this.meshes.length, frameCount: this.frameCount,
      labels: this.labelNodes.map(label => ({ id: label.id, text: label.text, visible: label.visible })),
      hotspots: this.labelNodes.filter(label => label.anchorVisible).map(label => ({ id: label.id, x: label.x, y: label.y })),
      labelsEnabled: this.labelsEnabled,
      flowAvailable: this.flowParticles.length > 0,
      flowPlaying: this.flow.playing && this.flowParticles.length > 0,
      flowTime: Number(this.flow.time.toFixed(5)), flowSpeed: this.flow.speed,
      flowPaths: this.flowPaths.map(path => path.label || ''),
      particlePositions: this.flowParticles.slice(0, 6).map(entry => entry.particle.position.toArray()),
      cameraPosition: this.camera.position.toArray(), cameraTarget: this.controls?.target.toArray() || [0, 0, 0],
      section: { ...this.section }, sectionPlane: { normal: this.cutPlane.normal.toArray(), constant: this.cutPlane.constant },
      layers: [...this.layers.values()].map(({ id, label, visible, opacity }) => ({ id, label, visible, opacity })),
      availableLayerIds: [...this.layers.keys()], nervousOnly: this.nervousOnly,
      explode: this.explode, stain: this.stain, microgliaActive: this.microgliaActive,
      reducedMotion: this._reduced, error: this.error,
      geometryCount: this.renderer?.info.memory.geometries || 0,
      renderCalls: this.renderer?.info.render.calls || 0,
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this._generation++;
    if (this._raf !== null) cancelAnimationFrame(this._raf);
    this._resizeObserver?.disconnect();
    this._intersectionObserver?.disconnect();
    if (this._visibilityChange) document.removeEventListener('visibilitychange', this._visibilityChange);
    if (this._motionChange) this._motion.removeEventListener('change', this._motionChange);
    const canvas = this.renderer?.domElement;
    if (canvas) {
      canvas.removeEventListener('pointerdown', this._pointerDown);
      canvas.removeEventListener('pointermove', this._pointerMove);
      canvas.removeEventListener('pointerup', this._pointerUp);
      canvas.removeEventListener('pointercancel', this._pointerCancel);
      canvas.removeEventListener('webglcontextlost', this._contextLost);
    }
    this.controls?.dispose();
    this._clearModel();
    this.renderer?.dispose();
    canvas?.remove();
    this.labelLayer?.remove();
    this.fallback?.remove();
  }
}
