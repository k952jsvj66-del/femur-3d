(() => {
  'use strict';
  const D=window.VESICULO_DATA, $=id=>document.getElementById(id), root=$('simulator');
  const phaseNames={tri:'Sélection de la cargaison',activation:'Activation moléculaire',coat:'Assemblage du manteau',bud:'Formation du transporteur',uncoat:'Retrait du manteau',travel:'Transport intracellulaire',tether:'Reconnaissance et arrimage',fusion:'Fusion membranaire',processing:'Maturation et tri',release:'Délivrance de la cargaison',recycling:'Recyclage du récepteur',maturation:'Maturation endolysosomale',scission:'Scission membranaire'};
  const state={scenario:0,step:0,fraction:0,playing:false,speed:1,selected:'rer',tab:'step',map:'selected',settings:{hidden:new Set(),opacity:{cytosol:.82,membrane:.8,microtubules:.85,actin:.8},labels:true,coatFilter:'copii',revision:0}};
  let raf=0,lastTime=null,fileURL=null,selectedPage=1;
  const scenario=()=>D.scenarios[state.scenario],current=()=>scenario().steps[state.step];
  const scene=new window.VesiculoScene($('cell-scene'),D,selectNode,c=>$('zoom-value').textContent=Math.round(c.zoom*100)+' %');
  const make=(tag,props={},text='')=>{const el=document.createElement(tag);Object.assign(el,props);if(text)el.textContent=text;return el;};
  function notify(text){$('app-status').textContent=text;}
  function sourceChips(container,pages){
    container.replaceChildren();
    for(const p of pages){const b=make('button',{type:'button'},`CM5 · p. ${p}`);b.dataset.page=p;b.addEventListener('click',()=>openSources(p));container.append(b);}
  }
  function externalLinks(container,refs){
    container.replaceChildren();
    for(const id of refs){const ref=D.sources[id];if(!ref)continue;const a=make('a',{href:ref.url,target:'_blank',rel:'noopener'},ref.title);container.append(a);}
  }
  function renderFrame(){
    const sc=scenario(),s=current();
    scene.render(sc,s,state.fraction,state.settings,state.selected,state.map);
    $('step-progress').value=String(Math.round(state.fraction*100));
    $('step-progress').setAttribute('aria-valuetext',`${Math.round(state.fraction*100)} % de l’étape ${state.step+1}`);
    root.dataset.scenario=sc.id;root.dataset.step=String(state.step);root.dataset.phase=s.phase;root.dataset.coat=s.coat;
    root.dataset.actor=s.actor||'cargo';root.dataset.progress=state.fraction.toFixed(4);root.dataset.playing=String(state.playing);
  }
  function renderStep(){
    const sc=scenario(),s=current();
    $('scenario-name').textContent=sc.name;$('step-phase').textContent=phaseNames[s.phase]||s.phase;
    $('step-title').textContent=s.title;$('step-body').textContent=s.body;$('step-why').textContent=s.why;$('step-trap').textContent=s.trap;
    $('scene-signal').textContent=s.signal||s.title;$('location-label').textContent=s.where;$('cargo-topology').textContent=s.where;
    $('step-count').textContent=`Étape ${state.step+1} / ${sc.steps.length}`;
    $('previous').disabled=state.step===0&&state.fraction===0;
    $('next').disabled=state.step===sc.steps.length-1;
    sourceChips($('step-sources'),s.pages);
    $('external-note').hidden=!s.external;
    if(s.external){$('external-text').textContent=s.external.text;externalLinks($('external-links'),s.external.refs);}
    $('play').textContent=state.playing?'Pause':state.step===sc.steps.length-1&&state.fraction===1?'Relire':'Lecture';
    $('play').setAttribute('aria-pressed',String(state.playing));
    document.querySelectorAll('#cargo-options [data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===sc.id)));
    document.querySelectorAll('[data-map]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.map===state.map)));
    document.querySelectorAll('.map-toolbar [data-coat]').forEach(b=>b.setAttribute('aria-pressed',String(state.map==='coat'&&b.dataset.coat===state.settings.coatFilter)));
    renderFrame();
  }
  function renderOrganelle(){
    const id=state.selected,n=D.nodes[id];
    $('organelle-title').textContent=n.name;$('organelle-body').textContent=n.body;$('organelle-trap').textContent=n.trap;
    sourceChips($('organelle-sources'),n.pages);$('compartment-select').value=id;
    $('organelle-visible').checked=!state.settings.hidden.has(id);
    const op=Math.round((state.settings.opacity[id]??1)*100);$('organelle-opacity').value=String(op);$('opacity-value').textContent=op+' %';
    const ext=$('organelle-external');ext.hidden=!n.external;ext.replaceChildren();
    if(n.external){ext.append(make('h3',{},'Précision de représentation'),make('p',{},n.external.text));const list=make('div');externalLinks(list,n.external.refs);ext.append(list);}
    document.querySelectorAll('[data-layer]').forEach(input=>input.checked=!state.settings.hidden.has(input.dataset.layer));
  }
  function setTab(tab,focus=false){
    state.tab=tab;
    for(const key of ['step','organelle']){const active=key===tab,b=$('tab-'+key);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$(key+'-panel').hidden=!active;if(active&&focus)b.focus();}
  }
  function selectNode(id){
    if(!D.nodes[id])return;
    state.selected=id;setTab('organelle');renderOrganelle();renderFrame();notify('Fiche : '+D.nodes[id].name);
  }
  function pause(){state.playing=false;lastTime=null;if(raf){cancelAnimationFrame(raf);raf=0;}$('play').textContent=state.step===scenario().steps.length-1&&state.fraction===1?'Relire':'Lecture';$('play').setAttribute('aria-pressed','false');renderFrame();}
  function frame(time){
    if(!state.playing)return;
    if(lastTime===null)lastTime=time;
    state.fraction+=Math.min(time-lastTime,150)*state.speed/(current().duration||4800);lastTime=time;
    if(state.fraction>=1){
      if(state.step<scenario().steps.length-1){state.step++;state.fraction=0;renderStep();}
      else{state.fraction=1;pause();renderStep();notify('Parcours terminé : '+scenario().name);return;}
    }else renderFrame();
    raf=requestAnimationFrame(frame);
  }
  function play(){
    if(state.playing){pause();return;}
    if(state.step===scenario().steps.length-1&&state.fraction===1){state.step=0;state.fraction=0;}
    state.playing=true;lastTime=null;setTab('step');renderStep();raf=requestAnimationFrame(frame);
  }
  function chooseScenario(index){
    pause();state.scenario=index;state.step=0;state.fraction=0;state.map='selected';state.selected=current().compartment||'rer';
    setTab('step');closeLearning();renderOrganelle();renderStep();notify('Cargaison : '+scenario().name);
  }
  function moveStep(delta){
    pause();state.step=Math.max(0,Math.min(scenario().steps.length-1,state.step+delta));state.fraction=0;setTab('step');renderStep();
  }
  function closeLearning(){
    for(const key of ['why','trap']){$(key+'-toggle').setAttribute('aria-expanded','false');$(key+'-content').hidden=true;}
  }
  function toggleLearning(key){
    const expanded=$(key+'-toggle').getAttribute('aria-expanded')==='true';$(key+'-toggle').setAttribute('aria-expanded',String(!expanded));$(key+'-content').hidden=expanded;
  }
  function visibility(id,visible){
    if(visible)state.settings.hidden.delete(id);else state.settings.hidden.add(id);
    state.settings.revision++;renderOrganelle();renderFrame();
  }
  function updatePDFLink(){
    const link=$('pdf-page-link');link.hidden=!fileURL;
    if(fileURL){link.href=fileURL+'#page='+selectedPage;link.textContent=`Ouvrir la fiche vérifiée · page ${selectedPage}`;}
  }
  function openSources(page=1){
    pause();selectedPage=page;$('source-page-note').textContent=`Renvoi sélectionné : page ${page} / 8 de la fiche fournie.`;updatePDFLink();
    const dialog=$('sources-dialog');if(!dialog.open){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  }
  function closeSources(){const dialog=$('sources-dialog');if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
  function expandScene(active){document.body.classList.toggle('scene-focus',active);const button=$('viewer-expand');button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',active?'Réduire la scène cellulaire':'Agrandir la scène cellulaire');button.textContent=active?'Réduire':'Agrandir';}
  function buildControls(){
    D.scenarios.forEach((sc,i)=>{
      const b=make('button',{type:'button',className:'cargo-card'});b.dataset.scenario=sc.id;b.setAttribute('aria-pressed',String(i===0));b.style.setProperty('--cargo-color',sc.color);
      const dot=make('span',{className:'cargo-dot'});dot.setAttribute('aria-hidden','true');const content=make('span');
      content.append(make('b',{},sc.name),make('small',{},sc.subtitle),make('span',{className:'cargo-badge'},sc.badge));b.append(dot,content);b.addEventListener('click',()=>chooseScenario(i));$('cargo-options').append(b);
    });
    for(const [id,n]of Object.entries(D.nodes)){
      $('compartment-select').append(make('option',{value:id},n.name));
      const label=make('label'),input=make('input',{type:'checkbox',checked:true});input.dataset.layer=id;input.addEventListener('change',()=>visibility(id,input.checked));label.append(input,make('span',{},n.short));$('layer-options').append(label);
    }
    for(const [id,ref]of Object.entries(D.sources)){
      if(id==='cm5')continue;
      const li=make('li');li.append(make('small',{},ref.type),make('a',{href:ref.url,target:'_blank',rel:'noopener'},ref.title));$('reference-list').append(li);
    }
    for(const item of D.roadmap){const row=make('div',{className:'roadmap-item'}),copy=make('div');copy.append(make('b',{},item.title),make('p',{},item.text));row.append(make('span',{},'Phase '+item.phase+' · à venir'),copy);$('roadmap-list').append(row);}
  }
  buildControls();
  $('play').addEventListener('click',play);$('previous').addEventListener('click',()=>moveStep(-1));$('next').addEventListener('click',()=>moveStep(1));
  $('restart').addEventListener('click',()=>chooseScenario(state.scenario));
  $('speed').addEventListener('change',e=>{state.speed=Number(e.target.value);});
  $('step-progress').addEventListener('input',e=>{const fraction=Number(e.target.value)/100;pause();state.fraction=fraction;renderStep();});
  $('zoom-in').addEventListener('click',()=>scene.zoomBy(1.2));$('zoom-out').addEventListener('click',()=>scene.zoomBy(1/1.2));$('camera-reset').addEventListener('click',()=>scene.reset());
  $('viewer-expand').addEventListener('click',()=>expandScene(!document.body.classList.contains('scene-focus')));
  $('labels-toggle').addEventListener('change',e=>{state.settings.labels=e.target.checked;state.settings.revision++;renderFrame();});
  $('compartment-select').addEventListener('change',e=>selectNode(e.target.value));
  $('organelle-visible').addEventListener('change',e=>visibility(state.selected,e.target.checked));
  $('organelle-opacity').addEventListener('input',e=>{state.settings.opacity[state.selected]=Number(e.target.value)/100;state.settings.revision++;$('opacity-value').textContent=e.target.value+' %';renderFrame();});
  $('focus-organelle').addEventListener('click',()=>scene.focus(state.selected));
  $('display-reset').addEventListener('click',()=>{state.settings.hidden.clear();state.settings.opacity={};state.settings.labels=true;state.settings.revision++;$('labels-toggle').checked=true;renderOrganelle();renderFrame();});
  for(const key of ['step','organelle']){
    $('tab-'+key).addEventListener('click',()=>setTab(key));
    $('tab-'+key).addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setTab(key==='step'?'organelle':'step',true);}});
  }
  for(const key of ['why','trap'])$(key+'-toggle').addEventListener('click',()=>toggleLearning(key));
  document.querySelectorAll('[data-map]').forEach(b=>b.addEventListener('click',()=>{state.map=b.dataset.map;renderStep();}));
  document.querySelectorAll('.map-toolbar [data-coat]').forEach(b=>b.addEventListener('click',()=>{state.map='coat';state.settings.coatFilter=b.dataset.coat;renderStep();}));
  $('sources-open').addEventListener('click',()=>openSources(current().pages[0]));$('sources-close').addEventListener('click',closeSources);
  $('scope-open').addEventListener('click',e=>{e.preventDefault();openSources();$('roadmap').scrollIntoView({block:'nearest'});});
  $('sources-dialog').addEventListener('click',e=>{if(e.target===$('sources-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeSources();}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const hadDialog=$('sources-dialog').open;$('display-menu').open=false;closeSources();if(!hadDialog)expandScene(false);}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  $('cm5-file').addEventListener('change',async e=>{
    if(fileURL){URL.revokeObjectURL(fileURL);fileURL=null;}updatePDFLink();
    const file=e.target.files?.[0];if(!file){$('pdf-status').textContent='Aucun fichier associé.';return;}
    $('pdf-status').textContent='Vérification locale de la fiche…';
    try{
      if(file.size>15000000)throw new Error('Ce fichier dépasse 15 Mo.');
      if(!window.crypto?.subtle)throw new Error('La vérification du fichier nécessite HTTPS ou une prévisualisation locale sécurisée.');
      const bytes=await file.arrayBuffer();if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('Le fichier ne porte pas une signature PDF valide.');
      const digest=await crypto.subtle.digest('SHA-256',bytes),hash=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
      if(hash!==D.sources.cm5.sha256)throw new Error('Cette version ne correspond pas à la fiche CM5 de huit pages utilisée ici : les renvois de pages ne sont pas activés.');
      fileURL=URL.createObjectURL(file);$('pdf-status').textContent='Fiche vérifiée : huit pages, référence exacte. Le fichier reste sur cet appareil.';updatePDFLink();
    }catch(error){$('pdf-status').textContent=error.message;}
  });
  renderOrganelle();renderStep();root.dataset.ready='true';
  window.VESICULOSCOPE={version:'1.0-phase1',snapshot:()=>({scenario:scenario().id,step:state.step,stepId:current().id,fraction:state.fraction,playing:state.playing,speed:state.speed,selected:state.selected,tab:state.tab,map:state.map,hidden:[...state.settings.hidden],opacity:{...state.settings.opacity},labels:state.settings.labels,camera:{...scene.camera}})};
})();
