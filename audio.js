// ---------- audio (all procedural) ----------
let ac,mg,dg,wg,wt=0,rum,nb,mpg,mpf,musK=0,bt=0,bn=0,lastEv=0,px=0,pz=0,stepT=0,mstepT=0,heartT=0,brT=0,crT=0,ambT=8,pst='',pdown=0;
const MEL=[392,466,587,523,466,392,349,466];let mbT=[],mbN=0;
function tone(f,x,z){if(!ac||!f)return;const o=ac.createOscillator(),g=ac.createGain(),p=ac.createPanner(),t=ac.currentTime;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);p.refDistance=2;p.positionX.value=x;p.positionY.value=1;p.positionZ.value=z;o.connect(g);g.connect(p);p.connect(mg);o.start(t);o.stop(t+.7)}
const SC=[220,233.1,261.6,233.1,196,233.1,261.6,293.7];
function note(f,len,vol,type){if(!ac)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type=type||'sawtooth';o.frequency.value=f;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g);g.connect(mg);o.start(t);o.stop(t+len)}
function startGenHum(x,z){if(!ac)return;const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain(),p=ac.createPanner();o.type='sawtooth';o.frequency.value=48;f.frequency.value=220;g.gain.value=.5;p.refDistance=3;p.positionX.value=x;p.positionY.value=1;p.positionZ.value=z;o.connect(f);f.connect(g);g.connect(p);p.connect(mg);o.start()}
function applyVol(){if(ac){mg.gain.value=.8*PS.mvol;dg.gain.value=.05*PS.avol}}
function initAudio(){if(ac){ac.resume();return}ac=new AudioContext();mg=ac.createGain();mg.gain.value=.8;mg.connect(ac.destination);
 nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1;
 const lp=ac.createBiquadFilter();lp.frequency.value=180;dg=ac.createGain();dg.gain.value=.05*PS.avol;lp.connect(dg);dg.connect(mg);
 for(const f of[55,55.7,82.4]){const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(lp);o.start()}
 const lf=ac.createOscillator(),lg=ac.createGain();lf.frequency.value=.07;lg.gain.value=90;lf.connect(lg);lg.connect(lp.frequency);lf.start();
 rum=ac.createGain();rum.gain.value=0;const ro=ac.createOscillator();ro.type='sawtooth';ro.frequency.value=38;const rl=ac.createBiquadFilter();rl.frequency.value=90;ro.connect(rl);rl.connect(rum);rum.connect(mg);ro.start();const ws=ac.createBufferSource();ws.buffer=nb;ws.loop=true;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=500;wf.Q.value=.6;wg=ac.createGain();wg.gain.value=0;ws.connect(wf);wf.connect(wg);wg.connect(mg);ws.start();mpg=ac.createGain();mpg.gain.value=0;mpf=ac.createBiquadFilter();mpf.frequency.value=300;for(const fr of[110,116.54]){const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.connect(mpf);o.start()}mpf.connect(mpg);mpg.connect(mg);applyVol()}   // chase-music pad
addEventListener('pointerdown',initAudio);
function sfx(f,len,vol,x,z,type){if(!ac)return;const s=ac.createBufferSource();s.buffer=nb;const fi=ac.createBiquadFilter();fi.type=type||'lowpass';fi.frequency.value=f;const g=ac.createGain(),t=ac.currentTime;
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);s.connect(fi);fi.connect(g);
 if(x!=null&&ac.createPanner().positionX){const p=ac.createPanner();p.panningModel='HRTF';p.refDistance=2;p.rolloffFactor=1.5;p.positionX.value=x;p.positionY.value=1.5;p.positionZ.value=z;g.connect(p);p.connect(mg)}else g.connect(mg);s.start();s.stop(t+len)}
function scream(v){if(!ac)return;if(v==1)sfx(60,1.8,1);if(v==2)sfx(300,.5,1);if(v==3)sfx(500,.5,1,null,null,'bandpass');const t=ac.currentTime,g=ac.createGain();g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+1.2);g.connect(mg);
 for(const f of[620,880,1330]){const o=ac.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.6,t+.4);o.connect(g);o.start(t);o.stop(t+1.2)}sfx(3000,1,.8,null,null,'bandpass')}
