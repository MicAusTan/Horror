// ---------- monster AI (host only) ----------
const cell=(x,z)=>(z/C|0)*W+(x/C|0);
const pass=(x,y)=>{const k=MAP[y]&&MAP[y][x];return!!k&&k!='#'&&k!='%'&&k!='T'&&!(k=='D'&&!DOPEN)&&!(k=='L'&&isLocked(CFL,x,y))&&!((k=='d'||k=='e')&&isShut(CFL,x,y))};
const solid=(x,z)=>{const c=x/C|0,r=z/C|0;return r<0||c<0||r>=H||c>=W||!pass(c,r)};
function segX(ax,az,bx,bz,s){const o=(px,pz,qx,qz,rx,rz)=>(qx-px)*(rz-pz)-(qz-pz)*(rx-px);return o(ax,az,bx,bz,s[0],s[1])*o(ax,az,bx,bz,s[2],s[3])<0&&o(s[0],s[1],s[2],s[3],ax,az)*o(s[0],s[1],s[2],s[3],bx,bz)<0}
function dseg(px,pz,s){const vx=s[2]-s[0],vz=s[3]-s[1],t=Math.max(0,Math.min(1,((px-s[0])*vx+(pz-s[1])*vz)/(vx*vx+vz*vz)));return Math.hypot(px-(s[0]+vx*t),pz-(s[1]+vz*t))}
function los(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=d/.5|0;for(let i=1;i<n;i++)if(solid(ax+(bx-ax)*i/n,az+(bz-az)*i/n))return false;
 for(const dd of DOORS)if(dd.open&&!dd.broken&&dd.f==CFL&&segX(ax,az,bx,bz,dd.sg))return false;   // an open door leaf can hide you
 return true}
const passF=(f,x,y)=>{const k=MAPS[f]&&MAPS[f][y]&&MAPS[f][y][x];return!!k&&k!='#'&&k!='%'&&k!='T'&&!(k=='D'&&!DOPEN)};   // the monster can path through locked doors - it breaks them open
const inLockedRoom=(f,c,r)=>LOCKROOM&&LOCKS.some(l=>!l.open)&&f==LOCKROOM.f&&c>=LOCKROOM.c0&&c<=LOCKROOM.c1&&r>=LOCKROOM.r0&&r<=LOCKROOM.r1;
function rtOf(f,x,z){const c=x/C|0,r=z/C|0,mp=MAPS[f];if(mp&&mp[r]&&mp[r][c]==',')return'yard';for(const o of RS[f]||[])if(c>=o.c0&&c<=o.c1&&r>=o.r0&&r<=o.r1)return o.t;return'hall'}
function nextPt(x,z,f,tx,tz,tf){const N=W*H,sc_=cell(x,z),tc=cell(tx,tz),key=(ff,c)=>ff*N+c,start=key(f,sc_),goal=key(tf,tc);if(start==goal||!(tc>=0&&tc<N&&sc_>=0&&sc_<N)||!MAPS[tf]||!MAPS[f])return[tx,tz];   // never path outside the map
 const lockOK=inLockedRoom(tf,tc%W,tc/W|0);   // only goes through a locked door when its target is inside that room
 const prev=new Map([[goal,-1]]),q=[goal];
 for(let i=0;i<q.length&&!prev.has(start);i++){const k=q[i],ff=k/N|0,c=k%N,cx=c%W,cy=c/W|0,nb=[];
  for(const[dx,dy]of D)if(passF(ff,cx+dx,cy+dy)&&(lockOK||!(MAPS[ff][cy+dy][cx+dx]=='L'&&isLocked(ff,cx+dx,cy+dy))))nb.push(key(ff,(cy+dy)*W+cx+dx));
  if(MAPS[ff][cy][cx]=='R')for(const o of[ff-1,ff+1])if(MAPS[o]&&MAPS[o][cy][cx]=='R')nb.push(key(o,c));
  for(const n of nb)if(!prev.has(n)){prev.set(n,k);q.push(n)}}
 let n=prev.get(start);if(n==null||n<0)return[tx,tz];
 for(let g=0;g<3&&n%N==sc_;g++){const nx=prev.get(n);if(nx==null||nx<0)return[tx,tz];n=nx}   // skip floor-switch edges (same cell, other floor)
 const c=n%N;return ctr(c%W,c/W|0)}
