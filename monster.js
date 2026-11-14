// ---------- monster AI (host only) ----------
const cell=(x,z)=>(z/C|0)*W+(x/C|0);
const solid=(x,z)=>{const c=x/C|0,r=z/C|0;return r<0||c<0||r>=H||c>=W||MAP[r][c]=='#'};
function los(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=d/.5|0;for(let i=1;i<n;i++)if(solid(ax+(bx-ax)*i/n,az+(bz-az)*i/n))return false;return true}
function nextPt(x,z,tx,tz){const sc_=cell(x,z),tc=cell(tx,tz);if(sc_==tc)return[tx,tz];
 const prev=new Map([[tc,-1]]),q=[tc];
 for(let i=0;i<q.length&&!prev.has(sc_);i++){const c=q[i],cx=c%W,cy=c/W|0;for(const[dx,dy]of D){const nx=cx+dx,ny=cy+dy;if(MAP[ny]&&MAP[ny][nx]&&MAP[ny][nx]!='#'){const n=ny*W+nx;if(!prev.has(n)){prev.set(n,c);q.push(n)}}}}
 const n=prev.get(sc_);return n==null||n<0?[tx,tz]:ctr(n%W,n/W|0)}
function randCell(near){for(let k=0;k<50;k++){const c=near?Math.max(1,Math.min(W-2,(near[0]/C|0)+(rnd()*7-3|0))):1+rnd()*(W-2)|0,r=near?Math.max(1,Math.min(H-2,(near[1]/C|0)+(rnd()*7-3|0))):1+rnd()*(H-2)|0;if(MAP[r][c]!='#')return ctr(c,r)}return spawn}
function facing(p,x,z){const dx=x-p.x,dz=z-p.z;return(-Math.sin(p.ry)*dx-Math.cos(p.ry)*dz)/(Math.hypot(dx,dz)||1)}
function nab(p,v){p.down=1;p.jv=v;p.rp=0;p.hid=0}
function pickVent(ex){const up=Object.values(P).filter(p=>!p.down);
 if(up.length&&rnd()<.3){const q=up[rnd()*up.length|0];return vents.filter(v=>v!==ex).reduce((a,b)=>Math.hypot(a[0]-q.x,a[1]-q.z)<Math.hypot(b[0]-q.x,b[1]-q.z)?a:b)}let c=vents.filter(v=>v!==ex&&up.every(p=>Math.hypot(p.x-v[0],p.z-v[1])>10));if(!c.length)c=vents.filter(v=>v!==ex);return c[rnd()*c.length|0]}
