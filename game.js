
const $=i=>document.getElementById(i);
const rnd=()=>Math.random();
const ld=(k,d)=>{try{return{...d,...JSON.parse(localStorage.getItem(k))}}catch{return{...d}}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
// ---------- map & settings ----------
const C=4,D=[[1,0],[-1,0],[0,1],[0,-1]];
let MAP,W,H,ROOMS,SEED=0,items,bats,closets,ventP,spawn,mspawn,exitP,fm,bm,exm,vents,doorM,DOPEN=false,cans,genP,jm,genM,genLamp,genHumOn=false,OBS=[],doorP,cdirs=[],gateLeaves=[],gateLight,noises,nm,Nf=[],boxes=[],MB=[];
const FH=4;let MAPS=[],RS=[],NF=1,GF=0,STAIRS=[],FGS=[],TG;
let LOCKROOM=null,CFL=0,keyItems=[],LOCKS=[],LKI={},LOCKM=[],Kf=[],km=[],DOORS=[],DRI={},DOORM=[];
function zoneAt(f,x,z){const c=x/C|0,r=z/C|0,rs=RS[f]||[];for(let i=0;i<rs.length;i++){const o=rs[i];if(c>=o.c0&&c<=o.c1&&r>=o.r0&&r<=o.r1)return ZI[f].rooms[i]}return ZI[f]?ZI[f].hall:0}
function useF(f){MAP=MAPS[f];ROOMS=RS[f];CFL=f}
function leafSeg(cx,cz,ew){const a=.3624,b=.932,h=ew?[0,1.78]:[-1.78,0],d=ew?[b,-a]:[a,b];return[cx+h[0],cz+h[1],cx+h[0]+d[0]*3.5,cz+h[1]+d[1]*3.5]}   // where an open door leaf lies (hinged 69 degrees open)
function isShut(f,c,r){const k=DRI[f+':'+c+','+r];return k!==undefined&&!DOORS[k].open}
function isLocked(f,c,r){const k=LKI[f+':'+c+','+r];return k!==undefined&&!LOCKS[k].open}
function groundY(x,z,f){for(const s of STAIRS)if((f==s.lo||f==s.lo+1)&&x>=s.x0&&x<=s.x1&&z>=s.z0&&z<=s.z1)return(s.lo+(x-s.x0)/(s.x1-s.x0))*FH;return f*FH}
const ctr=(c,r)=>[c*C+C/2,r*C+C/2];
const roomAt=(c,r)=>{if(MAP[r]&&MAP[r][c]==',')return'yard';for(const o of ROOMS)if(c>=o.c0&&c<=o.c1&&r>=o.r0&&r<=o.r1)return o.t;return'hall'};
function loadMap(seed,size,nf){const g=genMap(seed,size,nf);MAPS=g.floors.map(f=>f.rows);RS=g.floors.map(f=>f.rooms);NF=MAPS.length;GF=g.gf||0;LOCKROOM=g.lockRoom;H=MAPS[0].length;W=MAPS[0][0].length;
 STAIRS=g.stairs.map(s=>({lo:s.lo,x0:s.c*C,x1:(s.c+2)*C,z0:s.r*C,z1:(s.r+1)*C}));
 items=[];bats=[];closets=[];ventP=[];cans=[];genP=null;OBS=[];noises=[];boxes=[];cdirs=[];keyItems=[];LOCKS=[];LKI={};DOORS=[];DRI={};
 MAPS.forEach((mp,f)=>{useF(f);const cl=[],lk=[],dl=[];
  mp.forEach((row,r)=>[...row].forEach((ch,c)=>{const p=[...ctr(c,r),f];
   if(ch=='F')items.push(p);if(ch=='B')bats.push(p);if(ch=='H')cl.push(p);if(ch=='V')ventP.push(p);if(ch=='J')cans.push(p);if(ch=='G')genP=p;if(ch=='D')doorP=p;if(ch=='N')noises.push(p);if(ch=='K')keyItems.push(p);if(ch=='L')lk.push([c,r]);if(ch=='d'||ch=='e')dl.push([c,r,ch]);if(ch=='S')spawn=p;if(ch=='M')mspawn=p;if(ch=='X')exitP=p}));
  const cd=cl.map(p=>{const c=p[0]/C|0,r=p[1]/C|0,ok=(a,b)=>{const k=MAP[r+b]&&MAP[r+b][c+a];return k&&k!='#'&&k!='%'&&k!='T'};let ff=null;for(const[a,b]of D)if(ok(a,b)&&!ok(-a,-b)){ff=[a,b];break}if(!ff)for(const[a,b]of D)if(ok(a,b)){ff=[a,b];break}return ff||[0,1]});
  cl.forEach((p,i)=>{closets.push([p[0]-cd[i][0]*(C/2-.8),p[1]-cd[i][1]*(C/2-.8),f]);cdirs.push(cd[i])});
  lk.forEach(([c,r])=>{const q=ctr(c,r);LKI[f+':'+c+','+r]=LOCKS.length;LOCKS.push({f,c,r,open:0,x:q[0],z:q[1]})});
  dl.forEach(([c,r,ch])=>{const q=ctr(c,r);DRI[f+':'+c+','+r]=DOORS.length;DOORS.push({f,c,r,x:q[0],z:q[1],open:0,cr:ch=='e',sg:leafSeg(q[0],q[1],MAP[r][c-1]!='#'&&MAP[r][c+1]!='#')})});
  const nfn=(c,r)=>{for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1],[2,0],[-2,0],[0,2],[0,-2]])if(MAP[r+b]&&MAP[r+b][c+a]=='.')return ctr(c+a,r+b);return null};
  RS[f].filter(o=>o.t=='nursery'||o.t=='boiler').forEach(o=>{const p=nfn((o.c0+o.c1)>>1,(o.r0+o.r1)>>1);if(p)boxes.push([p[0],p[1],f,o.t=='boiler'?'b':'m'])})});
 ZONES=[];ZI=[];RS.forEach((rs,f)=>{const o={rooms:rs.map(()=>{ZONES.push(f);return ZONES.length-1}),hall:0};ZONES.push(f);o.hall=ZONES.length-1;ZI.push(o)});
 useF(0)}
const defH={doorT:5,dark:0,cut:1,floors:1,obj:1,size:2,fuses:4,mSpeed:5.2,wSpeed:2.8,hear:18,sight:14,drain:0,sdrain:0,tele:45,grace:30,revive:4};
const defP={sens:1,vol:1,prox:true,range:16,bright:1,fov:75,mvol:1,avol:.5,res:1,vmode:0,music:.6,js:true};
const HS=ld('hh_h',defH),PS=ld('hh_p',defP);
const PSch=[['sens','Mouse sensitivity',.3,2.5,.1],['mvol','Master volume',0,1,.05],['vmode','Microphone: 0 open, 1 push-to-talk (hold V), 2 muted',0,2,1],['avol','Ambience volume',0,1,.05],['music','Chase music volume',0,1,.05],['vol','Voice volume',0,1,.05],['range','Voice range (m)',4,40,1],['bright','Brightness',.5,3,.1],['fov','Field of view',60,100,1],['res','Render scale (lower = faster)',.5,1.5,.1]];
const HSch=[['obj','Extra objectives: fuel + generator (0 off, 1 on)',0,1,1],['doorT','Monster door-breaking time (s)',1,20,1],['dark','Darkness mode: lights never work (0/1)',0,1,1],['cut','Monster can cut the lights (0/1)',0,1,1],['floors','Floors (1-3; 3 adds a basement)',1,3,1],['size','House size (1 small - 4 huge)',1,4,1],['fuses','Fuses needed',1,5,1],['mSpeed','Monster chase speed',1.5,10,.1],['wSpeed','Monster roam speed',1,8,.1],['hear','Monster hearing (m)',6,40,1],['sight','Monster sight (m)',6,30,1],['drain','Flashlight drain (%/s, 0 = infinite)',0,3,.1],['sdrain','Sprint drain (/s, 0 = infinite)',0,3,.1],['tele','Monster vent trip interval (s)',15,120,5],['grace','Grace period at start (s)',0,120,5],['revive','Revive time (s)',1,10,.5]];
function build(el,sch,o,key){el.innerHTML='';for(const[k,l,mn,mx,st]of sch){const r=document.createElement('label');
 r.innerHTML=`<span>${l}</span><input type="range" min="${mn}" max="${mx}" step="${st}" value="${o[k]}"><b>${o[k]}</b>`;
 const i=r.querySelector('input'),b=r.querySelector('b');i.oninput=()=>{o[k]=+i.value;b.textContent=i.value;sv(key,o);if(typeof applyVol=='function')applyVol();if(typeof resize=='function')resize()};el.append(r)}}
