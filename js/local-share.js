document.addEventListener('DOMContentLoaded',()=>{
 const button=document.createElement('button');button.type='button';button.id='localShare';const shareIcon=document.createElement('img');shareIcon.src='assets/images/share-heart-brick.svg';shareIcon.alt='';shareIcon.width=28;shareIcon.height=28;button.append(shareIcon);button.title='Partager une brique';button.setAttribute('aria-label','Partager une brique');document.getElementById('trophyBtn').after(button);
 const dialog=document.createElement('dialog');dialog.id='shareDialog';dialog.innerHTML='<form method="dialog"><button aria-label="Fermer">✕</button></form><h2>Une brique de bonheur ♡</h2><canvas width="960" height="960"></canvas><label>Ton message<textarea maxlength="160">Une brique à la fois, construisons de grands rêves ! (◕‿◕) ♡</textarea></label><div><button id="randomBrick">🎲 Autre brique</button> <button id="sendBrick">↗ Partager</button> <button id="saveBrick">↓ Image PNG</button></div><p role="status"></p>';document.body.append(dialog);
 const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d'),input=dialog.querySelector('textarea'),status=dialog.querySelector('[role=status]');
 const shapes=Object.values(BLOCKS).filter(block=>block.shape);
 const translations={
  fr: ["Une brique de bonheur","Partager une brique","Fermer","Ton message","Une brique à la fois, construisons de grands rêves ! ♡","Autre brique","Partager","Image PNG","De petites briques, de grands rêves","Image téléchargée.","Impossible de créer le PNG.","Partage terminé.","Partage direct indisponible : joins le PNG téléchargé à ton message.","Partage annulé.","Utilise le bouton Image PNG."],
  en: ["A brick of happiness","Share a brick","Close","Your message","One brick at a time, let’s build big dreams! ♡","Another brick","Share","PNG image","Small bricks, big dreams","Image downloaded.","Could not create the PNG.","Shared.","Direct sharing is unavailable. Attach the downloaded PNG to your message.","Sharing cancelled.","Use the PNG image button."],
  es: ["Un ladrillo de felicidad","Compartir un ladrillo","Cerrar","Tu mensaje","¡Construyamos grandes sueños, ladrillo a ladrillo! ♡","Otro ladrillo","Compartir","Imagen PNG","Pequeños ladrillos, grandes sueños","Imagen descargada.","No se pudo crear el PNG.","Imagen compartida.","No se puede compartir directamente. Adjunta el PNG descargado a tu mensaje.","Se canceló el envío.","Usa el botón Imagen PNG."],
  pt: ["Um tijolo de felicidade","Partilhar um tijolo","Fechar","A tua mensagem","Vamos construir grandes sonhos, um tijolo de cada vez! ♡","Outro tijolo","Partilhar","Imagem PNG","Pequenos tijolos, grandes sonhos","Imagem descarregada.","Não foi possível criar o PNG.","Imagem partilhada.","Não é possível partilhar diretamente. Anexa o PNG descarregado à tua mensagem.","Partilha cancelada.","Usa o botão Imagem PNG."],
  ar: ["لبنة من السعادة","شارك لبنة","إغلاق","رسالتك","لنبنِ أحلامًا كبيرة، لبنةً تلو الأخرى! ♡","لبنة أخرى","مشاركة","صورة PNG","لبنات صغيرة وأحلام كبيرة","تم تنزيل الصورة.","تعذّر إنشاء صورة PNG.","تمت المشاركة.","المشاركة المباشرة غير متاحة. أرفق الصورة التي نزّلتها برسالتك.","أُلغيت المشاركة.","استخدم زر صورة PNG."],
  ja: ["幸せのブロック","ブロックを共有","閉じる","メッセージ","一つずつブロックを積んで、大きな夢を築こう！ ♡","別のブロック","共有","PNG画像","小さなブロック、大きな夢","画像をダウンロードしました。","PNG画像を作成できませんでした。","共有しました。","直接共有できません。ダウンロードしたPNG画像をメッセージに添付してください。","共有をキャンセルしました。","「PNG画像」ボタンを使ってください。"],
  zh: ["一块幸福积木","分享积木","关闭","你的留言","一块一块地搭起大梦想！♡","换一块积木","分享","PNG 图片","小积木，大梦想","图片已下载。","无法生成 PNG 图片。","已分享。","无法直接分享，请在消息中附上下载的 PNG 图片。","已取消分享。","请使用「PNG 图片」按钮。"],
  uk: ["Цеглинка щастя","Поділитися цеглинкою","Закрити","Твоє повідомлення","Будуймо великі мрії, цеглинка за цеглинкою! ♡","Інша цеглинка","Поділитися","Зображення PNG","Малі цеглинки, великі мрії","Зображення завантажено.","Не вдалося створити PNG.","Зображення надіслано.","Не вдалося поділитися напряму. Прикріпи завантажений PNG до свого повідомлення.","Надсилання скасовано.","Скористайся кнопкою «Зображення PNG»."],
  ln: ["Libanga ya esengo","Kabola libanga","Kanga","Nsango na yo","Tótonga bandoto minene, libanga moko na nsima ya mosusu! ♡","Libanga mosusu","Kabola","Elilingi PNG","Mabanga mike, bandoto minene","Ozwaki elilingi.","Tokoki kosala PNG te.","Elilingi ekabolami.","Okoki kokabola mbala moko te. Bakisá PNG oyo ozwi na nsango na yo.","Bokaboli esili te.","Salelá butɔ ya Elilingi PNG."]
 };
 let copy=translations.fr, defaultMessage;
 function localize(){
  const lang=window.i18n?.getLanguage() || 'fr';
  copy=translations[lang] || translations.fr;
  dialog.lang=lang; dialog.dir=lang==='ar'?'rtl':'ltr';
  const [title,open,close,messageLabel,message,another,share,png]=copy;
  dialog.querySelector('h2').textContent=title;
  button.title=open; button.setAttribute('aria-label',open);
  dialog.querySelector('form button').setAttribute('aria-label',close);
  const label=input.parentElement;
  label.firstChild.nodeValue=messageLabel;
  if(defaultMessage===undefined || input.value===defaultMessage)input.value=message;
  defaultMessage=message;
  dialog.querySelector('#randomBrick').textContent='🎲 '+another;
  dialog.querySelector('#sendBrick').textContent='↗ '+share;
  dialog.querySelector('#saveBrick').textContent='↓ '+png;
  if(dialog.open)draw();
 }
 let shapeIndex=Math.max(0,shapes.findIndex(block=>block.type==='cross')),pausedHere=false;
 function draw(){
  const rect=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  rect('#fffaf0',0,0,960,960);
  ctx.direction=dialog.dir;ctx.textAlign='center';ctx.fillStyle='#4a5568';ctx.font='bold 72px monospace';ctx.fillText('PATRI-X',480,134);
  ctx.font='28px sans-serif';ctx.fillText(copy[8],480,184,750);
  const block=shapes[shapeIndex];
  const rows=block.shape.length,cols=Math.max(...block.shape.map(row=>row.length));
  const size=6*Math.floor(Math.min(108,360/Math.max(rows,cols))/6),unit=size/6;
  block.shape.forEach((row,y)=>row.forEach((cell,x)=>{
   if(!cell)return;
   const px=480-cols*size/2+x*size,py=420-rows*size/2+y*size;
   rect('#4a5568',px,py,size,size);
   rect('#ec9eb1',px+unit,py+unit,4*unit,4*unit);
   rect('#ffc0cb',px+unit,py+unit,4*unit,3*unit);
   rect('#ffdbe4',px+unit,py+unit,3*unit,unit);
  }));
  ctx.fillStyle='#4a5568';ctx.font='32px sans-serif';
  let line='';const lines=[];
  for(const char of input.value){if(ctx.measureText(line+char).width>750||char==='\n'){lines.push(line);line='';}if(char!=='\n')line+=char;}
  lines.push(line);
  const visible=lines.slice(0,5);
  if(lines.slice(5).some(text=>text.trim()))visible[4]+='…';
  visible.forEach((text,i)=>ctx.fillText(text,480,676+i*40,750));
  ctx.fillStyle='#85475f';ctx.font='22px sans-serif';ctx.fillText(copy[0],480,911,750);
 }
 function nextBrick(){shapeIndex=(shapeIndex+1)%shapes.length;draw();}
 button.onclick=()=>{pausedHere=!!(game&&game.isRunning&&!game.isPaused);if(pausedHere)game.togglePause();status.textContent='';localize();draw();dialog.showModal();};dialog.addEventListener('close',()=>{if(pausedHere&&game?.isPaused)game.togglePause();pausedHere=false;});dialog.querySelector('#randomBrick').onclick=nextBrick;input.oninput=draw;
 localize();
 window.i18n?.addObserver(localize);
 const blob=()=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));
 async function download(){const url=URL.createObjectURL(await blob()),a=document.createElement('a');a.href=url;a.download='patrix-brique.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
 dialog.querySelector('#saveBrick').onclick=async()=>{try{await download();status.textContent=copy[9];}catch{status.textContent=copy[10];}};
 dialog.querySelector('#sendBrick').onclick=async()=>{try{const file=new File([await blob()],'patrix-brique.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({title:copy[0],text:input.value,files:[file]});status.textContent=copy[11];}else{await download();status.textContent=copy[12];}}catch(e){status.textContent=e.name==='AbortError'?copy[13]:copy[14];}};
});

