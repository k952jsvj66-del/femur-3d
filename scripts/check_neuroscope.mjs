#!/usr/bin/env node
/** Validate source provenance, graph navigation and real procedural geometry. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'histologie/neuroscope');
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const preservation=JSON.parse(fs.readFileSync(path.join(root,'docs/neuroscope/preservation.json'),'utf8'));
for(const [file,hash] of Object.entries(preservation.protected_files)) {
 assert.equal(digest(path.join(root,file)),hash,`Module existant modifié : ${file}`);
 const baseline=execFileSync('git',['show',`${preservation.base_commit}:${file}`],{cwd:root,maxBuffer:10*1024*1024});
 assert.equal(createHash('sha256').update(baseline).digest('hex'),hash,`Manifeste divergent de la base Git : ${file}`);
}
const {structures}=await import(pathToFileURL(path.join(directory,'anatomy-data.js')));
const {source,references,questions,comparison,limitations}=await import(pathToFileURL(path.join(directory,'content.js')));
const {buildAnatomy}=await import(pathToFileURL(path.join(directory,'models-anatomy.js')));
const {buildMicro}=await import(pathToFileURL(path.join(directory,'models-micro.js')));
assert.equal(source.pages,14);
assert.equal(source.sha256,'53f8056101374aaebbf279d1e73e494e78cfbe2093071f725868ae145bce2283');
assert.ok(Number.isInteger(source.bytes)&&source.bytes>10000);
const expected='body head spine upper-limb lower-limb digestive brain cerebellum brainstem spinal-cord dorsal-root ventral-root cortex white-matter gray-matter corpus-callosum basal-nuclei meninges scalp skull periosteum dura dural-sinus falx tentorium arachnoid subarachnoid pia glia-limitans csf lateral-ventricles monro third-ventricle aqueduct fourth-ventricle median-aperture lateral-apertures cisterns perimedullary central-canal choroid-plexus granulations lymphatics interfaces bbb blood-csf ependyma neuron astrocyte oligodendrocyte schwann microglia ependymocyte satellite neuropil synapse axon dendrite myelin node nerve paraneurium epineurium perineurium endoneurium fascicle sensory-ganglion autonomic-ganglion enteric meissner auerbach'.split(' ');
for(const id of expected)assert.ok(structures[id],`Structure obligatoire absente : ${id}`);
const pages=(values,context,allowEmpty=false)=>{assert.ok(Array.isArray(values),`${context}: pages`);assert.ok(allowEmpty||values.length,`${context}: source absente`);for(const number of values)assert.ok(Number.isInteger(number)&&number>=1&&number<=14,`${context}: page ${number}`);};
for(const [key,ref]of Object.entries(references)){assert.ok(ref.title?.length>5,key);if(key==='tn1')assert.equal(ref.url,'','La ronéo locale ne doit pas recevoir une URL publique inventée');else assert.match(ref.url,/^https:\/\//,key);}
for(const [id,s]of Object.entries(structures)){
 assert.equal(s.id,id);assert.ok(Number.isInteger(s.level)&&s.level>=1&&s.level<=6,id);
 for(const field of ['name','scale','location','composition','cells','functions','relations','trap','model'])assert.ok(typeof s[field]==='string'&&s[field].length>0,`${id}: ${field}`);
 assert.ok(Array.isArray(s.synonyms),id);pages(s.pages,id,Boolean(s.supplement));
 if(s.parent!==null)assert.ok(structures[s.parent],`${id}: parent absent`);
 const seen=new Set([id]);let parent=s.parent;while(parent){assert.ok(!seen.has(parent),`${id}: cycle`);seen.add(parent);parent=structures[parent].parent;}
 for(const ref of s.references||[])assert.ok(references[ref],`${id}: référence ${ref}`);
 if(!s.pages.length){assert.ok(s.supplement?.length>10,`${id}: complément non identifié`);assert.ok(s.references?.length,`${id}: complément sans référence`);}
 for(const child of s.children||[])assert.ok(structures[child],`${id}: enfant ${child}`);
 if(s.compare)assert.ok(structures[s.compare]||comparison[s.compare],`${id}: comparaison absente`);
}
const models=[...new Set(Object.values(structures).map(s=>s.model))],geometryReport=[];
for(const id of models){
 const model=buildAnatomy(id)||buildMicro(id);assert.ok(model?.root?.isObject3D,`Modèle manquant : ${id}`);assert.ok(Number.isFinite(model.cameraDistance)&&model.cameraDistance>0,id);assert.ok(model.scaleNote?.length>15,id);
 model.root.updateMatrixWorld(true);let meshes=0,vertices=0;const geometries=new Set(),materials=new Set();
 model.root.traverse(node=>{
  assert.ok(node.matrixWorld.elements.every(Number.isFinite),`${id}: matrice non finie`);
  if(node.userData.structure)assert.ok(structures[node.userData.structure],`${id}: sélection inconnue ${node.userData.structure}`);
  if(node.isMesh){meshes++;const positions=node.geometry?.attributes.position;assert.ok(positions?.count>0,`${id}: maillage vide`);vertices+=positions.count;for(const attribute of Object.values(node.geometry.attributes))assert.ok(attribute.array.every(Number.isFinite),`${id}: attribut non fini`);}
  if(node.geometry)geometries.add(node.geometry);for(const m of [].concat(node.material||[]))materials.add(m);
 });
 assert.ok(meshes>0&&vertices>10,id);geometryReport.push({id,meshes,vertices});
 for(const flow of model.flowPaths||[]){assert.ok(flow.points.length>1,id);for(const p of flow.points)assert.ok(p.length===3&&p.every(Number.isFinite),id);if(flow.isMain!==false)assert.ok(!/canal central/i.test(flow.label||''),'Le canal central ne doit pas porter le flux principal');}
 for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
}
assert.ok(questions.length>=8,'Prévoir les thèmes de QRM demandés');const questionIds=new Set();
for(const q of questions){assert.ok(!questionIds.has(q.id),q.id);questionIds.add(q.id);assert.ok(structures[q.structure],q.id);assert.ok(q.prompt?.length>10,q.id);pages(q.pages,q.id);assert.equal(q.options.length,5,q.id);assert.ok(q.options.some(o=>o.correct),q.id);for(const ref of q.references||[])assert.ok(references[ref],`${q.id}: référence ${ref}`);for(const o of q.options){assert.equal(typeof o.correct,'boolean',q.id);assert.ok(o.text?.length>5&&o.explanation?.length>10,q.id);if(o.structure)assert.ok(structures[o.structure],q.id);}}
assert.ok(Array.isArray(limitations)&&limitations.length>2);
for(const key of ['graywhite','arrangement','myelin','ganglia','barriers','envelopes'])assert.ok(comparison[key]?.rows?.length>=2,`Comparaison absente : ${key}`);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of files(root).filter(f=>!f.includes(`${path.sep}.git${path.sep}`))){if(/\.pdf$/i.test(file))assert.fail(`PDF non redistribuable présent : ${path.relative(root,file)}`);}
for(const file of files(directory).filter(f=>/\.(html|js|css)$/.test(f)&&!f.includes('/assets/vendor/'))){const text=fs.readFileSync(file,'utf8');assert.ok(!/(?:src|href)=["']https?:\/\/[^"']+\.(?:js|css)|import\s.*?from\s*['"]https?:\/\/|fetch\s*\(\s*['"]https?:\/\//i.test(text),`Dépendance runtime externe : ${file}`);}
console.log(`PASS NeuroScope : ${Object.keys(structures).length} structures, ${models.length} modèles réels, ${questions.length} QRM originaux à cinq propositions.`);
console.log(`PASS ${Object.keys(preservation.protected_files).length} fichiers existants intacts ; pages TN1 1–14, graphes sans cycle, géométries finies, sources locales et compléments identifiés.`);
console.log(JSON.stringify({structures:Object.keys(structures).length,models:geometryReport,questions:questions.length}));