build($('ps'),PSch,PS,'hh_p');build($('ps2'),PSch,PS,'hh_p');build($('hs'),HSch,HS,'hh_h');
const DIFF=[{mSpeed:4.2,wSpeed:2.2,hear:12,sight:10,tele:75,grace:60,revive:3,cut:0,dark:0,doorT:8},{mSpeed:5.2,wSpeed:2.8,hear:18,sight:14,tele:45,grace:30,revive:4,cut:1,dark:0,doorT:5},{mSpeed:6.4,wSpeed:3.6,hear:26,sight:18,tele:30,grace:10,revive:6,cut:1,dark:1,doorT:3}];
for(let i=0;i<3;i++)$('d'+i).onclick=()=>{Object.assign(HS,DIFF[i]);sv('hh_h',HS);build($('hs'),HSch,HS,'hh_h')};
$('js').checked=PS.js!==false;$('js').onchange=e=>{PS.js=e.target.checked;sv('hh_p',PS)};$('prox').checked=PS.prox;$('prox').onchange=e=>{PS.prox=e.target.checked;sv('hh_p',PS)};
$('nm').value=(()=>{try{return localStorage.getItem('hh_name')}catch{}})()||'Player'+(Math.random()*90+10|0);
let prevView='home';
function view(v){for(const i of['home','lobby','setp'])$(i).classList.toggle('hide',i!=v)}
$('bs').onclick=()=>{prevView='home';view('setp')};$('bs2').onclick=()=>{prevView='lobby';view('setp')};$('back').onclick=()=>view(prevView);

// ---------- three.js world ----------
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
const sc=new THREE.Scene();sc.background=new THREE.Color(0x050403);sc.fog=new THREE.FogExp2(0x050403,.085);
const cam=new THREE.PerspectiveCamera(75,1,.1,400);sc.add(cam);
const amb=new THREE.AmbientLight(0x554433,.3);sc.add(amb);
const fl=new THREE.SpotLight(0xffeecc,2,32,.55,.5,1.4);sc.add(fl);
const tg=new THREE.Object3D();sc.add(tg);fl.target=tg;
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:1});
function tex(w,fn,rx,ry){const c=document.createElement('canvas');c.width=c.height=w;fn(c.getContext('2d'),w);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
const stain=(g,w,n,a)=>{for(let i=0;i<n;i++){g.fillStyle='rgba(0,0,0,'+rnd()*a+')';g.fillRect(rnd()*w,rnd()*w,rnd()*30,rnd()*30)}};
const wallT=tex(256,(g,w)=>{g.fillStyle='#4a3a2c';g.fillRect(0,0,w,w);for(let x=0;x<w;x+=32){g.fillStyle='rgba(95,60,40,.35)';g.fillRect(x,0,14,w)}stain(g,w,140,.25);for(let i=0;i<7;i++){g.fillStyle='rgba(25,5,0,.3)';g.fillRect(rnd()*w,0,3+rnd()*5,rnd()*w)}g.fillStyle='rgba(15,10,6,.7)';g.fillRect(0,w-26,w,26)},1,1);
const floorT=tex(256,(g,w)=>{g.fillStyle='#2e1e13';g.fillRect(0,0,w,w);for(let y=0;y<w;y+=32){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,y,w,2);for(let x=rnd()*60;x<w;x+=70)g.fillRect(x,y,2,32)}stain(g,w,160,.3)},W,H);
function buildWorld(){const _pre=new Set(sc.children);LAMPS=[];CANDLES=[];SW=[];BEDS=[];LOCKM=[];km=[];DOORM=[];FGS=Array.from({length:NF},(_,f)=>{const g=new THREE.Group();g.position.y=f*FH;sc.add(g);return g});TG=FGS[0];

const wm=new THREE.MeshStandardMaterial({map:wallT,roughness:1}),bx=new THREE.BoxGeometry(C,3.4,C);
const fenceT=tex(64,(g,w)=>{g.fillStyle='#1a1612';g.fillRect(0,w*.82,w,5);g.fillRect(0,w*.35,w,5);for(let x=2;x<w;x+=10){g.fillRect(x,w*.1,4,w*.9);g.beginPath();g.moveTo(x-1,w*.1);g.lineTo(x+2,0);g.lineTo(x+5,w*.1);g.fill()}},1,1);
const fenceM=new THREE.MeshStandardMaterial({map:fenceT,transparent:true,alphaTest:.5,side:THREE.DoubleSide,roughness:1}),tm=mat(0x1a120c);
for(let f=0;f<NF;f++){useF(f);TG=FGS[f];
MAP.forEach((row,r)=>[...row].forEach((ch,c)=>{const p=ctr(c,r);
 if(ch=='#'&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>MAP[r+b]&&MAP[r+b][c+a]&&MAP[r+b][c+a]!='#')){const ms=[[1,0],[-1,0],null,null,[0,1],[0,-1]].map(d=>{if(!d)return RM('hall').wall;const t=MAP[r+d[1]]&&MAP[r+d[1]][c+d[0]];const oc=c+d[0],orr=r+d[1],outside=oc<6||oc>W-7||orr<6||orr>H-7;return RM(t&&t!='#'&&t!='%'?roomAt(oc,orr):outside?'yard':'hall').wall});const m=new THREE.Mesh(bx,ms);m.position.set(p[0],1.7,p[1]);TG.add(m)}
 else if(ch=='%'){const m=new THREE.Mesh(new THREE.PlaneGeometry(C,2.4),fenceM);m.position.set(p[0],1.2,p[1]);if(c==0||c==W-1)m.rotation.y=Math.PI/2;TG.add(m)}
 else if(ch=='T'){const g=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(.22,.38,3.8,7),tm);t.position.y=1.9;g.add(t);for(let k=0;k<4;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.04,.1,2,5),tm);b.position.set(0,2.5+k*.3,0);b.rotation.set(.9,k*1.6+rnd(),0);g.add(b)}g.position.set(p[0]+rnd()-.5,0,p[1]+rnd()-.5);TG.add(g)}
 else if(ch=='d'||ch=='e'){const ew=MAP[r][c-1]!='#'&&MAP[r][c+1]!='#',dg=new THREE.Group(),di=DRI[f+':'+c+','+r],old=ch=='e';dg.position.set(p[0],0,p[1]);dg.rotation.y=ew?Math.PI/2:0;
  const hinge=new THREE.Group();hinge.position.set(-1.78,0,0);dg.add(hinge);const lf=new THREE.Mesh(new THREE.BoxGeometry(3.5,2.9,.12),cm(old?0x2c2118:0x4a3220));lf.position.set(1.75,1.45,0);hinge.add(lf);
  for(const y of[.8,2.1]){const pn=new THREE.Mesh(new THREE.BoxGeometry(2.7,1,.05),cm(old?0x1c150f:0x3a2616));pn.position.set(1.75,y,.07);hinge.add(pn)}
  const kn=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.2),cm(old?0x6a5a3a:0xb89b4a));kn.position.set(3.2,1.3,.1);hinge.add(kn);
  const li2=new THREE.Mesh(new THREE.BoxGeometry(4.2,.5,.3),cm(0x1c120a));li2.position.set(0,3.15,0);dg.add(li2);DOORM[di]=hinge;TG.add(dg)}
 else if(ch=='L'){const ew=MAP[r][c-1]!='#'&&MAP[r][c+1]!='#',dg=new THREE.Group(),li=LKI[f+':'+c+','+r],fr=cm(0x1c120a);dg.position.set(p[0],0,p[1]);dg.rotation.y=ew?Math.PI/2:0;
  const hinge=new THREE.Group();hinge.position.set(-1.78,0,0);dg.add(hinge);const lf=new THREE.Mesh(new THREE.BoxGeometry(3.5,3,.16),cm(0x3a2412));lf.position.set(1.75,1.5,0);hinge.add(lf);
  const lp=new THREE.Mesh(new THREE.BoxGeometry(.3,.4,.2),cm(0xb89b4a));lp.position.set(3.1,1.4,0);hinge.add(lp);
  for(const x of[-1.95,1.95]){const po=new THREE.Mesh(new THREE.BoxGeometry(.3,3.4,.4),fr);po.position.set(x,1.7,0);dg.add(po)}
  const li2=new THREE.Mesh(new THREE.BoxGeometry(4.2,.4,.4),fr);li2.position.set(0,3.2,0);dg.add(li2);LOCKM[li]=hinge;TG.add(dg)}
 else if(ch=='D'){const ew=MAP[r][c-1]==','||MAP[r][c+1]==',',dg=new THREE.Group();dg.position.set(p[0],0,p[1]);dg.rotation.y=ew?Math.PI/2:0;
  const wd2=cm(0x2a1a10),fr=cm(0x1c120a),b2=(w,h,d,x,y,z,mt,par)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);o.position.set(x,y,z);(par||dg).add(o);return o};
  b2(.35,3.4,.5,-1.95,1.7,0,fr);b2(.35,3.4,.5,1.95,1.7,0,fr);b2(4.2,.5,.5,0,3.15,0,fr);
  doorM=new THREE.Group();doorM.position.set(-1.78,0,0);dg.add(doorM);b2(3.5,2.9,.14,1.75,1.45,0,wd2,doorM);
  for(const z of[.09,-.09]){for(const[x,y]of[[.9,.8],[2.6,.8],[.9,2.1],[2.6,2.1]])b2(1.3,1.05,.05,x,y,z,fr,doorM);b2(.12,.12,.2,3.2,1.4,z*2.4,cm(0xb89b4a),doorM)}
  TG.add(dg)}}));
