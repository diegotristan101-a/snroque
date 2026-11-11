import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

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

function noiseTexture(size, base, amp, holes, holeRGB='120,90,20', holeA=.35, tint=[1,.9,.6]){
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
      d[i]=clamp(d[i]+k*tint[0],0,255); d[i+1]=clamp(d[i+1]+k*tint[1],0,255); d[i+2]=clamp(d[i+2]+k*tint[2],0,255);
    }
  }
  ctx.putImageData(img,0,0);
  if(holes){
    for(let i=0;i<holes;i++){
      const r=1+rnd()*2.2, x=rnd()*size, y=rnd()*size;
      const g=ctx.createRadialGradient(x,y,0,x,y,r*2.2);
      g.addColorStop(0,`rgba(${holeRGB},${holeA})`); g.addColorStop(1,`rgba(${holeRGB},0)`);
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

  // materiales: queso Ranchero con las texturas de las fotos reales (tapa, costado con las marcas de la manta y corte)
  const texLoader=new THREE.TextureLoader();
  const foto=(n,rx=1,ry=1)=>{ const t=texLoader.load((opts.base||'assets/img/')+n); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.anisotropy=8; return t; };
  const relieve=(n,rx=1,ry=1)=>{ const t=texLoader.load((opts.base||'assets/img/')+n); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); return t; };
  const inBump=noiseTexture(256,'#8c8c8c',150,300,'0,0,0',.8,[1,1,1]);
  const capMat=new THREE.MeshPhysicalMaterial({color:0xFFF4D8,map:foto('ranchero-tapa.webp'),bumpMap:relieve('ranchero-tapa.webp'),bumpScale:.035,roughness:.62,sheen:.4,sheenColor:0xffffff,sheenRoughness:.6});
  const sideMat=new THREE.MeshPhysicalMaterial({color:0xFFF4D8,map:foto('ranchero-lado.webp'),bumpMap:relieve('ranchero-lado.webp'),bumpScale:.05,roughness:.55,clearcoat:.08,clearcoatRoughness:.6,sheen:.4,sheenColor:0xffffff,sheenRoughness:.6});
  const inside=new THREE.MeshPhysicalMaterial({color:0xFFF6DE,map:foto('ranchero-corte.webp',1.5,1.5),bumpMap:relieve('ranchero-corte.webp',1.5,1.5),bumpScale:.07,roughness:.92,side:THREE.DoubleSide});
  const crumbMat=new THREE.MeshPhysicalMaterial({color:0xF4EEDA,bumpMap:inBump,bumpScale:.02,roughness:.85});
  const shadowMat=new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false,opacity:1});


  function shadow(scale=2.6){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),shadowMat.clone()); m.rotation.x=-Math.PI/2; m.scale.setScalar(scale); m.renderOrder=-1; return m;
  }

  // ---------- QUESO RANCHERO (inicio) ----------
  // Rueda baja de orilla redondeada. Se arma por revolución (LatheGeometry) en dos piezas: el cuerpo y la rebanada.
  // Las caras del corte llevan otro material para que al partirlo se vea el queso por dentro.
  const R=1.3, H=.98, BV=.045, P0=-2.42, P1=-1.38, REP=3; // radio, alto, redondeo, ángulos de la rebanada y repeticiones del costado
  const perfil=[]; // (radio, altura) de abajo hacia arriba
  perfil.push(new THREE.Vector2(0,-H/2));
  for(let i=0;i<=6;i++){ const a=-Math.PI/2+i/6*Math.PI/2; perfil.push(new THREE.Vector2(R-BV+Math.cos(a)*BV,-H/2+BV+Math.sin(a)*BV)); }
  for(let i=1;i<8;i++){ const y=-H/2+BV+(H-2*BV)*i/8; perfil.push(new THREE.Vector2(R+Math.sin(i/8*Math.PI)*.018-(i/8)*.03,y)); } // panza ligera, un poco más angosto arriba
  for(let i=0;i<=6;i++){ const a=i/6*Math.PI/2; perfil.push(new THREE.Vector2(R-.03-BV+Math.cos(a)*BV,H/2-BV+Math.sin(a)*BV)); }
  perfil.push(new THREE.Vector2(0,H/2));
  const PACK=3.9, PACK_DX=.0, PACK_DZ=.0; // tamaño y centrado de la foto del empaque sobre el queso
  const N=perfil.length, iA=4, iB=N-5; // cortes del perfil: base | costado | tapa
  const corte=new THREE.Shape(perfil.map(v=>v.clone()));
  { const sg=new THREE.ShapeGeometry(corte); const u=sg.attributes.uv; for(let i=0;i<u.count;i++) u.setXY(i,u.getX(i)/R,u.getY(i)/R); corte.geo=sg; }
  function pieza(a0,a1){
    const g=new THREE.Group();
    const seg=Math.max(12,Math.round((a1-a0)/(Math.PI*2)*150));
    const parte=(pts,mat,tipo)=>{ const lg=new THREE.LatheGeometry(pts,seg,a0,a1-a0); const pos=lg.attributes.position, uv=lg.attributes.uv;
      for(let i=0;i<pos.count;i++){ const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        if(tipo==='lado'){ const phi=a0+uv.getX(i)*(a1-a0); uv.setXY(i,phi/(Math.PI*2)*REP,(y+H/2)/H); }
        else uv.setXY(i,x/(2*R)*.97+.5,.5-z/(2*R)*.97); }
      g.add(new THREE.Mesh(lg,mat)); };
    parte(perfil.slice(0,iA+1),capMat,'tapa'); parte(perfil.slice(iA,iB+1),sideMat,'lado'); parte(perfil.slice(iB),capMat,'tapa');
    for(const a of [a0,a1]){ const m=new THREE.Mesh(corte.geo,inside); m.rotation.y=a-Math.PI/2; g.add(m); }
    return g;
  }
  const hero=new THREE.Group(); scene.add(hero);
  const wheel=new THREE.Group(); hero.add(wheel);
  const body=pieza(P1,P0+Math.PI*2); wheel.add(body);
  const wedge=pieza(P0,P1); wheel.add(wedge);
  const am=(P0+P1)/2, wedgeDir=new THREE.Vector3(Math.sin(am),0,Math.cos(am));
  // empaque: la tapa impresa del Ranchero 300 g (foto del catálogo) cubre el queso al inicio y se levanta al deslizar
  const tapaG=new THREE.Group(); hero.add(tapaG);
  const packMat=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.02,side:THREE.DoubleSide,depthWrite:false,toneMapped:false,color:0xf2f2f2});
  const pack=new THREE.Mesh(new THREE.PlaneGeometry(1,1),packMat); pack.rotation.x=-Math.PI/2; pack.visible=false; pack.renderOrder=2; tapaG.add(pack);
  texLoader.load(opts.packUrl||'assets/prod/102.webp',t=>{ t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; packMat.map=t; packMat.needsUpdate=true; pack.visible=true; });
  const wheelShadow=shadow(3.4); wheelShadow.position.y=-H/2-.3; hero.add(wheelShadow);
  // moronas flotando (el Ranchero se desmorona)
  const cubes=[];
  for(let i=0;i<9;i++){
    const cg=new THREE.IcosahedronGeometry(.15,3); const cp=cg.attributes.position; const sx=.8+rnd()*.5, sy=.6+rnd()*.4, sz=.8+rnd()*.5;
    for(let k=0;k<cp.count;k++){ const x=cp.getX(k),y=cp.getY(k),z=cp.getZ(k); const j=1+Math.sin(x*14+i)*Math.cos(y*12+i*2)*.16+Math.sin(z*33+x*21+i)*.07; cp.setXYZ(k,x*sx*j,y*sy*j,z*sz*j); }
    cg.computeVertexNormals();
    const m=new THREE.Mesh(cg,crumbMat); const a=rnd()*Math.PI*2, r=2.25+rnd()*.9;
    m.userData={a,r,y:(rnd()-.5)*1.8,s:.35+rnd()*.5,rot:new THREE.Vector3(rnd(),rnd(),rnd()),sp:.15+rnd()*.25};
    m.scale.setScalar(m.userData.s); hero.add(m); cubes.push(m);
  }

  // ---------- estado ----------
  const S={section:'hero',hero:0,heroS:0,proc:0,procS:0,mx:0,my:0,mxs:0,mys:0,t:0};
  const L={x:1.75,y:0,sc:1,psc:1,dropY:2.35,dolly:1.1,wd:.9,wx:0}; // layout del objeto principal
  function layout(){
    const w=window.innerWidth,h=window.innerHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
    if(isMobile()){ L.x=0; L.y=-1.0; L.sc=.6; L.psc=.5; L.dropY=1.2; L.dolly=.45; L.wd=.62; L.wx=.42; } else { L.wd=.9; L.wx=0; }
    if(isMobile()){ } else if(w<1200){ L.x=1.45; L.y=-.05; L.sc=.9; L.psc=.9; L.dropY=1.75; L.dolly=1.0; } else { L.x=1.65; L.y=-.05; L.sc=.92; L.psc=.95; L.dropY=1.75; L.dolly=1.1; }
  }
  layout(); window.addEventListener('resize',layout);

  
  function updateHero(){
    const p=S.heroS, t=S.t;
    hero.visible = S.section==='hero';
    if(!hero.visible) return;
    hero.position.set(L.x,L.y,0); hero.scale.setScalar(L.sc);
    // el empaque se levanta y se va antes de partir el queso
    const q=easeIO(clamp((p-.02)/.15));
    tapaG.rotation.x=.5+S.mys*.06; tapaG.rotation.z=S.mxs*.05;
    pack.scale.setScalar(PACK); pack.position.set(PACK_DX,H/2+.035+1.7*q,PACK_DZ-1.5*q); pack.rotation.x=-Math.PI/2-.9*q; pack.rotation.z=.25*q;
    packMat.opacity=1-smooth(.35,.85,q); pack.visible=!!packMat.map && q<.995;
    // la rueda se mece y gira con el scroll hasta dejar el corte de frente
    wheel.rotation.x=.5+S.mys*.06+.1*easeIO(clamp((p-.2)/.4)); wheel.rotation.z=S.mxs*.05;
    wheel.rotation.y=Math.sin(t*.35)*.14+p*1.6+.5;
    // rebanada: sale, sube y se voltea para enseñar el corte
    const p1=easeIO(clamp((p-.2)/.34));
    const p2=easeOut(clamp((p-.36)/.34));
    const giro=-1.25*p2; // la rebanada se abre como puerta desde la punta y deja ver sus caras y el hueco
    wedge.position.set(Math.sin(am+giro*.6),0,Math.cos(am+giro*.6)).multiplyScalar(L.wd*p1); wedge.position.y=.3*p1+Math.sin(t*1.4)*.03*p1;
    wedge.rotation.set(-.16*p2,giro,0);
    // acercamiento
    const dolly=easeIO(clamp((p-.5)/.3));
    camera.position.z=7.2-L.dolly*dolly; camera.position.y=.25-.12*dolly;
    camera.position.x=S.mxs*.18; camera.lookAt(S.mxs*.18*.4, -.1*dolly, 0);
    // salida
    const out=easeIn(clamp((p-.82)/.16));
    hero.position.x=L.x+L.wx*p1-8.5*out; hero.position.y=L.y+1.2*out; wheel.rotation.z+=out*1.2;
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
