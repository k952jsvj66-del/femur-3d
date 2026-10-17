import { structures } from './anatomy-data.js';
import { source, references, questions, limitations, comparison } from './content.js';
import { NeuroScene } from './scene.js';

const $ = id => document.getElementById(id);
const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
const all = Object.values(structures);
const state = { selected: 'body', model: null, mode: 'explore', labels: true, isolate: false, section: { enabled: false, axis: 'sagittal', position: 0 }, flow: false, speed: 1, stain: 'natural', explode: .25, comparison: 'graywhite', question: 0, validated: false, answers: new Set(), completed: new Map(), sourcePage: 1, pdfUrl: null, serial: 0, traversing: false };
let compareScene = null;
let traverseTimer = null;
let lastFocus = null;
const labelLayer = { skin:'Peau', muscles:'Muscles', bones:'Os', nervous:'Système nerveux' };
const levels = {1:'Corps entier',2:'Région anatomique',3:'Organe ou structure',4:'Tissu',5:'Cellule',6:'Microstructure'};
const pairs = { graywhite:['gray-matter','white-matter'], arrangement:['cortex','spinal-cord'], myelin:['oligodendrocyte','schwann'], ganglia:['sensory-ganglion','autonomic-ganglion'], barriers:['bbb','blood-csf'], envelopes:['meninges','spinal-meninges'] };
const microNext = { body:'head',head:'meninges',brain:'cortex',cerebellum:'gray-matter',brainstem:'gray-matter',meninges:'cortex',scalp:'meninges',skull:'meninges',dura:'arachnoid',arachnoid:'subarachnoid',subarachnoid:'pia',pia:'glia-limitans','glia-limitans':'cortex',cortex:'gray-matter','gray-matter':'neuropil','white-matter':'oligodendrocyte',neuropil:'neuron',neuron:'synapse',dendrite:'synapse',axon:'myelin',myelin:'node',spine:'spinal-cord','spinal-cord':'dorsal-root','dorsal-root':'sensory-ganglion','ventral-root':'nerve','upper-limb':'nerve','lower-limb':'nerve',nerve:'fascicle',fascicle:'axon','sensory-ganglion':'satellite','autonomic-ganglion':'synapse',digestive:'enteric',enteric:'auerbach',csf:'interfaces','choroid-plexus':'blood-csf',interfaces:'bbb' };
const scene = new NeuroScene($('scene'), { onSelect: id => selectStructure(id), onStatus: (message,kind) => { $('scene-status').textContent = kind==='ready'?'Volume interactif · WebGL':message; if (kind === 'error') $('app-status').textContent = message; } });