const PAD=6,hw=W-2*PAD,hh=H-2*PAD,hx=(PAD+hw/2)*C,hz=(PAD+hh/2)*C,X0=PAD*C,X1=(W-PAD)*C,Z0=PAD*C,Z1=(H-PAD)*C;
if(f<GF){floorT.repeat.set(hw,hh);const fl0=new THREE.Mesh(new THREE.PlaneGeometry(hw*C,hh*C),new THREE.MeshStandardMaterial({map:floorT,roughness:.9}));fl0.rotation.x=-Math.PI/2;fl0.position.set(hx,.004,hz);TG.add(fl0)}
if(f==GF){floorT.repeat.set(hw,hh);
 const grassT=tex(256,(g,w)=>{g.fillStyle='#141c0e';g.fillRect(0,0,w,w);for(let i=0;i<900;i++){g.fillStyle='rgba('+(20+rnd()*30|0)+','+(40+rnd()*40|0)+',15,.5)';g.fillRect(rnd()*w,rnd()*w,2,5)}},W*.6,H*.6);
 const gnd=new THREE.Mesh(new THREE.PlaneGeometry(W*C,H*C),new THREE.MeshStandardMaterial({map:grassT,roughness:1}));gnd.rotation.x=-Math.PI/2;gnd.position.set(W*C/2,0,H*C/2);TG.add(gnd);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(hw*C,hh*C),new THREE.MeshStandardMaterial({map:floorT,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.set(hx,.004,hz);TG.add(floor);
 const moon=new THREE.Mesh(new THREE.SphereGeometry(14,16,12),new THREE.MeshBasicMaterial({color:0xdde6f0,fog:false}));moon.position.set(W*C*.7,150,-120);TG.add(moon)}
const holes=STAIRS.filter(s=>s.lo==f);
if(f<NF-1){   // slab between floors, with a hole where the stairs pass through
 const sh=new THREE.Shape();sh.moveTo(X0,-Z0);sh.lineTo(X1,-Z0);sh.lineTo(X1,-Z1);sh.lineTo(X0,-Z1);sh.lineTo(X0,-Z0);
 for(const s of holes){const h=new THREE.Path();h.moveTo(s.x0,-s.z0);h.lineTo(s.x0,-s.z1);h.lineTo(s.x1,-s.z1);h.lineTo(s.x1,-s.z0);h.lineTo(s.x0,-s.z0);sh.holes.push(h)}
 const ft=floorT.clone();ft.needsUpdate=true;ft.repeat.set(.25,.25);
 const sl=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.6,bevelEnabled:false}),[new THREE.MeshStandardMaterial({map:ft,roughness:.9}),mat(0x2c2822)]);sl.rotation.x=-Math.PI/2;sl.position.y=3.4;TG.add(sl)
}else{const ceil=new THREE.Mesh(new THREE.PlaneGeometry(hw*C,hh*C),mat(0x120d0a));ceil.rotation.x=Math.PI/2;ceil.position.set(hx,3.4,hz);TG.add(ceil);const roof=new THREE.Mesh(new THREE.BoxGeometry(hw*C+1,.5,hh*C+1),mat(0x15110d));roof.position.set(hx,3.75,hz);TG.add(roof)}
for(const s of holes){const N=14,sl_=(s.x1-s.x0)/N,dk=mat(0x2a1c12),tr=mat(0x5a3f26),zc=(s.z0+s.z1)/2,xm=(s.x0+s.x1)/2,len=Math.hypot(s.x1-s.x0,FH),ang=Math.atan2(FH,s.x1-s.x0);
 for(let i=0;i<N;i++){const top=(i+.5)/N*FH,st=new THREE.Mesh(new THREE.BoxGeometry(sl_,top,C-.1),[dk,dk,tr,dk,dk,dk]);st.position.set(s.x0+(i+.5)*sl_,top/2,zc);TG.add(st)}   // lighter treads, dark risers
 const rm=mat(0x1a120a);
 for(const zz of[s.z0+.14,s.z1-.14]){const rl=new THREE.Mesh(new THREE.BoxGeometry(len,.07,.07),rm);rl.position.set(xm,FH/2+.95,zz);rl.rotation.z=ang;TG.add(rl);   // handrails
  for(let k=0;k<5;k++){const px=s.x0+(k+.5)/5*(s.x1-s.x0),py=(px-s.x0)/(s.x1-s.x0)*FH,pb=new THREE.Mesh(new THREE.BoxGeometry(.05,.95,.05),rm);pb.position.set(px,py+.47,zz);TG.add(pb)}}
 const bb=new THREE.MeshBasicMaterial({color:0xffe0a0}),sb=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),bb);sb.position.set(xm,FH/2+2.3,s.z0+.3);TG.add(sb);LAMPS.push({m:bb,x:xm,z:s.z0+.6,f,zi:ZI[f].hall,y:FH/2+2.3,base:.9,rg:10,on:1,fl:1})}
}
TG=FGS[0];
function prop(p,g,c,y,em){const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,emissive:em||0,roughness:.8}));m.position.set(p[0],y,p[1]);TG.add(m);return m}
const fmat=(c,e)=>new THREE.MeshStandardMaterial({color:c,emissive:e||0,roughness:.5});
fm=items.map(p=>{TG=FGS[p[2]||0];const g=new THREE.Group();g.position.set(p[0],0,p[1]);const add=(geo,m,y)=>{const o=new THREE.Mesh(geo,m);o.position.y=y;g.add(o)};
 add(new THREE.BoxGeometry(.7,.45,.7),fmat(0x3a2a1c),.225);add(new THREE.CylinderGeometry(.09,.09,.34,10),fmat(0xffc040,0x9a6410),.62);
 for(const y of[.43,.81])add(new THREE.CylinderGeometry(.1,.1,.06,10),fmat(0x9a9a9a),y);
 add(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:0xffb030,transparent:true,opacity:.12,depthWrite:false}),.62);TG.add(g);return g});
bm=bats.map(p=>{TG=FGS[p[2]||0];const m=prop(p,new THREE.CylinderGeometry(.08,.08,.35,8),0x40c060,.09,0x105020);m.rotation.z=Math.PI/2;return m});
const wd=new THREE.MeshStandardMaterial({color:0x3a2412,roughness:.9,side:THREE.DoubleSide}),tr=new THREE.MeshStandardMaterial({color:0x5a3a20,roughness:.8,side:THREE.DoubleSide});
closets.forEach((p,i)=>{TG=FGS[p[2]||0];const g=new THREE.Group(),f=cdirs[i];g.position.set(p[0],0,p[1]);g.rotation.y=Math.atan2(f[0],f[1]);
 const b=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||wd);o.position.set(x,y,z);g.add(o)};
 b(.08,2.4,1.3,-.71,1.2,0);b(.08,2.4,1.3,.71,1.2,0);b(1.5,2.4,.08,0,1.2,-.61);b(1.5,.08,1.3,0,2.4,0,tr);b(1.5,.06,1.3,0,.03,0,tr);
 b(1.4,1.3,.06,0,.7,.64);b(1.4,.8,.06,0,2.0,.64);b(.03,1.3,.07,0,.7,.68,tr);b(.03,.8,.07,0,2.0,.68,tr);b(1.7,.14,1.5,0,2.47,0,tr);b(.06,.06,.1,.12,1.1,.7,tr);b(.06,.06,.1,-.12,1.1,.7,tr);   // doors leave a slit at eye height
 TG.add(g);OBS.push([p[0],p[1],1.05,p[2]||0])});
