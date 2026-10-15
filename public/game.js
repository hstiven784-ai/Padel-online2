// Lógica compartida (servidor y navegador)
(function(root){
const W=300,H=450,PW=64,PH=10,R=7,WIN=7;
function create(){return{bx:W/2,by:H/2,vx:0,vy:0,p1:W/2,p2:W/2,s1:0,s2:0,wait:1,over:false,dir:1}}
function serve(S){S.bx=W/2;S.by=H/2;S.vx=(Math.random()-.5)*120;S.vy=170*S.dir}
function hit(S,px,dir){
  const sp=Math.min(Math.hypot(S.vx,S.vy)*1.06,520);
  S.vx=(S.bx-px)/(PW/2)*160+S.vx*.3;
  S.vy=dir*Math.sqrt(Math.max(sp*sp-S.vx*S.vx,10000));
}
function point(S,dir){
  S.dir=dir;S.vx=S.vy=0;S.bx=W/2;S.by=H/2;S.wait=1;
  if(S.s1>=WIN||S.s2>=WIN)S.over=true;
}
function step(S,dt,bot){
  if(S.over)return;
  if(S.wait>0){S.wait-=dt;if(S.wait<=0)serve(S);return}
  if(bot){const t=S.vy<0?S.bx:W/2,s=130*dt;S.p2+=Math.max(-s,Math.min(s,t-S.p2))}
  S.bx+=S.vx*dt;S.by+=S.vy*dt;
  if(S.bx<R){S.bx=R;S.vx=Math.abs(S.vx)}
  if(S.bx>W-R){S.bx=W-R;S.vx=-Math.abs(S.vx)}
  const y1=H-30,y2=30;
  if(S.vy>0&&S.by+R>=y1-PH/2&&S.by<y1+PH&&Math.abs(S.bx-S.p1)<=PW/2+R)hit(S,S.p1,-1);
  if(S.vy<0&&S.by-R<=y2+PH/2&&S.by>y2-PH&&Math.abs(S.bx-S.p2)<=PW/2+R)hit(S,S.p2,1);
  if(S.by>H+15){S.s2++;point(S,-1)}
  if(S.by<-15){S.s1++;point(S,1)}
}
const api={W,H,PW,PH,R,WIN,create,step};
if(typeof module!=='undefined')module.exports=api;else root.Padel=api;
})(this);
