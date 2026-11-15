// Room themes (wall/floor materials) and decorations. buildDecor() is called by buildWorld() in game.js.
const RT={foyer:['#5a4636','wood','#2e1e13'],living:['#4a3040','carpet','#301820'],kitchen:['#566058','tile','#8a8a80|#303030'],bedroom:['#3a4658','wood','#3a2a1c'],bath:['#6a7878','tile','#aab8b8|#667070'],library:['#3a2a20','carpet','#1c2a1c'],chapel:['#4a4a50','stone','#3a3a3e'],nursery:['#6a5a70','carpet','#58405a'],storage:['#3e3a30','wood','#241c14'],hall:['#4a3a2c','wood','#2e1e13'],yard:['#2c2822','wood','#18200f']};
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
function buildDecor(){
 let sd=(SEED>>>0)||1337;const rr=()=>(sd=(sd*1664525+1013904223)>>>0)/4294967296;
 const used=new Set([...items,...bats,...closets,...vents,exitP,spawn,mspawn].map(p=>(p[0]/C|0)+(p[1]/C|0)*W));
 const winT=tex(128,(g,w)=>{g.fillStyle='#0a1220';g.fillRect(0,0,w,w);const gr=g.createRadialGradient(w*.65,w*.3,2,w*.65,w*.3,w*.7);gr.addColorStop(0,'#aab8d0');gr.addColorStop(1,'#0a1220');g.fillStyle=gr;g.fillRect(0,0,w,w);
  g.fillStyle='#1a120c';g.fillRect(w/2-3,0,6,w);g.fillRect(0,w*.45,w,6);g.strokeStyle='#2a1a10';g.lineWidth=10;g.strokeRect(0,0,w,w);
  g.fillStyle='rgba(70,10,10,.85)';for(let i=0;i<4;i++){g.fillRect(i*5,0,5,w*(.5+rnd()*.5));g.fillRect(w-5-i*5,0,5,w*(.5+rnd()*.5))}},1,1);
 const paint=face=>tex(128,(g,w)=>{g.fillStyle='#241a12';g.fillRect(0,0,w,w);g.fillStyle='#120c08';g.fillRect(w*.2,w*.55,w*.6,w);
  g.fillStyle=face;g.beginPath();g.ellipse(w/2,w*.4,w*.17,w*.24,0,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(w*.43,w*.37,5,8,0,0,7);g.ellipse(w*.57,w*.37,5,8,0,0,7);g.fill();g.fillRect(w*.45,w*.53,w*.1,2);
  g.strokeStyle='#6a5028';g.lineWidth=10;g.strokeRect(0,0,w,w)},1,1);
 const pT=[paint('#b8a890'),paint('#8a9a8a')];
 const rugT=tex(128,(g,w)=>{g.fillStyle='#3a1010';g.fillRect(0,0,w,w);g.strokeStyle='#8a6a3a';g.lineWidth=6;g.strokeRect(8,8,w-16,w-16);g.beginPath();g.moveTo(w/2,24);g.lineTo(w-24,w/2);g.lineTo(w/2,w-24);g.lineTo(24,w/2);g.closePath();g.stroke();stain(g,w,60,.3)},1,1);
 const stT=tex(128,(g,w)=>{const gr=g.createRadialGradient(w/2,w/2,2,w/2,w/2,w/2);gr.addColorStop(0,'rgba(80,0,0,.85)');gr.addColorStop(1,'rgba(80,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,w)},1,1);
 const add=(g,m,x,y,z,ry,rx)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,0);sc.add(o);return o};
 const bx=(w,h,d,x,y,z,ry,col)=>add(new THREE.BoxGeometry(w,h,d),cm(col==null?0x3b2616:col),x,y,z,ry);
 const pl=(w,h,map,x,y,z,ry,rx,basic)=>add(new THREE.PlaneGeometry(w,h),basic?new THREE.MeshBasicMaterial({map,color:0x99a4b0}):new THREE.MeshStandardMaterial({map,roughness:1,transparent:true,depthWrite:false}),x,y,z,ry,rx);
 for(const o of ROOMS){const f=RM(o.t).ft.clone(),cw=o.c1-o.c0+1,rh=o.r1-o.r0+1;f.needsUpdate=true;f.repeat.set(cw,rh);
  const p=add(new THREE.PlaneGeometry(cw*C,rh*C),new THREE.MeshStandardMaterial({map:f,roughness:.9}),(o.c0+o.c1+1)*C/2,.012,(o.r0+o.r1+1)*C/2,0,-Math.PI/2)}
 let lights=0;
 const candle=(x,y,z)=>{add(new THREE.CylinderGeometry(.04,.04,.22,6),cm(0xddd0b0),x,y,z);add(new THREE.SphereGeometry(.04,6,6),new THREE.MeshBasicMaterial({color:0xffcc66}),x,y+.15,z);
  if(lights<6){const l=new THREE.PointLight(0xffaa55,.7,8);l.position.set(x,y+.4,z);sc.add(l);lights++}};
 const table=(x,z,ry)=>{bx(1.2,.08,.8,x,.8,z,ry);bx(.2,.8,.2,x,.4,z,ry);candle(x,.95,z)};
 const shelf=(x,z,ry)=>{bx(1.8,2.2,.5,x,1.1,z,ry);for(let k=0;k<4;k++)bx(1.6,.05,.45,x,.5+k*.5,z,ry,[0x6a2a2a,0x2a4a3a,0x4a3a6a][k%3])};
 const furn={
  living:(x,z,ry,dx,dz)=>{bx(2,.5,.9,x,.3,z,ry,0x4a1c24);bx(2,.6,.2,x+dx*.35,.7,z+dz*.35,ry,0x3a1018)},
  kitchen:(x,z,ry)=>{bx(2.2,.9,.7,x,.45,z,ry,0x6a6a62);bx(2.2,.06,.76,x,.93,z,ry,0x222222)},
  bedroom:(x,z,ry,dx,dz)=>{bx(1.6,.5,2.2,x,.3,z,ry+1.57,0x5a4a3a);bx(1.2,.15,.5,x+dx*.8,.62,z+dz*.8,ry+1.57,0xcfc8b8)},
  bath:(x,z,ry,dx,dz)=>{bx(1.8,.6,.8,x,.3,z,ry,0xd8dcd8);bx(.5,.9,.4,x-dz*1.3,.45,z+dx*1.3,ry,0xc8ccc8)},
  library:shelf,
  chapel:(x,z,ry)=>{bx(2.4,.5,.6,x,.25,z,ry);bx(2.4,.6,.1,x,.8,z,ry)},
  nursery:(x,z,ry)=>{bx(1.2,.5,.8,x,.3,z,ry,0xd8c8b8);bx(.3,.3,.3,x+.9,.15,z+.4,.5,0xc04040);bx(.3,.3,.3,x+1.2,.15,z+.2,.2,0x4060c0)},
  storage:(x,z,ry)=>{bx(.8,.8,.8,x,.4,z,ry,0x6a4a2a);bx(.7,.7,.7,x+.1,1.15,z,ry+.4,0x5a3a1a);add(new THREE.CylinderGeometry(.35,.35,.9,10),cm(0x4a3a2a),x+1,.45,z)},
  foyer:table,hall:table};
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){const ch=MAP[r][c];if(ch=='#'||ch=='%'||ch=='T')continue;const id=c+r*W,p=ctr(c,r),t=roomAt(c,r);
  if(ch==','){const q=rr(),x=p[0]+rr()*3-1.5,z=p[1]+rr()*3-1.5;if(q<.05){bx(.7,1,.18,x,.5,z,rr()*6,0x6a6a66);bx(.4,.12,.4,x,.06,z,0,0x4a4a46)}else if(q<.1)add(new THREE.SphereGeometry(.5+rr()*.4,7,5),cm(0x1a2a14),x,.3,z);continue}
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dx,nr=r+dz;if(!MAP[nr]||MAP[nr][nc]!='#')continue;
   const outer=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>MAP[nr+b]&&MAP[nr+b][nc+a]==','),ry=Math.atan2(-dx,-dz),wx=p[0]+dx*(C/2-.03),wz=p[1]+dz*(C/2-.03);
   if(outer&&(c+r)%3==0)pl(1.5,1.9,winT,wx,1.9,wz,ry,0,true);
   else if(!outer&&rr()<.1)pl(.9,1.1,pT[rr()*2|0],wx,1.8,wz,ry);
   else if(!used.has(id)&&t!='hall'&&rr()<.2){const fx=p[0]+dx*(C/2-.5),fz=p[1]+dz*(C/2-.5);(furn[t]||table)(fx,fz,ry,dx,dz);OBS.push([fx,fz,1.05])}}
  if(!used.has(id)&&t!='hall'&&rr()<.08)pl(2.6,2.6,rugT,p[0],.02,p[1],rr()*3,-Math.PI/2);
  if(rr()<.06)pl(2,2,stT,p[0]+rr()-.5,.03,p[1]+rr()-.5,0,-Math.PI/2)}
}
