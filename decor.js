// Decorations: windows, paintings, rugs, stains, furniture, candles. Called once by game.js after the world is built.
function buildDecor(){
 let sd=1337;const rr=()=>(sd=(sd*1664525+1013904223)>>>0)/4294967296;   // seeded so every player sees the same house
 const used=new Set([...items,...bats,...closets,...vents,exitP,spawn,mspawn].map(p=>(p[0]/C|0)+(p[1]/C|0)*W));
 const wood=tex(128,(g,w)=>{g.fillStyle='#3b2616';g.fillRect(0,0,w,w);for(let i=0;i<w;i+=8){g.fillStyle='rgba(0,0,0,'+rnd()*.35+')';g.fillRect(0,i,w,2)}},1,1);
 const wm=new THREE.MeshStandardMaterial({map:wood,roughness:.9});
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
 const bx=(w,h,d,x,y,z,ry)=>add(new THREE.BoxGeometry(w,h,d),wm,x,y,z,ry);
 const pl=(w,h,map,x,y,z,ry,rx,basic)=>add(new THREE.PlaneGeometry(w,h),basic?new THREE.MeshBasicMaterial({map,color:0x99a4b0}):new THREE.MeshStandardMaterial({map,roughness:1,transparent:true,depthWrite:false}),x,y,z,ry,rx);
 let lights=0;
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(MAP[r][c]=='#')continue;const id=c+r*W,p=ctr(c,r);
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dx,nr=r+dz;if(!MAP[nr]||MAP[nr][nc]!='#')continue;
   const outer=nr==0||nr==H-1||nc==0||nc==W-1,ry=Math.atan2(-dx,-dz),wx=p[0]+dx*(C/2-.03),wz=p[1]+dz*(C/2-.03);
   if(outer&&(c+r)%3==0)pl(1.5,1.9,winT,wx,1.9,wz,ry,0,true);
   else if(!outer&&rr()<.1)pl(.9,1.1,pT[rr()*2|0],wx,1.8,wz,ry);
   else if(!used.has(id)&&rr()<.13){const fx=p[0]+dx*(C/2-.5),fz=p[1]+dz*(C/2-.5),t=rr()*3|0;
    if(t==0){bx(1.8,2.2,.5,fx,1.1,fz,ry);for(let k=0;k<4;k++)bx(1.6,.05,.45,fx,.5+k*.5,fz,ry)}
    else if(t==1){bx(1.2,.08,.8,fx,.8,fz,ry);bx(.2,.8,.2,fx,.4,fz,ry);add(new THREE.CylinderGeometry(.04,.04,.22,6),new THREE.MeshStandardMaterial({color:0xddd0b0}),fx,.95,fz);
     add(new THREE.SphereGeometry(.04,6,6),new THREE.MeshBasicMaterial({color:0xffcc66}),fx,1.1,fz);
     if(lights<4){const l=new THREE.PointLight(0xffaa55,.7,8);l.position.set(fx,1.3,fz);sc.add(l);lights++}}
    else{bx(.5,.06,.5,fx,.5,fz,ry+.3);bx(.08,.5,.08,fx,.25,fz);bx(.5,.6,.06,fx+dx*.25,.8,fz+dz*.25,ry)}}}
  if(!used.has(id)&&rr()<.14)pl(2.6,2.6,rugT,p[0],.02,p[1],rr()*3,-Math.PI/2);
  if(rr()<.07)pl(2,2,stT,p[0]+rr()-.5,.03,p[1]+rr()-.5,0,-Math.PI/2)}
}
