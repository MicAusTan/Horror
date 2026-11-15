// Seeded house generator: BSP rooms, corridors, room types, objective/closet/vent placement.
function genMap(seed,size){
 let sd=seed>>>0;const rr=()=>(sd=(sd*1664525+1013904223)>>>0)/4294967296,ri=(a,b)=>a+(rr()*(b-a+1)|0);
 const W=[23,31,41,51][size-1],H=[19,25,31,37][size-1],g=Array.from({length:H},()=>Array(W).fill('#')),leaves=[];
 (function sp(x,y,w,h,d){const cv=w>=14,ch=h>=12;
  if((!cv&&!ch)||(d>=2&&rr()<.18)){leaves.push({x,y,w,h});return}
  if(cv&&(!ch||(w>h?rr()<.7:rr()<.3))){const s=ri(7,w-7);sp(x,y,s,h,d+1);sp(x+s,y,w-s,h,d+1)}else{const s=ri(6,h-6);sp(x,y,w,s,d+1);sp(x,y+s,w,h-s,d+1)}})(0,0,W-1,H-1,0);
 const rooms=leaves.map(l=>({c0:l.x+1,c1:l.x+l.w-1,r0:l.y+1,r1:l.y+l.h-1,t:''}));
 for(const o of rooms)for(let r=o.r0;r<=o.r1;r++)for(let c=o.c0;c<=o.c1;c++)g[r][c]='.';
 const mid=o=>[(o.c0+o.c1)>>1,(o.r0+o.r1)>>1],dist=(a,b)=>{const p=mid(a),q=mid(b);return Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])};
 const link=(a,b)=>{const[x1,y1]=mid(a),[x2,y2]=mid(b);for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)g[y1][x]='.';for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)g[y][x2]='.'};
 const done=[rooms[0]],todo=rooms.slice(1);
 while(todo.length){let bd=1e9,ba,bb;for(const t of todo)for(const d of done){const k=dist(t,d);if(k<bd){bd=k;ba=t;bb=d}}link(ba,bb);done.push(ba);todo.splice(todo.indexOf(ba),1)}
 for(const a of rooms)if(rr()<.3){const b=rooms[ri(0,rooms.length-1)];if(a!=b)link(a,b)}
 const area=o=>(o.c1-o.c0+1)*(o.r1-o.r0+1);
 for(const o of rooms)if(area(o)>45)for(let k=ri(2,4);k>0;k--)g[ri(o.r0+2,o.r1-2)][ri(o.c0+2,o.c1-2)]='#';
 const edge=rooms.filter(o=>o.c0==1||o.r1==H-2),sp0=edge.reduce((a,b)=>b.c0-b.r1<a.c0-a.r1?b:a);sp0.t='foyer';
 const big=['living','library','chapel','kitchen','bedroom','bedroom','nursery'];
 rooms.filter(o=>o!=sp0).sort((a,b)=>area(b)-area(a)).forEach((o,i)=>o.t=area(o)<22?['bath','storage','nursery'][i%3]:big[i%big.length]);
 const free=o=>{for(let k=0;k<60;k++){const c=ri(o.c0,o.c1),r=ri(o.r0,o.r1);if(g[r][c]=='.')return[c,r]}return null};
 const put=(ch,o)=>{const p=free(o);if(p)g[p[1]][p[0]]=ch};
 const far=rooms.filter(o=>o!=sp0).sort((a,b)=>dist(b,sp0)-dist(a,sp0));
 put('S',sp0);put('M',far[0]);
 const sh=rooms.filter(o=>o!=sp0).sort(()=>rr()-.5);
 for(let k=0;k<6;k++)put('F',sh[k%sh.length]);
 for(let k=0;k<3;k++)put('J',sh[(k+2)%sh.length]);
 for(let k=0;k<Math.ceil(rooms.length/3);k++)put('B',rooms[ri(0,rooms.length-1)]);
 for(const o of rooms){if(o==sp0&&rr()<.5)continue;for(let k=0;k<30;k++){const p=free(o);if(!p)break;const n=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>g[p[1]+b][p[0]+a]=='#').length;if(n>=2){g[p[1]][p[0]]='H';break}}}
 for(let k=0;k<Math.ceil(rooms.length*.8);k++)put('V',sh[k%sh.length]);
 const hall=[];for(let r=1;r<H-1;r++)for(let c=1;c<W-1;c++)if(g[r][c]=='.'&&!rooms.some(o=>c>=o.c0&&c<=o.c1&&r>=o.r0&&r<=o.r1))hall.push([c,r]);
 for(let k=0;k<Math.min(3,hall.length>>3);k++){const p=hall[ri(0,hall.length-1)];if(g[p[1]][p[0]]=='.')g[p[1]][p[0]]='V'}
 let dr=null;   // front door in the foyer's outside wall
 for(let r=sp0.r0;r<=sp0.r1&&!dr;r++)if(sp0.c0==1&&g[r][1]!='#')dr=[0,r,'L'];
 for(let c=sp0.c0;c<=sp0.c1&&!dr;c++)if(sp0.r1==H-2&&g[H-2][c]!='#')dr=[c,H-1,'B'];
 g[dr[1]][dr[0]]='D';
 const P=6,NW=W+2*P,NH=H+2*P,n=Array.from({length:NH},(_,r)=>Array.from({length:NW},(_,c)=>r==0||c==0||r==NH-1||c==NW-1?'%':','));   // yard + fence ring
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)n[r+P][c+P]=g[r][c];
 const door=[dr[0]+P,dr[1]+P],gate=dr[2]=='L'?[NW-1,ri(3,NH-4)]:[ri(3,NW-4),0];n[gate[1]][gate[0]]='X';
 for(let r=2;r<NH-2;r++)for(let c=2;c<NW-2;c++)if(n[r][c]==','&&Math.hypot(c-door[0],r-door[1])>4&&Math.hypot(c-gate[0],r-gate[1])>4&&[[1,0],[-1,0],[0,1],[0,-1]].every(([a,b])=>n[r+b][c+a]==',')&&rr()<.08)n[r][c]='T';
 const gc=[];for(let r=3;r<NH-3;r++)for(let c=3;c<NW-3;c++)if(n[r][c]==','&&Math.hypot(c-door[0],r-door[1])>8&&Math.hypot(c-gate[0],r-gate[1])>6&&[[1,0],[-1,0],[0,1],[0,-1]].every(([a,b])=>n[r+b][c+a]==','))gc.push([c,r]);
 if(gc.length){const gp=gc[ri(0,gc.length-1)];n[gp[1]][gp[0]]='G'}
 const sr=n.findIndex(r=>r.includes('S')),scl=n[sr].indexOf('S'),seen=new Set([scl+','+sr]),st=[[scl,sr]],bl=k=>k=='#'||k=='%'||k=='T';   // seal off unreachable cells
 while(st.length){const[x,y]=st.pop();for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+a)+','+(y+b);if(n[y+b]&&n[y+b][x+a]&&!bl(n[y+b][x+a])&&!seen.has(k)){seen.add(k);st.push([x+a,y+b])}}}
 for(let r=0;r<NH;r++)for(let c=0;c<NW;c++)if(!bl(n[r][c])&&!seen.has(c+','+r))n[r][c]='#';
 return{rows:n.map(r=>r.join('')),rooms:rooms.map(o=>({...o,c0:o.c0+P,c1:o.c1+P,r0:o.r0+P,r1:o.r1+P}))};
}
