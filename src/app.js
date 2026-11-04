// ====================== Quesos Sn Roque · landing ======================
// Librerías empaquetadas en el sitio (sin CDN): GSAP + ScrollTrigger (animación con el scroll) y Lenis (scroll suave).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { WA, WA_TEXTO, P, FAM, FAM_ORDER, FOTO_FAM, caract } from './data.js';
// La escena 3D (three.js) vive en su propio archivo y se descarga después, sin frenar la carga de la página.
const loadScene = () => import('./scene.js');
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const html=document.documentElement;
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce) html.classList.add('reduce');
const mobile=()=>window.innerWidth<860;

// Primero se pinta el inicio (rueda y título) y después se arma lo demás en pedacitos,
// para que el celular no se trabe al abrir la página.
const ceder=()=>new Promise(r=>setTimeout(r,0));
const alFinal=[]; // observadores de video: se activan cuando ya está armado el scroll (si no, el navegador bajaría videos de más)
await new Promise(res=>{
  const img=document.querySelector('.hero-poster img');
  const listo=()=>requestAnimationFrame(()=>setTimeout(res,0));
  if(!img||img.complete) return listo();
  const t=setTimeout(listo,1500);
  const fin=()=>{ clearTimeout(t); listo(); };
  img.addEventListener('load',fin,{once:true}); img.addEventListener('error',fin,{once:true});
});

// ---- WhatsApp ----
const wa=(txt)=>`https://wa.me/${WA}?text=${encodeURIComponent(txt)}`;
const WAB='<span class="wa-badge" aria-hidden="true"><svg><use href="#i-wa"/></svg></span>';
$('#nav-wa').href=wa(WA_TEXTO);
$('#hero-wa').href=wa(WA_TEXTO);
$('#ct-wa').href=wa(WA_TEXTO);
async function copiar(txt,b,ok,orig){
  try{ await navigator.clipboard.writeText(txt); b.textContent=ok; }
  catch(err){ const ta=document.createElement('textarea'); ta.value=txt; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); b.textContent=ok; }catch(e){ b.textContent='Selecciona y copia'; } ta.remove(); }
  setTimeout(()=>b.textContent=orig,1800);
}
$('#copy-tel').addEventListener('click',e=>copiar('+52 1 477 231 2260',e.currentTarget,'Copiado','Copiar número'));

// ---- familias ----
const byFam=(f)=>P.filter(p=>p[1]===f);
const famCard=(f)=>{ const F=FAM[f], items=byFam(f);
  return `<button class="fam" type="button" style="--c:${F.c}" data-fam="${f}">
    <span class="fam-ging"></span>
    <img class="fam-img" src="assets/prod/s/${F.hero}.webp" srcset="assets/prod/s/${F.hero}.webp 400w, assets/prod/${F.hero}.webp 820w" sizes="(max-width:860px) 52vw, 260px" width="400" height="400" alt="" loading="lazy" decoding="async">
    <span class="fam-txt"><span class="fam-n">${F.n}</span><span class="fam-frase">${F.frase}</span>
    <span class="fam-meta"><span>${items.length} ${items.length===1?'presentación':'presentaciones'}</span><span>Ver todas <i>+</i></span></span></span>
  </button>`; };
$('#fam-track').innerHTML=FAM_ORDER.map(famCard).join('')+
  `<div class="fam-end"><h3>¿No ves tu presentación?</h3><p>Tenemos ${P.length} presentaciones, de 150 g a 24 kg. Pregúntanos por la que necesitas.</p><a class="btn btn-wa" href="${wa('Hola, busco una presentación de Quesos Sn Roque:')}" target="_blank" rel="noopener">${WAB}Preguntar</a></div>`;

