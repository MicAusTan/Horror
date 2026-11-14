
const $=i=>document.getElementById(i);
const rnd=()=>Math.random();
const ld=(k,d)=>{try{return{...d,...JSON.parse(localStorage.getItem(k))}}catch{return{...d}}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
// ---------- map & settings ----------
const MAP=["#################","#S..#....#.....X#","#...#.F..#..H...#","#.......##......#","###.###.#####.###","#..HF.#.....#...#","#.....#..B..#.F.#","#.....M.....#...#","###.#####.###.###","#...#.....#.....#","#.B.#..F..#..H..#","#...........B...#","#################"];
const C=4,H=MAP.length,W=MAP[0].length,D=[[1,0],[-1,0],[0,1],[0,-1]];
const ctr=(c,r)=>[c*C+C/2,r*C+C/2];
const items=[],bats=[],closets=[];let spawn,mspawn,exitP;
MAP.forEach((row,r)=>[...row].forEach((ch,c)=>{const p=ctr(c,r);
 if(ch=='F')items.push(p);if(ch=='B')bats.push(p);if(ch=='H')closets.push(p);
 if(ch=='S')spawn=p;if(ch=='M')mspawn=p;if(ch=='X')exitP=p;}));
const defH={fuses:3,mSpeed:5.2,wSpeed:2.8,hear:18,sight:14,drain:0,sdrain:0,tele:45,grace:30,revive:4};
const defP={sens:1,vol:1,prox:true,range:16,bright:1,fov:75,mvol:1,avol:.5,js:true};
const HS=ld('hh_h',defH),PS=ld('hh_p',defP);
const PSch=[['sens','Mouse sensitivity',.3,2.5,.1],['mvol','Master volume',0,1,.05],['avol','Ambience volume',0,1,.05],['vol','Voice volume',0,1,.05],['range','Voice range (m)',4,40,1],['bright','Brightness',.5,3,.1],['fov','Field of view',60,100,1]];
const HSch=[['fuses','Fuses needed',1,4,1],['mSpeed','Monster chase speed',1.5,10,.1],['wSpeed','Monster roam speed',1,8,.1],['hear','Monster hearing (m)',6,40,1],['sight','Monster sight (m)',6,30,1],['drain','Flashlight drain (%/s, 0 = infinite)',0,3,.1],['sdrain','Sprint drain (/s, 0 = infinite)',0,3,.1],['tele','Monster vent trip interval (s)',15,120,5],['grace','Grace period at start (s)',0,120,5],['revive','Revive time (s)',1,10,.5]];
function build(el,sch,o,key){el.innerHTML='';for(const[k,l,mn,mx,st]of sch){const r=document.createElement('label');
 r.innerHTML=`<span>${l}</span><input type="range" min="${mn}" max="${mx}" step="${st}" value="${o[k]}"><b>${o[k]}</b>`;
 const i=r.querySelector('input'),b=r.querySelector('b');i.oninput=()=>{o[k]=+i.value;b.textContent=i.value;sv(key,o);if(typeof applyVol=='function')applyVol()};el.append(r)}}
build($('ps'),PSch,PS,'hh_p');build($('hs'),HSch,HS,'hh_h');
$('js').checked=PS.js!==false;$('js').onchange=e=>{PS.js=e.target.checked;sv('hh_p',PS)};$('prox').checked=PS.prox;$('prox').onchange=e=>{PS.prox=e.target.checked;sv('hh_p',PS)};
$('nm').value='Player'+(Math.random()*90+10|0);
let prevView='home';
function view(v){for(const i of['home','lobby','setp'])$(i).classList.toggle('hide',i!=v)}
$('bs').onclick=()=>{prevView='home';view('setp')};$('bs2').onclick=()=>{prevView='lobby';view('setp')};$('back').onclick=()=>view(prevView);

// ---------- three.js world ----------
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
const sc=new THREE.Scene();sc.background=new THREE.Color(0x050403);sc.fog=new THREE.FogExp2(0x050403,.085);
const cam=new THREE.PerspectiveCamera(75,1,.1,80);sc.add(cam);
const amb=new THREE.AmbientLight(0x554433,.3);sc.add(amb);
const fl=new THREE.SpotLight(0xffeecc,2,32,.55,.5,1.4);sc.add(fl);
const tg=new THREE.Object3D();sc.add(tg);fl.target=tg;
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:1});
function tex(w,fn,rx,ry){const c=document.createElement('canvas');c.width=c.height=w;fn(c.getContext('2d'),w);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
const stain=(g,w,n,a)=>{for(let i=0;i<n;i++){g.fillStyle='rgba(0,0,0,'+rnd()*a+')';g.fillRect(rnd()*w,rnd()*w,rnd()*30,rnd()*30)}};
const wallT=tex(256,(g,w)=>{g.fillStyle='#4a3a2c';g.fillRect(0,0,w,w);for(let x=0;x<w;x+=32){g.fillStyle='rgba(95,60,40,.35)';g.fillRect(x,0,14,w)}stain(g,w,140,.25);for(let i=0;i<7;i++){g.fillStyle='rgba(25,5,0,.3)';g.fillRect(rnd()*w,0,3+rnd()*5,rnd()*w)}g.fillStyle='rgba(15,10,6,.7)';g.fillRect(0,w-26,w,26)},1,1);
const floorT=tex(256,(g,w)=>{g.fillStyle='#2e1e13';g.fillRect(0,0,w,w);for(let y=0;y<w;y+=32){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,y,w,2);for(let x=rnd()*60;x<w;x+=70)g.fillRect(x,y,2,32)}stain(g,w,160,.3)},W,H);
const wm=new THREE.MeshStandardMaterial({map:wallT,roughness:1}),bx=new THREE.BoxGeometry(C,3.4,C);
MAP.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch=='#'){const m=new THREE.Mesh(bx,wm);const p=ctr(c,r);m.position.set(p[0],1.7,p[1]);sc.add(m)}}));
const fg=new THREE.PlaneGeometry(W*C,H*C);
const floor=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:floorT,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.set(W*C/2,0,H*C/2);sc.add(floor);
const ceil=new THREE.Mesh(fg,mat(0x120d0a));ceil.rotation.x=Math.PI/2;ceil.position.set(W*C/2,3.4,H*C/2);sc.add(ceil);
function prop(p,g,c,y,em){const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,emissive:em||0,roughness:.8}));m.position.set(p[0],y,p[1]);sc.add(m);return m}
const fm=items.map(p=>prop(p,new THREE.BoxGeometry(.4,.3,.25),0xe0c040,.9,0x806010));
const bm=bats.map(p=>prop(p,new THREE.BoxGeometry(.25,.4,.25),0x40c060,.8,0x105020));
closets.forEach(p=>prop(p,new THREE.BoxGeometry(1.6,2.6,1.6),0x2c1f16,1.3));
const ventT=tex(64,(g,w)=>{g.fillStyle='#0b0908';g.fillRect(0,0,w,w);g.fillStyle='#3a342e';for(let i=4;i<w;i+=10)g.fillRect(4,i,w-8,4);g.strokeStyle='#4a423a';g.lineWidth=4;g.strokeRect(2,2,w-4,w-4)},1,1);
const vents=[[3,2],[14,2],[1,7],[10,5],[14,5],[7,9],[13,9],[8,11],[2,9]].map(p=>{const q=ctr(p[0],p[1]),v=new THREE.Mesh(new THREE.BoxGeometry(1.5,.06,1.5),new THREE.MeshStandardMaterial({map:ventT,roughness:.6}));v.position.set(q[0],.04,q[1]);sc.add(v);return q});
const exm=prop(exitP,new THREE.BoxGeometry(2,2.8,.3),0x501010,1.4,0x300808);buildDecor();
function avatar(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,1.4,8),mat(0x6a7a8a));b.position.y=.7;g.add(b);
 const h=new THREE.Mesh(new THREE.SphereGeometry(.22,8,8),mat(0xc9b9a0));h.position.y=1.55;g.add(h);
 const l=new THREE.PointLight(0xffeecc,.5,5);l.position.y=1.5;g.add(l);sc.add(g);return g}
