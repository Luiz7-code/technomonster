// Original procedural score for TechnoMonster, no recordings or external samples.
// Run from any directory: node scripts/generate-intro-audio.cjs
const fs=require('fs'),path=require('path');
const rate=44100,duration=15.5,count=Math.round(rate*duration),tau=Math.PI*2;
const left=new Float64Array(count),right=new Float64Array(count);
const hz=midi=>440*2**((midi-69)/12);
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
function voice(start,length,midi,gain,pan,kind='pad') {
  const f=hz(midi),begin=Math.floor(start*rate),end=Math.min(count,Math.floor((start+length)*rate));
  for(let i=begin;i<end;i++) {
    const t=(i-begin)/rate,tail=(end-i)/rate;
    let sample;
    if(kind==='bell') {
      const env=smooth(t/.012)*Math.exp(-t*1.6)*smooth(tail/.45);
      sample=env*(Math.sin(tau*f*t)+.25*Math.sin(tau*f*2.003*t)*Math.exp(-t*2)+.08*Math.sin(tau*f*3.98*t)*Math.exp(-t*4));
    } else {
      const env=smooth(t/1.2)*smooth(tail/1.7);
      sample=env*(.65*Math.sin(tau*f*t+.008*Math.sin(tau*.2*t))+.22*Math.sin(tau*f*1.002*t)+.1*Math.sin(tau*f*2*t));
    }
    left[i]+=sample*gain*Math.sqrt((1-pan)/2);right[i]+=sample*gain*Math.sqrt((1+pan)/2);
  }
}
// D minor with an unresolved ninth, opening into a warm F major/add9 voicing.
for(const [m,g,p] of [[38,.16,0],[50,.07,-.3],[57,.065,.3],[60,.05,-.5],[64,.025,.5]])voice(0,7.9,m,g,p);
for(const [m,g,p] of [[34,.12,0],[53,.08,-.4],[57,.07,.35],[60,.05,.6]])voice(5.5,5.6,m,g,p);
for(const [m,g,p] of [[41,.13,0],[53,.07,-.5],[57,.07,.4],[60,.055,-.2],[67,.045,.65]])voice(9.2,6.3,m,g,p);
// Small melodic questions, then the motif resolves as the seed sprouts.
for(const [t,m,g,p] of [[1.4,69,.07,-.35],[3.1,64,.065,.3],[5.2,62,.075,-.2],[6.7,60,.065,.4],[9.8,65,.09,-.25],[10.55,69,.085,.25],[11.3,72,.08,-.1],[12.15,79,.065,.4],[13.1,77,.07,0]])voice(t,2.3,m,g,p,'bell');
// Filtered wind/water, kept below the music. Deterministic noise, not a sample.
let seed=97421,low=0,slow=0;
for(let i=0;i<count;i++) {
  const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const noise=seed/2147483648-1;low+=.018*(noise-low);slow+=.002*(noise-slow);
  const env=smooth(t/.8)*smooth((10.8-t)/2)*(.055+.025*Math.sin(t*.8)**2);
  const air=(low-slow)*env;
  left[i]+=air;right[i]+=air*.8;
  if(t>4.2&&t<8.7){const phase=(t-4.2)%.9;const pulse=Math.sin(tau*(48*phase+1.8*(1-Math.exp(-phase*12))))*Math.exp(-phase*13)*smooth(phase/.008)*.035;left[i]+=pulse;right[i]+=pulse;}
}
// Sparse stereo echoes add depth without burying the melody.
for(const [delay,gain] of [[.173,.13],[.311,.1],[.487,.07]]) {
  const n=Math.round(delay*rate);
  for(let i=count-1;i>=n;i--){left[i]+=right[i-n]*gain;right[i]+=left[i-n]*gain;}
}
let peak=0;for(let i=0;i<count;i++){const fade=smooth(i/rate/.06)*smooth((duration-i/rate)/1.05);left[i]*=fade;right[i]*=fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
const normalization=.75/Math.max(peak,.001),wav=Buffer.alloc(44+count*4);
wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*4,40);
let energy=0;for(let i=0;i<count;i++){const l=left[i]*normalization,r=right[i]*normalization;wav.writeInt16LE(Math.round(l*32767),44+i*4);wav.writeInt16LE(Math.round(r*32767),46+i*4);energy+=(l*l+r*r)/2;}
const target=path.join(__dirname,'../audio/technomonster-primeiro-broto.wav');fs.writeFileSync(target,wav);
console.log(JSON.stringify({file:target,duration,peak:.75,rms:Math.sqrt(energy/count),bytes:wav.length}));