function randCell(near){for(let k=0;k<50;k++){const c=near?Math.max(1,Math.min(W-2,(near[0]/C|0)+(rnd()*7-3|0))):1+rnd()*(W-2)|0,r=near?Math.max(1,Math.min(H-2,(near[1]/C|0)+(rnd()*7-3|0))):1+rnd()*(H-2)|0;if(pass(c,r)&&MAP[r][c]!=','&&!inLockedRoom(CFL,c,r))return ctr(c,r)}return spawn}
function facing(p,x,z){const dx=x-p.x,dz=z-p.z;return(-Math.sin(p.ry)*dx-Math.cos(p.ry)*dz)/(Math.hypot(dx,dz)||1)}
function nab(p,v){p.down=1;p.jv=v;p.rp=0;p.hid=0}
function pickVent(ex){const up=Object.values(P).filter(p=>!p.down);
 if(up.length&&rnd()<.3){const q=up[rnd()*up.length|0],vf=vents.filter(v=>v!==ex&&v[2]==q.f);if(vf.length)return vf.reduce((a,b)=>Math.hypot(a[0]-q.x,a[1]-q.z)<Math.hypot(b[0]-q.x,b[1]-q.z)?a:b)}let c=vents.filter(v=>v!==ex&&up.every(p=>p.f!=v[2]||Math.hypot(p.x-v[0],p.z-v[1])>10));if(!c.length)c=vents.filter(v=>v!==ex);return c[rnd()*c.length|0]}
