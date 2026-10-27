/* Plusieurs pièces indépendantes ; les commandes ciblent la sélection. */
(()=>{
 const proto=GameEngine.prototype;
 function pieceCount(engine){
  const landscape=window.innerWidth>window.innerHeight;
  if(!landscape)return 1;
  return Math.max(1,Math.min(Math.floor(engine.grid.cols/6),Math.floor(window.innerWidth/300)));
 }
 const baseReset=proto.reset,baseUpdate=proto.update,basePlace=proto.placePiece,baseExport=proto.exportState,baseImport=proto.importState;
 proto.reset=function(){
  this.activePieces=[];
  this.parallelCount=pieceCount(this);
  this.grid.getFallingPieces=()=>this.activePieces||[];
  baseReset.call(this);
 };
 proto.spawnPiece=function(){
  if(!this.activePieces)this.activePieces=[];
  const count=this.parallelCount||1;
  if(this.activePieces.length>=count){this.currentPiece=this.activePieces[0]||null;this.grid.selectedPiece=this.currentPiece;return;}
  do {
   const piece=this.nextPiece||createRandomPiece();this.nextPiece=createRandomPiece();
   const occupied=new Set(this.activePieces.map(p=>p.lane));
   let lane=0;while(occupied.has(lane))lane++;
   piece.lane=lane;piece.dropTimer=0;
   const start=Math.floor(lane*this.grid.cols/count),end=Math.floor((lane+1)*this.grid.cols/count);
   const preferred=Math.floor((start+end-piece.shape[0].length)/2);
   // Chercher une apparition libre à proximité de sa zone.
   let placed=false;
   for(let distance=0;distance<this.grid.cols&&!placed;distance++){
    for(const x of distance?[preferred-distance,preferred+distance]:[preferred]){
     piece.x=x;piece.y=0;
     if(this.grid.isValidMove(piece,x,0)){placed=true;break;}
    }
   }
   if(!placed){this.gameOver();return;}
   this.activePieces.push(piece);this.currentPiece=piece;
   this.grid.selectedPiece=piece;
   this.emit('spawn',{current:piece,next:this.nextPiece});
  }while(this.activePieces.length<count);
 };
 proto.placePiece=function(){
  const piece=this.currentPiece;
  if(!piece)return;
  this.activePieces=this.activePieces.filter(p=>p!==piece);
  basePlace.call(this);
 };
 proto.update=function(delta){
  if(!this.isRunning||this.isPaused)return;
  const selected=this.currentPiece;
  this.parallelCount=pieceCount(this);
  if(this.activePieces.length<this.parallelCount)this.spawnPiece();
  // Une seule avancée de chaque pièce par frame, sans déplacer la sélection.
  for(const piece of [...(this.activePieces||[])]){
   if(!this.isRunning||this.isPaused)break;
   if(!this.activePieces.includes(piece))continue;
   this.currentPiece=piece;this.dropTimer=piece.dropTimer||0;
   baseUpdate.call(this,delta);
   piece.dropTimer=this.dropTimer;
  }
  this.currentPiece=this.activePieces.includes(selected)?selected:(this.activePieces[0]||null);
  this.grid.selectedPiece=this.currentPiece;
 };
 proto.selectFallingPiece=function(row,col){
  const piece=(this.activePieces||[]).find(p=>p.shape[row-p.y]?.[col-p.x]);
  if(!piece||!this.isRunning||this.isPaused)return false;
  this.currentPiece=piece;this.grid.selectedPiece=piece;this.grid.render(piece);return true;
 };
 proto.exportState=function(){return {...baseExport.call(this),activePieces:JSON.parse(JSON.stringify(this.activePieces||[])),selectedPieceIndex:(this.activePieces||[]).indexOf(this.currentPiece),parallelCount:this.parallelCount||1};};
 proto.importState=function(state){
  this.activePieces=[];baseImport.call(this,state);
  this.activePieces=state.activePieces?.length?JSON.parse(JSON.stringify(state.activePieces)):(this.currentPiece?[this.currentPiece]:[]);
  this.parallelCount=state.parallelCount||1;
  for(const p of this.activePieces){if(!p.icon)p.icon=Object.values(BLOCKS).find(b=>b.type===p.type)?.icon||'◆';}
  if(this.nextPiece&&!this.nextPiece.icon)this.nextPiece.icon=Object.values(BLOCKS).find(b=>b.type===this.nextPiece.type)?.icon||'◆';
  this.currentPiece=this.activePieces[state.selectedPieceIndex]||this.activePieces[0]||null;
  this.grid.getFallingPieces=()=>this.activePieces;this.grid.selectedPiece=this.currentPiece;this.grid.render(this.currentPiece);
 };
 const valid=GameGrid.prototype.isValidMove;
 GameGrid.prototype.isValidMove=function(piece,x,y,shape=piece.shape){
  if(!valid.call(this,piece,x,y,shape))return false;
  for(const other of this.getFallingPieces?.()||[]){
   if(other===piece)continue;
   for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++){
    if(shape[r][c]&&other.shape[y+r-other.y]?.[x+c-other.x])return false;
   }
  }
  return true;
 };
 document.addEventListener('DOMContentLoaded',()=>{
  let selectionPress=null;
  const start=e=>{
   const cell=e.target.closest?.('.board-grid .cell');if(!cell)return;
   if(game.selectFallingPiece(Number(cell.dataset.row),Number(cell.dataset.col))){
    const pos=e.touches?.[0]||e;selectionPress={x:pos.clientX,y:pos.clientY};
   }else selectionPress=null;
  };
  const end=e=>{
   if(!selectionPress)return;
   const pos=e.changedTouches?.[0]||e;
   if(Math.hypot(pos.clientX-selectionPress.x,pos.clientY-selectionPress.y)<10){e.preventDefault();e.stopImmediatePropagation();}
   selectionPress=null;
  };
  document.addEventListener('mousedown',start,true);document.addEventListener('touchstart',start,{capture:true,passive:true});
  document.addEventListener('mouseup',end,true);document.addEventListener('touchend',end,{capture:true,passive:false});
 });
})();


