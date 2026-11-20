// Room themes (wall/floor materials) and decorations. buildDecor() is called by buildWorld() in game.js.
const RT={foyer:['#5a4636','wood','#2e1e13'],living:['#4a3040','carpet','#301820'],kitchen:['#566058','tile','#8a8a80|#303030'],bedroom:['#3a4658','wood','#3a2a1c'],bath:['#6a7878','tile','#aab8b8|#667070'],library:['#3a2a20','carpet','#1c2a1c'],chapel:['#4a4a50','stone','#3a3a3e'],nursery:['#6a5a70','carpet','#58405a'],storage:['#3e3a30','wood','#241c14'],hall:['#4a3a2c','wood','#2e1e13'],yard:['#2c2822','wood','#18200f'],landing:['#4a3a2c','wood','#2e1e13'],cellar:['#2a2622','stone','#201e1b'],boiler:['#2e2a28','stone','#1c1a18'],ritual:['#2a1c1c','stone','#241616']};
const RMc={},CM={};
const cm=c=>CM[c]||(CM[c]=new THREE.MeshStandardMaterial({color:c,roughness:.8}));
function RM(t){if(RMc[t])return RMc[t];const[wc,fk,fc]=RT[t]||RT.hall,[a,b]=fc.split('|');
 const wt=tex(128,(g,w)=>{g.fillStyle=wc;g.fillRect(0,0,w,w);for(let x=0;x<w;x+=16){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,0,8,w)}stain(g,w,90,.25);g.fillStyle='rgba(10,6,3,.7)';g.fillRect(0,w-14,w,14)},1,1);
 const ft=tex(128,(g,w)=>{g.fillStyle=a;g.fillRect(0,0,w,w);
  if(fk=='tile'){g.fillStyle=b;for(let y=0;y<w;y+=32)for(let x=0;x<w;x+=32)if((x+y)/32%2==0)g.fillRect(x,y,32,32)}
  else if(fk=='wood'){for(let y=0;y<w;y+=16){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(0,y,w,2)}}
  else if(fk=='stone'){g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=2;for(let y=0;y<w;y+=32)for(let x=0;x<w;x+=32)g.strokeRect(x,y,32,32)}
  else{g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=3;g.strokeRect(6,6,w-12,w-12)}stain(g,w,80,.3)},1,1);
 return RMc[t]={wall:new THREE.MeshStandardMaterial({map:wt,roughness:1}),ft}}