function sim(dt){if(!started||over)return;const m=M,ps=Object.values(P);m.f=m.f==null?GF:m.f;m.y=m.y||0;useF(m.f);for(const p of ps)p.f=Math.round((p.y||0)/FH);if(m.st!='patrol'&&m.st!='invest')m.xf=null;m.hot=m.st=='chase'?4:Math.max(0,(m.hot||0)-dt);   // 'hot' for a few seconds after a chase: it bashes doors instead of opening them politelyfor(const p of ps){if(p.ox==null||Math.hypot(p.x-p.ox,p.z-p.oz)>.3){p.ox=p.x;p.oz=p.z;p.still=0}else p.still+=dt}if((m.age=(m.age||0)+dt)<HS.grace)return;
 if(HS.cut&&!HS.dark){m.lt=(m.lt==null?35+rnd()*30:m.lt)-dt;   // the monster sometimes cuts the lights in the zone it is walking through
  if(m.lt<=0){m.lt=45+rnd()*55;if(!m.vs&&m.st!='chase'){const z=LZ[zoneAt(m.f,m.x,m.z)];if(z&&z.on){z.on=0;m.ev={n:(m.ev?m.ev.n:0)+1,x:m.x,z:m.z,k:3}}}}}
 for(const b of MB){b.t-=dt;b.cd=Math.max(0,(b.cd||0)-dt);if(!b.on&&b.t<=0){b.on=1;b.t=22;m.ev={n:(m.ev?m.ev.n:0)+1,x:b.x,z:b.z,k:2};
  // an ambient event only draws the monster if someone is close enough to be near the noise (a hazard, not a free distraction)
  if(ps.some(p=>!p.down&&p.f==b.f&&Math.hypot(p.x-b.x,p.z-b.z)<16)&&(m.st=='patrol'||m.st=='search')&&(!m.vs||m.vs=='walk')){m.vs=null;m.st='invest';m.tx=b.x;m.tz=b.z;m.t=0;m.tf=0;m.xf=b.f==m.f?null:b.f}}else if(b.on&&b.t<=0){b.on=0;b.t=35+rnd()*40;b.cd=30}}
 m.tt=(m.tt==null?HS.tele:m.tt)-dt;
 for(const p of ps){p.sc=(p.sc||0)+dt;if(p.sc>.25){p.still=Math.hypot(p.x-(p.ox==null?p.x:p.ox),p.z-(p.oz==null?p.z:p.oz))<.15?(p.still||0)+p.sc:0;p.ox=p.x;p.oz=p.z;p.sc=0}}
 if(m.vs=='in'||m.vs=='out'){m.vt-=dt;const k=Math.max(0,m.vt)/1.4;m.py=m.vs=='in'?-2.8*(1-k):-2.8*k;
  if(m.vt<=0){if(m.vs=='in'){m.vs='gone';m.vt=5+rnd()*8;const t=pickVent(m.vc);m.vc=t;m.x=t[0];m.z=t[1];m.f=t[2]||0;m.y=m.f*FH;m.py=-2.8}else{for(const p of ps)if(!p.down&&!p.hid&&p.f==m.f&&Math.hypot(p.x-m.x,p.z-m.z)<2.6)nab(p,3);m.vs=null;m.py=0;m.st='search';m.t=0;m.tx=m.x;m.tz=m.z}}return}
 if(m.vs=='gone'){m.vt-=dt;if(m.vt<=0){m.vs='out';m.vt=1.4;m.ev={n:m.ev.n+1,x:m.x,z:m.z}}return}
 if(!m.vs&&m.tt<=0&&m.st!='chase'){m.tt=HS.tele*(.7+rnd()*.6);const vf=vents.filter(v=>v[2]==m.f);if(vf.length){m.vs='walk';m.vc=vf.reduce((a,b)=>Math.hypot(a[0]-m.x,a[1]-m.z)<Math.hypot(b[0]-m.x,b[1]-m.z)?a:b)}}
 const calm=m.st=='patrol'||m.st=='search'||m.st=='invest',was=m.st;let best=null,bd=1e9;
 if(m.st=='chase'&&m.tp&&m.tp.hid&&!m.tp.down&&Math.hypot(m.tp.x-m.x,m.tp.z-m.z)<16&&los(m.x,m.z,m.tp.x,m.tp.z)){
  m.st='closet';m.cv=rnd()*3|0;m.ct=0;m.pt=0;m.cph=0;m.cw=2+rnd()*2;m.cl=[m.tp.x,m.tp.z];
  [m.tx,m.tz]=[randCell(),randCell(),randCell()].sort((a,b)=>Math.hypot(b[0]-m.x,b[1]-m.z)-Math.hypot(a[0]-m.x,a[1]-m.z))[0]}
 for(const p of ps){if(p.down||p.hid)continue;const d=Math.hypot(p.x-m.x,p.z-m.z),same=p.f==m.f;
  if(same&&d<HS.sight&&d<bd&&los(m.x,m.z,p.x,p.z)){best=p;bd=d}
  if(calm&&d+(same?0:12)<(p.spr?HS.hear:HS.hear*.3)*({kitchen:1.7,bath:1.3}[rtOf(p.f,p.x,p.z)]||1)*(STAIRS.some(s=>p.x>=s.x0&&p.x<=s.x1&&p.z>=s.z0&&p.z<=s.z1)?1.4:1)){m.st='invest';m.tx=p.x;m.tz=p.z;m.t=0;m.xf=same?null:p.f}}
 if(best){const lk=facing(best,m.x,m.z)>.55;
  if(calm){if(lk||best.spr)m.st='chase';else if(m.tf==1&&bd<10){m.st='stare';m.t=0;m.sd=2.5+rnd()*2.5;m.tp=best}else if(!m.tf){m.st='feign';m.t=0;m.fd=2+rnd()*2.5;m.lx=best.x;m.lz=best.z}}
  else if(m.st=='feign'){m.lx=best.x;m.lz=best.z;if(lk||best.spr)m.st='chase'}
  else if(m.st=='stare'){m.tp=best;if(best.spr||bd>12)m.st='chase'}
  if(m.st=='chase'){if(was!='chase')m.lm=rnd()<.6;m.tp=best;m.tx=best.x;m.tz=best.z;m.lost=0;m.tf=0}}
 else if(m.st=='chase'&&(m.lost+=dt)>1.5){m.tf=0;m.t=0;const q=m.tp;if(q&&q.f!=m.f&&!q.down&&STAIRS.some(s=>Math.hypot((s.x0+s.x1)/2-m.x,(s.z0+s.z1)/2-m.z)<16)){m.st='invest';m.tx=q.x;m.tz=q.z;m.xf=q.f}else m.st='search'}   // follows you up or down the stairs
 m.t+=dt;const arrived=Math.hypot(m.tx-m.x,m.tz-m.z)<1.2&&(m.xf==null||m.f==m.xf);
 if(m.st=='patrol'&&(arrived||!m.tx)){m.xf=null;if(NF>1&&rnd()<.25){let ff=rnd()*NF|0;if(ff==m.f)ff=(ff+1)%NF;useF(ff);[m.tx,m.tz]=randCell();useF(m.f);m.xf=ff}else[m.tx,m.tz]=randCell()}
 if(m.st=='invest'&&arrived){m.st='search';m.t=0;m.tf=0}
 if(m.st=='feign'&&m.t>m.fd){m.st='invest';m.tx=m.lx;m.tz=m.lz;m.tf=1;m.t=0}
 if(m.st=='stare'&&m.t>m.sd&&m.tp){m.st='chase';m.tx=m.tp.x;m.tz=m.tp.z;m.lost=0;m.tf=0;m.lm=rnd()<.6}
 if(m.st=='chase'&&m.lm&&m.tp&&!m.tp.down&&!m.tp.hid&&Math.hypot(m.tp.x-m.x,m.tp.z-m.z)<3.8&&facing(m.tp,m.x,m.z)<-.1&&m.tp.still>.8){m.st='loom';m.t=0;m.lm=0}
 if(m.st=='loom'){const q=m.tp;if(!q||q.down||q.hid)m.st='search';else if(facing(q,m.x,m.z)>.4||m.t>6){nab(q,1);m.st='search';m.t=0;m.tf=0}else if(Math.hypot(q.x-m.x,q.z-m.z)>6||(m.t>1&&q.still<.2))m.st='chase'}
 if(m.st=='closet'){const q=m.tp,cx=m.cl[0],cz=m.cl[1],d=Math.hypot(cx-m.x,cz-m.z);m.ct+=dt;
  if(!q||!q.hid||q.down){m.st='search';m.t=0}
  else if(m.cv==2&&m.cph==0){if(m.ct>m.cw+2)m.cph=1}
  else{m.tx=cx;m.tz=cz;if(m.cv==1&&d<1.8){m.pt+=dt;if(m.pt>m.cw){nab(q,2);m.st='search';m.t=0}}}}
 if(m.st=='search'){if(m.t>9){m.st='patrol';[m.tx,m.tz]=randCell()}else if(arrived)[m.tx,m.tz]=randCell([m.x,m.z])}
 if(m.vs=='walk'&&m.st!='patrol'){m.vs=null;m.tt=10}
 if(m.vs=='walk'){m.tx=m.vc[0];m.tz=m.vc[1]}
 const sp=m.st=='stare'||m.st=='loom'||(m.st=='closet'&&m.cv==1&&Math.hypot(m.cl[0]-m.x,m.cl[1]-m.z)<1.8)?0:m.st=='closet'?(m.cv==1||m.cph==0&&m.cv==2?HS.wSpeed*1.3:HS.mSpeed*1.15):m.st=='chase'?HS.mSpeed:HS.wSpeed*(m.st=='invest'?1.3:1);
 const tfl=m.vs=='walk'?m.vc[2]:(m.xf!=null&&(m.st=='patrol'||m.st=='invest')?m.xf:m.f),[nx,nz]=nextPt(m.x,m.z,m.f,m.tx,m.tz,tfl),dx=nx-m.x,dz=nz-m.z,dl=Math.hypot(dx,dz)||1;
 const dc=nx/C|0,dr=nz/C|0,dk=MAP[dr]&&MAP[dr][dc]=='L'&&isLocked(m.f,dc,dr),ds=MAP[dr]&&(MAP[dr][dc]=='d'||MAP[dr][dc]=='e')&&isShut(m.f,dc,dr);
 if(dk&&Math.hypot(nx-m.x,nz-m.z)<2.6){m.dw=m.dw||{t:0,b:0};m.dw.t+=dt;m.dw.b-=dt;   // it stops at a locked door and bangs on it until it gives way
  if(m.dw.b<=0){m.dw.b=.8;m.ev={n:(m.ev?m.ev.n:0)+1,x:nx,z:nz,k:5}}
  if(m.dw.t>=HS.doorT){LOCKS.forEach(l=>{if(l.f==m.f)l.open=1});m.dw=null;m.ev={n:(m.ev?m.ev.n:0)+1,x:nx,z:nz,k:6}}}
 else if(ds&&Math.hypot(nx-m.x,nz-m.z)<2.4){m.dop=(m.dop||0)+dt;const bash=m.hot>0;if(m.dop>(bash?.3:.5)){const dd2=DOORS[DRI[m.f+':'+dc+','+dr]];dd2.open=1;if(bash)dd2.broken=1;m.dop=0;m.ev={n:(m.ev?m.ev.n:0)+1,x:nx,z:nz,k:bash?8:7}}}   // it takes a moment to open a closed door
 else{m.dw=null;m.dop=0;m.x+=dx/dl*sp*dt;m.z+=dz/dl*sp*dt}
 m.ry=Math.atan2(dx,dz);m.y=groundY(m.x,m.z,m.f);m.f=Math.round(m.y/FH);if(m.tp&&(m.st=='stare'||m.st=='loom'))m.ry=Math.atan2(m.tp.x-m.x,m.tp.z-m.z);if(m.st=='closet'&&m.cv==1)m.ry=Math.atan2(m.cl[0]-m.x,m.cl[1]-m.z);if(m.vs=='walk'&&m.f==m.vc[2]&&Math.hypot(m.vc[0]-m.x,m.vc[1]-m.z)<.9){m.vs='in';m.vt=1.4;m.ev={n:(m.ev?m.ev.n:0)+1,x:m.x,z:m.z}}
 for(const p of ps){if(p.down||p.f!=m.f)continue;if(Math.hypot(p.x-m.x,p.z-m.z)<(p.hid?1.3:1.1)){nab(p,p.hid?2:0);m.st='search';m.t=0;m.tf=0}
  if(p.down)continue}
 for(const p of ps)if(p.down)p.rp=Math.max(0,p.rp-dt*.5);
 if(ps.length&&ps.every(p=>p.down))over='lose';
 if(F.slice(0,HS.fuses).every(x=>x)&&(!HS.obj||GEN)&&ps.some(p=>!p.down&&Math.hypot(p.x-exitP[0],p.z-exitP[1])<2))over='win'}