const ventT=tex(64,(g,w)=>{g.fillStyle='#0b0908';g.fillRect(0,0,w,w);g.fillStyle='#3a342e';for(let i=4;i<w;i+=10)g.fillRect(4,i,w-8,4);g.strokeStyle='#4a423a';g.lineWidth=4;g.strokeRect(2,2,w-4,w-4)},1,1);
vents=ventP.map(q=>{TG=FGS[q[2]||0];const v=new THREE.Mesh(new THREE.BoxGeometry(1.5,.06,1.5),new THREE.MeshStandardMaterial({map:ventT,roughness:.6}));v.position.set(q[0],.04,q[1]);TG.add(v);return q});
TG=FGS[GF];const gate=new THREE.Group(),stone=fmat(0x4a4a46),lm=new THREE.MeshStandardMaterial({color:0x501010,emissive:0x400a08});gateLeaves=[];
 gate.position.set(exitP[0],0,exitP[1]);if(exitP[0]>(W-1)*C)gate.rotation.y=Math.PI/2;
 for(const s of[-1,1]){const m=(geo,x,y,z,mt)=>{const o=new THREE.Mesh(geo,mt||stone);o.position.set(x,y,z);gate.add(o);return o};
  m(new THREE.BoxGeometry(.6,3.2,.6),s*2,1.6,0);m(new THREE.BoxGeometry(.8,.2,.8),s*2,3.3,0);m(new THREE.SphereGeometry(.22,10,8),s*2,3.6,0);
  const lamp=m(new THREE.BoxGeometry(.22,.3,.22),s*2,2.7,.36,lm);if(s<0)exm=lamp;
  const pv=new THREE.Group();pv.position.set(s*1.7,0,0);const lf=new THREE.Mesh(new THREE.PlaneGeometry(1.7,2.5),fenceM);lf.position.set(-s*.85,1.3,0);pv.add(lf);gate.add(pv);gateLeaves.push(pv)}
 { const arch=new THREE.Mesh(new THREE.BoxGeometry(4.6,.18,.18),stone);arch.position.set(0,3.3,0);gate.add(arch);gateLight=new THREE.PointLight(0xff3020,.9,14);gateLight.position.set(0,3,.6);gate.add(gateLight);TG.add(gate)}
 nm=noises.map(p=>{TG=FGS[p[2]||0];const m=prop(p,new THREE.CylinderGeometry(.08,.08,.35,8),0xc08030,.09,0x402008);m.rotation.z=Math.PI/2;return m});
 boxes.forEach(p=>{TG=FGS[p[2]||0];if(p[3]=='b'){prop(p,new THREE.CylinderGeometry(.7,.75,1.9,14),0x4a4a4e,.95);prop(p,new THREE.CylinderGeometry(.12,.12,1.4,8),0x35353a,2.4);prop([p[0]+.8,p[1]],new THREE.BoxGeometry(.5,.5,.5),0x802010,.4,0x802010);return}prop(p,new THREE.BoxGeometry(.7,.5,.7),0x3a2a1c,.25);prop(p,new THREE.BoxGeometry(.5,.28,.4),0x8a4a2a,.64,0x201008);prop(p,new THREE.CylinderGeometry(.03,.03,.3,6),0xd8c8a8,.95)});
 km=keyItems.map(p=>{TG=FGS[p[2]||0];const o=new THREE.Group();o.position.set(p[0],0,p[1]);const br=fmat(0xc9a43c,0x4a3a08),rg=new THREE.Mesh(new THREE.TorusGeometry(.1,.025,6,14),br);rg.position.set(0,.07,.18);rg.rotation.x=Math.PI/2;o.add(rg);
  const sh=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,.32),br);sh.position.set(0,.07,-.02);o.add(sh);const tt=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,.08),br);tt.position.set(0,.07,-.16);o.add(tt);
  const gl=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.1,depthWrite:false}));gl.position.y=.1;o.add(gl);TG.add(o);return o});
 const jmat=fmat(0xb02020,0x300808);
 jm=cans.map(p=>{TG=FGS[p[2]||0];const g=new THREE.Group();g.position.set(p[0],0,p[1]);const a=new THREE.Mesh(new THREE.BoxGeometry(.4,.5,.25),jmat);a.position.y=.25;g.add(a);const h=new THREE.Mesh(new THREE.BoxGeometry(.2,.08,.08),fmat(0x303030));h.position.y=.55;g.add(h);TG.add(g);return g});
 TG=FGS[GF];if(genP){genM=new THREE.Group();genM.position.set(genP[0],0,genP[1]);const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,.9,.9),fmat(0x40464a));b.position.y=.55;genM.add(b);const e=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.6,8),fmat(0x202020));e.position.set(.4,1.2,0);genM.add(e);
  genLamp=new THREE.Mesh(new THREE.SphereGeometry(.1,8,8),new THREE.MeshBasicMaterial({color:0x802020}));genLamp.position.set(-.5,1.1,.46);genM.add(genLamp);TG.add(genM)}
 for(let f=0;f<NF;f++){useF(f);TG=FGS[f];buildDecor(f)}useF(0);CHUNKS=[];FGS.forEach((fg,f)=>{CHUNKS.push(...chunkFloor(fg,f,THREE.Group))});sc.children.forEach(o=>{if(!_pre.has(o)){o.updateMatrixWorld(true);o.traverse(c=>{c.updateMatrix();c.matrixAutoUpdate=false})}});gateLeaves.forEach(o=>o.matrixAutoUpdate=true);if(doorM)doorM.matrixAutoUpdate=true;LOCKM.forEach(h=>{if(h)h.matrixAutoUpdate=true});DOORM.forEach(h=>{if(h)h.matrixAutoUpdate=true});
}
function avatar(name,id){const g=new THREE.Group(),h=[...String(id)].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7),col=[0x6a7a8a,0x8a5a4a,0x4a7a5a,0x7a6a3a,0x6a4a7a][Math.abs(h)%5],legs=[];
 const part=(geo,m,x,y,z,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(par||g).add(o);return o};
 part(new THREE.BoxGeometry(.5,.7,.26),mat(col),0,1.15,0);part(new THREE.SphereGeometry(.2,10,8),mat(0xc9b9a0),0,1.7,0);
 for(const s of[-1,1]){const lp=new THREE.Group();lp.position.set(s*.13,.8,0);g.add(lp);part(new THREE.BoxGeometry(.17,.8,.17),mat(0x2a2a30),0,-.4,0,lp);legs.push(lp);part(new THREE.BoxGeometry(.13,.65,.13),mat(col),s*.34,1.1,0)}
 part(new THREE.BoxGeometry(.08,.08,.3),mat(0x222222),.34,.9,-.2);
 const l=new THREE.PointLight(0xffeecc,.5,5);l.position.set(.34,.9,-.5);g.add(l);
 const cv=document.createElement('canvas');cv.width=256;cv.height=64;const c2=cv.getContext('2d');c2.font='bold 34px Georgia';c2.textAlign='center';c2.fillStyle='#e8dfc8';c2.shadowColor='#000';c2.shadowBlur=6;c2.fillText(name||'',128,42);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true}));sp.scale.set(1.6,.4,1);sp.position.y=2.2;g.add(sp);g.userData.legs=legs;sc.add(g);return g}
const mon=new THREE.Group(),dk=new THREE.MeshStandardMaterial({color:0x0a0808,roughness:1}),limbs=[];
{const add=(g,x,y,z,rz)=>{const o=new THREE.Mesh(g,dk);o.position.set(x,y,z);o.rotation.z=rz||0;mon.add(o);return o};
 add(new THREE.CylinderGeometry(.14,.2,1.5,6),0,1.85,0).rotation.x=.25;
 const hd=add(new THREE.SphereGeometry(.2,8,8),0,2.8,.2);hd.scale.set(.75,1.6,.85);
 for(const k of[-1,1]){limbs.push(add(new THREE.CylinderGeometry(.045,.03,2.1,5),k*.36,1.5,.2,k*.1));add(new THREE.CylinderGeometry(.07,.05,1.2,5),k*.13,.6,0);
  const e=new THREE.Mesh(new THREE.SphereGeometry(.035,6,6),new THREE.MeshBasicMaterial({color:0xff3010}));e.position.set(k*.07,2.85,.38);mon.add(e)}
 const l=new THREE.PointLight(0xff2010,.6,6);l.position.y=2.8;mon.add(l);sc.add(mon);mon.visible=false}