await ceder();
// ---- panel de familia ----
const drawer=$('#drawer'); let lastFocus=null;
function openFam(f){ const F=FAM[f], items=byFam(f);
  const dh=$('#drawer-hero'), foto=FOTO_FAM[f]; dh.style.setProperty('--c',F.c); dh.classList.toggle('foto',!!foto);
  dh.innerHTML=foto?`<img class="df" src="${foto}" alt="${F.n} Sn Roque fuera del empaque" width="1080" height="675"><img class="dp" src="assets/prod/t/${F.hero}.webp" alt="" width="128" height="128">`:`<img src="assets/prod/s/${F.hero}.webp" alt="" width="400" height="400">`;
  $('#drawer-script').textContent=F.frase; $('#drawer-title').textContent=`Queso ${F.n}`.replace('Queso Cremas','Cremas').replace('Queso Jocoque','Jocoque').replace('Queso Cajeta','Cajeta').replace('Queso Mozzarella pizzero','Mozzarella pizzero');
  const c=caract(items[0]);
  $('#drawer-chips').innerHTML=[...c.car,...c.uso].map(x=>`<span>${x}</span>`).join('');
  $('#drawer-list').innerHTML=items.map(p=>`<li><img src="assets/prod/t/${p[0]}.webp" alt="" width="128" height="128" loading="lazy" decoding="async"><div><b>${p[2]}</b><small>${p[3]}</small></div><span class="clave">${p[0]}</span></li>`).join('');
  $('#drawer-wa').href=wa(`Hola, me interesa el queso ${F.n} de Sn Roque. ¿Me pueden dar más información?`);
  lastFocus=document.activeElement; drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false');
  if(window.lenis) window.lenis.stop(); $('.drawer-x').focus();
}
function closeFam(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); if(window.lenis) window.lenis.start(); if(lastFocus) lastFocus.focus(); }
$$('[data-close]',drawer).forEach(el=>el.addEventListener('click',closeFam));
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&drawer.classList.contains('open')) closeFam(); });
$('#fam-track').addEventListener('click',e=>{ const b=e.target.closest('.fam'); if(b) openFam(b.dataset.fam); });
// inclinación 3D de las tarjetas con el mouse
if(window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce){
  $('#fam-track').addEventListener('pointermove',e=>{ const b=e.target.closest('.fam'); if(!b) return; const r=b.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; b.style.transform=`perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-6px)`; });
  $('#fam-track').addEventListener('pointerleave',()=>{ $$('.fam').forEach(b=>b.style.transform=''); });
  $('#fam-track').addEventListener('pointerout',e=>{ const b=e.target.closest('.fam'); if(b&&!b.contains(e.relatedTarget)) b.style.transform=''; });
}

// ====================== datos del cliente (mismas preguntas que la landing de Famo) ======================
const alta=$('#alta'), FIELDS=['c-id','c-name','c-contact','c-phone','c-addr','c-col','c-cp','c-city','c-hours','c-note'];
let ctype='nuevo', altaFocus=null;
const fv=(id)=>$('#'+id).value.trim();
try{ const g=JSON.parse(localStorage.getItem('srq-datos')||'{}'); FIELDS.forEach(id=>{ if(g[id]) $('#'+id).value=g[id]; }); }catch(e){}
function guardar(){ try{ const g={}; FIELDS.forEach(id=>g[id]=fv(id)); localStorage.setItem('srq-datos',JSON.stringify(g)); }catch(e){} }
function mensaje(){
  const m=[ctype==='cliente'?'*Ya soy cliente · Quesos Sn Roque*':'*Quiero ser cliente · Quesos Sn Roque*'];
  if(fv('c-name')) m.push(`Negocio: ${fv('c-name')}`);
  m.push(ctype==='cliente'?`No. de cliente: ${fv('c-id')}`:'Cliente: Nuevo');
  if(fv('c-contact')||fv('c-phone')) m.push(`Encargado: ${[fv('c-contact'),fv('c-phone')&&'tel. '+fv('c-phone')].filter(Boolean).join(' · ')}`);
  const d=[fv('c-addr'),fv('c-col')&&'Col. '+fv('c-col'),fv('c-cp')&&'C.P. '+fv('c-cp'),fv('c-city')].filter(Boolean).join(', ');
  if(d) m.push(`Domicilio: ${d}`);
  if(fv('c-hours')) m.push(`Horario: ${fv('c-hours')}`);
  if(fv('c-note')) m.push('',`Necesito: ${fv('c-note')}`);
  return m.join('\n');
}
const LBL={'c-id':'número de cliente','c-name':'nombre del negocio','c-contact':'encargado','c-phone':'teléfono (10 dígitos)','c-addr':'calle y número','c-col':'colonia','c-city':'ciudad'};
function faltan(){ const r=['c-name','c-contact','c-phone','c-addr','c-col','c-city']; if(ctype==='cliente') r.unshift('c-id');
  const f=r.filter(id=>!fv(id)); if(fv('c-phone')&&fv('c-phone').replace(/\D/g,'').length<10) f.push('c-phone'); return [...new Set(f)]; }