const mon=new THREE.Group(),dk=new THREE.MeshStandardMaterial({color:0x0a0808,roughness:1}),limbs=[];
{const add=(g,x,y,z,rz)=>{const o=new THREE.Mesh(g,dk);o.position.set(x,y,z);o.rotation.z=rz||0;mon.add(o);return o};
 add(new THREE.CylinderGeometry(.14,.2,1.5,6),0,1.85,0).rotation.x=.25;
 const hd=add(new THREE.SphereGeometry(.2,8,8),0,2.8,.2);hd.scale.set(.75,1.6,.85);
 for(const k of[-1,1]){limbs.push(add(new THREE.CylinderGeometry(.045,.03,2.1,5),k*.36,1.5,.2,k*.1));add(new THREE.CylinderGeometry(.07,.05,1.2,5),k*.13,.6,0);
  const e=new THREE.Mesh(new THREE.SphereGeometry(.035,6,6),new THREE.MeshBasicMaterial({color:0xff3010}));e.position.set(k*.07,2.85,.38);mon.add(e)}
 const l=new THREE.PointLight(0xff2010,.6,6);l.position.y=2.8;mon.add(l);sc.add(mon);mon.visible=false}
const av={};
function resize(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();

// ---------- game state ----------
let peer,me,isHost=false,hconn,conns=[],started=false,S=null,mic=null;
const P={};let M={x:mspawn[0],z:mspawn[1],ry:0,st:'patrol',tx:0,tz:0,t:0,lost:0};
let F=items.map(()=>0),B=bats.map(()=>0),over=null;
const L={x:0,z:0,ry:0,pitch:0,stam:5,bat:100,fon:true,hid:null};
const keys={};let act=false;
const cfg=()=>isHost?HS:(S&&S.set)||HS;

const newP=n=>({x:spawn[0],z:spawn[1],ry:0,down:0,hid:0,n,spr:0,rp:0});
function toHost(m){if(m.t=='take')sfx(2200,.2,.25,null,null,'highpass');if(isHost)onHost({peer:me},m);else if(hconn&&hconn.open)hconn.send(m)}

// ---------- networking ----------
const flash=t=>$('msg').textContent=t;
function startHost(){
 const code=Array.from({length:5},()=>'ABCDEFGHJKMNPQRSTUVWXYZ'[rnd()*23|0]).join('');
 isHost=true;peer=new Peer('hollowhouse-'+code);
 peer.on('error',e=>{flash('Could not host: '+e.type);view('home')});
 peer.on('open',id=>{me=id;P[me]=newP($('nm').value||'Host');$('code').textContent=code;view('lobby');$('hostset').classList.remove('hide');$('go').classList.remove('hide');setInterval(tick,66)});
 peer.on('connection',c=>{conns.push(c);c.on('data',d=>onHost(c,d));c.on('close',()=>{conns=conns.filter(x=>x!==c);delete P[c.peer]})});
 peer.on('call',answer);
}
function startJoin(){
 const code=$('cd').value.trim().toUpperCase();if(code.length!=5)return flash('Enter the 5-letter room code.');
 peer=new Peer();peer.on('error',e=>flash('Could not join: '+e.type));
 peer.on('open',id=>{me=id;hconn=peer.connect('hollowhouse-'+code);
  hconn.on('open',()=>{hconn.send({t:'hi',n:$('nm').value||'Guest'});$('code').textContent=code;view('lobby');$('wait').classList.remove('hide');setInterval(()=>{if(started)hconn.send({t:'p',x:L.x,z:L.z,ry:L.ry,hid:L.hid?1:0,spr:L.spr?1:0})},66)});
  hconn.on('data',onClient);hconn.on('close',()=>{$('et').textContent='Host disconnected';$('end').classList.remove('hide')})});
 peer.on('call',answer);
}
$('bh').onclick=startHost;$('bj').onclick=startJoin;
function onHost(c,d){const p=P[c.peer];
 if(d.t=='hi'){if(started)return c.close();P[c.peer]=newP(d.n)}
 else if(!p)return;
 else if(d.t=='p'&&!p.down){Object.assign(p,{x:d.x,z:d.z,ry:d.ry,hid:d.hid,spr:d.spr})}
 else if(d.t=='take'&&started){const a=d.k=='f'?F:B,pos=d.k=='f'?items:bats;if(a[d.i]==0&&Math.hypot(pos[d.i][0]-p.x,pos[d.i][1]-p.z)<3)a[d.i]=1}
 else if(d.t=='rev'&&P[d.id]&&P[d.id].down&&Math.hypot(P[d.id].x-p.x,P[d.id].z-p.z)<3){const q=P[d.id];q.rp+=d.dt;if(q.rp>=HS.revive){q.down=0;q.rp=0}}}
function snap(){const o={};for(const id in P){const p=P[id];o[id]=[p.x,p.z,p.ry,p.down,p.hid,p.n,p.spr,p.jv||0]}
 return{t:'s',go:started,P:o,m:[M.x,M.z,M.ry,M.st,(M.vs=='gone'||(M.age||0)<HS.grace)?1:0,M.py||0],e:M.ev,f:F,b:B,open:F.slice(0,HS.fuses).every(x=>x),over,set:HS,ids:Object.keys(P)}}
function tick(){const p=P[me];if(started&&p&&!p.down){Object.assign(p,{x:L.x,z:L.z,ry:L.ry,hid:L.hid?1:0,spr:L.spr?1:0})}
 S=snap();for(const c of conns)if(c.open)c.send(S);onState()}
function onClient(d){if(d.t=='s'){S=d;onState()}}
$('go').onclick=()=>{started=true;let i=0;for(const id in P){P[id].x=spawn[0]+(i%2)*.9;P[id].z=spawn[1]+(i>>1)*.9;i++}
 F=items.map(()=>0);B=bats.map(()=>0)};
let began=false;
function onState(){if(!S)return;
 if(S.go&&!began){began=true;started=true;const i=S.ids.indexOf(me);L.x=spawn[0]+(i%2)*.9;L.z=spawn[1]+(i>>1)*.9;beginGame()}
 if(!began){$('pl').innerHTML=Object.values(S.P).map(p=>`<div>${p[5]}</div>`).join('')}
 if(S.e&&S.e.n!=lastEv){lastEv=S.e.n;sfx(110,.7,.9,S.e.x,S.e.z)}
 if(S.over&&!over){over=S.over;document.exitPointerLock();$('et').textContent=over=='win'?'You escaped.':'The house keeps you.';$('end').classList.remove('hide')}}
async function beginGame(){$('menu').classList.add('hide');$('hud').classList.remove('hide');$('pause').classList.remove('hide');
 if(PS.prox){try{mic=await navigator.mediaDevices.getUserMedia({audio:true})}catch{}}
 if(!mic){mic=new AudioContext().createMediaStreamDestination().stream}
 for(const id of S.ids)if(id!==me&&me<id)hook(peer.call(id,mic),id)}
const voices={};
function answer(call){(async()=>{if(!mic){try{mic=PS.prox?await navigator.mediaDevices.getUserMedia({audio:true}):null}catch{}
 if(!mic)mic=new AudioContext().createMediaStreamDestination().stream}call.answer(mic);hook(call,call.peer)})()}
function hook(call,id){call.on('stream',s=>{if(voices[id])return;const a=new Audio();a.srcObject=s;a.play().catch(()=>{});voices[id]=a})}

// ---------- local player loop ----------
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code=='KeyE')act=true;if(e.code=='KeyF')L.fon=!L.fon});
addEventListener('keyup',e=>keys[e.code]=0);
$('c').onclick=()=>{if(began)$('c').requestPointerLock()};$('res').onclick=()=>$('c').requestPointerLock();
document.addEventListener('pointerlockchange',()=>{if(began&&!over)$('pause').classList.toggle('hide',document.pointerLockElement==$('c'))});
addEventListener('mousemove',e=>{if(document.pointerLockElement==$('c')&&!L.hid){L.ry-=e.movementX*.0022*PS.sens;L.pitch=Math.max(-1.4,Math.min(1.4,L.pitch-e.movementY*.0022*PS.sens))}});
const hit=(x,z)=>{for(const[a,b]of[[.35,.35],[-.35,.35],[.35,-.35],[-.35,-.35]])if(solid(x+a,z+b))return true;return false};
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;
 if(isHost)sim(dt);
 const me_=S&&S.P[me],down=me_&&me_[3],set=cfg();
 if(began&&!over){
  let pr='';
  if(!down&&!L.hid&&document.pointerLockElement==$('c')){
   const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0);
   L.spr=!!keys.ShiftLeft&&L.stam>0&&(f||s);
   const sp=L.spr?6.2:3.4;L.stam=Math.max(0,Math.min(5,L.stam+(L.spr?-set.sdrain:.8)*dt));
   L.mv=f||s;const l=Math.hypot(f,s)||1,vx=(-Math.sin(L.ry)*f+Math.cos(L.ry)*s)/l*sp*dt,vz=(-Math.cos(L.ry)*f-Math.sin(L.ry)*s)/l*sp*dt;
   if(!hit(L.x+vx,L.z))L.x+=vx;if(!hit(L.x,L.z+vz))L.z+=vz}
  else{L.spr=false;L.mv=0}
  // interactions
  const near=(p,r)=>Math.hypot(p[0]-L.x,p[1]-L.z)<r;
  if(L.hid){pr='E: leave closet';if(act)L.hid=null}
  else if(!down){
   items.some((p,i)=>{if(S.f[i]==0&&near(p,1.8)){pr='E: take fuse';if(act)toHost({t:'take',k:'f',i});return true}});
   bats.some((p,i)=>{if(S.b[i]==0&&near(p,1.8)){pr='E: take battery';if(act){L.bat=Math.min(100,L.bat+40);toHost({t:'take',k:'b',i})}return true}});
   closets.some(p=>{if(near(p,1.8)){pr='E: hide';if(act){L.hid=p;L.x=p[0];L.z=p[1]}return true}});
   for(const id in S.P){const q=S.P[id];if(id!=me&&q[3]&&Math.hypot(q[0]-L.x,q[1]-L.z)<2){pr='Hold E: revive '+q[5];if(keys.KeyE)toHost({t:'rev',id,dt});}}
  }else pr='You are down. A teammate must revive you.';
  act=false;$('pr').textContent=pr;
  // flashlight
  if(L.fon&&L.bat>0)L.bat=Math.max(0,L.bat-set.drain*dt);
  fl.intensity=L.fon&&L.bat>0&&!down?((S.m[3]=='stare'&&rnd()<.4)||(L.bat<15||(!S.m[4]&&Math.hypot(S.m[0]-L.x,S.m[1]-L.z)<10))&&rnd()<.15?0:(.6+L.bat/100*1.8)*PS.bright):0;
  amb.intensity=.3*PS.bright;
  $('hud').style.display=set.drain||set.sdrain?'block':'none';$('st').firstChild.style.width=L.stam/5*100+'%';$('bat').firstChild.style.width=L.bat+'%';
  $('top').textContent=`Fuses ${S.f.slice(0,set.fuses).reduce((a,b)=>a+b,0)} / ${set.fuses}`+(S.open?' - Power on. Reach the exit.':'');
  $('dn').style.display=down?'block':'none';if(down&&!L.pd){L.hid=null;const jv=me_[7];if(PS.js!==false){L.js=L.jt=jv==1?1.8:1.1;L.jv=jv;scream(jv)}}L.pd=down;
  cam.fov=PS.fov;cam.updateProjectionMatrix();
  cam.position.set(L.x,(down?.5:(L.hid?1.5:1.6))+(L.mv?Math.sin(now/(L.spr?90:150))*.045:0)+(L.js>0?(rnd()-.5)*(L.jv==2?.3:.12):0),L.z);cam.rotation.set(L.pitch,L.ry,0,'YXZ');fl.position.copy(cam.position);tg.position.set(cam.position.x-Math.sin(L.ry)*Math.cos(L.pitch),cam.position.y+Math.sin(L.pitch),cam.position.z-Math.cos(L.ry)*Math.cos(L.pitch));
  // monster & others
  const[mx,mz,mry,mst,gone]=S.m;mon.visible=!gone;mon.position.x+=(mx-mon.position.x)*.3;mon.position.z+=(mz-mon.position.z)*.3;mon.rotation.y=mry;mon.rotation.z=Math.sin(now/400)*.05+(mst=='chase'?Math.sin(now/40)*.03:0);limbs.forEach((a,i)=>a.rotation.x=Math.sin(now/(mst=='chase'?120:380)+i*3)*.35);mon.position.y=S.m[5];
  if(L.js>0){L.js-=dt;L.jsd=1;let a=Math.atan2(L.x-mx,L.z-mz)-L.ry;a=Math.atan2(Math.sin(a),Math.cos(a));if(L.js>L.jt-.5)L.ry+=a*.25;const dd=1+(L.jv==1?1.5*L.js/L.jt:0);mon.visible=true;mon.scale.setScalar(1.3);mon.position.set(L.x-Math.sin(L.ry)*dd,-2.6-(L.jv==3?1.6*L.js/L.jt:0),L.z-Math.cos(L.ry)*dd);mon.rotation.set(0,L.ry+Math.PI,0);L.pitch+=(.3-L.pitch)*.3}
  else if(L.jsd){L.jsd=0;mon.scale.setScalar(1);mon.position.set(mx,S.m[5],mz)}
  const md=Math.hypot(mx-L.x,mz-L.z);audio(dt,md,mst,gone,down);$('vig').style.opacity=L.js>0?1:((mst=='chase'||mst=='stare'||mst=='loom')&&!down?Math.min(1,Math.max(0,1-md/22)):0);
  for(const id in S.P){if(id==me)continue;const p=S.P[id],o=av[id]||(av[id]=avatar());
   o.position.x+=(p[0]-o.position.x)*.3;o.position.z+=(p[1]-o.position.z)*.3;o.rotation.y=p[2];o.visible=!p[4];o.scale.y=p[3]?.35:1;
   const v=voices[id];if(v)v.volume=PS.prox?Math.max(0,1-Math.hypot(p[0]-L.x,p[1]-L.z)/PS.range)*PS.vol:0}
  S.f.forEach((v,i)=>fm[i].visible=!v&&i<set.fuses);S.b.forEach((v,i)=>bm[i].visible=!v);
  exm.material.emissive.setHex(S.open?0x108030:0x300808);
 }
 R.render(sc,cam)}
requestAnimationFrame(frame);
