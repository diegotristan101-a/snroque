import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ====================== utilidades ======================
const clamp = (v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const SNAP = /snap/.test(location.search); // prueba: sin suavizado
const lerp  = (a,b,t)=>a+(b-a)*t;
const smooth= (a,b,x)=>{ const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
const easeOut=(t)=>1-Math.pow(1-clamp(t),3);
const easeIn =(t)=>Math.pow(clamp(t),2);
const easeIO =(t)=>{t=clamp(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
// ruido determinista sencillo
let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };

function noiseTexture(size, base, amp, holes){
  const c=document.createElement('canvas'); c.width=c.height=size;
  const ctx=c.getContext('2d');
  ctx.fillStyle=base; ctx.fillRect(0,0,size,size);
  const img=ctx.getImageData(0,0,size,size), d=img.data;
  // ruido suave por capas
  const n1=[], cells=16, cell=size/cells;
  for(let i=0;i<(cells+1)*(cells+1);i++) n1.push(rnd());
  for(let y=0;y<size;y++){
    for(let x=0;x<size;x++){
      const gx=x/cell, gy=y/cell, x0=Math.floor(gx), y0=Math.floor(gy), fx=gx-x0, fy=gy-y0;
      const sx=fx*fx*(3-2*fx), sy=fy*fy*(3-2*fy);
      const a=n1[y0*(cells+1)+x0], b=n1[y0*(cells+1)+x0+1], cc=n1[(y0+1)*(cells+1)+x0], dd=n1[(y0+1)*(cells+1)+x0+1];
      const v=lerp(lerp(a,b,sx),lerp(cc,dd,sx),sy)-.5;
      const fine=(rnd()-.5)*.35;
      const k=(v+fine)*amp;
      const i=(y*size+x)*4;
      d[i]=clamp(d[i]+k,0,255); d[i+1]=clamp(d[i+1]+k*.9,0,255); d[i+2]=clamp(d[i+2]+k*.6,0,255);
    }
  }
  ctx.putImageData(img,0,0);
  if(holes){
    for(let i=0;i<holes;i++){
      const r=1+rnd()*2.2, x=rnd()*size, y=rnd()*size;
      const g=ctx.createRadialGradient(x,y,0,x,y,r*2.2);
      g.addColorStop(0,'rgba(120,90,20,.35)'); g.addColorStop(1,'rgba(120,90,20,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r*2.2,0,Math.PI*2); ctx.fill();
    }
  }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
  return t;
}
function shadowTexture(){
  const c=document.createElement('canvas'); c.width=c.height=256; const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(128,128,10,128,128,128);
  g.addColorStop(0,'rgba(0,0,0,.55)'); g.addColorStop(.5,'rgba(0,0,0,.22)'); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c); return t;
}

// ====================== escena ======================
export function createScene(canvas, opts={}){
  const isMobile = ()=>window.innerWidth<860;
  let gl=null;
  try{ gl=canvas.getContext('webgl2',{antialias:true,alpha:true}) || canvas.getContext('webgl',{antialias:true,alpha:true}); }catch(e){}
  if(!gl) return null;

  const renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, isMobile()?1.5:1.5));
  renderer.setClearColor(0x000000,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
  renderer.outputColorSpace=THREE.SRGBColorSpace;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,60);
  camera.position.set(0,.25,7.2); camera.lookAt(0,0,0);

  // luz: ambiente de estudio + clave cálida
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
  if('environmentIntensity' in scene) scene.environmentIntensity=.75;
  const key=new THREE.DirectionalLight(0xfff3d6,2.2); key.position.set(3.5,5,4); scene.add(key);
  const fill=new THREE.DirectionalLight(0xd8ffe6,.6); fill.position.set(-4,2,2); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xffffff,0x00843d,.5));

  // materiales
  const pasteTex=noiseTexture(512,'#F3D98D',18,34); pasteTex.repeat.set(.45,.45);
  const bumpTex=noiseTexture(256,'#808080',70,0);   bumpTex.repeat.set(.6,.6);
  const cheeseCap=new THREE.MeshPhysicalMaterial({color:0xF6DE93,map:pasteTex,bumpMap:bumpTex,bumpScale:.012,roughness:.5,clearcoat:.14,clearcoatRoughness:.5,sheen:.4,sheenColor:0xfff4cf,sheenRoughness:.7});
  const cheeseWall=new THREE.MeshPhysicalMaterial({color:0xEFCF78,bumpMap:bumpTex,bumpScale:.01,roughness:.52,clearcoat:.14,clearcoatRoughness:.5,sheen:.4,sheenColor:0xfff4cf,sheenRoughness:.7});
  const cheesePlain=new THREE.MeshPhysicalMaterial({color:0xF4DD95,bumpMap:bumpTex,bumpScale:.012,roughness:.55,clearcoat:.1,clearcoatRoughness:.6,sheen:.5,sheenColor:0xfff4cf});
  const shadowMat=new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false,opacity:1});

  const texLoader=new THREE.TextureLoader();
  const logoTex=texLoader.load(opts.logoUrl||'assets/img/logo-srq-512.webp'); logoTex.colorSpace=THREE.SRGBColorSpace;

  function shadow(scale=2.6){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),shadowMat.clone()); m.rotation.x=-Math.PI/2; m.scale.setScalar(scale); m.renderOrder=-1; return m;
  }

  // ---------- RUEDA (inicio) ----------
  const R=1.32, H=.6, A0=-.14, A1=.80, BT=.085;
  function sector(r,a0,a1){ const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(r*Math.cos(a0),r*Math.sin(a0)); s.absarc(0,0,r,a0,a1,false); s.lineTo(0,0); return s; }
  const ext={depth:H,bevelEnabled:true,bevelThickness:BT,bevelSize:BT,bevelOffset:0,bevelSegments:7,curveSegments:160};
  function cheesePiece(shape){
    const g=new THREE.ExtrudeGeometry(shape,ext); g.rotateX(-Math.PI/2); g.translate(0,-H/2,0); g.computeVertexNormals();
    return new THREE.Mesh(g,[cheeseCap,cheeseWall]);
  }
  const hero=new THREE.Group(); scene.add(hero);
  const wheel=new THREE.Group(); hero.add(wheel);
  const body=cheesePiece(sector(R,A1,A0+Math.PI*2)); wheel.add(body);
  const wedge=cheesePiece(sector(R,A0,A1)); wheel.add(wedge);
  const am=(A0+A1)/2, wedgeDir=new THREE.Vector3(Math.cos(am),0,-Math.sin(am));
  // marca "estampada" en la tapa
  const decal=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.0*900/840),new THREE.MeshStandardMaterial({map:logoTex,transparent:true,opacity:.42,color:0x8a6d2a,roughness:.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
  decal.rotation.x=-Math.PI/2; decal.rotation.z=-Math.PI/2-am; decal.position.set(-.18,H/2+BT+.004,.10); wheel.add(decal);
  const wheelShadow=shadow(3.4); wheelShadow.position.y=-H/2-BT-.35; hero.add(wheelShadow);
  // cubitos flotantes
  const cubes=[]; const cubeGeo=new RoundedBoxGeometry(.3,.3,.3,3,.07);
  for(let i=0;i<8;i++){
    const m=new THREE.Mesh(cubeGeo,cheesePlain); const a=rnd()*Math.PI*2, r=2.1+rnd()*.9;
    m.userData={a,r,y:(rnd()-.5)*1.8,s:.6+rnd()*.7,rot:new THREE.Vector3(rnd(),rnd(),rnd()),sp:.15+rnd()*.25};
    m.scale.setScalar(m.userData.s); hero.add(m); cubes.push(m);
  }

  // ---------- estado ----------
  const S={section:'hero',hero:0,heroS:0,proc:0,procS:0,mx:0,my:0,mxs:0,mys:0,t:0};
  const L={x:1.75,y:0,sc:1,psc:1,dropY:2.35,dolly:1.1}; // layout del objeto principal
  function layout(){
    const w=window.innerWidth,h=window.innerHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
    if(isMobile()){ L.x=0; L.y=-1.0; L.sc=.6; L.psc=.5; L.dropY=1.2; L.dolly=.45; }
    if(isMobile()){ } else if(w<1200){ L.x=1.45; L.y=-.05; L.sc=.9; L.psc=.9; L.dropY=1.75; L.dolly=1.0; } else { L.x=1.65; L.y=-.05; L.sc=.92; L.psc=.95; L.dropY=1.75; L.dolly=1.1; }
  }
  layout(); window.addEventListener('resize',layout);

  
  function updateHero(){
    const p=S.heroS, t=S.t;
    hero.visible = S.section==='hero';
    if(!hero.visible) return;
    hero.position.set(L.x,L.y,0); hero.scale.setScalar(L.sc);
    // la rueda gira con el tiempo y con el scroll
    wheel.rotation.x=.46+S.mys*.06; wheel.rotation.z=S.mxs*.05;
    wheel.rotation.y=t*.06+p*1.6+.5;
    // cuña: sale, sube y se inclina
    const p1=easeIO(clamp((p-.18)/.36));
    const p2=easeOut(clamp((p-.42)/.3));
    wedge.position.copy(wedgeDir).multiplyScalar(1.15*p1); wedge.position.y=.55*p1+Math.sin(t*1.4)*.03*p1;
    wedge.rotation.set(0,0,0);
    wedge.rotateOnWorldAxis(wedgeDir.clone().cross(new THREE.Vector3(0,1,0)).normalize(), -.55*p2);
    // acercamiento
    const dolly=easeIO(clamp((p-.5)/.3));
    camera.position.z=7.2-L.dolly*dolly; camera.position.y=.25-.12*dolly;
    camera.position.x=S.mxs*.18; camera.lookAt(S.mxs*.18*.4, -.1*dolly, 0);
    // salida
    const out=easeIn(clamp((p-.82)/.16));
    hero.position.x=L.x-8.5*out; hero.position.y=L.y+1.2*out; wheel.rotation.z+=out*1.2;
    wheelShadow.material.opacity=1-p1*.35; wheelShadow.scale.setScalar(3.4*(1+.1*p1));
    // cubitos
    cubes.forEach((m,i)=>{ const u=m.userData; const a=u.a+t*u.sp; const spread=1+out*4;
      m.position.set(Math.cos(a)*u.r*spread, u.y+Math.sin(t*.9+i)*.12, Math.sin(a)*u.r*.55-.4);
      m.rotation.set(t*u.rot.x,t*u.rot.y,t*u.rot.z); m.scale.setScalar(u.s*(1-out)); });
  }

  function frame(dt){
    S.t+=dt;
    const k=SNAP?1:.28; S.heroS=lerp(S.heroS,S.hero,k);
    S.mxs=lerp(S.mxs,S.mx,.06); S.mys=lerp(S.mys,S.my,.06);
    if(S.section==='none'){ return; }
    updateHero();
    renderer.render(scene,camera);
  }

  return {
    renderer, scene, camera, S,
    frame,
    setHero(p){ S.hero=p; },
    setSection(s){ S.section=s; if(s!=='none') renderer.render(scene,camera); },
    setMouse(x,y){ S.mx=x; S.my=y; },
    warm(){ // compila los shaders de todo antes de que se vea
      hero.visible=true;
      try{ renderer.compile(scene,camera); }catch(e){}
      updateHero(); renderer.render(scene,camera); }
  };
}