function actualizar(){ $('#c-send').href=wa(mensaje()); }
function setType(t){ ctype=t==='cliente'?'cliente':'nuevo';
  $$('#c-type button').forEach(b=>{ const on=b.dataset.t===ctype; b.classList.toggle('on',on); b.setAttribute('aria-checked',String(on)); });
  $('#c-idwrap').hidden=ctype!=='cliente'; if(ctype!=='cliente') $('#c-id').classList.remove('err');
  if($('#alta-err').textContent){ const f=faltan(); $('#alta-err').textContent=f.length?'Falta: '+f.map(x=>LBL[x]).join(', ')+'.':''; }
  $('#alta-t').textContent=ctype==='cliente'?'Escríbenos con tu número de cliente':'Te damos de alta';
  actualizar(); }
function openAlta(t){ setType(t); $('#alta-err').textContent=''; FIELDS.forEach(id=>$('#'+id).classList.remove('err'));
  altaFocus=document.activeElement; alta.classList.add('open'); alta.setAttribute('aria-hidden','false'); if(window.lenis) window.lenis.stop();
  setTimeout(()=>$(t==='cliente'?'#c-id':'#c-name').focus({preventScroll:true}),350); }
function closeAlta(){ closeIdHelp(false,true); alta.classList.remove('open'); alta.setAttribute('aria-hidden','true'); if(window.lenis) window.lenis.start(); if(altaFocus) altaFocus.focus({preventScroll:true}); }
$$('[data-alta]').forEach(b=>b.addEventListener('click',()=>openAlta(b.dataset.alta)));
$$('[data-alta-close]',alta).forEach(el=>el.addEventListener('click',closeAlta));
$('#c-type').addEventListener('click',e=>{ const b=e.target.closest('button[data-t]'); if(!b) return; setType(b.dataset.t);
  if(b.dataset.t==='cliente'){ const q=$('#c-help'); q.classList.remove('pulse'); void q.offsetWidth; q.classList.add('pulse'); } });
FIELDS.forEach(id=>$('#'+id).addEventListener('input',()=>{ $('#'+id).classList.remove('err'); guardar(); actualizar();
  if($('#alta-err').textContent){ const f=faltan().filter(x=>$('#'+x).classList.contains('err')||!fv(x)); $('#alta-err').textContent=f.length?'Falta: '+f.map(x=>LBL[x]).join(', ')+'.':''; } }));
$('#c-send').addEventListener('click',e=>{ const f=faltan();
  if(f.length){ e.preventDefault(); f.forEach(id=>$('#'+id).classList.add('err')); $('#alta-err').textContent='Falta: '+f.map(id=>LBL[id]).join(', ')+'.'; $('#'+f[0]).focus(); return; }
  $('#alta-err').textContent=''; actualizar(); });
$('#c-copy').addEventListener('click',e=>copiar(mensaje(),e.currentTarget,'Copiado','Copiar'));
// ayuda del número de cliente
function openIdHelp(){ const h=$('#idhelp'); h.hidden=false; h.classList.remove('on'); void h.offsetWidth; h.classList.add('on'); h.scrollTop=0; $('#idh-x').focus({preventScroll:true}); }
function closeIdHelp(escribir,quiet){ const h=$('#idhelp'); if(h.hidden) return; h.hidden=true; h.classList.remove('on'); if(quiet) return;
  if(escribir){ setType('cliente'); setTimeout(()=>{ $('#c-id').scrollIntoView({block:'center'}); $('#c-id').focus({preventScroll:true}); },30); } else $('#c-help').focus({preventScroll:true}); }
$('#c-help').addEventListener('click',openIdHelp);
$('#idh-x').addEventListener('click',()=>closeIdHelp(false));
$('#idh-ok').addEventListener('click',()=>closeIdHelp(true));
document.addEventListener('keydown',e=>{ if(e.key!=='Escape'||!alta.classList.contains('open')) return; if(!$('#idhelp').hidden) closeIdHelp(false); else closeAlta(); });
setType('nuevo');