function audio(dt,md,mst,gone,down){if(!ac||!ac.listener.positionX)return;const l=ac.listener;
 l.positionX.value=L.x;l.positionY.value=1.6;l.positionZ.value=L.z;l.forwardX.value=-Math.sin(L.ry);l.forwardY.value=0;l.forwardZ.value=-Math.cos(L.ry);l.upX.value=0;l.upY.value=1;l.upZ.value=0;
 mg.gain.value=.8*PS.mvol;rum.gain.value=gone?0:Math.max(0,1-md/16)*.3*PS.avol;
 wt+=dt;const rt0=roomAt(L.x/C|0,L.z/C|0),out=rt0=='yard';wg.gain.value+=((out?.22:.025)*(.75+.25*Math.sin(wt*.7))*PS.avol-wg.gain.value)*.05;if(out&&(crT-=dt)<=0){crT=.22+rnd()*.15;sfx(4300+rnd()*400,.04,.05*PS.avol,null,null,'bandpass')}
 // chase music: a pad that opens up, a pulse that speeds up, and a nervous riff, only while the monster is hunting AND close
 const mt=(mst=='chase'?1:(mst=='stare'||mst=='loom')?.55:0)*Math.min(1,THR*2.2)*(down||gone?0:1),mvl=PS.music==null?.6:PS.music;
 musK+=(mt-musK)*(mt>musK?.1:.02);if(mpg){mpg.gain.value=musK*.16*mvl;mpf.frequency.value=200+musK*1500}
 if(musK>.04&&(bt-=dt)<=0){bt=.64-.3*musK;bn++;sfx(70,.18,.8*musK*mvl);if(bn%2)sfx(2200,.05,.22*musK*mvl,null,null,'bandpass');if(musK>.5)note(SC[bn%SC.length],.16,.09*musK*mvl,'square');if(bn%8==0&&musK>.6)note(bn%16?486:466,.5,.12*mvl,'sawtooth')}
 if(S.mb)S.mb.forEach((on,i)=>{if(on==1&&(mbT[i]=(mbT[i]||0)-dt)<=0){if(boxes[i][3]=='b'){mbT[i]=.8;sfx(130,.5,.9,boxes[i][0],boxes[i][1]);setTimeout(()=>sfx(900,.15,.4,boxes[i][0],boxes[i][1],'bandpass'),90)}else{mbT[i]=.42;tone(MEL[(mbN=(mbN+1)%MEL.length)],boxes[i][0],boxes[i][1])}}});
 const mv=Math.hypot(L.x-px,L.z-pz)>.02;px=L.x;pz=L.z;
 const ons=STAIRS.some(s=>L.x>=s.x0&&L.x<=s.x1&&L.z>=s.z0&&L.z<=s.z1);
 if(mv&&!L.hid&&(stepT-=dt)<=0){stepT=ons?(L.spr?.26:.4):(L.spr?.3:.5);sfx(ons?150:out?220:(rt0=='kitchen'||rt0=='bath')?900:450,ons?.12:.09,ons?.28:rt0=='kitchen'?.25:.12);if(ons&&rnd()<.25)sfx(280+rnd()*200,.3,.12,null,null,'bandpass')}   // heavy, creaky stairs
 if(!gone&&mst!='stare'&&mst!='loom'&&(mstepT-=dt)<=0){mstepT=mst=='chase'?.3:.8;const onSt=((S.m[6]||0)%FH)>.15;sfx(onSt?150:260,onSt?.2:.12,.7,S.m[0],S.m[1])}
 if(!gone&&md<14&&(heartT-=dt)<=0){heartT=Math.max(.4,md/18);sfx(70,.2,.7);setTimeout(()=>sfx(70,.15,.45),140)}
 if((mst=='stare'||mst=='loom')&&(L.brt=(L.brt||0)-dt)<=0){L.brt=1.6;sfx(500,1.1,.25,S.m[0],S.m[1],'bandpass')}
 if((mst=='stare'||mst=='loom')&&(brT-=dt)<=0){brT=1.7;sfx(500,.9,.3,S.m[0],S.m[1],'bandpass')}
 if(mst=='chase'&&pst!='chase')sfx(2500,1,.35,null,null,'bandpass');pst=mst;
 if(down&&!pdown)sfx(80,1.4,1);pdown=down;
 if((ambT-=dt)<=0){ambT=10+rnd()*20;sfx(rnd()<.5?900:1800,1.6,.12,L.x+rnd()*12-6,L.z+rnd()*12-6,'bandpass')}}

