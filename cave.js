'use strict';
// The bunker room (the page background), shared by the home page and the coin pages.
// The class keeps the name Cave so the pages need no wiring change: same options (bears, ambient, glow, fps).
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rng(seed){var a=seed>>>0;return function(){a=(a+0x6d2b79f5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
  // The page background: a concrete bunker lit by one lantern. A pipe drips into a bucket, a radio hisses, the breaker light blinks, and a survivor in a hazmat suit waits it out.
  function Cave(canvas,opts){
    var scale=0,w=0,h=0,ctx=canvas.getContext('2d'),base=null,fall=null,fx=0,fy=0,ly=0,floorY=0,t0=0,raf=0,last=0,self=this,P={};
    function R(c,x,y,ww,hh,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)))}
    function ell(c,cx,cy,rx,ry,col){c.fillStyle=col;for(var y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){var dy=(y+.5-cy)/ry;if(dy*dy>1)continue;var dx=Math.sqrt(1-dy*dy)*rx;c.fillRect(Math.round(cx-dx),y,Math.max(1,Math.round(dx*2)),1)}}
    function can(c,x,y,col,lab){R(c,x,y,5,7,'#b9c0cc');R(c,x,y+2,5,3,col);R(c,x+1,y+3,3,1,lab)}
    function size(){
      var vw=canvas.clientWidth||window.innerWidth,vh=canvas.clientHeight||window.innerHeight;
      scale=vw>900?4:3;w=Math.max(80,Math.ceil(vw/scale));h=Math.max(80,Math.ceil(vh/scale));canvas.width=w;canvas.height=h;
      floorY=Math.round(h*.74);fx=Math.round(w*.5);var tableTop=floorY-Math.round(h*.09);fy=tableTop;ly=tableTop-Math.round(h*.1);
      var oc=document.createElement('canvas');oc.width=w;oc.height=h;var c=oc.getContext('2d'),r=rng(11);
      // concrete block wall
      for(var y=0;y<floorY;y++)for(var x=0;x<w;x++){var n=r()*.1,k=1+n;c.fillStyle='rgb('+(52*k|0)+','+(54*k|0)+','+(58*k|0)+')';c.fillRect(x,y,1,1)}
      for(var by0=0,row=0;by0<floorY;by0+=14,row++){R(c,0,by0,w,1,'#34363b');for(var bx0=(row%2?16:0);bx0<w;bx0+=32)R(c,bx0,by0,1,14,'#34363b')}
      // stains running down the wall
      for(var sI=0;sI<7;sI++){var sx=Math.round(r()*w),sl=Math.round(h*(.08+r()*.18));for(var sy=0;sy<sl;sy++)R(c,sx,Math.round(h*.04)+sy,1,1,'rgba(20,22,26,'+(.5-sy/sl*.4)+')')}
      // ceiling pipe with a valve
      var py=Math.round(h*.05);R(c,0,py,w,5,'#4b5058');R(c,0,py,w,1,'#6a717c');R(c,0,py+4,w,1,'#2d3036');for(var pj=Math.round(w*.12);pj<w;pj+=Math.round(w*.2))R(c,pj,py-1,3,7,'#3a3e45');
      P.vx=Math.round(w*.27);P.vy=py+5;R(c,P.vx-1,py+5,3,4,'#7a8190');
      // floor: bare concrete with a hazard stripe along the wall
      for(var fy2=floorY;fy2<h;fy2++){for(var fx2=0;fx2<w;fx2++){var kk=1+r()*.12;c.fillStyle='rgb('+(60*kk|0)+','+(58*kk|0)+','+(56*kk|0)+')';c.fillRect(fx2,fy2,1,1)}}
      for(var hx=0;hx<w;hx+=10)R(c,hx,floorY,5,3,'#a68414');R(c,0,floorY,w,1,'#2a2b2f');
      R(c,0,floorY-3,w,3,'#3d4046');
      // a worn olive mat
      var ryc=floorY+Math.round((h-floorY)*.52),rrx=Math.round(w*.3),rry=Math.round((h-floorY)*.36);
      ell(c,fx,ryc,rrx,rry,'#2d3322');ell(c,fx,ryc,rrx*.92,rry*.88,'#454d33');ell(c,fx,ryc,rrx*.7,rry*.66,'#59623f');
      // the vault door on the left, with a wheel and rivets
      var dx0=Math.round(w*.05),dy0=Math.round(h*.14),dw=Math.round(w*.16),dh=floorY-dy0-3;
      R(c,dx0-3,dy0-3,dw+6,dh+3,'#262a30');R(c,dx0,dy0,dw,dh,'#5a6270');R(c,dx0+2,dy0+2,dw-4,dh-4,'#4a515d');
      for(var rv=0;rv<5;rv++){R(c,dx0+3,dy0+4+rv*Math.round(dh/5),2,2,'#7a8394');R(c,dx0+dw-5,dy0+4+rv*Math.round(dh/5),2,2,'#7a8394')}
      var wcx=dx0+dw/2,wcy=dy0+dh*.45,wr=Math.max(6,dw*.28);ell(c,wcx,wcy,wr,wr,'#2e333b');ell(c,wcx,wcy,wr*.8,wr*.8,'#6a7384');ell(c,wcx,wcy,wr*.55,wr*.55,'#4a515d');R(c,wcx-wr,wcy-1,wr*2,2,'#6a7384');R(c,wcx-1,wcy-wr,2,wr*2,'#6a7384');
      for(var hs=0;hs<dw;hs+=8){R(c,dx0+hs,dy0+dh-5,4,3,'#a68414')}
      // a dim EXIT sign above it
      P.ex=[dx0+Math.round(dw*.25),dy0-Math.round(h*.07),Math.round(dw*.5),6];R(c,P.ex[0]-1,P.ex[1]-1,P.ex[2]+2,P.ex[3]+2,'#1a1c20');
      // the day calendar and a warning poster
      var f1x=Math.round(w*.34),f1y=Math.round(h*.14);R(c,f1x,f1y,22,24,'#8a7f66');R(c,f1x+1,f1y+1,20,22,'#e8dfc8');R(c,f1x+1,f1y+1,20,4,'#9c3a30');
      for(var cy=0;cy<4;cy++)for(var cx=0;cx<5;cx++){var gx=f1x+3+cx*3.6,gy=f1y+8+cy*3.6;R(c,gx,gy,2,2,(cy*5+cx)<13?'#2a2a2a':'#b8ae94')}
      P.day=[f1x+22,f1y+14];
      var f2x=Math.round(w*.63),f2y=Math.round(h*.16);R(c,f2x,f2y,20,17,'#6a6e76');R(c,f2x+1,f2y+1,18,15,'#d6a916');R(c,f2x+7,f2y+3,6,6,'#1a1a1a');ell(c,f2x+10,f2y+6,1.5,1.5,'#d6a916');R(c,f2x+3,f2y+11,14,1,'#1a1a1a');R(c,f2x+5,f2y+13,10,1,'#1a1a1a');
      // supplies: a shelf of cans and water jugs
      var shx=Math.round(w*.43),shy=Math.round(h*.37),shw=Math.round(w*.15);
      R(c,shx,shy,shw,3,'#6a5a40');R(c,shx,shy+Math.round(h*.1),shw,3,'#6a5a40');
      for(var cI=0;cI<Math.floor(shw/6)-1;cI++){can(c,shx+2+cI*6,shy-7,['#c23b3b','#3f9a58','#3b6fd6','#e8832e'][cI%4],'#f2e27a')}
      R(c,shx+3,shy+Math.round(h*.1)-10,8,10,'#3d6aa0');R(c,shx+5,shy+Math.round(h*.1)-12,4,2,'#2b4a73');R(c,shx+14,shy+Math.round(h*.1)-10,8,10,'#3d6aa0');R(c,shx+16,shy+Math.round(h*.1)-12,4,2,'#2b4a73');
      for(var c2=0;c2<3;c2++)can(c,shx+shw-20+c2*6,shy+Math.round(h*.1)-7,['#c23b3b','#e8832e','#3f9a58'][c2],'#fff0c2');
      // the breaker box on the right wall, and a gas mask on a hook
      var bxx=Math.round(w*.86),byy=Math.round(h*.16);R(c,bxx,byy,16,20,'#3a3f46');R(c,bxx+1,byy+1,14,18,'#555c66');for(var sw=0;sw<4;sw++)R(c,bxx+3+sw*3,byy+9,2,5,'#2a2d33');
      P.led=[bxx+7,byy+4];
      var gmx=Math.round(w*.77),gmy=Math.round(h*.3);R(c,gmx+4,gmy-6,2,6,'#7a8190');ell(c,gmx+5,gmy+4,5,5,'#2e332b');R(c,gmx+2,gmy+2,2,2,'#101418');R(c,gmx+6,gmy+2,2,2,'#101418');R(c,gmx+3,gmy+8,4,4,'#5a6054');R(c,gmx+4,gmy+12,2,2,'#7a8190');
      // the bucket under the dripping pipe
      var bx=P.vx,by=floorY+Math.round((h-floorY)*.5),bw2=Math.round(w*.05);P.bx=bx;P.by=by;P.bw=bw2;
      ell(c,bx,by+3,bw2+2,Math.round(bw2*.35)+2,'#16181c');R(c,bx-bw2,by-Math.round(bw2*.9),bw2*2,Math.round(bw2*.9)+2,'#6a7384');R(c,bx-bw2,by-Math.round(bw2*.9),bw2*2,2,'#9aa3b5');ell(c,bx,by-Math.round(bw2*.9),bw2,Math.round(bw2*.25),'#2c3f66');
      // a crank radio on a crate, and the lantern table
      var rx=Math.round(w*.63),ry=floorY+Math.round((h-floorY)*.62);R(c,rx-12,ry-4,28,14,'#5a3f24');R(c,rx-12,ry-4,28,2,'#7a5a36');
      R(c,rx-8,ry-14,18,11,'#6f7d4f');R(c,rx-6,ry-12,7,6,'#2a3022');R(c,rx+3,ry-12,5,2,'#cfd6e3');R(c,rx+3,ry-8,5,2,'#cfd6e3');R(c,rx+8,ry-22,1,9,'#cfd6e3');P.rad=[rx+5,ry-9];P.ant=[rx+8,ry-22];
      R(c,fx-12,fy,24,3,'#5a3f24');R(c,fx-10,fy+3,3,floorY-fy,'#3e2c1a');R(c,fx+7,fy+3,3,floorY-fy,'#3e2c1a');R(c,fx-9,fy+Math.round((floorY-fy)*.6),18,2,'#3e2c1a');
      // the lantern
      R(c,fx-5,fy-9,10,9,'#2a2d33');R(c,fx-4,fy-8,8,7,'#8a5a14');R(c,fx-2,fy-12,4,3,'#2a2d33');R(c,fx-1,fy-14,2,2,'#2a2d33');P.lan=[fx,fy-5];
      var swd=Math.round(w*.05);for(var sy3=0;sy3<Math.round(h*.05);sy3++){var half=swd*.5+sy3*.55;R(c,fx-half,ly+sy3+Math.round(h*.04),half*2,1,'#ffd48a')}
      base=oc;
      fall=new Float32Array(w*h);var sig=Math.max(w,h)*.5;
      for(var yy=0;yy<h;yy++)for(var xx=0;xx<w;xx++){var dx=(xx-fx)/(sig*1.1),dy=(yy-ly)/(sig*.9);fall[yy*w+xx]=Math.exp(-(dx*dx+dy*dy)*2.0)}
    }
    // the survivor in the corner: a yellow hazmat suit, a dark visor, nervous eyes and a sweat drop
    function survivor(c,t){
      var tx=Math.round(w*.88),gy=floorY+3,u=Math.max(5,Math.round(w*.035)),sway=Math.round(Math.sin(t*1.7)*1);
      R(c,tx-u*.9+sway,gy-u*3.4,u*1.8,u*2.4,'#e8b92a');R(c,tx-u*.9+sway,gy-u*1.0,u*.7,u*1.0,'#c9a02a');R(c,tx+u*.2+sway,gy-u*1.0,u*.7,u*1.0,'#c9a02a');
      R(c,tx-u*.95+sway,gy-u*5.1,u*1.9,u*1.8,'#e8b92a');R(c,tx-u*.7+sway,gy-u*4.8,u*1.4,u*1.1,'#10141c');
      var blink=(t%4)>3.8;R(c,tx-u*.5+sway,gy-u*4.5,2,blink?1:2,'#a8f0ff');R(c,tx+u*.1+sway,gy-u*4.5,2,blink?1:2,'#a8f0ff');
      R(c,tx-u*.2+sway,gy-u*3.8,u*.4,1,'#a8f0ff');R(c,tx-u*.4+sway,gy-u*2.9,u*.8,u*.6,'#6a6e76');
      var sp=(t*.9)%1;R(c,tx+u*.9+sway,gy-u*4.6+sp*u*1.6,1,2,'#bfe3ff');
    }
    function frame(ts){
      if(!ctx)return;
      var t=(ts-t0)/1000;
      if(!frame.buf||frame.buf.width!==w||frame.buf.height!==h){frame.buf=document.createElement('canvas');frame.buf.width=w;frame.buf.height=h}
      var bc=frame.buf.getContext('2d');bc.drawImage(base,0,0);
      survivor(bc,t);
      // the breaker light blinks red, the EXIT sign flickers, the radio dial pulses
      if((t%1.6)<.8)R(bc,P.led[0],P.led[1],3,3,'#ff3b30');else R(bc,P.led[0],P.led[1],3,3,'#5a1612');
      if(Math.sin(t*9)>-.3&&(t%7)<5.5)R(bc,P.ex[0],P.ex[1],P.ex[2],P.ex[3],'#1f7a3a');
      var pulse=(Math.sin(t*3)+1)/2;R(bc,P.rad[0]-6,P.rad[1]-2,5,3,pulse>.5?'#ffb347':'#7a5420');R(bc,P.ant[0],P.ant[1],1,1,(t%1.2)<.6?'#ff3b30':'#5a1612');
      // the lantern flame flickers
      var fh=2+Math.round(Math.sin(t*9)+Math.sin(t*13+1));R(bc,P.lan[0]-1,P.lan[1]-fh,3,fh+1,'#ffd98a');R(bc,P.lan[0],P.lan[1]-fh-1,1,1,'#fff3c0');
      // the pipe drips into the bucket, and a ripple spreads
      var top=P.vy+4,btm=P.by-Math.round(P.bw*.9),ph=(t*.7)%1;R(bc,P.vx,top+ph*ph*(btm-top),1,2,'#8fb8e6');
      var rp=(t*.7)%1;if(rp<.2){var rr=1+rp*20;ell(bc,P.bx,btm,Math.min(P.bw,rr),Math.min(P.bw*.25,rr*.3),'#8fb8e6')}
      var img=bc.getImageData(0,0,w,h),d=img.data;
      var fl=.88+.07*Math.sin(t*2.1)+.05*Math.sin(t*7.3+1.3)+(Math.random()-.5)*.05,amb=opts.ambient*1.1;
      for(var p=0,n=w*h;p<n;p++){var g=fall[p]*fl*opts.glow,o=p*4;
        d[o]=Math.min(255,d[o]*(amb*1.0+g*1.5));d[o+1]=Math.min(255,d[o+1]*(amb*1.0+g*1.1));d[o+2]=Math.min(255,d[o+2]*(amb*1.0+g*.6))}
      ctx.putImageData(img,0,0);
      ell(ctx,fx,P.lan[1]-3,Math.round(w*.03),Math.round(h*.035),'rgba(255,200,110,.35)');
      // the calendar says what day it is
      ctx.fillStyle='rgba(255,230,190,.8)';ctx.font='bold 6px monospace';ctx.fillText('DAY '+(14+Math.floor(t/20)%60),P.day[0]-20,P.day[1]-9);
    }
    function loop(ts){raf=requestAnimationFrame(loop);if(ts-last<(opts.fps?1000/opts.fps:33))return;last=ts;frame(ts)}
    this.start=function(){size();t0=performance.now();if(reduce){frame(t0+1500);return}
      window.addEventListener('resize',self.resize);raf=requestAnimationFrame(loop)};
    this.stop=function(){cancelAnimationFrame(raf);raf=0;window.removeEventListener('resize',self.resize)};
    this.resize=function(){size()};
  }

  /* ---------- the 2D intro for slow devices: a pixel street in a blackout ---------- */
  function Matrix(canvas,opts){
    var w=0,h=0,ctx=canvas.getContext('2d'),t0=0,raf=0,last=0,self=this,rd=rng(5),bl=[],em=[];
    function size(){
      var vw=canvas.clientWidth||window.innerWidth,vh=canvas.clientHeight||window.innerHeight,scale=vw>900?4:3;
      w=Math.max(80,Math.ceil(vw/scale));h=Math.max(80,Math.ceil(vh/scale));canvas.width=w;canvas.height=h;
      bl=[];var x=-6;while(x<w){var bw=18+Math.round(rd()*16),bh=Math.round(h*(.3+rd()*.28)),wins=[];for(var wy=6;wy<bh-4;wy+=8)for(var wx=3;wx<bw-5;wx+=7){var q=rd();wins.push({x:wx,y:wy,lit:q<.1?1:q<.17?2:0,p:rd()*9})}bl.push({x:x,w:bw,h:bh,wins:wins,c:Math.round(20+rd()*10)});x+=bw+2}
      em=[];for(var i=0;i<Math.round(w/4);i++)em.push({x:rd()*w,y:rd()*h,v:6+rd()*10,p:rd()*6})}
    // two survivors: a hazmat worker and a lamplighter with his lantern. dir is the way they face; step swaps the feet; the sweat drop runs down
    function friend(c,x,gy,dir,bat,col,dk,step,t){
      var f=function(rx,ry,rw,rh,cl){c.fillStyle=cl;c.fillRect(Math.round(x+dir*rx-(dir<0?rw-1:0)),gy+ry,rw,rh)};
      if(bat){f(-5,-26,10,9,'#e8c4a0');f(-5,-27,10,3,'#5a3a1e');f(-6,-17,12,16,col);f(-5,-1+(step?1:0),4,2,'#2b2b2b');f(1,-1+(step?0:1),4,2,'#2b2b2b');f(6,-15,3,6,col);
        f(-3,-23,2,2,'#fff');f(1,-23,2,2,'#fff');f(-2,-22,1,1,'#222');f(2,-22,1,1,'#222');f(-2,-19,4,1,'#222');f(-3,-20,1,1,'#222');f(2,-20,1,1,'#222');f(3,-21+Math.round((t*3)%1*5),1,2,'#bfe3ff');f(8,-10,3,4,'#ffb347')}
      else{f(-6,-17,12,12,col);f(-5,-26,10,9,col);f(-4,-24,8,5,'#10141c');f(-3,-23,2,2,'#a8f0ff');f(1,-23,2,2,'#a8f0ff');f(-2,-20,4,1,'#a8f0ff');
        f(-5,-5,4,5+(step?1:0),dk);f(1,-5,4,5+(step?0:1),dk);f(6,-15,3,6,col);f(3,-22+Math.round((t*3)%1*5),1,2,'#bfe3ff')}
    }
    function frame(ts){
      if(!ctx)return;var t=(ts-t0)/1000;
      var flick=((Math.sin(Math.floor(t*4)*12.9898)*43758.5453%1+1)%1)>.93?.6:1;
      ctx.fillStyle='#06070b';ctx.fillRect(0,0,w,h);
      var hy=Math.round(h*.62);
      bl.forEach(function(b){var by=hy-b.h;ctx.fillStyle='rgb('+Math.round(b.c*flick)+','+Math.round((b.c+2)*flick)+','+Math.round((b.c+8)*flick)+')';ctx.fillRect(b.x,by,b.w,b.h);
        b.wins.forEach(function(q){var on=q.lit===1||(q.lit===2&&Math.sin(t*(2+q.p*.3)+q.p*7)>.3);ctx.fillStyle=on?'#ffb347':'#0b0d14';ctx.fillRect(b.x+q.x,by+q.y,3,4)})});
      ctx.fillStyle='#17171c';ctx.fillRect(0,hy,w,h-hy);ctx.fillStyle='#26252a';ctx.fillRect(0,hy,w,Math.round(h*.04));
      for(var dx=0;dx<w;dx+=14){ctx.fillStyle='#8a6a1a';ctx.fillRect(dx,Math.round(h*.8),7,2)}
      // a stalled car with blinking hazards, and a siren washing the road
      var cx=Math.round(w*.2),cy=Math.round(h*.7),blink=Math.floor(t*2)%2;ctx.fillStyle='#2a3342';ctx.fillRect(cx,cy,34,9);ctx.fillRect(cx+7,cy-6,18,7);ctx.fillStyle=blink?'#ffb02e':'#3a2a10';ctx.fillRect(cx,cy+2,2,3);ctx.fillRect(cx+32,cy+2,2,3);
      var siren=Math.floor(t*5)%2;ctx.fillStyle=siren?'rgba(255,30,30,.12)':'rgba(40,80,255,.12)';ctx.fillRect(Math.round(w*.55),hy,Math.round(w*.4),h-hy);
      ctx.fillStyle=siren?'#ff3030':'#3050ff';ctx.fillRect(Math.round(w*.72),Math.round(h*.66),4,3);
      em.forEach(function(q){var y=(q.y-t*q.v)%h;if(y<0)y+=h;if(Math.sin(t*5+q.p*3)>-.4){ctx.fillStyle='rgba(255,170,60,.8)';ctx.fillRect(Math.round(q.x),Math.round(y),1,1)}});
      // two survivors hurry back and forth along the road
      [[.88,.07,0],[.93,.06,.4]].forEach(function(ln,i){
        var gy=Math.round(h*ln[0]),ph=(t*ln[1]+ln[2])%1,fwd=ph<.5,k=fwd?ph*2:(1-ph)*2,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
        var L=14,R=w-32,x1=L+(R-L)*e,dir=fwd?1:-1,step=((t*10+i)%1)<.5;
        friend(ctx,Math.round(x1),gy,dir,i%2===1,i%2?'#4fae5a':'#e8b92a',i%2?'#2f6a38':'#a8841c',step,t)});
      if(flick<1){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,w,h)}
    }
    function loop(ts){raf=requestAnimationFrame(loop);if(ts-last<(opts&&opts.fps?1000/opts.fps:33))return;last=ts;frame(ts)}
    this.start=function(){size();t0=performance.now();
      if(reduce){frame(t0+3500);return}
      window.addEventListener('resize',self.resize);raf=requestAnimationFrame(loop)};
    this.stop=function(){cancelAnimationFrame(raf);raf=0;window.removeEventListener('resize',self.resize)};
    this.resize=function(){size()};
  }

  window.Matrix=Matrix;

  window.Cave=Cave;window.caveReduce=reduce;
})();
