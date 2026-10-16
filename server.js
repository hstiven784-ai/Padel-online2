const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const G=require('./public/game.js');
const PUB=path.join(__dirname,'public');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript'};
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
const all=(r,o)=>r.players.forEach(p=>send(p,o));
const newCode=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c;
  do{c='';for(let i=0;i<4;i++)c+=a[Math.random()*a.length|0]}while(rooms.has(c));return c};
const nm=n=>String(n||'Jugador').slice(0,12);
function leave(ws){
  const r=ws.room;if(!r)return;
  ws.room=null;rooms.delete(r.code);
  r.players.forEach(p=>{if(p!==ws){p.room=null;send(p,{t:'left'})}});
}
wss.on('connection',ws=>{
  ws.alive=true;ws.on('pong',()=>ws.alive=true);
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw)}catch{return}
    if(m.t==='create'){
      leave(ws);const code=newCode(),mode=m.mode===4?4:2;
      const r={code,mode,players:[ws],names:[nm(m.name)],S:G.create(),started:false,wins:[0,0],counted:false};
      rooms.set(code,r);ws.room=r;ws.slot=0;
      send(ws,{t:'room',code});send(ws,{t:'wait',n:1,mode});
    }else if(m.t==='join'){
      leave(ws);const r=rooms.get(String(m.code||'').toUpperCase());
      if(!r)return send(ws,{t:'err',msg:'Código no encontrado'});
      if(r.players.length>=r.mode)return send(ws,{t:'err',msg:'La partida está llena'});
      ws.slot=r.players.length;r.players.push(ws);r.names.push(nm(m.name));ws.room=r;
      if(r.players.length<r.mode)return all(r,{t:'wait',n:r.players.length,mode:r.mode});
      r.S=G.create();r.started=true;
      r.players.forEach(p=>send(p,{t:'start',side:p.slot%2?2:1,idx:p.slot>>1,mode:r.mode,names:r.names}));
    }else if(m.t==='p'&&ws.room&&ws.room.started&&typeof m.x==='number'){
      const x=Math.max(G.PW/2,Math.min(G.W-G.PW/2,m.x));
      ws.room.S[ws.slot%2?'B':'A'][ws.slot>>1]=x;
    }else if(m.t==='again'&&ws.room&&ws.room.S.over){
      ws.room.S=G.create();ws.room.counted=false;
    }else if(m.t==='e'&&ws.room&&typeof m.e==='string'){
      all(ws.room,{t:'e',e:m.e.slice(0,4),side:ws.slot%2?2:1});
    }
  });
  ws.on('close',()=>leave(ws));
});
let tick=0;
setInterval(()=>{
  tick++;
  for(const r of rooms.values()){
    if(!r.started)continue;
    const s=r.S;G.step(s,1/60,false);
    if(s.over&&!r.counted){r.counted=true;r.wins[s.sA>s.sB?0:1]++}
    if(tick%2===0)all(r,{t:'s',bx:s.bx,by:s.by,vx:s.vx,vy:s.vy,A:s.A,B:s.B,sA:s.sA,sB:s.sB,wait:s.wait,over:s.over,w:r.wins});
  }
},1000/60);
setInterval(()=>wss.clients.forEach(ws=>{if(!ws.alive)return ws.terminate();ws.alive=false;ws.ping()}),30000);
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log('Pádel online en http://localhost:'+PORT));