function sim(dt){if(!started||over)return;const m=M,ps=Object.values(P);for(const p of ps){if(p.ox==null||Math.hypot(p.x-p.ox,p.z-p.oz)>.3){p.ox=p.x;p.oz=p.z;p.still=0}else p.still+=dt}if((m.age=(m.age||0)+dt)<HS.grace)return;
 m.tt=(m.tt==null?HS.tele:m.tt)-dt;
 for(const p of ps){p.sc=(p.sc||0)+dt;if(p.sc>.25){p.still=Math.hypot(p.x-(p.ox==null?p.x:p.ox),p.z-(p.oz==null?p.z:p.oz))<.15?(p.still||0)+p.sc:0;p.ox=p.x;p.oz=p.z;p.sc=0}}
 if(m.vs=='in'||m.vs=='out'){m.vt-=dt;const k=Math.max(0,m.vt)/1.4;m.py=m.vs=='in'?-2.8*(1-k):-2.8*k;
  if(m.vt<=0){if(m.vs=='in'){m.vs='gone';m.vt=5+rnd()*8;const t=pickVent(m.vc);m.vc=t;m.x=t[0];m.z=t[1];m.py=-2.8}else{for(const p of ps)if(!p.down&&!p.hid&&Math.hypot(p.x-m.x,p.z-m.z)<2.6)nab(p,3);m.vs=null;m.py=0;m.st='search';m.t=0;m.tx=m.x;m.tz=m.z}}return}
 if(m.vs=='gone'){m.vt-=dt;if(m.vt<=0){m.vs='out';m.vt=1.4;m.ev={n:m.ev.n+1,x:m.x,z:m.z}}return}
 if(!m.vs&&m.tt<=0&&m.st!='chase'){m.tt=HS.tele*(.7+rnd()*.6);m.vs='walk';m.vc=vents.reduce((a,b)=>Math.hypot(a[0]-m.x,a[1]-m.z)<Math.hypot(b[0]-m.x,b[1]-m.z)?a:b)}
 const calm=m.st=='patrol'||m.st=='search'||m.st=='invest',was=m.st;let best=null,bd=1e9;
 if(m.st=='chase'&&m.tp&&m.tp.hid&&!m.tp.down&&Math.hypot(m.tp.x-m.x,m.tp.z-m.z)<16&&los(m.x,m.z,m.tp.x,m.tp.z)){
  m.st='closet';m.cv=rnd()*3|0;m.ct=0;m.pt=0;m.cph=0;m.cw=2+rnd()*2;m.cl=[m.tp.x,m.tp.z];
  [m.tx,m.tz]=[randCell(),randCell(),randCell()].sort((a,b)=>Math.hypot(b[0]-m.x,b[1]-m.z)-Math.hypot(a[0]-m.x,a[1]-m.z))[0]}
 for(const p of ps){if(p.down||p.hid)continue;const d=Math.hypot(p.x-m.x,p.z-m.z);
  if(d<HS.sight&&d<bd&&los(m.x,m.z,p.x,p.z)){best=p;bd=d}
  if(calm&&d<(p.spr?HS.hear:HS.hear*.3)){m.st='invest';m.tx=p.x;m.tz=p.z;m.t=0}}
 if(best){const lk=facing(best,m.x,m.z)>.55;
  if(calm){if(lk||best.spr)m.st='chase';else if(m.tf==1&&bd<10){m.st='stare';m.t=0;m.sd=2.5+rnd()*2.5;m.tp=best}else if(!m.tf){m.st='feign';m.t=0;m.fd=2+rnd()*2.5;m.lx=best.x;m.lz=best.z}}
  else if(m.st=='feign'){m.lx=best.x;m.lz=best.z;if(lk||best.spr)m.st='chase'}
  else if(m.st=='stare'){m.tp=best;if(best.spr||bd>12)m.st='chase'}
  if(m.st=='chase'){if(was!='chase')m.lm=rnd()<.6;m.tp=best;m.tx=best.x;m.tz=best.z;m.lost=0;m.tf=0}}
 else if(m.st=='chase'&&(m.lost+=dt)>1.5){m.st='search';m.t=0;m.tf=0}
 m.t+=dt;const arrived=Math.hypot(m.tx-m.x,m.tz-m.z)<1.2;
 if(m.st=='patrol'&&(arrived||!m.tx)){[m.tx,m.tz]=randCell()}
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
 const[nx,nz]=nextPt(m.x,m.z,m.tx,m.tz),dx=nx-m.x,dz=nz-m.z,dl=Math.hypot(dx,dz)||1;
 m.x+=dx/dl*sp*dt;m.z+=dz/dl*sp*dt;m.ry=Math.atan2(dx,dz);if(m.tp&&(m.st=='stare'||m.st=='loom'))m.ry=Math.atan2(m.tp.x-m.x,m.tp.z-m.z);if(m.st=='closet'&&m.cv==1)m.ry=Math.atan2(m.cl[0]-m.x,m.cl[1]-m.z);if(m.vs=='walk'&&Math.hypot(m.vc[0]-m.x,m.vc[1]-m.z)<.9){m.vs='in';m.vt=1.4;m.ev={n:(m.ev?m.ev.n:0)+1,x:m.x,z:m.z}}
 for(const p of ps){if(p.down)continue;if(Math.hypot(p.x-m.x,p.z-m.z)<(p.hid?1.3:1.1)){nab(p,p.hid?2:0);m.st='search';m.t=0;m.tf=0}
  if(p.down)continue}
 for(const p of ps)if(p.down)p.rp=Math.max(0,p.rp-dt*.5);
 if(ps.length&&ps.every(p=>p.down))over='lose';
 if(F.slice(0,HS.fuses).every(x=>x)&&ps.some(p=>!p.down&&Math.hypot(p.x-exitP[0],p.z-exitP[1])<2))over='win'}