// ---- videos: el archivo y su portada se piden solo cuando la sección se acerca ----
function hidratar(v){ if(v.dataset.poster){ v.poster=v.dataset.poster; delete v.dataset.poster; } if(v.dataset.src){ v.src=v.dataset.src; delete v.dataset.src; } }
const lejos=(els,margin)=>{ if(!('IntersectionObserver' in window)){ els.forEach(hidratar); return; }
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ hidratar(e.target); io.unobserve(e.target); } }),{rootMargin:margin}); els.forEach(v=>io.observe(v)); };

// ---- recetas (videos) ----
const reels=$$('.reel video');
alFinal.push(()=>lejos(reels,'120% 0px'));
$$('.reel-go').forEach(b=>b.addEventListener('click',()=>openFam(b.dataset.fam)));
$$('.reel-snd').forEach(b=>b.addEventListener('click',()=>{
  const v=b.closest('.reel').querySelector('video'); const on=v.muted;
  reels.forEach(o=>{ if(o!==v){ o.muted=true; const s=o.closest('.reel').querySelector('.reel-snd'); s.setAttribute('aria-pressed','false'); s.setAttribute('aria-label','Activar sonido'); } });
  v.muted=!on; b.setAttribute('aria-pressed',String(on)); b.setAttribute('aria-label',on?'Silenciar':'Activar sonido');
  if(on){ v.play().catch(()=>{}); }
}));
alFinal.push(()=>{ if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(en=>{ const v=en.target;
    if(en.isIntersecting){ hidratar(v); if(v.preload==='none') v.preload='auto'; if(!reduce) v.play().catch(()=>{}); } else v.pause(); }),{threshold:.35});
  reels.forEach(v=>io.observe(v));
} });

// ---- barra: siempre verde; sombra al bajar ----
const nav=$('#nav');
const onScrollNav=()=>nav.classList.toggle('solid',(window.scrollY||document.documentElement.scrollTop)>8);
window.addEventListener('scroll',onScrollNav,{passive:true}); onScrollNav();

// ---- anclas con desplazamiento suave ----
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{ const id=a.getAttribute('href'); if(id.length<2) return; const el=$(id); if(!el) return; e.preventDefault();
  if(window.lenis) window.lenis.scrollTo(el,{offset:0,duration:1.4}); else el.scrollIntoView({behavior:'smooth'}); }));

await ceder();
// ====================== ruta de la camioneta ======================
const ruta=$('#ruta'), rScene=$('#ruta-scene'), rPath=$('#ruta-path'), rTrail=$('#ruta-trail'), truck=$('#ruta-truck'), stops=$$('.ruta-stop'), negocio=$('#negocio');
const VB_W=1200, VB_H=300, F0=.085, F1=.93;
let RL=rPath.getTotalLength(), sceneW=1200, stageW=1200, rutaP=0;
function rpt(f){ const p=rPath.getPointAtLength(Math.max(0,Math.min(1,f))*RL); const k=sceneW/VB_W; return {x:p.x*k, y:p.y*(sceneW/4)/VB_H}; }
function sizeRuta(){
  stageW=ruta.clientWidth||window.innerWidth;
  const other=$('.negocio-head').offsetHeight+$('.negocio-foot').offsetHeight+(mobile()?150:170);
  const maxH=Math.max(170,window.innerHeight-other);
  sceneW = stageW<980 ? 980 : Math.round(Math.min(stageW, maxH*4));
  rScene.style.setProperty('--sw',sceneW+'px');
  rScene.style.setProperty('--tw',Math.round(Math.max(92,Math.min(150,sceneW*.11)))+'px');
  stops.forEach(s=>{ const p=rpt(+s.dataset.at); s.style.left=p.x+'px'; s.style.top=p.y+'px'; });
  setRuta(rutaP);
}
function setRuta(p){
  rutaP=p; const f=F0+p*(F1-F0);
  const a=rpt(f), b=rpt(f+.012);
  const ang=Math.max(-16,Math.min(16,Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI));
  const tw=truck.offsetWidth||132, th=tw/2;
  truck.style.transform=`translate(${(a.x-tw/2).toFixed(1)}px,${(a.y-th*.9).toFixed(1)}px) rotate(${ang.toFixed(2)}deg) scaleX(-1)`;
  rTrail.style.strokeDashoffset=(1000*(1-f)).toFixed(1);
  stops.forEach(s=>s.classList.toggle('on',f>=+s.dataset.at-.004));
  negocio.classList.toggle('llego',f>=F1-.004);
  if(sceneW>stageW){ const x=Math.max(0,Math.min(sceneW-stageW,a.x-stageW*.5)); rScene.style.transform=`translate3d(${(-x).toFixed(1)}px,0,0)`; }
  else rScene.style.transform='';
}
window.addEventListener('resize',sizeRuta);
sizeRuta();

