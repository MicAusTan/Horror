// ---------- audio (all procedural) ----------
let ac,mg,dg,rum,nb,lastEv=0,px=0,pz=0,stepT=0,mstepT=0,heartT=0,brT=0,ambT=8,pst='',pdown=0;
function applyVol(){if(ac){mg.gain.value=.8*PS.mvol;dg.gain.value=.05*PS.avol}}
function initAudio(){if(ac){ac.resume();return}ac=new AudioContext();mg=ac.createGain();mg.gain.value=.8;mg.connect(ac.destination);
 nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1;
 const lp=ac.createBiquadFilter();lp.frequency.value=180;dg=ac.createGain();dg.gain.value=.05*PS.avol;lp.connect(dg);dg.connect(mg);
 for(const f of[55,55.7,82.4]){const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(lp);o.start()}
 const lf=ac.createOscillator(),lg=ac.createGain();lf.frequency.value=.07;lg.gain.value=90;lf.connect(lg);lg.connect(lp.frequency);lf.start();
 rum=ac.createGain();rum.gain.value=0;const ro=ac.createOscillator();ro.type='sawtooth';ro.frequency.value=38;const rl=ac.createBiquadFilter();rl.frequency.value=90;ro.connect(rl);rl.connect(rum);rum.connect(mg);ro.start();applyVol()}
addEventListener('pointerdown',initAudio);
function sfx(f,len,vol,x,z,type){if(!ac)return;const s=ac.createBufferSource();s.buffer=nb;const fi=ac.createBiquadFilter();fi.type=type||'lowpass';fi.frequency.value=f;const g=ac.createGain(),t=ac.currentTime;
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);s.connect(fi);fi.connect(g);
 if(x!=null&&ac.createPanner().positionX){const p=ac.createPanner();p.panningModel='HRTF';p.refDistance=2;p.rolloffFactor=1.5;p.positionX.value=x;p.positionY.value=1.5;p.positionZ.value=z;g.connect(p);p.connect(mg)}else g.connect(mg);s.start();s.stop(t+len)}
function scream(v){if(!ac)return;if(v==1)sfx(60,1.8,1);if(v==2)sfx(300,.5,1);if(v==3)sfx(500,.5,1,null,null,'bandpass');const t=ac.currentTime,g=ac.createGain();g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+1.2);g.connect(mg);
 for(const f of[620,880,1330]){const o=ac.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.6,t+.4);o.connect(g);o.start(t);o.stop(t+1.2)}sfx(3000,1,.8,null,null,'bandpass')}
function audio(dt,md,mst,gone,down){if(!ac||!ac.listener.positionX)return;const l=ac.listener;
 l.positionX.value=L.x;l.positionY.value=1.6;l.positionZ.value=L.z;l.forwardX.value=-Math.sin(L.ry);l.forwardY.value=0;l.forwardZ.value=-Math.cos(L.ry);l.upX.value=0;l.upY.value=1;l.upZ.value=0;
 mg.gain.value=.8*PS.mvol;rum.gain.value=gone?0:Math.max(0,1-md/16)*.3*PS.avol;
 const mv=Math.hypot(L.x-px,L.z-pz)>.02;px=L.x;pz=L.z;
 if(mv&&!L.hid&&(stepT-=dt)<=0){stepT=L.spr?.3:.5;sfx(450,.08,.12)}
 if(!gone&&mst!='stare'&&mst!='loom'&&(mstepT-=dt)<=0){mstepT=mst=='chase'?.3:.8;sfx(260,.12,.7,S.m[0],S.m[1])}
 if(!gone&&md<14&&(heartT-=dt)<=0){heartT=Math.max(.4,md/18);sfx(70,.2,.7);setTimeout(()=>sfx(70,.15,.45),140)}
 if((mst=='stare'||mst=='loom')&&(L.brt=(L.brt||0)-dt)<=0){L.brt=1.6;sfx(500,1.1,.25,S.m[0],S.m[1],'bandpass')}
 if((mst=='stare'||mst=='loom')&&(brT-=dt)<=0){brT=1.7;sfx(500,.9,.3,S.m[0],S.m[1],'bandpass')}
 if(mst=='chase'&&pst!='chase')sfx(2500,1,.35,null,null,'bandpass');pst=mst;
 if(down&&!pdown)sfx(80,1.4,1);pdown=down;
 if((ambT-=dt)<=0){ambT=10+rnd()*20;sfx(rnd()<.5?900:1800,1.6,.12,L.x+rnd()*12-6,L.z+rnd()*12-6,'bandpass')}}

