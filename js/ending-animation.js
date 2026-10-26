/* Fin en pixel art : forêt d'automne, voyage et phare. Résolution fixe, 24 images/s. */
class EndingAnimation {
 constructor(){this.animationFrame=null;this.elapsed=0;this.last=0;this.stopped=false;}
 text(key,fallback){const value=window.i18n?.t(key);return value&&value!==key?value:fallback;}
 start(){
  window.activePixelEnding?.stop();window.activePixelEnding=this;
  document.getElementById('endingModal')?.remove();
  this.wasPaused=typeof game!=='undefined'?game?.isPaused:false;
  if(typeof game!=='undefined'&&game)game.isPaused=true;
  this.modal=document.createElement('div');this.modal.id='endingModal';this.modal.className='pixel-ending';this.modal.setAttribute('role','dialog');this.modal.setAttribute('aria-modal','true');this.modal.setAttribute('aria-label',this.text('endingAnimation.maxLevelReached','Niveau 50 atteint !'));
  this.modal.innerHTML='<div class="pixel-ending-shell"><div class="pixel-ending-top"><span>PATRI-X / 50</span><button id="endingSkip"></button></div><canvas id="endingCanvas" width="480" height="270" aria-label="Un chat traverse une forêt automnale et rejoint un phare à l’aube"></canvas><div class="pixel-ending-caption" aria-live="polite"></div><div class="pixel-ending-progress"><i></i></div><div class="pixel-ending-actions" hidden></div></div>';
  document.body.append(this.modal);this.canvas=this.modal.querySelector('canvas');this.ctx=this.canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;
  this.modal.querySelector('#endingSkip').textContent=this.text('endingAnimation.skip','Passer');
  this.modal.querySelector('#endingSkip').onclick=()=>this.finish();
  this.onKey=e=>{
   e.stopImmediatePropagation();
   if(e.key==='Escape'){e.preventDefault();this.stop();}
   if(e.key==='Tab'){
    const buttons=[...this.modal.querySelectorAll('button,a')].filter(el=>el.getClientRects().length);
    const index=buttons.indexOf(document.activeElement);
    if(e.shiftKey&&index<=0){e.preventDefault();buttons.at(-1)?.focus();}
    else if(!e.shiftKey&&index===buttons.length-1){e.preventDefault();buttons[0]?.focus();}
   }
  };document.addEventListener('keydown',this.onKey,true);
  this.caption=this.modal.querySelector('.pixel-ending-caption');this.bar=this.modal.querySelector('.pixel-ending-progress i');
  this.started=performance.now();this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.previousFocus=document.activeElement;this.modal.querySelector('button').focus();
  this.loop(this.started);
 }
 rect(x,y,w,h,color){this.ctx.fillStyle=color;this.ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
 line(x,y,x2,y2,color,width=1){const steps=Math.max(Math.abs(x2-x),Math.abs(y2-y));for(let i=0;i<=steps;i++){const f=steps?i/steps:0;this.rect(x+(x2-x)*f,y+(y2-y)*f,width,width,color);}}
 tree(x,ground,scale=1,light=false){
  const c=light?'#72534c':'#302c3e',hi=light?'#a16a4c':'#51404b';
  this.rect(x,ground-91*scale,5*scale,91*scale,c);this.rect(x+4*scale,ground-70*scale,scale,70*scale,hi);
  const branches=[[-27,-100,-2,-59],[4,-48,31,-82],[-20,-62,0,-33],[2,-74,24,-112],[-4,-84,-16,-116],[14,-96,39,-110]];
  for(const [a,b,d,e]of branches)this.line(x+a*scale,ground+b*scale,x+d*scale,ground+e*scale,c,Math.max(1,2*scale));
  this.line(x-22*scale,ground-92*scale,x-36*scale,ground-95*scale,c);this.line(x+22*scale,ground-105*scale,x+25*scale,ground-126*scale,c);
 }
 leaf(x,y,color,size=2){this.rect(x,y,size*2,size,color);this.rect(x+size,y-size,size,size*3,color);this.rect(x+size,y,size,1,'#f9d17b');}
 cat(x,y,walk,t){
  const step=walk?Math.floor(t*7)%2:0;
  this.rect(x-5,y+18,34,3,'#292634');
  this.rect(x,y,24,17,'#202334');this.rect(x+13,y-8,15,16,'#202334');
  this.rect(x+13,y-12,4,7,'#202334');this.rect(x+24,y-12,4,7,'#202334');
  this.rect(x+15,y-9,2,3,'#b17978');this.rect(x+25,y-9,2,3,'#b17978');
  this.rect(x+18,y-3,3,2,'#ffda7b');this.rect(x+25,y-3,2,2,'#ffda7b');
  this.rect(x+15,y+5,12,3,'#da7550');this.rect(x+12,y+8,5,4,'#f5ae67');
  this.rect(x+3+step*3,y+15,4,6,'#202334');this.rect(x+18-step*3,y+15,4,6,'#202334');
  this.line(x+1,y+9,x-8,y+2,'#202334',4);this.line(x-8,y+2,x-8,y-5,'#202334',3);
 }
 draw(t){
  const dawn=Math.min(1,Math.max(0,(t-19)/10)),scene=t<9?0:t<19?1:t<28?2:3;
  const sky=dawn>.5?['#b67873','#d49679','#ecc295','#f8d9a0']:['#24253e','#3b344b','#694958','#ac6e64'];
  sky.forEach((color,i)=>this.rect(0,i*53,480,54,color));
  // Le ciel et les montagnes sont dessinés en marches de pixels.
  for(let i=0;i<32;i++){const x=(i*79+17)%480,y=(i*37+9)%100;if(dawn<.7)this.rect(x,y,i%5===0?2:1,1,'#e8c6a2');}
  const sunY=scene<2?53:87-dawn*35;this.rect(354,sunY,22,28,'#f9dba2');this.rect(349,sunY+5,32,18,'#f9dba2');
  for(let x=0;x<480;x+=4){const h=25+Math.sin(x*.025)*12+Math.sin(x*.061)*8;this.rect(x,145-h,4,65+h,dawn>.5?'#b1817c':'#584658');}
  for(let x=0;x<480;x+=4){const h=12+Math.sin(x*.033+2)*16;this.rect(x,166-h,4,65+h,dawn>.5?'#84646b':'#3e354b');}
  const offset=scene===1?(t-9)*11:0;
  for(let i=0;i<8;i++)this.tree(((i*83-offset*.35+600)%640)-60,191,.65,true);
  this.rect(0,198,480,72,'#3a303b');this.rect(0,199,480,3,'#ce8754');
  // Sentier de pierres ambrées vers le phare.
  for(let y=205;y<270;y+=5){const spread=(y-195)*1.6;this.rect(235-spread,y,spread*2,5,y%10?'#bd855b':'#a46e50');}
  for(let i=0;i<58;i++){const x=(i*43+13)%480,y=205+(i*19)%65;this.rect(x,y,2+(i%3),1,i%2?'#e6b879':'#684a44');}
  this.tree(33-offset%80,222,1.5);this.tree(440-offset%55,232,1.75);this.tree(108-offset%70,206,.95);
  // Phare en pierre et faisceau doré à l'arrivée.
  if(scene>=2){
   const x=330;this.rect(x,123,27,78,'#dbc2a5');this.rect(x+20,123,7,78,'#a78479');
   this.rect(x-4,119,35,5,'#48364b');this.rect(x+3,107,21,12,'#ffd58a');this.rect(x+8,100,11,7,'#48364b');
   this.rect(x+10,178,8,23,'#493345');this.rect(x+9,137,6,10,'#57445b');this.rect(x+9,157,6,8,'#57445b');
   for(let i=0;i<70;i+=3)this.rect(x+27+i,109-Math.floor(i/6),3,7+Math.floor(i/3),i%2?'#f6cb8060':'#f6cb8030');
  }
  const x=scene===0?130+Math.min(t,7)*8:scene===1?190+Math.sin(t)*3:Math.min(298,200+(t-19)*11);
  this.cat(x,194,scene<3,t);
  // Feuilles bornées, aucune allocation de particules pendant l'animation.
  for(let i=0;i<24;i++){const speed=8+i%5;const xx=(i*67+t*speed)%520-20,yy=(i*29+t*(6+i%4))%230;this.leaf(xx+Math.sin(t+i)*6,yy,['#d27642','#efab57','#ac5350','#f3cc83'][i%4],i%3?1:2);}
  if(scene===3){
   this.rect(104,36,272,52,'#292638');this.rect(108,40,264,44,'#3b3042');
   this.ctx.fillStyle='#ffdda0';this.ctx.font='bold 17px monospace';this.ctx.textAlign='center';this.ctx.fillText('PATRI-X',240,59);
   this.ctx.font='10px monospace';this.ctx.fillText(this.text('endingAnimation.maxLevelReached','Niveau 50 atteint !'),240,77);
  }
  const captions=[['endingAnimation.pixelForest','Chaque pas compte.'],['endingAnimation.pixelJourney','Garde ta lumière.'],['endingAnimation.pixelDawn','Un nouveau jour.'],['endingAnimation.pixelFinal','De grands rêves.']];
  if(this.lastScene!==scene){this.lastScene=scene;this.caption.textContent=this.text(...captions[scene]);}
 }
 loop(now){
  if(this.stopped)return;
  if(now-this.last>=1000/24){this.last=now;this.elapsed=this.reduced?32:(now-this.started)/1000;this.draw(this.elapsed);this.bar.style.width=Math.min(100,this.elapsed/32*100)+'%';}
  if(this.elapsed>=32){this.finish();return;}
  this.animationFrame=requestAnimationFrame(time=>this.loop(time));
 }
 finish(){
  cancelAnimationFrame(this.animationFrame);this.draw(32);this.bar.style.width='100%';
  this.modal.querySelector('#endingSkip').textContent=this.text('game.close','Fermer');this.modal.querySelector('#endingSkip').onclick=()=>this.stop();
  const actions=this.modal.querySelector('.pixel-ending-actions');actions.hidden=false;actions.replaceChildren();
  const replay=document.createElement('button');replay.textContent=this.text('game.restart','Recommencer');replay.onclick=()=>{this.stop();if(typeof game!=='undefined'&&game)game.start();};
  const support=document.createElement('a');support.textContent=this.text('footer.support',"Soutenir l’artiste");support.href='https://www.redbubble.com/fr/people/H777plx';support.target='_blank';support.rel='noopener noreferrer';actions.append(replay,support);
 }
 stop(){if(window.activePixelEnding===this)window.activePixelEnding=null;this.stopped=true;cancelAnimationFrame(this.animationFrame);document.removeEventListener('keydown',this.onKey,true);this.modal?.remove();if(typeof game!=='undefined'&&game){game.isLevelingUp=false;game.isPaused=!!this.wasPaused;}this.previousFocus?.focus();}
}
window.EndingAnimation=EndingAnimation;

