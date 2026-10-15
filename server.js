const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const G=require('./public/game.js');
const PUB=path.join(__dirname,'public');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css'};
const server=http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(PUB,path.normalize(p));
  if(!f.startsWith(PUB)){res.writeHead(403);return res.end()}
  fs.readFile(f,(e,d)=>{
    if(e){res.writeHead(404);return res.end('No encontrado')}
    res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});res.end(d);
  });
});
const wss=new WebSocketServer({server});
const rooms=new Map();
const send=(ws,o)=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
const newCode=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c;
  do{c='';for(let i=0;i<4;i++)c+=a[Math.random()*a.length|0]}while(rooms.has(c));return c};
function leave(ws){
  const r=ws.room;if(!r)return;
  r.players=r.players.filter(p=>p!==ws);ws.room=null;
  r.players.forEach(p=>send(p,{t:'left'}));
  if(!r.players.length)rooms.delete(r.code);else{r.S=G.create();r.started=false}
}
wss.on('connection',ws=>{
  ws.alive=true;ws.on('pong',()=>ws.alive=true);
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw)}catch{return}
    if(m.t==='create'){
      leave(ws);const code=newCode();
      const r={code,players:[ws],S:G.create(),started:false};
      rooms.set(code,r);ws.room=r;ws.side=1;send(ws,{t:'room',code});
    }else if(m.t==='join'){
      leave(ws);const r=rooms.get(String(m.code||'').toUpperCase());
      if(!r)return send(ws,{t:'err',msg:'Código no encontrado'});
      if(r.players.length>=2)return send(ws,{t:'err',msg:'La partida está llena'});
      r.players.push(ws);ws.room=r;ws.side=2;r.S=G.create();r.started=true;
      r.players.forEach(p=>send(p,{t:'start',side:p.side}));
    }else if(m.t==='p'&&ws.room&&typeof m.x==='number'){
      const x=Math.max(G.PW/2,Math.min(G.W-G.PW/2,m.x));
      ws.room.S[ws.side===1?'p1':'p2']=x;
    }else if(m.t==='again'&&ws.room&&ws.room.S.over){
      ws.room.S=G.create();
    }
  });
  ws.on('close',()=>leave(ws));
});
let tick=0;
setInterval(()=>{
  tick++;
  for(const r of rooms.values()){
    if(!r.started)continue;
    G.step(r.S,1/60,false);
    if(tick%2===0){const s=r.S;
      const o={t:'s',bx:s.bx,by:s.by,vx:s.vx,vy:s.vy,p1:s.p1,p2:s.p2,s1:s.s1,s2:s.s2,wait:s.wait,over:s.over};
      r.players.forEach(p=>send(p,o));}
  }
},1000/60);
setInterval(()=>wss.clients.forEach(ws=>{if(!ws.alive)return ws.terminate();ws.alive=false;ws.ping()}),30000);
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log('Pádel online en http://localhost:'+PORT));
