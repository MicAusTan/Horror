// Spatial chunking: static world pieces are grouped into 20 m chunks per floor, and chunks that are far away
// (or on a floor you cannot see) are switched off each frame - the fog hides them anyway.
const CHUNK=20;
function chunkFloor(fg,f,Group){const out=[],map={};
 for(const o of fg.children.slice()){
  if(o.isLight)continue;
  const gm=o.geometry;if(gm){if(gm.computeBoundingBox&&!gm.boundingBox)gm.computeBoundingBox();const b=gm.boundingBox;
   if(b){const s=o.scale||{x:1,y:1,z:1};if(Math.max((b.max.x-b.min.x)*Math.abs(s.x),(b.max.y-b.min.y)*Math.abs(s.y),(b.max.z-b.min.z)*Math.abs(s.z))>9)continue}}   // big pieces (floors, slabs, sky) stay always-on
  const kx=(o.position.x/CHUNK)|0,kz=(o.position.z/CHUNK)|0,k=kx+','+kz;let c=map[k];
  if(!c){c={g:new Group(),cx:kx*CHUNK+CHUNK/2,cz:kz*CHUNK+CHUNK/2,f};map[k]=c;out.push(c);fg.add(c.g)}
  c.g.add(o)}
 return out}
function cullChunks(chunks,cx,cz,cf,R){for(const c of chunks){const d=Math.hypot(c.cx-cx,c.cz-cz);c.g.visible=c.f==cf?d<R+CHUNK*.75:(Math.abs(c.f-cf)<=1?d<22+CHUNK*.75:false)}}