const av={};
function resize(){R.setPixelRatio(PS.res||1);R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();

// ---------- game state ----------
let peer,me,isHost=false,hconn,conns=[],started=false,S=null,mic=null;
const P={};let M={x:0,z:0,ry:0,st:'patrol',tx:0,tz:0,t:0,lost:0};
let F=[],B=[],Cn=[],GEN=0,over=null;
const L={y:0,f:0,x:0,z:0,ry:0,pitch:0,stam:5,bat:100,fon:true,hid:null};
const keys={};let act=false;
const cfg=()=>isHost?HS:(S&&S.set)||HS;

const newP=n=>({x:0,z:0,ry:0,down:0,hid:0,n,spr:0,rp:0});
function toHost(m){if(m.t=='take')sfx(2200,.2,.25,null,null,'highpass');if(isHost)onHost({peer:me},m);else if(hconn&&hconn.open)hconn.send(m)}

// ---------- networking ----------
const flash=t=>$('msg').textContent=t;
function startHost(){try{localStorage.setItem('hh_name',$('nm').value)}catch{}
 const code=Array.from({length:5},()=>'ABCDEFGHJKMNPQRSTUVWXYZ'[rnd()*23|0]).join('');
 isHost=true;peer=new Peer('hollowhouse-'+code);
 peer.on('error',e=>{flash('Could not host: '+e.type);view('home')});
 peer.on('open',id=>{me=id;P[me]=newP($('nm').value||'Host');$('code').textContent=code;view('lobby');$('hostset').classList.remove('hide');$('go').classList.remove('hide');setInterval(tick,66)});
 peer.on('connection',c=>{conns.push(c);c.on('data',d=>onHost(c,d));c.on('close',()=>{conns=conns.filter(x=>x!==c);delete P[c.peer]})});
 peer.on('call',answer);
}
function startJoin(){try{localStorage.setItem('hh_name',$('nm').value)}catch{}
 const code=$('cd').value.trim().toUpperCase();if(code.length!=5)return flash('Enter the 5-letter room code.');
 peer=new Peer();peer.on('error',e=>flash('Could not join: '+e.type));
 peer.on('open',id=>{me=id;hconn=peer.connect('hollowhouse-'+code,{reliable:true,serialization:'json'});
  hconn.on('open',()=>{hconn.send({t:'hi',n:$('nm').value||'Guest'});$('code').textContent=code;view('lobby');$('wait').classList.remove('hide');setInterval(()=>{if(started)hconn.send({t:'p',x:L.x,z:L.z,ry:L.ry,hid:L.hid?1:0,spr:L.spr?1:0,y:L.y})},66)});
  hconn.on('data',onClient);hconn.on('close',()=>{$('et').textContent='Host disconnected';$('end').classList.remove('hide')})});
 peer.on('call',answer);
}
$('bh').onclick=startHost;$('bj').onclick=startJoin;$('code').style.cursor='pointer';$('code').title='Click to copy';$('code').onclick=()=>{try{navigator.clipboard.writeText($('code').textContent)}catch{}};
function onHost(c,d){const p=P[c.peer];
 if(d.t=='hi'){if(started)return c.close();P[c.peer]=newP(d.n)}
 else if(!p)return;
 else if(d.t=='p'&&!p.down){Object.assign(p,{x:d.x,z:d.z,ry:d.ry,hid:d.hid,spr:d.spr,y:d.y||0})}
 else if(d.t=='take'&&started){const a=d.k=='f'?F:d.k=='j'?Cn:d.k=='n'?Nf:d.k=='k'?Kf:B,pos=d.k=='f'?items:d.k=='j'?cans:d.k=='n'?noises:d.k=='k'?keyItems:bats;if(a[d.i]==0&&Math.hypot(pos[d.i][0]-p.x,pos[d.i][1]-p.z)<3&&(pos[d.i][2]||0)==Math.round((p.y||0)/FH))a[d.i]=1}
 else if(d.t=='gen'&&started&&HS.obj&&!GEN&&genP&&Cn.every(x=>x)&&Math.hypot(genP[0]-p.x,genP[1]-p.z)<4){GEN=1;if(M.vs=='walk')M.vs=null;if(!M.vs){M.st='invest';M.tx=genP[0];M.tz=genP[1];M.t=0;M.tf=0;M.xf=(M.f||0)==genP[2]?null:genP[2]}M.ev={n:(M.ev?M.ev.n:0)+1,x:genP[0],z:genP[1]}}
 else if(d.t=='mb'&&started&&MB[d.i]&&Math.hypot(MB[d.i].x-p.x,MB[d.i].z-p.z)<3&&MB[d.i].f==Math.round((p.y||0)/FH)){const b=MB[d.i];if(b.on){b.on=0;b.t=35+rnd()*40;b.cd=30}else if(!(b.cd>0)){b.on=1;b.t=22;M.ev={n:(M.ev?M.ev.n:0)+1,x:b.x,z:b.z,k:2};if((M.st=='patrol'||M.st=='search')&&(!M.vs||M.vs=='walk')){M.vs=null;M.st='invest';M.tx=b.x;M.tz=b.z;M.t=0;M.tf=0;M.xf=b.f==(M.f||0)?null:b.f}}}   // players can also START it, as a decoy
 else if(d.t=='dr'&&started&&DOORS[d.i]&&DOORS[d.i].f==Math.round((p.y||0)/FH)&&Math.hypot(DOORS[d.i].x-p.x,DOORS[d.i].z-p.z)<3.8){const dd=DOORS[d.i];
  if(dd.broken){}else if(dd.open){const blocked=Object.values(P).some(q=>!q.down&&Math.round((q.y||0)/FH)==dd.f&&Math.abs(q.x-dd.x)<2.3&&Math.abs(q.z-dd.z)<2.3)||(M.f==dd.f&&Math.hypot(M.x-dd.x,M.z-dd.z)<2.4);if(!blocked)dd.open=0}   // nobody can be shut inside the doorway
  else{dd.open=1;if(dd.cr){M.ev={n:(M.ev?M.ev.n:0)+1,x:dd.x,z:dd.z,k:7};if((M.st=='patrol'||M.st=='search')&&(!M.vs||M.vs=='walk')&&M.f==dd.f&&Math.hypot(M.x-dd.x,M.z-dd.z)<HS.hear){M.vs=null;M.st='invest';M.tx=dd.x;M.tz=dd.z;M.t=0;M.tf=0;M.xf=null}}}}   // an old door creaks and the monster may hear it
 else if(d.t=='unlock'&&started&&LOCKS[d.i]&&Kf.some(x=>x)&&LOCKS[d.i].f==Math.round((p.y||0)/FH)&&Math.hypot(LOCKS[d.i].x-p.x,LOCKS[d.i].z-p.z)<4){const l0=LOCKS[d.i];LOCKS.forEach(l=>{if(l.f==l0.f)l.open=1})}
 else if(d.t=='sw'&&started&&!HS.dark&&SW[d.i]&&SW[d.i].f==Math.round((p.y||0)/FH)&&Math.hypot(SW[d.i].x-p.x,SW[d.i].z-p.z)<3.4){const z=LZ[SW[d.i].zi];if(z)z.on^=1}
 else if(d.t=='noise'&&started&&Math.hypot(d.x-p.x,d.z-p.z)<20){M.ev={n:(M.ev?M.ev.n:0)+1,x:d.x,z:d.z,k:1};if(['patrol','search','invest'].includes(M.st)&&(!M.vs||M.vs=='walk')){M.vs=null;M.st='invest';M.tx=d.x;M.tz=d.z;M.t=0;M.tf=0;{const pf=Math.round((p.y||0)/FH);M.xf=pf==(M.f||0)?null:pf}}}
 else if(d.t=='rev'&&P[d.id]&&P[d.id].down&&Math.hypot(P[d.id].x-p.x,P[d.id].z-p.z)<3&&Math.abs((P[d.id].y||0)-(p.y||0))<2){const q=P[d.id];q.rp+=d.dt;if(q.rp>=HS.revive){q.down=0;q.rp=0}}}
function snap(){const o={};for(const id in P){const p=P[id];o[id]=[p.x,p.z,p.ry,p.down,p.hid,p.n,p.spr,p.jv||0,p.y||0]}
 return{t:'s',go:started,P:o,m:[M.x,M.z,M.ry,M.st,(M.vs=='gone'||(M.age||0)<HS.grace)?1:0,M.py||0,M.y||0],e:M.ev,f:F,b:B,open:F.slice(0,HS.fuses).every(x=>x),over,set:HS,seed:SEED,j:Cn,gen:GEN,n:Nf,k:Kf,lk:LOCKS.map(l=>l.open),dr:DOORS.map(d=>d.broken?2:d.open),mb:MB.map(b=>b.on?1:(b.cd>0?2:0)),lz:LZ.map(z=>z.on),ids:Object.keys(P)}}
function tick(){const p=P[me];if(started&&p&&!p.down){Object.assign(p,{x:L.x,z:L.z,ry:L.ry,hid:L.hid?1:0,spr:L.spr?1:0,y:L.y})}
 S=snap();for(const c of conns)if(c.open)c.send(S);onState()}
function onClient(d){if(d.t=='s'){S=d;onState()}}
$('go').onclick=()=>{SEED=Math.random()*1e9|0;loadMap(SEED,HS.size,HS.floors);M.x=mspawn[0];M.z=mspawn[1];M.f=mspawn[2];M.y=M.f*FH;started=true;let i=0;for(const id in P){P[id].x=spawn[0]+(i%2)*.9;P[id].z=spawn[1]+(i>>1)*.9;P[id].y=spawn[2]*FH;i++}
 F=items.map(()=>0);B=bats.map(()=>0);Cn=cans.map(()=>0);GEN=0;Nf=noises.map(()=>0);Kf=keyItems.map(()=>0);LOCKS.forEach(l=>l.open=0);DOORS.forEach(d=>d.open=rnd()<.5?1:0);LZ=ZONES.map(()=>({on:HS.dark?0:1}));MB=boxes.map(p=>({x:p[0],z:p[1],f:p[2],k:p[3],on:0,t:25+rnd()*40}))};
let began=false;
function onState(){if(!S)return;DOPEN=!!S.open;if(S.dr)S.dr.forEach((v,i)=>{const d=DOORS[i];if(d){if(d.snd!==undefined&&d.snd!=v)v?sfx(d.cr?220:360,.35,.4,d.x,d.z,'bandpass'):sfx(120,.15,.5,d.x,d.z);d.snd=v;d.open=v?1:0;d.broken=v==2}});if(S.lk)S.lk.forEach((v,i)=>{const l=LOCKS[i];if(l){if(v&&!l.snd){l.snd=1;sfx(260,.9,.5,l.x,l.z,'bandpass')}l.open=v}});if(S.gen&&!genHumOn&&genP){genHumOn=true;startGenHum(genP[0],genP[1])}
 if(S.go&&!began){began=true;started=true;if(!isHost){SEED=S.seed;loadMap(S.seed,S.set.size,S.set.floors)}buildWorld();const i=S.ids.indexOf(me);L.f=spawn[2]||0;L.y=L.f*FH;L.x=spawn[0]+(i%2)*.9;L.z=spawn[1]+(i>>1)*.9;beginGame()}
 if(!began){$('pl').innerHTML=Object.values(S.P).map(p=>`<div>${p[5]}</div>`).join('')}
 if(S.e&&S.e.n!=lastEv){lastEv=S.e.n;if(S.e.k==5){sfx(90,.3,1,S.e.x,S.e.z);setTimeout(()=>sfx(150,.2,.8,S.e.x,S.e.z),110)}else if(S.e.k==6){sfx(60,.7,1,S.e.x,S.e.z);sfx(1400,.2,.6,S.e.x,S.e.z,'bandpass')}else if(S.e.k==8){sfx(80,.4,1,S.e.x,S.e.z);setTimeout(()=>sfx(1800,.15,.7,S.e.x,S.e.z,'bandpass'),60)}else if(S.e.k==7){sfx(240,.7,.6,S.e.x,S.e.z,'bandpass')}else if(S.e.k==3){sfx(70,.25,.9,S.e.x,S.e.z);sfx(2400,.08,.5,S.e.x,S.e.z,'highpass')}else if(S.e.k==1){sfx(1800,.5,.9,S.e.x,S.e.z,'bandpass');setTimeout(()=>sfx(2400,.4,.7,S.e.x,S.e.z,'bandpass'),160)}else sfx(110,.7,.9,S.e.x,S.e.z)}
 if(S.over&&!over){over=S.over;document.exitPointerLock();$('et').textContent=over=='win'?'You escaped.':'The house keeps you.';{const s=(performance.now()-L.t0)/1000|0;$('est').textContent='Time '+(s/60|0)+':'+String(s%60).padStart(2,'0')+'  |  Times downed '+(L.dn||0)+'  |  Fuses '+S.f.slice(0,S.set.fuses).reduce((a,b)=>a+b,0)+'/'+S.set.fuses+(S.set.obj?'  |  Generator '+(S.gen?'started':'not started'):'')}$('end').classList.remove('hide')}}
async function beginGame(){L.t0=performance.now();$('xh').style.display='block';{const h=$('hint');h.textContent=(HS.obj||(S&&S.set&&S.set.obj))?'Find the fuses to restore the power. Gather fuel for the generator in the yard, start it, then run for the gate.  M: map   G: throw noisemaker   E: interact':'Find the fuses to restore the power, then run for the gate.  M: map   G: throw noisemaker   E: interact';setTimeout(()=>h.textContent='',24000)}$('menu').classList.add('hide');$('hud').classList.remove('hide');$('pause').classList.remove('hide');{const q=$('c').requestPointerLock();if(q&&q.catch)q.catch(()=>{})}
 if(PS.prox){try{mic=await navigator.mediaDevices.getUserMedia({audio:true})}catch{}}
 if(!mic){mic=new AudioContext().createMediaStreamDestination().stream}
 for(const id of S.ids)if(id!==me&&me<id)hook(peer.call(id,mic),id)}
const voices={};
function answer(call){(async()=>{if(!mic){try{mic=PS.prox?await navigator.mediaDevices.getUserMedia({audio:true}):null}catch{}
 if(!mic)mic=new AudioContext().createMediaStreamDestination().stream}call.answer(mic);hook(call,call.peer)})()}
function hook(call,id){call.on('stream',s=>{if(voices[id])return;const a=new Audio();a.srcObject=s;a.play().catch(()=>{});voices[id]=a})}

// ---------- local player loop ----------
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code=='KeyG')throwDecoy();if(e.code=='KeyQ')L.si=(L.si||0)+1;if(e.code=='KeyM')mapOn=!mapOn;if(e.code=='KeyE')act=true;if(e.code=='KeyF')L.fon=!L.fon});
addEventListener('keyup',e=>keys[e.code]=0);
$('c').onclick=()=>{if(began)$('c').requestPointerLock()};$('res').onclick=()=>$('c').requestPointerLock();
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement==$('c')){$('ph').textContent='Paused';$('res').textContent='Resume'}if(began&&!over)$('pause').classList.toggle('hide',document.pointerLockElement==$('c'))});
addEventListener('mousemove',e=>{if(document.pointerLockElement==$('c')){L.ry-=e.movementX*.0022*PS.sens;L.pitch=Math.max(-1.4,Math.min(1.4,L.pitch-e.movementY*.0022*PS.sens));
 if(L.hid){const d=Math.atan2(Math.sin(L.ry-L.hb),Math.cos(L.ry-L.hb));L.ry=L.hb+Math.max(-1.1,Math.min(1.1,d));{const pm=(L.he||1.5)<1?.25:.6;L.pitch=Math.max(-pm,Math.min(pm,L.pitch))}}}});