// ====================== proceso: video a pantalla completa, un paso por cuarto de recorrido ======================
const pasos=$$('.paso'), pVids=$$('.proc-media video'), rail=$$('.proc-rail button'), procN=$('#proc-n');
alFinal.push(()=>lejos(pVids,'150% 0px'));
let pasoI=-1, procCerca=false; // procCerca: la sección está en pantalla o por llegar
function setPaso(i){ if(i===pasoI) return; const prev=pasoI; pasoI=i;
  pasos.forEach((p,k)=>p.classList.toggle('on',k===i));
  rail.forEach((b,k)=>{ b.classList.toggle('on',k===i); b.classList.toggle('done',k<i); b.setAttribute('aria-current',k===i?'step':'false'); });
  procN.textContent=String(i+1);
  pVids.forEach((v,k)=>{ v.classList.toggle('prev',k===prev); const on=k===i; v.classList.toggle('on',on);
    if(on && procCerca){ hidratar(v); if(v.preload!=='auto') v.preload='auto'; if(!reduce) v.play().catch(()=>{}); }
    else if(k!==prev) v.pause(); });
  if(prev>=0) setTimeout(()=>{ const pv=pVids[prev]; if(pasoI!==prev){ pv.classList.remove('prev'); pv.pause(); } },1050); }
alFinal.push(()=>{ if('IntersectionObserver' in window){ new IntersectionObserver(es=>es.forEach(e=>{ procCerca=e.isIntersecting; if(e.isIntersecting){ pVids.forEach(v=>{ hidratar(v); if(v.preload==='none') v.preload='metadata'; }); const v=pVids[Math.max(0,pasoI)]; v.preload='auto'; if(!reduce) v.play().catch(()=>{}); } else pVids.forEach(v=>v.pause()); }),{rootMargin:'30% 0px'}).observe($('#proceso')); } });

await ceder();
// ====================== 3D (solo el queso del inicio) + scroll ======================
const canvas=$('#gl');
let three=null, heroP=0, heroSec='hero', heroST=null;
const hasGsap=typeof gsap!=='undefined' && typeof ScrollTrigger!=='undefined';
if(!hasGsap) html.classList.add('no-gsap');
if(hasGsap){ gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ignoreMobileResize:true}); }
// ¿hay WebGL? (se pide el contexto en el mismo canvas que usará la escena)
const glOK=!reduce && hasGsap && (()=>{ try{ return !!(canvas.getContext('webgl2',{antialias:true,alpha:true})||canvas.getContext('webgl',{antialias:true,alpha:true})); }catch(e){ return false; } })();
if(!glOK && !reduce) html.classList.add('no-gl');
// WebGL por software (sin tarjeta de video): el 3D sería lento, así que se queda la rueda fija (…/?3d lo fuerza para pruebas)
const glSoft=glOK && !/[?&]3d\b/.test(location.search) && (()=>{ try{ const g=canvas.getContext('webgl2')||canvas.getContext('webgl'); const ext=g.getExtension('WEBGL_debug_renderer_info'); const r=String(g.getParameter(ext?ext.UNMASKED_RENDERER_WEBGL:g.RENDERER)); return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r); }catch(e){ return false; } })();
function sinGL(){ html.classList.add('no-gl'); if(heroST){ heroST.scrollTrigger&&heroST.scrollTrigger.kill(true); heroST.kill(); heroST=null; } gsap.set('.hero-copy',{clearProps:'all'}); ScrollTrigger.refresh(); }
// la escena 3D (three.js) se descarga y arma cuando el navegador queda libre o al primer gesto: la página aparece al instante
let pedida=false;
function cargar3D(){
  if(pedida || !glOK || glSoft) return; pedida=true;
  loadScene().then(m=>{
    three=m.createScene(canvas,{logoUrl:'assets/img/logo-srq-512.webp'}); if(!three) throw new Error('sin contexto');
    three.setHero(heroP); three.setSection(heroSec); if(heroSec==='none') canvas.classList.add('off');
    window.addEventListener('pointermove',e=>{ three.setMouse((e.clientX/window.innerWidth-.5)*2,(e.clientY/window.innerHeight-.5)*2); },{passive:true});
    window.addEventListener('deviceorientation',e=>{ if(e.gamma==null) return; three.setMouse(Math.max(-1,Math.min(1,e.gamma/30)),Math.max(-1,Math.min(1,(e.beta-45)/30))); },{passive:true});
    let last=0, frames=0;
    gsap.ticker.add((t)=>{ const dt=Math.min(.05,t-last); last=t; if(document.hidden||three.S.section==='none') return; three.frame(dt); if(++frames===3) html.classList.add('gl-ready'); });
    three.warm();
  }).catch(e=>{ console.warn('3D no disponible',e); three=null; sinGL(); });
}
if(glOK && !glSoft){
  const gestos=['pointerdown','pointermove','touchstart','wheel','keydown','scroll'];
  const ya=()=>{ gestos.forEach(g=>window.removeEventListener(g,ya)); cargar3D(); };
  gestos.forEach(g=>window.addEventListener(g,ya,{passive:true}));
  const libre=()=>('requestIdleCallback' in window)?requestIdleCallback(cargar3D,{timeout:2000}):setTimeout(cargar3D,200);
  if(document.readyState==='complete') setTimeout(libre,4000); else window.addEventListener('load',()=>setTimeout(libre,4000),{once:true});
}

