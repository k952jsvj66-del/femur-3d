/* Lightweight SVG 2.5D scene. No WebGL/CDN; camera and biology are independent. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  class VesiculoScene {
    constructor(svg, data, onSelect, onCamera) {
      this.svg = svg; this.data = data; this.onSelect = onSelect; this.onCamera = onCamera;
      this.camera = { x: 0, y: 0, zoom: 1 }; this.pointers = new Map(); this.distance = 0;
      this.build(); this.bind(); this.renderCamera();
      if('ResizeObserver' in window){this.resizeObserver=new ResizeObserver(()=>this.sizeLabels());this.resizeObserver.observe(this.svg);}
      else window.addEventListener('resize',()=>this.sizeLabels());
    }
    node(id, contents) {
      return `<g class="organelle" data-node="${id}" role="button" tabindex="0" aria-label="Sélectionner : ${this.data.nodes[id].name}">${contents}</g>`;
    }
    build() {
      const D = this.data;
      const micro = [[143,201],[234,132],[476,104],[731,117],[865,226],[902,386],[847,565],[691,676],[442,683],[215,615],[105,435]].map(([x,y], i) => `<path d="M442 414 Q${(442+x)/2+25} ${(414+y)/2-25} ${x} ${y}" stroke="${i%2?'#bca56a':'#d7c78b'}" stroke-width="${i%3===0?3:2}"/>`).join('');
      const rer = Array.from({ length: 6 }, (_,i) => {
        const y=194+i*31, dx=i<3?i*8:(5-i)*8;
        const d=`M${252+dx} ${y} C${322+dx} ${y-33} ${408+dx} ${y-18} ${389+dx} ${y+18}`;
        const dots=Array.from({length:8},(_,j)=>`<circle cx="${270+dx+j*16}" cy="${y-7-13*Math.sin(j/7*Math.PI)}" r="3.3" fill="#4f7786"/>`).join('');
        return `<path d="${d}" stroke="#6693a5" stroke-width="19"/><path d="${d}" stroke="#c8dfe3" stroke-width="10"/>${dots}`;
      }).join('');
      const rel = ['M239 459 C291 431 324 451 318 485 S381 490 373 518','M202 481 C230 446 275 471 260 507 S316 556 342 528','M219 530 C231 495 286 509 292 543 S350 572 380 550','M311 457 C352 432 397 465 376 491'].map(d=>`<path d="${d}" stroke="#82afb4" stroke-width="17"/><path d="${d}" stroke="#d1e5e2" stroke-width="9"/>`).join('');
      const cistern = (x,y,color) => `<g transform="translate(${x} ${y}) rotate(-18)"><path d="M-58 -14 Q-5 -37 59 -8 L59 15 Q2 -7 -58 9Z" fill="#655e5c" opacity=".12" transform="translate(1 7)"/><path class="node-surface" d="M-58 -14 Q-5 -37 59 -8 L59 15 Q2 -7 -58 9Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/><path d="M-54 -10 Q-5 -31 54 -5" stroke="#fff" opacity=".7" stroke-width="3" fill="none"/></g>`;
      const vesicles = [[676,315,9],[712,343,7],[663,371,6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r+3}" fill="#d9e6dc" stroke="#819e93"/><circle cx="${x-1}" cy="${y-1}" r="${r-3}" fill="#e2b46c"/>`).join('');
      const routes=Object.entries(D.paths).map(([id,p])=>`<path id="route-${id}" class="traffic-route" data-route="${id}" data-coat="${p.coat}" d="${p.d}" stroke="${D.coats[p.coat].color}" marker-end="url(#arrow-${p.coat})" fill="none"/>`).join('');
      const markers=Object.entries(D.coats).map(([id,c])=>`<marker id="arrow-${id}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 7 4 1 7" fill="none" stroke="${c.color}" stroke-width="1.5"/></marker>`).join('');
      const labels=Object.entries(D.nodes).map(([id,n])=>`<g class="organelle-label" data-label="${id}" data-node="${id}" role="button" tabindex="0" aria-label="Afficher la fiche : ${n.name}" transform="translate(${n.labels[0]} ${n.labels[1]})"><rect x="-6" y="-18" width="${Math.max(65,n.short.length*10.1)}" height="29" rx="6"/><text>${n.short}</text></g>`).join('');
      this.svg.innerHTML = `<defs>
        <radialGradient id="cyto" cx=".4" cy=".36"><stop offset="0" stop-color="#f9fbf0"/><stop offset="1" stop-color="#d9e8df"/></radialGradient>
        <linearGradient id="rim" x2="0" y2="1"><stop stop-color="#9dc4b8"/><stop offset="1" stop-color="#6c9d91"/></linearGradient>
        <radialGradient id="nucleus"><stop stop-color="#e0dce9"/><stop offset="1" stop-color="#b6afcc"/></radialGradient>
        <radialGradient id="endo"><stop stop-color="#eaf0f2"/><stop offset="1" stop-color="#9cb5c5"/></radialGradient>
        <radialGradient id="lyso"><stop stop-color="#e2c8dc"/><stop offset="1" stop-color="#a2749c"/></radialGradient>
        <filter id="cell-shadow" x="-.2" y="-.2" width="1.4" height="1.6"><feGaussianBlur stdDeviation="15"/></filter>${markers}
      </defs><g id="camera">
        <ellipse cx="514" cy="421" rx="445" ry="278" fill="#536e62" opacity=".1" filter="url(#cell-shadow)"/>
        ${this.node('cytosol','<ellipse class="node-surface" cx="509" cy="365" rx="451" ry="302" fill="url(#cyto)"/>')}
        ${this.node('membrane','<path class="node-surface" d="M58 365a451 302 0 1 0 902 0v20a451 302 0 1 1-902 0Z" fill="url(#rim)" opacity=".55"/><ellipse cx="509" cy="365" rx="451" ry="302" fill="none" stroke="#5f9a8b" stroke-width="3"/><ellipse cx="509" cy="365" rx="442" ry="294" fill="none" stroke="#b6d4c5" stroke-width="2"/>')}
        ${this.node('microtubules',`<g fill="none" opacity=".57">${micro}</g><circle cx="442" cy="414" r="8" fill="#c4a669"/>`)}
        ${this.node('actin','<g fill="none" stroke="#91ac7d" stroke-width="3" opacity=".55"><path d="M100 424C122 550 289 637 443 646M609 651C767 630 906 516 920 396M929 295C883 154 671 93 509 90"/><path d="m115 457 19-21m5 62 21-24m9 58 17-25m30 55 10-31m47 55 7-32m420 14-3-26m39 7-8-31m56 7-15-25m48-4-24-18m51-19-22-12m32-28-26-7"/></g>')}
        <g aria-hidden="true"><ellipse cx="248" cy="354" rx="110" ry="125" transform="rotate(-15 248 354)" fill="#8e8baa" opacity=".12"/><ellipse cx="245" cy="336" rx="105" ry="115" transform="rotate(-15 245 336)" fill="url(#nucleus)" stroke="#938dae" stroke-width="2"/><ellipse cx="241" cy="328" rx="91" ry="100" transform="rotate(-15 241 328)" fill="none" stroke="#ede9f2" stroke-width="3"/><circle cx="237" cy="337" r="29" fill="#9c91b1" opacity=".65"/><text x="214" y="398" class="nucleus-label">Noyau</text></g>
        ${this.node('rer',`<g fill="none" stroke-linecap="round">${rer}</g>`)}
        ${this.node('rel',`<g fill="none" stroke-linecap="round">${rel}</g>`)}
        ${this.node('cis',cistern(506,267,'#d5bd92'))}
        ${this.node('median',cistern(536,291,'#cfaa91')+cistern(560,314,'#ca9b8e'))}
        ${this.node('trans',cistern(586,338,'#bd8b9b')+cistern(610,360,'#ab829b'))}
        ${this.node('vesicles',vesicles)}
        ${this.node('early','<g transform="rotate(-17 782 457)"><ellipse class="node-surface" cx="782" cy="457" rx="43" ry="32" fill="url(#endo)" stroke="#819faf" stroke-width="2"/><path d="M808 444q28-19 43-12m-51 48q20 20 37 11" fill="none" stroke="#a2bbc9" stroke-width="13" stroke-linecap="round"/><ellipse cx="776" cy="451" rx="28" ry="19" fill="#dae8ea" opacity=".7"/></g>')}
        ${this.node('late','<ellipse class="node-surface" cx="679" cy="571" rx="45" ry="36" fill="#aca9c4" stroke="#8885a7" stroke-width="2"/><g fill="#d6d1e2" stroke="#9890b2"><circle cx="660" cy="565" r="9"/><circle cx="689" cy="559" r="7"/><circle cx="680" cy="583" r="8"/><circle cx="704" cy="580" r="5"/></g>')}
        ${this.node('lysosome','<ellipse class="node-surface" cx="532" cy="596" rx="40" ry="35" fill="url(#lyso)" stroke="#9b7193" stroke-width="2"/><g fill="#8d638b" opacity=".6"><circle cx="519" cy="587" r="4"/><circle cx="540" cy="602" r="5"/><circle cx="550" cy="587" r="3"/><circle cx="520" cy="611" r="3"/><path d="m537 578 4 5-5 4-4-5Z"/></g>')}
        <g id="traffic-paths" aria-hidden="true">${routes}</g>
        <g id="organelle-labels">${labels}</g>
        <g id="stationary-cargo" pointer-events="none"><circle r="11" fill="#dc9e42" stroke="#fff" stroke-width="3"/></g>
        <g id="cargo-marker" data-node="vesicles" role="button" tabindex="0" aria-label="Sélectionner le transporteur suivi">
          <circle id="target-halo" r="38" fill="none" stroke="#2c8275" stroke-width="2" opacity=".2"/>
          <circle id="carrier" r="22" fill="#f7fbf1" stroke="#5c8c7e" stroke-width="2"/>
          <g id="coat-shell" fill="none" stroke-width="2.2"><circle r="28"/>${Array.from({length:12},(_,i)=>{let a=i*Math.PI/6;return `<path d="M${24*Math.cos(a)} ${24*Math.sin(a)}l${9*Math.cos(a)} ${9*Math.sin(a)}"/>`;}).join('')}<path d="M-24-12 0-28 24-12 24 12 0 28-24 12Z"/></g>
          <circle id="cargo-dot" r="10" fill="#dc9e42" stroke="#fff" stroke-width="2"/>
          <path id="receptor-diamond" d="M0-13 12 0 0 13-12 0Z" fill="#f7faf5" stroke="#146c66" stroke-width="3"/>
          <text id="actor-label" y="-41" text-anchor="middle"></text>
        </g>
      </g>`;
      this.g = this.svg.querySelector('#camera'); this.marker = this.svg.querySelector('#cargo-marker');
      this.dot = this.svg.querySelector('#cargo-dot'); this.carrier = this.svg.querySelector('#carrier');
      this.shell = this.svg.querySelector('#coat-shell'); this.receptor = this.svg.querySelector('#receptor-diamond');
      this.hold = this.svg.querySelector('#stationary-cargo'); this.actorLabel = this.svg.querySelector('#actor-label');
      this.halo = this.svg.querySelector('#target-halo');
      this.routeEls = Object.fromEntries(Object.keys(D.paths).map(id => [id, this.svg.querySelector(`#route-${id}`)]));
    }
    point(route, fraction) {
      const p = this.routeEls[route];
      if (!p) return { x: 368, y: 310 };
      return p.getPointAtLength(p.getTotalLength() * clamp(fraction, 0, 1));
    }
    render(scenario, step, fraction, settings, selected, mapMode) {
      const D=this.data;
      const contextKey=[scenario.id,step.id,settings.revision,selected,mapMode,settings.coatFilter].join('|');
      if(this.contextKey!==contextKey){
      this.contextKey=contextKey;
      for (const [id,el] of Object.entries(this.routeEls)) {
        const inScenario=scenario.routes.includes(id), isCurrent=step.route===id;
        const visible=(mapMode==='all'||mapMode==='coat'||inScenario) && (mapMode!=='coat'||D.paths[id].coat===settings.coatFilter);
        el.style.display=visible?'':'none'; el.classList.toggle('current-route',isCurrent);
        el.style.opacity=isCurrent?'1':mapMode==='all'?(inScenario?'.5':'.22'):'.45';
        el.setAttribute('stroke-width',isCurrent?'4':'2.5');
      }
      for (const [id,n] of Object.entries(D.nodes)) {
        const el=this.svg.querySelector(`.organelle[data-node="${id}"]`);
        const label=this.svg.querySelector(`[data-label="${id}"]`);
        if(el){el.style.display=settings.hidden.has(id)?'none':'';el.style.opacity=String(settings.opacity[id]??1);el.classList.toggle('node-selected',id===selected);el.setAttribute('aria-pressed',String(id===selected));el.setAttribute('tabindex',settings.hidden.has(id)?'-1':'0');}
        if(label){label.style.display=settings.labels&&!settings.hidden.has(id)?'':'none';label.classList.toggle('label-selected',id===selected);}
      }
      }
      const v=this.position(step,fraction);
      this.marker.setAttribute('transform',`translate(${v.x} ${v.y})`);
      this.marker.dataset.actor=step.actor||'cargo'; this.marker.dataset.route=step.route||'';
      this.marker.dataset.x=v.x.toFixed(2);this.marker.dataset.y=v.y.toFixed(2);
      const isReceptor=step.actor==='receptor';
      this.dot.style.display=isReceptor?'none':'';this.receptor.style.display=isReceptor?'':'none';
      this.carrier.style.display=isReceptor||step.carrier===false?'none':'';
      this.carrier.style.opacity=String(step.phase==='fusion'?1-fraction:1);
      this.carrier.setAttribute('r',String(step.phase==='bud'?15+fraction*7:22));
      const color=D.coats[step.coat].color;
      const opacity=step.coat==='none'||isReceptor?0:step.uncoat?1-fraction:step.phase==='coat'?.2+fraction*(step.coatLevel??.8):(step.coatLevel??1);
      this.shell.style.opacity=String(opacity);this.shell.setAttribute('stroke',color);
      this.halo.style.display=step.phase==='tether'||step.phase==='fusion'?'':'none';
      this.halo.setAttribute('r',String(28+fraction*18));
      this.actorLabel.textContent=settings.labels?(isReceptor?'Récepteur':scenario.cargo):'';
      this.actorLabel.setAttribute('text-anchor',v.x>880?'end':'middle');
      this.hold.style.display=isReceptor?'':'none';
      if(isReceptor){const n=D.nodes[step.cargoHold];this.hold.setAttribute('transform',`translate(${n.x} ${n.y})`);}
    }
    position(step,fraction) {
      if(step.route){const range=step.range;return this.point(step.route,range?range[0]+(range[1]-range[0])*fraction:(step.at??0));}
      return this.data.nodes[step.anchor||step.compartment||'rer'];
    }
    select(id) { this.svg.querySelectorAll('.organelle').forEach(el=>el.classList.toggle('node-selected',el.dataset.node===id)); }
    renderCamera() {
      const c=this.camera;this.g.setAttribute('transform',`translate(${500+c.x} ${370+c.y}) scale(${c.zoom}) translate(-500 -370)`);
      this.svg.dataset.zoom=c.zoom.toFixed(3);if(this.onCamera)this.onCamera(c);
      this.sizeLabels();
    }
    sizeLabels(){
      const bounds=this.svg.getBoundingClientRect(),box=this.svg.viewBox.baseVal;
      const scale=Math.min(bounds.width/box.width,bounds.height/box.height)*this.camera.zoom;
      if(!scale)return;
      const font=clamp(11.5/scale,14,42);
      this.svg.querySelectorAll('.organelle-label').forEach(el=>{const n=this.data.nodes[el.dataset.label],width=Math.max(65,n.short.length*font*.57+13);el.querySelector('text').style.fontSize=font+'px';el.querySelector('rect').setAttribute('width',String(width));el.querySelector('rect').setAttribute('y',String(-font*.72));el.querySelector('rect').setAttribute('height',String(font*1.35));});
      this.actorLabel.style.fontSize=Math.min(font,29)+'px';
    }
    zoomBy(factor,at={x:500,y:370}) {
      const c=this.camera,next=clamp(c.zoom*factor,.65,3.2),k=next/c.zoom;
      c.x=(at.x-500)-(at.x-500-c.x)*k;c.y=(at.y-370)-(at.y-370-c.y)*k;c.zoom=next;this.renderCamera();
    }
    reset() { this.camera={x:0,y:0,zoom:1};this.renderCamera(); }
    focus(id) { const n=this.data.nodes[id];this.camera={zoom:1.7,x:(500-n.x)*1.7,y:(370-n.y)*1.7};this.renderCamera(); }
    local(e) {const p=this.svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(this.svg.getScreenCTM().inverse());}
    bind() {
      this.svg.addEventListener('pointerdown',e=>{
        this.svg.setPointerCapture(e.pointerId);const p=this.local(e);
        this.pointers.set(e.pointerId,p);this.downNode=e.target.closest('[data-node]')?.dataset.node;this.moved=0;
        if(this.pointers.size>1){this.gesture=true;const a=[...this.pointers.values()];this.distance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);}
      });
      this.svg.addEventListener('pointermove',e=>{
        if(!this.pointers.has(e.pointerId))return;
        const p=this.local(e),old=this.pointers.get(e.pointerId);this.pointers.set(e.pointerId,p);
        this.moved+=Math.hypot(p.x-old.x,p.y-old.y);
        if(this.pointers.size===2){const a=[...this.pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(this.distance>0)this.zoomBy(d/this.distance,{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2});this.distance=d;}
        else{this.camera.x=clamp(this.camera.x+p.x-old.x,-850,850);this.camera.y=clamp(this.camera.y+p.y-old.y,-650,650);this.renderCamera();}
      });
      this.svg.addEventListener('pointerup',e=>{
        const pick=this.pointers.size===1&&!this.gesture&&this.moved<8&&this.downNode;
        this.pointers.delete(e.pointerId);
        if(pick)this.onSelect(this.downNode);
        if(!this.pointers.size){this.gesture=false;this.distance=0;this.downNode=null;}
      });
      this.svg.addEventListener('pointercancel',e=>{this.pointers.delete(e.pointerId);if(!this.pointers.size)this.gesture=false;});
      this.svg.addEventListener('wheel',e=>{e.preventDefault();this.zoomBy(Math.exp(-clamp(e.deltaY,-120,120)*.003),this.local(e));},{passive:false});
      this.svg.addEventListener('keydown',e=>{
        const node=e.target.closest('[data-node]')?.dataset.node;
        if(node&&(e.key==='Enter'||e.key===' ')){e.preventDefault();this.onSelect(node);return;}
        if(e.key==='+'||e.key==='='){e.preventDefault();this.zoomBy(1.2);}
        if(e.key==='-'){e.preventDefault();this.zoomBy(1/1.2);}
        if(e.key.toLowerCase()==='r'){this.reset();}
        const moves={ArrowLeft:[25,0],ArrowRight:[-25,0],ArrowUp:[0,25],ArrowDown:[0,-25]};
        if(moves[e.key]){e.preventDefault();this.camera.x+=moves[e.key][0];this.camera.y+=moves[e.key][1];this.renderCamera();}
      });
    }
  }
  window.VesiculoScene=VesiculoScene;
})();