const hit=(x,z)=>{useF(L.f);for(const[a,b]of[[.35,.35],[-.35,.35],[.35,-.35],[-.35,-.35]])if(solid(x+a,z+b))return true;return OBS.some(o=>{if(o[3]!=L.f)return false;const d=Math.hypot(x-o[0],z-o[1]);return d<o[2]&&d<Math.hypot(L.x-o[0],L.z-o[1])})||DOORS.some(d=>{if(!d.open||d.broken||d.f!=L.f)return false;const q=dseg(x,z,d.sg);return q<.5&&q<dseg(L.x,L.z,d.sg)})};
function throwDecoy(){if(!began||over||(L.dec||0)<1||L.hid)return;const m=S.P[me];if(m&&m[3])return;L.dec--;let d=0,x=L.x,z=L.z;const fx=-Math.sin(L.ry),fz=-Math.cos(L.ry);
 while(d<14&&!solid(x+fx*.5,z+fz*.5)){x+=fx*.5;z+=fz*.5;d+=.5}toHost({t:'noise',x,z})}
const DN=300,dp0=new Float32Array(DN*3),dust=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xcfc4a8,size:.045,transparent:true,opacity:.4,depthWrite:false}));
for(let i=0;i<DN*3;i++)dp0[i]=rnd()*14;dust.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(DN*3),3));dust.frustumCulled=false;sc.add(dust);
function updDust(dt){const c=cam.position,w=dust.geometry.attributes.position.array;for(let i=0;i<DN;i++){dp0[i*3+1]+=dt*.04;w[i*3]=((dp0[i*3]-c.x)%14+14)%14-7+c.x;w[i*3+1]=((dp0[i*3+1]-c.y)%6+6)%6-3+c.y;w[i*3+2]=((dp0[i*3+2]-c.z)%14+14)%14-7+c.z}dust.geometry.attributes.position.needsUpdate=true}
let SPEC=null,mapOn=true,mapT=0,THR=0,LAMPS=[],CANDLES=[],SW=[],BEDS=[],ZONES=[],ZI=[],LZ=[],POOL=[],PSLOT=[],CHUNKS=[],gT=0;
POOL=Array.from({length:5},()=>{const l=new THREE.PointLight(0xffd8a0,0,15);sc.add(l);return l});PSLOT=POOL.map(()=>({lamp:null,k:0,tg:0}));   // a small pool of real lights follows the nearest lit lamps
function updAtmos(dt){const fd=L.f<GF?.105:(roomAt(L.x/C|0,L.z/C|0)=='yard'?.062:.085);sc.fog.density+=(fd-sc.fog.density)*.05;   // thicker fog in the basement, thinner outside
 if((gT+=dt)>.09){gT=0;const gc=$('gr'),gx=gc.getContext('2d'),im=gx.createImageData(96,96),d=im.data;for(let i=0;i<d.length;i+=4){const v=rnd()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}gx.putImageData(im,0,0);gc.style.opacity=.05+THR*.1}}   // film grain, heavier when the monster is near