function pageLabel(n) { return n===1?'PDF p. 1 · liminaire (repère 0)':`PDF p. ${n} · ronéo p. ${n-1}`; }
function txt(value) { return Array.isArray(value) ? value.join(' · ') : value || 'Non détaillé dans cette vue.'; }
function referenceLink(key) { const ref = references[key]; if (!ref) return el('span',key); if(key==='tn1'||!ref.url){const b=el('button',ref.title);b.type='button';b.addEventListener('click',()=>openSources(structures[state.selected].pages?.[0]||1));return b;} const a = el('a',ref.title); a.href=ref.url; a.target='_blank'; a.rel='noopener'; return a; }
function ancestors(id) { const list=[], seen=new Set(); while (id && structures[id] && !seen.has(id)) { seen.add(id); list.unshift(structures[id]); id=structures[id].parent; } return list; }
function renderAtlas() {
  const term=$('atlas-search').value.trim().toLocaleLowerCase('fr');
  const list=all.filter(s=>!term || `${s.name} ${txt(s.synonyms)}`.toLocaleLowerCase('fr').includes(term));
  const groups=[...new Set(list.map(s=>s.group))];
  const fragment=document.createDocumentFragment();
  for (const group of groups) {
    const details=el('details'); details.open=Boolean(term) || group===structures[state.selected].group;
    details.append(el('summary',group));
    for(const s of list.filter(x=>x.group===group)) { const b=el('button',undefined,'atlas-link'); b.type='button'; b.dataset.structure=s.id; b.append(el('span',s.name),el('small',`Niveau ${s.level} · ${levels[s.level]}`)); if(s.id===state.selected)b.setAttribute('aria-current','true'); b.addEventListener('click',()=>selectStructure(s.id)); details.append(b); }
    fragment.append(details);
  }
  if(!list.length)fragment.append(el('p','Aucune structure correspondante.','empty-search'));
  $('atlas-links').replaceChildren(fragment);
}
function renderContext(s) {
  $('structure-name').textContent=s.name; $('structure-category').textContent=`${s.group} · Niveau ${s.level}`;
  $('structure-synonyms').textContent=Array.isArray(s.synonyms)?s.synonyms.join(' · '):s.synonyms||'';
  $('view-title').textContent=s.name.split(' — ')[0]; $('view-scale').textContent=`Niveau ${s.level} · ${levels[s.level]}`;
  $('structure-select').value=s.id;
  const breadcrumb=document.createDocumentFragment();
  ancestors(s.id).forEach((a,i,arr)=>{ if(i)breadcrumb.append(el('span','›'));const b=el('button',a.name.split(' — ')[0]);b.type='button';b.setAttribute('aria-label',a.name);if(i===arr.length-1)b.setAttribute('aria-current','location');b.addEventListener('click',()=>selectStructure(a.id));breadcrumb.append(b); });
  $('breadcrumbs').replaceChildren(breadcrumb);
  const fields=[['Localisation',s.location],['Échelle',s.scale],['Composition tissulaire',s.composition],['Cellules présentes',s.cells],['Fonctions',s.functions],['Rapports anatomiques',s.relations],['Origine embryologique',s.origin]];
  $('structure-content').replaceChildren(...fields.filter(([,v])=>v).map(([name,value])=>{const d=el('section',undefined,'context-field');d.append(el('h3',name),el('p',txt(value)));return d;}));
  $('structure-trap').textContent=txt(s.trap);
  $('structure-sources').replaceChildren(...(s.pages||[]).map(n=>{const b=el('button',pageLabel(n));b.type='button';b.dataset.page=n;b.addEventListener('click',()=>openSources(n));return b;}));
  if(!s.pages?.length)$('structure-sources').append(el('span','Complément : non décrit dans TN1.','muted'));
  const externalRefs=(s.references||[]).filter(key=>key!=='tn1');
  $('supplement-panel').hidden=!s.supplement && !externalRefs.length;
  $('structure-supplement').textContent=s.supplement||'Références complémentaires pour la représentation anatomique.';
  $('structure-references').replaceChildren(...externalRefs.map(key=>{const li=el('li');li.append(referenceLink(key));return li;}));
  const next=microNext[s.id] || s.children?.find(id=>structures[id]?.level>s.level);
  $('micro-zoom').disabled=!next; $('micro-zoom').dataset.target=next||'';
  $('micro-zoom').textContent=next?`${structures[next]?.name||'Échelle suivante'} →`:'Dernière échelle';
  $('compare-context').disabled=!pairFor(s.id);
  renderAtlas();
}
function renderLayers() {
  const layers=scene.snapshot().layers||[];
  $('layers-controls').replaceChildren(...layers.map(layer=>{
    const row=el('div',undefined,'layer-row'), label=el('label'), check=el('input'), range=el('input'), out=el('output',`${Math.round(layer.opacity*100)} %`);
    check.type='checkbox';check.checked=layer.visible;check.dataset.layer=layer.id;check.setAttribute('aria-label',`Afficher ${labelLayer[layer.id]||layer.label||layer.id}`);
    label.append(check,el('span',labelLayer[layer.id]||structures[layer.id]?.name||layer.label||layer.id),out);
    range.type='range';range.min='0';range.max='100';range.value=String(Math.round(layer.opacity*100));range.dataset.opacity=layer.id;range.setAttribute('aria-label',`Opacité ${labelLayer[layer.id]||layer.label||layer.id}`);
    check.addEventListener('change',()=>scene.setLayer(layer.id,{visible:check.checked}));range.addEventListener('input',()=>{out.value=`${range.value} %`;scene.setLayer(layer.id,{opacity:Number(range.value)/100});});row.append(label,range);return row;
  }));
  if(!layers.length)$('layers-controls').append(el('p','Cette vue ne contient pas de couches séparables.'));
}
function controlsFor(s) {
  const model=s.model||s.id;
  $('meninges-controls').hidden=model!=='meninges';
  $('csf-controls').hidden=model!=='csf';
  const micro=['gray-matter','white-matter','neuropil','nerve','fascicle','sensory-ganglion','autonomic-ganglion','neuron','astrocyte','oligodendrocyte','schwann','microglia','ependymocyte','satellite','axon','myelin','node','synapse','interfaces','bbb','blood-csf','ependyma'];
  $('histology-controls').hidden=!micro.includes(model);
  $('microglia-toggle-wrap').hidden=s.id!=='microglia';
  document.querySelector('.orientation').textContent='Modèle 3D pédagogique';
  $('isolate').disabled=!['body','head','spine','upper-limb','lower-limb','digestive'].includes(model);
  $('scale-note').textContent=scene.snapshot().scaleNote||'Modèle schématique. Les dimensions, couleurs et distances ne sont pas mesurables.';
  $('see-section').disabled=['csf','synapse','interfaces','bbb','blood-csf'].includes(model);
}
async function selectStructure(id, {preserveComparison=false}={}) {
  if(!structures[id])return;
  const serial=++state.serial, s=structures[id];
  stopTraverse();
  state.selected=id;renderContext(s);
  const model=s.model||s.id;
  if(state.model!==model){
    state.flow=false;$('flow-play').setAttribute('aria-pressed','false');$('flow-play').textContent='Démarrer la circulation';
    state.section.enabled=false;$('section-enabled').checked=false;
    state.isolate=false;$('isolate').setAttribute('aria-pressed','false');
    $('app-status').textContent=`Changement de représentation : ${s.name}. Les modèles de différentes échelles ne partagent pas une échelle métrique.`;
    state.model=model;
    const ready=await scene.show(model);
    if(serial!==state.serial)return;
    if(ready===false){state.model=null;return;}
    scene.setLabels(state.labels); scene.setSection(state.section);scene.setExplode(state.explode);scene.setStain(state.stain);
    scene.setFlow({playing:false,speed:state.speed});
  }
  scene.setSelection?.(id); renderLayers();controlsFor(s);
  if(state.mode==='compare' && !preserveComparison && !pairs[state.comparison]?.includes(id)){$('comparison-note').textContent='La comparaison reste ouverte. Le modèle principal suit votre sélection.';}
  $('explorer').dataset.ready='true';
}
function setMode(mode) {
  state.mode=mode; document.body.dataset.mode=mode;
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  $('quiz-panel').hidden=mode!=='quiz';$('comparison-panel').hidden=mode!=='compare';
  $('comparison-slot').hidden=mode!=='compare';
  if(mode==='compare')$('comparison-slot').append($('comparison-title'),$('comparison-scene'));
  else $('comparison-panel').insertBefore($('comparison-title'),$('comparison-table')),$('comparison-panel').insertBefore($('comparison-scene'),$('comparison-table'));
  if(mode==='compare')loadComparison(state.comparison);
  else if(compareScene){compareScene.dispose();compareScene=null;}
  if(mode==='quiz'){ const index=questions.findIndex(q=>q.structure===state.selected); if(index>=0)state.question=index; renderQuestion(); }
  requestAnimationFrame(()=>scene.resize());
}
function pairFor(id) {return Object.keys(pairs).find(k=>pairs[k].includes(id)) || (['meninges','scalp','skull','dura','arachnoid','subarachnoid','pia','glia-limitans'].includes(id)?'envelopes':null);}
async function loadComparison(key) {
  state.comparison=key;$('comparison-select').value=key;
  const [left,right]=pairs[key];
  await selectStructure(left,{preserveComparison:true});
  if(state.mode!=='compare' || state.comparison!==key)return;
  if(!compareScene)compareScene=new NeuroScene($('comparison-scene'),{onSelect:id=>{ if(structures[id]){state.selected=id;renderContext(structures[id]);} }});
  await compareScene.show(structures[right].model||right);compareScene.setLabels(state.labels);
  $('comparison-title').textContent=structures[right].name;
  const data=comparison?.[key];
  $('comparison-note').textContent=data?.note||'Deux modèles manipulables indépendamment. Les échelles des deux vues sont ajustées pour la comparaison et ne sont pas identiques.';
  $('comparison-table').replaceChildren();
  if(data?.rows?.length){const table=el('table'),thead=el('thead'),tr=el('tr');for(const h of(data.headers||['Repère',structures[left].name,structures[right].name]))tr.append(el('th',h));thead.append(tr);table.append(thead);const tbody=el('tbody');for(const row of data.rows){const r=el('tr');for(const v of row)r.append(el('td',txt(v)));tbody.append(r);}table.append(tbody);$('comparison-table').append(table);}
  $('differences-tools').hidden=key!=='ganglia';$('differences-answer').hidden=true;
}
function applySection() {state.section={enabled:$('section-enabled').checked,axis:$('section-axis').value,position:Number($('section-position').value)/100};$('section-value').value=`${$('section-position').value} %`;scene.setSection(state.section);}
function stopTraverse() {if(traverseTimer)clearInterval(traverseTimer);traverseTimer=null;state.traversing=false;$('traverse').setAttribute('aria-pressed','false');$('traverse').textContent='Traversée des couches';}
function traverse() {
  if(state.traversing){stopTraverse();return;}
  state.traversing=true;$('traverse').setAttribute('aria-pressed','true');$('traverse').textContent='Pause de la traversée';
  const order=['scalp','skull','periosteum','dura','arachnoid','subarachnoid','pia','glia-limitans','cortex'];
  for(const layer of scene.snapshot().layers)scene.setLayer(layer.id,{visible:true,opacity:1});
  let i=0;
  const step=()=>{const id=order[i];$('traverse-step').value=`${i+1}/${order.length} · ${structures[id]?.name||id}`;scene.setSelection?.(id);if(i>0)scene.setLayer(order[i-1],{opacity:.07});i++;if(i>=order.length){stopTraverse();$('traverse-step').value='Cortex atteint. Passez ensuite à la représentation microscopique du neurone.';}};
  step();traverseTimer=setInterval(step,1400);
}
function renderQuestion() {
  if(!questions.length)return;
  const q=questions[state.question];state.validated=false;state.answers.clear();
  $('question-select').value=String(state.question);$('question-prompt').textContent=q.prompt;
  $('question-options').replaceChildren(...q.options.map((option,i)=>{const label=el('label',undefined,'quiz-option'),input=el('input');input.type='checkbox';input.name='answer';input.value=String(i);input.addEventListener('change',()=>{if(input.checked)state.answers.add(i);else state.answers.delete(i);});label.append(input,el('b',String.fromCharCode(65+i)),el('span',option.text));return label;}));
  $('quiz-result').replaceChildren();$('quiz-validate').disabled=false;$('quiz-progress').textContent=`Question ${state.question+1}/${questions.length} · ${[...state.completed.values()].filter(Boolean).length} réussie(s)`;
}
function validateQuestion(event) {
  event.preventDefault();if(state.validated)return;
  if(!state.answers.size){$('quiz-result').textContent='Sélectionnez au moins une proposition avant de valider.';return;}
  const q=questions[state.question];let exact=true;state.validated=true;
  const labels=[...$('question-options').querySelectorAll('.quiz-option')];
  q.options.forEach((option,i)=>{const ok=state.answers.has(i)===option.correct;if(!ok)exact=false;labels[i].classList.add(ok?'correct':'incorrect');labels[i].querySelector('input').disabled=true;const d=el('div',undefined,'option-explanation');d.append(el('p',`${option.correct?'Vrai':'Faux'} · ${option.explanation}`));if(option.structure&&structures[option.structure]){const b=el('button',`Voir : ${structures[option.structure].name}`);b.type='button';b.addEventListener('click',()=>selectStructure(option.structure));d.append(b);}labels[i].after(d);});
  state.completed.set(q.id,exact);$('quiz-result').append(el('p',exact?'Réponse exacte. Toutes les propositions sont correctement identifiées.':'Réponse à revoir. Comparez chaque proposition avec le modèle et sa correction.'));
  const pages=el('div',undefined,'source-chips');for(const n of q.pages||[]){const b=el('button',pageLabel(n));b.type='button';b.addEventListener('click',()=>openSources(n));pages.append(b);}$('quiz-result').append(pages);
  if(q.references?.length){const note=el('div',undefined,'supplement');note.append(el('h3','Compléments scientifiques de la correction'));for(const key of q.references.filter(key=>key!=='tn1')){const p=el('p');p.append(referenceLink(key));note.append(p);}$('quiz-result').append(note);}
  $('quiz-validate').disabled=true;$('quiz-progress').textContent=`${state.completed.size}/${questions.length} travaillée(s) · ${[...state.completed.values()].filter(Boolean).length} réussie(s)`;
  if(q.structure)selectStructure(q.structure);
}
function openSources(page=state.sourcePage) {
  state.sourcePage=Number(page);lastFocus=document.activeElement;
  if(state.pdfUrl){$('pdf-page-link').href=`${state.pdfUrl}#page=${state.sourcePage}`;$('pdf-page-link').textContent=`Ouvrir ${pageLabel(state.sourcePage)}`;$('pdf-page-link').hidden=false;}
  if(!$('sources-dialog').open)$('sources-dialog').showModal();
}
async function bindPDF(event) {
  const file=event.target.files?.[0];if(!file)return;
  if(state.pdfUrl){URL.revokeObjectURL(state.pdfUrl);state.pdfUrl=null;}$('pdf-page-link').hidden=true;
  if(file.size!==source.bytes){$('pdf-status').textContent='Ce fichier ne correspond pas à la version TN1 utilisée. Les renvois restent désactivés.';return;}
  try{if(!crypto.subtle)throw new Error('La vérification nécessite HTTPS ou localhost.');$('pdf-status').textContent='Vérification locale de la version…';const hash=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());const hex=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hex!==source.sha256){$('pdf-status').textContent='Version différente : empreinte non conforme. Les renvois restent désactivés.';return;}state.pdfUrl=URL.createObjectURL(file);$('pdf-status').textContent='Version TN1 vérifiée. Le document reste local ; aucun téléchargement vers un serveur.';$('pdf-page-link').href=`${state.pdfUrl}#page=${state.sourcePage}`;$('pdf-page-link').textContent=`Ouvrir ${pageLabel(state.sourcePage)}`;$('pdf-page-link').hidden=false;}catch(error){$('pdf-status').textContent=`Vérification impossible. ${error.message}`;}
}
function bind() {
  $('structure-select').replaceChildren(...[...new Set(all.map(s=>s.group))].map(group=>{const opt=el('optgroup');opt.label=group;for(const s of all.filter(x=>x.group===group)){const o=el('option',s.name);o.value=s.id;opt.append(o);}return opt;}));
  $('structure-select').addEventListener('change',e=>selectStructure(e.target.value));$('atlas-search').addEventListener('input',renderAtlas);
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
  $('camera-reset').addEventListener('click',()=>scene.reset());$('zoom-in').addEventListener('click',()=>scene.zoom(1.25));$('zoom-out').addEventListener('click',()=>scene.zoom(.8));
  $('labels-toggle').addEventListener('change',e=>{state.labels=e.target.checked;scene.setLabels(state.labels);compareScene?.setLabels(state.labels);});
  $('isolate').addEventListener('click',()=>{state.isolate=!state.isolate;scene.isolateNervous(state.isolate);$('isolate').setAttribute('aria-pressed',String(state.isolate));renderLayers();});
  $('layers-reset').addEventListener('click',()=>{for(const layer of scene.snapshot().layers)scene.setLayer(layer.id,{visible:true,opacity:1});state.isolate=false;$('isolate').setAttribute('aria-pressed','false');renderLayers();});
  ['section-enabled','section-axis'].forEach(id=>$(id).addEventListener('change',applySection));$('section-position').addEventListener('input',applySection);
  $('see-section').addEventListener('click',()=>{$('section-menu').open=true;$('section-enabled').checked=true;applySection();});
  $('micro-zoom').addEventListener('click',e=>selectStructure(e.currentTarget.dataset.target));
  $('compare-context').addEventListener('click',()=>{state.comparison=pairFor(state.selected)||'graywhite';setMode('compare');});
  $('comparison-select').addEventListener('change',e=>loadComparison(e.target.value));$('comparison-close').addEventListener('click',()=>setMode('explore'));
  $('expand-view').addEventListener('click',()=>{const expanded=document.body.classList.toggle('expanded');$('expand-view').setAttribute('aria-pressed',String(expanded));$('expand-view').textContent=expanded?'Réduire':'Agrandir';requestAnimationFrame(()=>scene.resize());});
  $('explode').addEventListener('input',e=>{state.explode=Number(e.target.value)/100;scene.setExplode(state.explode);});$('traverse').addEventListener('click',traverse);$('to-neuron').addEventListener('click',()=>selectStructure('neuron'));
  $('flow-play').addEventListener('click',()=>{state.flow=!state.flow;scene.setFlow({playing:state.flow,speed:state.speed});$('flow-play').setAttribute('aria-pressed',String(state.flow));$('flow-play').textContent=state.flow?'Arrêter la circulation':'Démarrer la circulation';});
  $('flow-speed').addEventListener('change',e=>{state.speed=Number(e.target.value);scene.setFlow({playing:state.flow,speed:state.speed});});$('see-interfaces').addEventListener('click',()=>selectStructure('interfaces'));
  $('stain').addEventListener('change',e=>{state.stain=e.target.value;scene.setStain(state.stain);});$('microglia-active').addEventListener('change',e=>scene.setMicrogliaActive(e.target.checked));
  $('differences-reveal').addEventListener('click',()=>{$('differences-answer').hidden=!$('differences-answer').hidden;});
  $('question-select').replaceChildren(...questions.map((q,i)=>{const o=el('option',q.title);o.value=String(i);return o;}));
  $('question-select').addEventListener('change',e=>{state.question=Number(e.target.value);renderQuestion();selectStructure(questions[state.question].structure);});$('quiz-form').addEventListener('submit',validateQuestion);$('quiz-next').addEventListener('click',()=>{state.question=(state.question+1)%questions.length;renderQuestion();selectStructure(questions[state.question].structure);});
  $('sources-open').addEventListener('click',()=>openSources());$('sources-close').addEventListener('click',()=>$('sources-dialog').close());$('sources-dialog').addEventListener('close',()=>lastFocus?.focus());$('tn1-file').addEventListener('change',bindPDF);
  $('limitations').replaceChildren(...limitations.map(t=>el('li',t)));
  $('references-list').replaceChildren(...Object.entries(references).filter(([key])=>key!=='tn1').map(([key,ref])=>{const li=el('li');li.append(referenceLink(key));if(ref.note)li.append(el('p',ref.note));return li;}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTraverse();});
  window.addEventListener('pagehide',()=>{stopTraverse();if(state.pdfUrl)URL.revokeObjectURL(state.pdfUrl);});
}
window.NEUROSCOPE={version:'1.0',snapshot:()=>({selected:state.selected,model:state.model,mode:state.mode,question:state.question,validated:state.validated,answers:[...state.answers],completed:[...state.completed],pdfVerified:Boolean(state.pdfUrl),sourcePage:state.sourcePage,scene:scene.snapshot(),comparison:compareScene?.snapshot()||null})};
bind();renderQuestion();selectStructure('body').catch(error=>{$('scene-status').textContent='Le modèle n’a pas pu être chargé.';$('app-status').textContent=error.message;console.error(error);});
