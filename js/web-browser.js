/* Playlist Audiomack : chargement uniquement après action sur le bouton musique. */
class WebBrowserManager {
 constructor(){
  this.items=[
   {name:'Amour Amour',url:'https://audiomack.com/embed/emmanuelpayet888/album/amour-amour'},
   {name:'No War (ENG)',url:'https://audiomack.com/embed/emmanuelpayet888/song/no-war-eng'},
   {name:"You’re Late",url:'https://audiomack.com/embed/emmanuelpayet888/album/youre-late'}
  ];
  this.panel=document.getElementById('webBrowserPanel');this.frame=document.getElementById('webBrowserFrame');
  this.autoMinimize = localStorage.getItem('patrix_music_auto_minimize') !== 'false';
  const label = document.createElement('label');label.className='music-auto-minimize';
  const checkbox = document.createElement('input');checkbox.type='checkbox';checkbox.checked=this.autoMinimize;
  label.append(checkbox,document.createTextNode(' Réduire après interaction avec le lecteur (3 s)'));
  this.panel.querySelector('.web-browser-header').after(label);
  checkbox.onchange=()=>{this.autoMinimize=checkbox.checked;localStorage.setItem('patrix_music_auto_minimize',String(this.autoMinimize));if(!this.autoMinimize)clearTimeout(this.minimizeTimer);};
  // L'iframe est sur un autre domaine : son contenu et l'état audio restent privés.
  // Le passage du focus dans le lecteur est le seul déclencheur, pas son chargement.
  window.addEventListener('blur',()=>{
   setTimeout(()=>{
    if(this.autoMinimize&&this.armed&&this.panel.classList.contains('show')&&document.activeElement===this.frame){
     this.armed=false;clearTimeout(this.minimizeTimer);
     this.minimizeTimer=setTimeout(()=>{if(this.autoMinimize)this.panel.classList.remove('show');},3000);
    }
   },0);
  });
  this.frame.allow='autoplay; encrypted-media';this.index=Number(localStorage.getItem('patrix_playlist_index'))||0;
  if(!this.items[this.index])this.index=0;
  const select=document.createElement('select');select.id='playlistChoice';select.setAttribute('aria-label','Playlist audio');
  this.items.forEach((item,i)=>{const option=document.createElement('option');option.value=i;option.textContent=item.name;select.append(option);});
  document.getElementById('webBrowserUrl').replaceWith(select);this.select=select;select.value=this.index;
  select.onchange=()=>this.load(Number(select.value));

  document.getElementById('webBackBtn').onclick=()=>this.load((this.index+this.items.length-1)%this.items.length);
  document.getElementById('webForwardBtn').onclick=()=>this.load((this.index+1)%this.items.length);
  document.getElementById('webRefreshBtn').onclick=()=>this.load(this.index);
  document.getElementById('webBrowserClose').onclick=()=>{clearTimeout(this.minimizeTimer);this.panel.classList.remove('show');this.frame.removeAttribute('src');};
  document.getElementById('webBrowserMinimize').onclick=()=>{clearTimeout(this.minimizeTimer);this.panel.classList.remove('show');};
  this.panel.querySelector('.privacy-text').textContent='Musique via Audiomack · Internet requis. − masque le lecteur ; 🔇 arrête la musique.';
 }
 load(index){clearTimeout(this.minimizeTimer);this.armed=true;this.index=index;this.select.value=index;localStorage.setItem('patrix_playlist_index',String(index));this.frame.src=this.items[index].url;}
 toggle(){clearTimeout(this.minimizeTimer);this.armed=true;const open=this.panel.classList.toggle('show');if(open&&!this.frame.getAttribute('src'))this.load(this.index);}
}


