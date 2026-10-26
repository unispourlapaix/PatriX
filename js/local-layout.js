/* Calcule les carrés à partir de la place restante après l'en-tête et le pied. */
document.addEventListener('DOMContentLoaded',()=>{
 const wrapper=document.querySelector('.game-wrapper'),panel=document.querySelector('.game-board'),header=document.querySelector('.mechanical-display'),footer=document.querySelector('.game-footer'),share=document.querySelector('#localShare');
 if(share)footer.append(share);
 let frame;
 function fit(){
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   const board=panel.querySelector('.board');if(!board)return;
   const grid=board.querySelector('.board-grid');if(!grid)return;
   const cells=grid.querySelectorAll('.cell'),cols=CONFIG.GRID.COLS,rows=CONFIG.GRID.ROWS;
   const ps=getComputedStyle(panel),bs=getComputedStyle(board),gs=getComputedStyle(grid);
   const horizontal=parseFloat(bs.paddingLeft)+parseFloat(bs.paddingRight)+parseFloat(bs.borderLeftWidth)+parseFloat(bs.borderRightWidth);
   const vertical=parseFloat(bs.paddingTop)+parseFloat(bs.paddingBottom)+parseFloat(bs.borderTopWidth)+parseFloat(bs.borderBottomWidth);
   const width=panel.clientWidth-parseFloat(ps.paddingLeft)-parseFloat(ps.paddingRight);
   const height=panel.clientHeight-header.getBoundingClientRect().height-parseFloat(ps.paddingTop)-parseFloat(ps.paddingBottom)-parseFloat(ps.rowGap||0)-2;
   const gx=parseFloat(gs.columnGap)||0,gy=parseFloat(gs.rowGap)||0;
   const size=Math.max(1,Math.floor(Math.min((width-horizontal-(cols-1)*gx)/cols,(height-vertical-(rows-1)*gy)/rows)));
   board.style.setProperty('--fitted-board-width',`${size*cols+(cols-1)*gx+horizontal}px`);
   grid.style.gridTemplateRows=`repeat(${rows},${size}px)`;
   if(window.game?.grid)window.game.grid.resizeCanvas();
  });
 }
 new ResizeObserver(fit).observe(panel);new ResizeObserver(fit).observe(header);new ResizeObserver(fit).observe(footer);
 new MutationObserver(fit).observe(panel,{childList:true});window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);fit();
});