function updCues(){const mm=S.m,set=cfg(),dy=f=>Math.abs((mm[6]||0)-f*FH)>2?12:0,cand=[];
 for(const l of LAMPS){const on=l.candle||(!set.dark&&S.lz&&S.lz[l.zi]),k=mm[4]?0:Math.max(0,1-(Math.hypot(mm[0]-l.x,mm[1]-l.z)+dy(l.f))/18),fk=k>0&&rnd()<k*.55;
  l.fl=l.candle?(.88+.12*rnd())*(k>0&&rnd()<k*.5?.15:1):(fk?(rnd()<.5?.1:.5):1);l.on=!!on;
  if(l.m)l.m.color.setHex(on?(fk?0x806030:0xffe0a0):0x241a10);
  if(on){const d=Math.hypot(l.x-L.x,l.z-L.z)+(l.f==L.f?0:14*Math.abs(l.f-L.f));if(d<l.rg+10)cand.push([d,l])}}
 cand.sort((a,b)=>a[0]-b[0]);const want=new Set(cand.slice(0,POOL.length).map(c=>c[1]));
 for(const s of PSLOT)if(s.lamp&&!want.has(s.lamp)){s.tg=0;if(s.k<.03)s.lamp=null}
 for(const s of PSLOT)if(!s.lamp)for(const l of want)if(!PSLOT.some(q=>q.lamp===l)){s.lamp=l;s.k=0;break}
 PSLOT.forEach((s,i)=>{const pl=POOL[i];if(s.lamp){const l=s.lamp;s.tg=want.has(l)?l.base*l.fl:0;pl.position.set(l.x,l.f*FH+l.y,l.z);pl.distance=l.rg;pl.color.setHex(l.candle?0xffaa55:0xffd8a0)}s.k+=(s.tg-s.k)*.25;pl.intensity=s.k*(L.f<GF?.8:1)});
 for(const s of SW)s.ind.color.setHex(set.dark?0x802020:(S.lz&&S.lz[s.zi]?0x40c060:0xc03020))}const vis=new Set();
