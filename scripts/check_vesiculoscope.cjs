/* Meaningful data invariants: provenance, coat/fusion order and receptor/cargo split. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'biologie-cellulaire/vesiculoscope/content.js'),'utf8'),sandbox);
const d=JSON.parse(JSON.stringify(sandbox.window.VESICULO_DATA));
assert.deepEqual(d.scenarios.map(s=>s.id),['secretion','kdel','hydrolase','ldl']);
assert.equal(d.sources.cm5.pages,8);
assert.equal(d.sources.cm5.sha256,'e85442656219fca00014d07a31cc7dbaaaccdb3eda166e5ce0c77763f00bad14');
for(const id of ['membrane','cytosol','rer','rel','cis','median','trans','vesicles','early','late','lysosome','microtubules','actin'])assert.ok(d.nodes[id],id);
for(const [id,p]of Object.entries(d.paths)){assert.ok(d.coats[p.coat],id);for(const key of ['from','to'])if(p[key])assert.ok(d.nodes[p[key]],id);assert.match(p.d,/^M[\d\s]+C/);}
const mp=d.nodes.membrane;
assert.ok(Math.abs(((mp.x-509)/451)**2+((mp.y-365)/302)**2-1)<.005,'Membrane route junction must be on the cell boundary');
const checkPages=pages=>{assert.ok(pages.length);assert.ok(pages.every(p=>Number.isInteger(p)&&p>=1&&p<=8));};
let count=0;
for(const n of Object.values(d.nodes)){checkPages(n.pages);if(n.external)for(const r of n.external.refs)assert.ok(d.sources[r]?.url);}
for(const scenario of d.scenarios){
 const ids=new Set();
 for(let i=0;i<scenario.steps.length;i++){
  const s=scenario.steps[i];count++;
  assert.ok(!ids.has(s.id),`${scenario.id}: duplicate ${s.id}`);ids.add(s.id);checkPages(s.pages);
  for(const field of ['title','body','why','trap','where'])assert.ok(typeof s[field]==='string'&&s[field].length>8,`${s.id}:${field}`);
  assert.ok(d.coats[s.coat]);assert.ok(d.nodes[s.compartment]);
  if(s.route)assert.ok(d.paths[s.route],s.id);
  if(s.range)assert.ok(s.range.length===2&&s.range[0]>=0&&s.range[1]<=1&&s.range[0]<s.range[1],s.id);
  if(s.anchor)assert.ok(d.nodes[s.anchor],s.id);
  if(s.external){assert.ok(s.external.text.length>20);assert.ok(s.external.refs.length);for(const id of s.external.refs)assert.ok(d.sources[id]?.url);}
  if(s.phase==='fusion')assert.equal(s.coat,'none',`${s.id}: coated fusion`);
  if(s.actor==='receptor'){assert.equal(s.phase,'recycling');assert.equal(s.coat,'none');assert.ok(d.nodes[s.cargoHold]);assert.equal(s.cargoHold,scenario.id==='kdel'?'rer':'early');}
  if(s.machinery==='dynamin'){assert.equal(scenario.id,'ldl');assert.equal(s.phase,'scission');}
  if(s.phase==='fusion'&&scenario.steps.some(p=>p.route===s.route&&p.phase==='bud'&&p.coat!=='none')){
   assert.ok(scenario.steps.slice(0,i).some(p=>p.route===s.route&&p.phase==='uncoat'),`${s.id}: no preceding uncoat`);
  }
 }
}
const h=d.scenarios.find(s=>s.id==='hydrolase').steps.map(s=>s.id);
for(const [a,b]of [['m6p-add','m6p-uncover'],['m6p-uncover','m6p-receptor'],['m6p-receptor','m6p-dissociate'],['m6p-dissociate','m6p-recycle'],['m6p-recycle','hydrolase-arrive']])assert.ok(h.indexOf(a)>=0&&h.indexOf(a)<h.indexOf(b),`${a} must precede ${b}`);
assert.deepEqual(d.roadmap.map(x=>x.phase),[2,3]);
console.log(`PASS VésiculoScope: ${d.scenarios.length} cargaisons, ${count} étapes sourcées, ${Object.keys(d.nodes).length} structures.`);
console.log('PASS ordre M6P, désassemblage avant fusion, dynamine limitée à son scénario et séparation cargo/récepteur.');
