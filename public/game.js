(function(root){
const W=300,H=450,PW=64,PH=10,R=7,WIN=3,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
function create(){return{bx:W/2,by:H/2,vx:0,vy:0,A:[W/2,W/2],B:[W/2,W/2],sA:0,sB:0,wait:1,over:false,dir:1,bw:0}}
function serve(S){S.bx=W/2;S.by=H/2;S.vx=(Math.random()-.5)*120;S.vy=170*S.dir}
function hit(S,px,dir){S.bw=0;
  const sp=Math.min(Math.hypot(S.vx,S.vy)*1.06,520);
  S.vx=(S.bx-px)/(PW/2)*160+S.vx*.3;
  S.vy=dir*Math.sqrt(Math.max(sp*sp-S.vx*S.vx,10000));
}
function point(S,dir){S.bw=0;S.dir=dir;S.vx=S.vy=0;S.bx=W/2;S.by=H/2;S.wait=1;if(S.sA>=WIN||S.sB>=WIN)S.over=true}
function step(S,dt,bot){
  if(S.over)return;
  if(S.wait>0){S.wait-=dt;if(S.wait<=0)serve(S);return}
  if(bot){const t=S.vy<0||S.bw===2?S.bx:W/2,s=bot*dt;S.B[0]=cl(S.B[0]+cl(t-S.B[0],-s,s),PW/2,W-PW/2)}
  S.bx+=S.vx*dt;S.by+=S.vy*dt;
  if(S.bx<R){S.bx=R;S.vx=Math.abs(S.vx)}
  if(S.bx>W-R){S.bx=W-R;S.vx=-Math.abs(S.vx)}
  const y1=H-30,y2=30;
  if((S.vy>0||S.bw===1)&&S.by+R>=y1-PH/2&&S.by<y1+PH)for(const x of S.A)if(Math.abs(S.bx-x)<=PW/2+R){hit(S,x,-1);break}
  if((S.vy<0||S.bw===2)&&S.by-R<=y2+PH/2&&S.by>y2-PH)for(const x of S.B)if(Math.abs(S.bx-x)<=PW/2+R){hit(S,x,1);break}
  if(S.by>H-R){S.bw=1;S.by=H-R;S.vy=-Math.max(120,Math.abs(S.vy)*.85)}
  if(S.by<R){S.bw=2;S.by=R;S.vy=Math.max(120,Math.abs(S.vy)*.85)}
  if(S.bw===1&&S.by<y1-PH-R){S.sB++;point(S,-1)}
  else if(S.bw===2&&S.by>y2+PH+R){S.sA++;point(S,1)}
}
const api={W,H,PW,PH,R,WIN,create,step};
if(typeof module!=='undefined')module.exports=api;else root.Padel=api;
})(this);