function specCam(down){SPEC=null;if(!down||L.js>0)return;const al=Object.keys(S.P).filter(id=>id!=me&&!S.P[id][3]);if(!al.length)return;SPEC=al[(L.si||0)%al.length];const p=S.P[SPEC];cam.position.set(p[0],(p[8]||0)+1.6,p[1]);cam.rotation.set(0,p[2],0,'YXZ')}
function drawMap(){const cv=$('mm');cv.style.display=mapOn?'block':'none';if(!mapOn)return;const g=cv.getContext('2d'),s=Math.min(180/W,140/H),ox=(180-W*s)/2,oy=(140-H*s)/2,cx=L.x/C|0,cy=L.z/C|0;
 for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)vis.add(L.f+':'+(cx+a)+','+(cy+b));g.clearRect(0,0,180,140);
 for(const k of vis){const kk=k.split(':');if(+kk[0]!=L.f)continue;const[c,r]=kk[1].split(',').map(Number),t=MAP[r]&&MAP[r][c];if(!t)continue;g.fillStyle=t=='#'?'#3a3028':t==','?'#1b2a14':t=='%'?'#222':t=='D'||t=='L'||t=='d'||t=='e'?'#8a5a2a':t=='X'?'#4a9a5a':t=='R'?'#b49a5a':'#7a6e5e';g.fillRect(ox+c*s,oy+r*s,s+.5,s+.5)}
 for(const id in S.P){if(id==me)continue;const p=S.P[id];if(Math.round((p[8]||0)/FH)!=L.f)continue;g.fillStyle=p[3]?'#c33':'#6ac';g.fillRect(ox+p[0]/C*s-1.5,oy+p[1]/C*s-1.5,3,3)}
 g.fillStyle='#fff';g.fillRect(ox+L.x/C*s-2,oy+L.z/C*s-2,4,4)}
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;
 if(isHost)sim(dt);if(MAPS.length)useF(L.f);
 const me_=S&&S.P[me],down=me_&&me_[3],set=cfg();
 if(began&&!over){
  let pr='';
  if(!down&&!L.hid&&document.pointerLockElement==$('c')){
   const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0);
   L.spr=!!keys.ShiftLeft&&L.stam>0&&(f||s);
   const sp=L.spr?6.2:3.4;L.stam=Math.max(0,Math.min(5,L.stam+(L.spr?-set.sdrain:.8)*dt));
   L.mv=f||s;const l=Math.hypot(f,s)||1,vx=(-Math.sin(L.ry)*f+Math.cos(L.ry)*s)/l*sp*dt,vz=(-Math.cos(L.ry)*f-Math.sin(L.ry)*s)/l*sp*dt;
   if(!hit(L.x+vx,L.z))L.x+=vx;if(!hit(L.x,L.z+vz))L.z+=vz;L.y=groundY(L.x,L.z,L.f);L.f=Math.round(L.y/FH)}
  else{L.spr=false;L.mv=0}
  // interactions
  const near=(p,r)=>(p[2]||0)==L.f&&Math.hypot(p[0]-L.x,p[1]-L.z)<r;
  if(L.hid){pr='E: leave closet (look around freely)';if(act){L.x+=L.hf[0]*1.4;L.z+=L.hf[1]*1.4;L.hid=null}}
  else if(!down){
   items.some((p,i)=>{if(S.f[i]==0&&near(p,1.8)){pr='E: take fuse';if(act)toHost({t:'take',k:'f',i});return true}});
   bats.some((p,i)=>{if(set.drain&&S.b[i]==0&&near(p,1.8)){pr='E: take battery';if(act){L.bat=Math.min(100,L.bat+40);toHost({t:'take',k:'b',i})}return true}});
   noises.some((p,i)=>{if(S.n[i]==0&&near(p,1.8)){pr='E: take noisemaker';if(act){L.dec=(L.dec||0)+1;toHost({t:'take',k:'n',i})}return true}});
   boxes.some((p,i)=>{if(near(p,2)){const st=S.mb&&S.mb[i],on=st==1,bo=boxes[i][3]=='b';pr=on?(bo?'E: shut the pressure valve':'E: close the music box'):st==2?(bo?'The valve is still hot.':'The music box is still winding down.'):(bo?'E: open the valve (loud - draws the monster)':'E: wind the music box (draws the monster)');if(act&&st!=2)toHost({t:'mb',i});return true}});
   SW.some((s,i)=>{if(near([s.x,s.z,s.f],2.2)){pr=set.dark?'The power is out. The switch does nothing.':(S.lz&&S.lz[s.zi]?'E: switch the lights off':'E: switch the lights on');if(act&&!set.dark){sfx(1600,.05,.5);toHost({t:'sw',i})}return true}});
   BEDS.some(p=>{if(near(p,2.3)){pr=p[5]||'E: hide under the bed';if(act){L.hid=p;L.hf=[p[3],p[4]];L.x=p[0];L.z=p[1];L.hb=Math.atan2(-p[3],-p[4]);L.ry=L.hb;L.pitch=0;L.he=p[6]||.4;sfx(700,.2,.25,null,null,'bandpass')}return true}});
   keyItems.some((p,i)=>{if(S.k&&S.k[i]==0&&near(p,1.8)){pr='E: take the brass key';if(act)toHost({t:'take',k:'k',i});return true}});
   DOORS.some((d,i)=>{if(near([d.x,d.z,d.f],3.1)){pr=d.broken?'The door has been smashed off its hinges.':d.open?'E: close the door':(d.cr?'E: open the old door (it will creak)':'E: open the door');if(act&&!d.broken)toHost({t:'dr',i});return true}});
   LOCKS.some((l,i)=>{if(!l.open&&near([l.x,l.z,l.f],2.8)){const has=S.k&&S.k.some(x=>x);pr=has?'E: unlock the door':'The door is locked. Find the key.';if(act&&has){sfx(900,.12,.4,null,null,'bandpass');toHost({t:'unlock',i})}return true}});
   if(!S.open&&doorP&&near(doorP,3.5))pr='The front door is sealed. Restore the power.';
   if(near(exitP,4)&&!(S.open&&(S.gen||!set.obj)))pr='The gate is locked.';
   if(set.obj){cans.some((p,i)=>{if(S.j[i]==0&&near(p,1.8)){pr='E: take fuel can';if(act)toHost({t:'take',k:'j',i});return true}});
    if(genP&&near(genP,2.4)&&!S.gen){const got=S.j.reduce((a,b)=>a+b,0);if(got==cans.length){pr='E: start the generator (it is very loud)';if(act)toHost({t:'gen'})}else pr='The generator needs fuel ('+got+'/'+cans.length+')'}}
   closets.some((p,i)=>{if(near(p,2)){pr='E: hide';if(act){const f=cdirs[i];L.hid=p;L.hf=f;L.x=p[0];L.z=p[1];L.hb=Math.atan2(-f[0],-f[1]);L.ry=L.hb;L.pitch=0;L.he=1.5;sfx(700,.2,.25,null,null,'bandpass')}return true}});
   for(const id in S.P){const q=S.P[id];if(id!=me&&q[3]&&Math.hypot(q[0]-L.x,q[1]-L.z)<2){pr='Hold E: revive '+q[5];if(keys.KeyE)toHost({t:'rev',id,dt});}}
  }else pr='You are down. A teammate must revive you.'+(SPEC?' (Q: switch teammate)':'');
  act=false;$('pr').textContent=pr;
  // flashlight
  if(L.fon&&L.bat>0)L.bat=Math.max(0,L.bat-set.drain*dt);
  {const ms=S.m[3],mdx=Math.hypot(S.m[0]-L.x,S.m[1]-L.z)+(Math.abs((S.m[6]||0)-L.y)>2?12:0);
   THR=S.m[4]?0:Math.min(1,Math.max(0,1-mdx/24)*((ms=='chase'||ms=='stare'||ms=='loom')?1.35:1));   // 0 = far away, 1 = on top of you
   const bad=(ms=='stare'&&rnd()<.4)||(L.bat<15&&rnd()<.15)||rnd()<THR*THR*.45;
   fl.intensity=L.fon&&L.bat>0&&(!down||SPEC)?(bad?(rnd()<.3?0:.25):(.6+L.bat/100*1.8)*PS.bright*(1-.4*THR)):0}
  amb.intensity=(set.dark?.2:.3)*PS.bright*(L.f<GF?.6:1)*(1-.35*THR*(rnd()<.2?1:.3));
  $('hud').style.display=set.drain||set.sdrain?'block':'none';$('st').firstChild.style.width=L.stam/5*100+'%';$('bat').firstChild.style.width=L.bat+'%';
  $('top').textContent=`Fuses ${S.f.slice(0,set.fuses).reduce((a,b)=>a+b,0)} / ${set.fuses}`+(S.open?' - Power on':'')+(set.obj?' | Fuel '+S.j.reduce((a,b)=>a+b,0)+'/'+S.j.length+(S.gen?' | Generator running - reach the gate!':''):(S.open?' - reach the gate!':''))+' | '+(t=>t[0].toUpperCase()+t.slice(1))(roomAt(L.x/C|0,L.z/C|0))+(NF>1?' ('+(NF==3?['basement','ground floor','upstairs']:['ground floor','upstairs'])[L.f]+')':'')+(()=>{const d=Object.values(S.P).filter(p=>p[3]).map(p=>p[5]);return d.length?' | Down: '+d.join(', '):''})()+(PS.prox&&mic?' | Mic: '+(PS.vmode==2?'muted':PS.vmode==1?(keys.KeyV?'talking':'hold V to talk'):'open'):'')+(L.dec?' | Noisemakers: '+L.dec+' (G to throw)':'')+(S.k&&S.k.some(x=>x)&&LOCKS.some(l=>!l.open)?' | Key found':'');
  $('dn').style.display=down?'block':'none';if(down&&!L.pd){L.dn=(L.dn||0)+1;L.hid=null;const jv=me_[7];if(PS.js!==false){L.js=L.jt=jv==1?1.8:1.1;L.jv=jv;scream(jv)}}L.pd=down;
  cam.fov=PS.fov;cam.updateProjectionMatrix();
  cam.position.set(L.x,L.y+(down?.5:(L.hid?(L.he||1.5):1.6))+(L.mv?Math.sin(now/(L.spr?90:150))*.045:0)+(L.js>0?(rnd()-.5)*(L.jv==2?.3:.12):0)+(THR>.6?(rnd()-.5)*.015*THR:0),L.z);cam.rotation.set(L.pitch,L.ry,0,'YXZ');specCam(down);fl.position.copy(cam.position);tg.position.set(cam.position.x-Math.sin(cam.rotation.y)*Math.cos(cam.rotation.x),cam.position.y+Math.sin(cam.rotation.x),cam.position.z-Math.cos(cam.rotation.y)*Math.cos(cam.rotation.x));
  if((mapT+=dt)>.15){mapT=0;drawMap()}updDust(dt);updCues();updAtmos(dt);cullChunks(CHUNKS,cam.position.x,cam.position.z,Math.max(0,Math.min(NF-1,Math.round((cam.position.y-1.6)/FH))),40);
  // monster & others
  const[mx,mz,mry,mst,gone]=S.m;mon.visible=!gone;mon.position.x+=(mx-mon.position.x)*.3;mon.position.z+=(mz-mon.position.z)*.3;mon.rotation.y=mry;mon.rotation.z=Math.sin(now/400)*.05+(mst=='chase'?Math.sin(now/40)*.03:0);limbs.forEach((a,i)=>a.rotation.x=Math.sin(now/(mst=='chase'?120:380)+i*3)*.35);mon.position.y=S.m[5]+(S.m[6]||0);
  if(L.js>0){L.js-=dt;L.jsd=1;let a=Math.atan2(L.x-mx,L.z-mz)-L.ry;a=Math.atan2(Math.sin(a),Math.cos(a));if(L.js>L.jt-.5)L.ry+=a*.25;const dd=1+(L.jv==1?1.5*L.js/L.jt:0);mon.visible=true;mon.scale.setScalar(1.3);mon.position.set(L.x-Math.sin(L.ry)*dd,L.y-2.6-(L.jv==3?1.6*L.js/L.jt:0),L.z-Math.cos(L.ry)*dd);mon.rotation.set(0,L.ry+Math.PI,0);L.pitch+=(.3-L.pitch)*.3}
  else if(L.jsd){L.jsd=0;mon.scale.setScalar(1);mon.position.set(mx,S.m[5]+(S.m[6]||0),mz)}
  const md=Math.hypot(mx-L.x,mz-L.z)+(Math.abs((S.m[6]||0)-L.y)>2?12:0);audio(dt,md,mst,gone,down);$('vig').style.opacity=L.js>0?1:Math.max(down?0:THR*.4,((mst=='chase'||mst=='stare'||mst=='loom')&&!down?Math.min(1,Math.max(0,1-md/22)):0));
  for(const id in S.P){if(id==me)continue;const p=S.P[id],o=av[id]||(av[id]=avatar(p[5],id));
   const spd=Math.hypot(p[0]-o.position.x,p[1]-o.position.z);o.position.x+=(p[0]-o.position.x)*.3;o.position.z+=(p[1]-o.position.z)*.3;o.position.y+=((p[8]||0)-o.position.y)*.3;o.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(now/110+i*Math.PI)*Math.min(.7,spd*3));o.rotation.y=p[2];o.visible=!p[4]&&id!=SPEC;o.scale.y=p[3]?.35:1;
   const v=voices[id];if(v)v.volume=PS.prox?Math.max(0,1-Math.hypot(p[0]-L.x,p[1]-L.z)/PS.range)*PS.vol*PS.mvol:0}
  if(mic)mic.getAudioTracks().forEach(t=>t.enabled=PS.vmode==0||(PS.vmode==1&&!!keys.KeyV));
  S.f.forEach((v,i)=>fm[i].visible=!v&&i<set.fuses);jm.forEach((o,i)=>o.visible=!S.j[i]&&!!set.obj);if(genM){genM.visible=!!set.obj;genLamp.material.color.setHex(S.gen?0x30ff50:0x802020)}S.b.forEach((v,i)=>bm[i].visible=!v&&set.drain>0);nm.forEach((o,i)=>o.visible=!S.n[i]);
  DOORM.forEach((h,i)=>{if(h&&DOORS[i]){h.rotation.y+=((DOORS[i].open?-1.2:0)-h.rotation.y)*.2;h.visible=!DOORS[i].broken}});
 LOCKM.forEach((h,i)=>{if(h&&LOCKS[i])h.rotation.y+=((LOCKS[i].open?-1.5:0)-h.rotation.y)*.06});km.forEach((o,i)=>o.visible=!(S.k&&S.k[i]));
 if(doorM)doorM.rotation.y+=((S.open?-1.5:0)-doorM.rotation.y)*.05;{const go=S.open&&(S.gen||!set.obj);gateLeaves.forEach((o,i)=>o.rotation.y+=((go?(i?1.4:-1.4):0)-o.rotation.y)*.04);if(gateLight)gateLight.color.setHex(go?0x30ff60:0xff3020)}exm.material.emissive.setHex((S.open&&(S.gen||!set.obj))?0x108030:0x300808);
 }
 R.render(sc,cam)}
requestAnimationFrame(frame);