function buildDecor(f){
 let sd=((SEED>>>0)||1337)+f*977;const swc={};const rr=()=>(sd=(sd*1664525+1013904223)>>>0)/4294967296;
 const used=new Set([...items,...bats,...closets,...vents,exitP,spawn,mspawn].filter(p=>(p[2]||0)==f).map(p=>(p[0]/C|0)+(p[1]/C|0)*W));
 const winT=tex(128,(g,w)=>{g.fillStyle='#0a1220';g.fillRect(0,0,w,w);const gr=g.createRadialGradient(w*.65,w*.3,2,w*.65,w*.3,w*.7);gr.addColorStop(0,'#aab8d0');gr.addColorStop(1,'#0a1220');g.fillStyle=gr;g.fillRect(0,0,w,w);
  g.fillStyle='#1a120c';g.fillRect(w/2-3,0,6,w);g.fillRect(0,w*.45,w,6);g.strokeStyle='#2a1a10';g.lineWidth=10;g.strokeRect(0,0,w,w);
  g.fillStyle='rgba(70,10,10,.85)';for(let i=0;i<4;i++){g.fillRect(i*5,0,5,w*(.5+rnd()*.5));g.fillRect(w-5-i*5,0,5,w*(.5+rnd()*.5))}},1,1);
 const paint=face=>tex(128,(g,w)=>{g.fillStyle='#241a12';g.fillRect(0,0,w,w);g.fillStyle='#120c08';g.fillRect(w*.2,w*.55,w*.6,w);
  g.fillStyle=face;g.beginPath();g.ellipse(w/2,w*.4,w*.17,w*.24,0,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(w*.43,w*.37,5,8,0,0,7);g.ellipse(w*.57,w*.37,5,8,0,0,7);g.fill();g.fillRect(w*.45,w*.53,w*.1,2);
  g.strokeStyle='#6a5028';g.lineWidth=10;g.strokeRect(0,0,w,w)},1,1);
 const pT=[paint('#b8a890'),paint('#8a9a8a')];
 const rugT=tex(128,(g,w)=>{g.fillStyle='#3a1010';g.fillRect(0,0,w,w);g.strokeStyle='#8a6a3a';g.lineWidth=6;g.strokeRect(8,8,w-16,w-16);g.beginPath();g.moveTo(w/2,24);g.lineTo(w-24,w/2);g.lineTo(w/2,w-24);g.lineTo(24,w/2);g.closePath();g.stroke();stain(g,w,60,.3)},1,1);
 const stT=tex(128,(g,w)=>{const gr=g.createRadialGradient(w/2,w/2,2,w/2,w/2,w/2);gr.addColorStop(0,'rgba(80,0,0,.85)');gr.addColorStop(1,'rgba(80,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,w)},1,1);
 const add=(g,m,x,y,z,ry,rx)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.order='YXZ';o.rotation.set(rx||0,ry||0,0);TG.add(o);return o};
 const bx=(w,h,d,x,y,z,ry,col)=>add(new THREE.BoxGeometry(w,h,d),cm(col==null?0x3b2616:col),x,y,z,ry);
 const pl=(w,h,map,x,y,z,ry,rx,basic)=>add(new THREE.PlaneGeometry(w,h),basic?new THREE.MeshBasicMaterial({map,color:0x99a4b0}):new THREE.MeshStandardMaterial({map,roughness:1,transparent:true,depthWrite:false}),x,y,z,ry,rx);
 for(const o of ROOMS){if(o.t=='landing')continue;const f=RM(o.t).ft.clone(),cw=o.c1-o.c0+1,rh=o.r1-o.r0+1;f.needsUpdate=true;f.repeat.set(cw,rh);
  const p=add(new THREE.PlaneGeometry(cw*C,rh*C),new THREE.MeshStandardMaterial({map:f,roughness:.9}),(o.c0+o.c1+1)*C/2,.012,(o.r0+o.r1+1)*C/2,0,-Math.PI/2)}
 // cobblestone path (with lamp posts) from the front door to the gate
 if(f==GF){ const s0=[doorP[0]/C|0,doorP[1]/C|0],t0=[exitP[0]/C|0,exitP[1]/C|0],prev=new Map(),key=(c,r)=>c+','+r,q=[s0];prev.set(key(...s0),null);
   while(q.length){const[c,r]=q.shift();if(c==t0[0]&&r==t0[1])break;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=key(c+a,r+b),t=MAP[r+b]&&MAP[r+b][c+a];if((t==','||t=='X')&&!prev.has(k)){prev.set(k,[c,r]);q.push([c+a,r+b])}}}
   const stoneT=tex(128,(g,w)=>{g.fillStyle='#1c1c1a';g.beginPath();g.ellipse(w/2,w/2,w*.48,w*.46,0,0,7);g.fill();for(let i=0;i<34;i++){g.fillStyle='rgb('+(70+rnd()*40|0)+','+(70+rnd()*35|0)+','+(66+rnd()*30|0)+')';g.beginPath();g.ellipse(w*.15+rnd()*w*.7,w*.15+rnd()*w*.7,8+rnd()*6,6+rnd()*5,rnd()*3,0,7);g.fill()}},1,1);
   const bulb=new THREE.MeshBasicMaterial({color:0xffd890});let cur=t0,prevP=null,n=0;
   while(cur){const[c,r]=cur,p=ctr(c,r);if(MAP[r][c]==','){pl(3.4,3.4,stoneT,p[0],.03,p[1],rr()*6,-Math.PI/2);
     if(prevP)pl(3.2,3.2,stoneT,(p[0]+prevP[0])/2,.031,(p[1]+prevP[1])/2,rr()*6,-Math.PI/2);
     if(n++%4==2){const sx=p[0]+(rr()<.5?-1:1)*2,sz=p[1]+(rr()<.5?-1:1)*.4;add(new THREE.CylinderGeometry(.06,.08,2.2,6),cm(0x151412),sx,1.1,sz);add(new THREE.SphereGeometry(.16,8,6),bulb,sx,2.3,sz)}}
     prevP=p;cur=prev.get(key(c,r))}}
 const curT=tex(64,(g,w)=>{g.fillStyle='rgba(150,190,170,.5)';g.fillRect(0,0,w,w);g.strokeStyle='rgba(60,90,70,.5)';for(let x=0;x<w;x+=8){g.beginPath();g.moveTo(x,0);g.lineTo(x,w);g.stroke()}},1,1);
 const drapeT=tex(64,(g,w)=>{g.fillStyle='rgba(90,18,24,.93)';g.fillRect(0,0,w,w);g.strokeStyle='rgba(30,4,6,.6)';for(let x=0;x<w;x+=6){g.beginPath();g.moveTo(x,0);g.lineTo(x,w);g.stroke()}},1,1);
 const circT=tex(256,(g,w)=>{g.strokeStyle='rgba(150,20,20,.9)';g.lineWidth=6;g.beginPath();g.arc(w/2,w/2,w*.45,0,7);g.stroke();g.beginPath();g.arc(w/2,w/2,w*.33,0,7);g.stroke();for(let i=0;i<5;i++){const a=i*1.2566-1.5708,b=(i+2)*1.2566-1.5708;g.beginPath();g.moveTo(w/2+Math.cos(a)*w*.33,w/2+Math.sin(a)*w*.33);g.lineTo(w/2+Math.cos(b)*w*.33,w/2+Math.sin(b)*w*.33);g.stroke()}},1,1);
 for(const o of ROOMS)if(o.t=='ritual'){const cx=(o.c0+o.c1+1)*C/2,cz=(o.r0+o.r1+1)*C/2;pl(7,7,circT,cx,.05,cz,rr()*6,-Math.PI/2);for(let k=0;k<6;k++){const a=k*Math.PI/3,x=cx+Math.cos(a)*3.1,z=cz+Math.sin(a)*3.1;add(new THREE.CylinderGeometry(.05,.05,.3,6),cm(0xddd0b0),x,.15,z);add(new THREE.SphereGeometry(.05,6,6),new THREE.MeshBasicMaterial({color:0xffaa55}),x,.34,z)}}
 const lamp=(x,z)=>{add(new THREE.CylinderGeometry(.01,.01,.8,4),cm(0x111111),x,3.0,z);add(new THREE.ConeGeometry(.35,.3,10,1,true),new THREE.MeshStandardMaterial({color:0x2a2018,side:THREE.DoubleSide}),x,2.55,z);{const bmat=new THREE.MeshBasicMaterial({color:0xffe0a0});add(new THREE.SphereGeometry(.09,8,6),bmat,x,2.45,z);LAMPS.push({m:bmat,x,z,f,zi:zoneAt(f,x,z),y:2.6,base:1.4,rg:16,on:1,fl:1})}};
 for(const o of ROOMS){const q=ctr((o.c0+o.c1)>>1,(o.r0+o.r1)>>1);lamp(q[0],q[1])}
 let lights=0;
 const candle=(x,y,z)=>{add(new THREE.CylinderGeometry(.04,.04,.22,6),cm(0xddd0b0),x,y,z);add(new THREE.SphereGeometry(.04,6,6),new THREE.MeshBasicMaterial({color:0xffcc66}),x,y+.15,z);
  if(lights<3){LAMPS.push({m:null,x,z,f,zi:-1,y:y+.5,base:.7,rg:8,candle:1,on:1,fl:1});lights++}};
 const table=(x,z,ry)=>{bx(1.2,.08,.8,x,.8,z,ry);bx(.2,.8,.2,x,.4,z,ry);candle(x,.95,z)};
 const shelf=(x,z,ry)=>{bx(1.8,2.2,.5,x,1.1,z,ry);for(let k=0;k<4;k++)bx(1.6,.05,.45,x,.5+k*.5,z,ry,[0x6a2a2a,0x2a4a3a,0x4a3a6a][k%3])};
 const furn={
  living:(x,z,ry,dx,dz)=>{bx(2,.5,.9,x,.3,z,ry,0x4a1c24);bx(2,.6,.2,x+dx*.35,.7,z+dz*.35,ry,0x3a1018)},
  kitchen:(x,z,ry)=>{bx(2.2,.9,.7,x,.45,z,ry,0x6a6a62);bx(2.2,.06,.76,x,.93,z,ry,0x222222)},
  bedroom:(x,z,ry,dx,dz)=>{const r2=ry+1.57,rot=(ox,oz)=>[x+ox*Math.cos(r2)+oz*Math.sin(r2),z-ox*Math.sin(r2)+oz*Math.cos(r2)];   // raised bed you can hide under
   bx(1.6,.14,2.2,x,.62,z,r2,0x5a4a3a);bx(1.5,.1,2.1,x,.74,z,r2,0x8a7a6a);bx(1.2,.15,.5,x+dx*.8,.86,z+dz*.8,r2,0xcfc8b8);
   for(const[ox,oz]of[[.7,.95],[-.7,.95],[.7,-.95],[-.7,-.95]]){const q=rot(ox,oz);bx(.1,.55,.1,q[0],.28,q[1],r2,0x3a2a1c)}
   BEDS.push([x,z,f,-dx,-dz])},
  bath:(x,z,ry,dx,dz)=>{bx(1.8,.6,.8,x,.3,z,ry,0xd8dcd8);bx(.5,.9,.4,x-dz*1.3,.45,z+dx*1.3,ry,0xc8ccc8);
   pl(1.8,1.7,curT,x+Math.sin(ry)*.5,.95,z+Math.cos(ry)*.5,ry);BEDS.push([x,z,f,-dx,-dz,'E: hide in the bathtub (behind the curtain)',.55])},
  library:shelf,
  chapel:(x,z,ry)=>{bx(2.4,.5,.6,x,.25,z,ry);bx(2.4,.6,.1,x,.8,z,ry)},
  nursery:(x,z,ry)=>{bx(1.2,.5,.8,x,.3,z,ry,0xd8c8b8);bx(.3,.3,.3,x+.9,.15,z+.4,.5,0xc04040);bx(.3,.3,.3,x+1.2,.15,z+.2,.2,0x4060c0)},
  storage:(x,z,ry)=>{bx(.8,.8,.8,x,.4,z,ry,0x6a4a2a);bx(.7,.7,.7,x+.1,1.15,z,ry+.4,0x5a3a1a);add(new THREE.CylinderGeometry(.35,.35,.9,10),cm(0x4a3a2a),x+1,.45,z)},
  foyer:table,hall:table};
 furn.cellar=furn.storage;furn.boiler=furn.storage;furn.ritual=table;
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){const ch=MAP[r][c];if(ch=='#'||ch=='%'||ch=='T')continue;const id=c+r*W,p=ctr(c,r),t=roomAt(c,r),zi=zoneAt(f,p[0],p[1]);
  if(t=='hall'&&ch=='.'&&(c*3+r*5)%11==0)lamp(p[0],p[1]);
  if(ch==','){const q=rr(),x=p[0]+rr()*3-1.5,z=p[1]+rr()*3-1.5;if(q<.05){bx(.7,1,.18,x,.5,z,rr()*6,0x6a6a66);bx(.4,.12,.4,x,.06,z,0,0x4a4a46)}else if(q<.1)add(new THREE.SphereGeometry(.5+rr()*.4,7,5),cm(0x1a2a14),x,.3,z);continue}
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dx,nr=r+dz;if(!MAP[nr]||MAP[nr][nc]!='#')continue;
   const outer=nr==6||nr==H-7||nc==6||nc==W-7,ry=Math.atan2(-dx,-dz),wx=p[0]+dx*(C/2-.03),wz=p[1]+dz*(C/2-.03);
   let sw_=false;
   if(!used.has(id)&&t!='yard'&&(swc[zi]||0)<(t=='hall'?3:1)&&(t!='hall'||(c*7+r*3)%7==0)){swc[zi]=(swc[zi]||0)+1;sw_=true;   // light switch on the wall
    const sx=p[0]+dx*(C/2-.06),sz=p[1]+dz*(C/2-.06),im=new THREE.MeshBasicMaterial({color:0x40c060});
    bx(.22,.34,.04,sx,1.3,sz,ry,0x8a8070);bx(.05,.12,.05,sx,1.24,sz,ry,0x222222);add(new THREE.BoxGeometry(.07,.07,.05),im,sx,1.42,sz,ry);
    SW.push({x:p[0]+dx*(C/2-.9),z:p[1]+dz*(C/2-.9),f,zi,ind:im})}
   if(sw_){}else if(f>=GF&&outer&&(c+r)%3==0){pl(1.5,1.9,winT,wx,1.9,wz,ry,0,true);
    if((c*3+r)%2==0){pl(1.9,2.5,drapeT,wx-dx*.5,1.3,wz-dz*.5,ry);BEDS.push([wx-dx*.25,wz-dz*.25,f,-dx,-dz,'E: hide behind the curtain',1.5])}}
   else if(!outer&&rr()<.1)pl(.9,1.1,pT[rr()*2|0],wx,1.8,wz,ry);
   else if(!used.has(id)&&t!='hall'&&rr()<.2){const fx=p[0]+dx*(C/2-.5),fz=p[1]+dz*(C/2-.5);(furn[t]||table)(fx,fz,ry,dx,dz);OBS.push([fx,fz,1.05,f])}}
  if(!used.has(id)&&t!='hall'&&rr()<.08)pl(2.6,2.6,rugT,p[0],.02,p[1],rr()*3,-Math.PI/2);
  if(rr()<.06)pl(2,2,stT,p[0]+rr()-.5,.03,p[1]+rr()-.5,0,-Math.PI/2)}
}