// Lenis (scroll suave con rueda; en celular el dedo manda)
if(hasGsap && typeof Lenis!=='undefined' && !reduce){
  const lenis=new Lenis({lerp:.095,smoothWheel:true});
  window.lenis=lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add((t)=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}

setPaso(0);
if(hasGsap && !reduce){
  if(glOK){
    // --- INICIO: la rueda se abre ---
    const sec=(s)=>{ heroSec=s; if(three) three.setSection(s); canvas.classList.toggle('off',s==='none'); };
    heroST=gsap.timeline({scrollTrigger:{trigger:'#inicio',start:'top top',end:'+=260%',pin:true,pinSpacer:'#inicio-pin',scrub:.6,anticipatePin:1,
      onUpdate:(self)=>{ heroP=self.progress; if(three) three.setHero(heroP); },
      onEnter:()=>sec('hero'), onEnterBack:()=>sec('hero'), onLeave:()=>sec('none')
    }}).to('.hero-copy',{opacity:0,y:-60,duration:.22,ease:'power2.in'},0.02)
      .to('.scroll-hint',{opacity:0,duration:.08},0)
      .fromTo('.hero-cap[data-cap="0"]',{opacity:0,y:14},{opacity:1,y:0,duration:.08},.2).to('.hero-cap[data-cap="0"]',{opacity:0,y:-10,duration:.07},.38)
      .fromTo('.hero-cap[data-cap="1"]',{opacity:0,y:14},{opacity:1,y:0,duration:.08},.46).to('.hero-cap[data-cap="1"]',{opacity:0,y:-10,duration:.07},.64)
      .fromTo('.hero-cap[data-cap="2"]',{opacity:0,y:14},{opacity:1,y:0,duration:.08},.70).to('.hero-cap[data-cap="2"]',{opacity:0,y:-10,duration:.07},.86)
      .fromTo('.hero-sello',{opacity:0,scale:.6,rotate:-20},{opacity:1,scale:1,rotate:8,duration:.1,ease:'back.out(2)'},.46).to('.hero-sello',{opacity:0,duration:.06},.88)
      .to('.hero-poster img',{opacity:0,y:-40,duration:.12,ease:'power1.in'},.84);
  }else{
    gsap.to('.scroll-hint',{opacity:0,ease:'none',scrollTrigger:{trigger:'#inicio',start:'top top',end:'+=25%',scrub:true}});
  }
  await ceder();
  // --- PROCESO: pantalla completa, cada cuarto del recorrido es un paso ---
  const procST=ScrollTrigger.create({trigger:'#proceso',start:'top top',end:'+=300%',pin:true,anticipatePin:1,onUpdate:(self)=>setPaso(Math.min(3,Math.floor(self.progress*4)))});
  rail.forEach((b,k)=>b.addEventListener('click',()=>{ const y=procST.start+(procST.end-procST.start)*(k+.5)/4; if(window.lenis) window.lenis.scrollTo(y,{duration:1}); else window.scrollTo({top:y,behavior:'smooth'}); }));

  await ceder();
  // --- FAMILIAS: carril con el scroll (igual en celular y en compu) ---
  const track=$('#fam-track'), famBar=$('.fam-prog span');
  const famDist=()=>Math.max(0,track.scrollWidth-window.innerWidth);
  gsap.to(track,{x:()=>-famDist(),ease:'none',scrollTrigger:{trigger:'#familias',start:'top top',end:()=>'+='+Math.max(famDist(),1),pin:true,scrub:mobile()?.35:.8,anticipatePin:1,invalidateOnRefresh:true,
    onUpdate:(self)=>famBar.style.setProperty('--p',self.progress.toFixed(3))}});

  await ceder();
  // --- recetas: los dos videos suben a distinto ritmo ---
  const m=mobile();
  $$('.reel').forEach((r,k)=>{ const col=m?k%2:k%3, f=[1,2,1.5][col]; gsap.fromTo(r,{y:(m?30:60)*f},{y:(m?-12:-25)*f,ease:'none',scrollTrigger:{trigger:'#recetas',start:'top bottom',end:'bottom top',scrub:true}}); });

  await ceder();
  // --- PARA TU NEGOCIO: la camioneta recorre la ruta ---
  ScrollTrigger.create({trigger:'#negocio',start:'top top',end:'+=130%',pin:true,scrub:.5,anticipatePin:1,
    onUpdate:(self)=>setRuta(self.progress),onRefresh:sizeRuta});

  await ceder();
  // --- entradas suaves de las secciones ---
  $$('.familias-head, .recetas-head, .leche-inner, .negocio-head').forEach(el=>{
    gsap.fromTo(el,{opacity:.001,y:30},{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 85%',once:true}});
  });

  // un solo recálculo cuando ya cargaron las letras (ScrollTrigger recalcula solo al terminar de cargar la página)
  if(document.fonts && document.fonts.status!=='loaded') document.fonts.ready.then(()=>{ sizeRuta(); ScrollTrigger.refresh(); });
}else{
  // sin animaciones: todo queda quieto y legible
  rail.forEach((b,k)=>b.addEventListener('click',()=>setPaso(k)));
  setRuta(1);
}

// ====================== aviso de privacidad completo ======================
const aviso=$('#aviso'); let avBack=null;
function openAviso(origen){ avBack=origen||document.activeElement; aviso.hidden=false; aviso.classList.remove('on'); void aviso.offsetWidth; aviso.classList.add('on');
  $('#av-body').scrollTop=0; html.classList.add('av-open'); if(window.lenis) window.lenis.stop(); $('#av-x').focus({preventScroll:true}); }
function closeAviso(){ if(aviso.hidden) return; aviso.hidden=true; aviso.classList.remove('on'); html.classList.remove('av-open');
  if(window.lenis && !drawer.classList.contains('open') && !alta.classList.contains('open')) window.lenis.start(); if(avBack&&avBack.focus) avBack.focus({preventScroll:true}); }
document.addEventListener('click',e=>{ const a=e.target.closest('[data-aviso]'); if(a){ e.preventDefault(); e.stopPropagation(); openAviso(a); } },true);
$('#av-x').addEventListener('click',closeAviso); $('#av-ok').addEventListener('click',closeAviso);
aviso.addEventListener('click',e=>{ if(e.target===aviso) closeAviso(); });
window.addEventListener('keydown',e=>{ if(e.key==='Escape' && !aviso.hidden){ e.stopImmediatePropagation(); closeAviso(); } },true);
// liga directa: …/#aviso-de-privacidad
if(location.hash==='#aviso-de-privacidad'){ openAviso(); try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} }

// ---- botones magnéticos (solo con mouse) ----
if(hasGsap && !reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  $$('.btn').forEach(b=>{
    b.addEventListener('pointermove',e=>{ const r=b.getBoundingClientRect(); gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.28,duration:.4,ease:'power2.out'}); });
    b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.5)'}));
  });
}

// ya con el scroll armado: empezar a vigilar videos
await ceder();
alFinal.forEach(f=>f());
