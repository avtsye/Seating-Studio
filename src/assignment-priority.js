function seatingCells(areas){
  return (areas||[]).filter(a=>a.type==='chair'||a.type==='benches').flatMap(a=>a.cells||[]);
}
function seatingCenterX(hall,areas){
  const cells=seatingCells(areas);
  if(!cells.length)return (hall.gridWidth-1)/2;
  const xs=cells.map(c=>c.x);
  return (Math.min(...xs)+Math.max(...xs))/2;
}
function stageFrontDepth(seat,areas){
  const stages=(areas||[]).filter(a=>a.type==='stage').flatMap(a=>a.cells||[]);
  if(!stages.length)return seat.cell.y;
  const seats=seatingCells(areas);
  const stageYs=stages.map(c=>c.y),seatYs=seats.map(c=>c.y);
  const minStage=Math.min(...stageYs),maxStage=Math.max(...stageYs);
  const stageCenter=(minStage+maxStage)/2;
  const seatCenter=seatYs.length?seatYs.reduce((a,b)=>a+b,0)/seatYs.length:seat.cell.y;
  if(seatCenter>stageCenter)return Math.max(0,seat.cell.y-maxStage);
  if(seatCenter<stageCenter)return Math.max(0,minStage-seat.cell.y);
  return Math.min(...stageYs.map(y=>Math.abs(seat.cell.y-y)));
}
export function seatPriorityParts(seat,hall,areas){
  const front=stageFrontDepth(seat,areas);
  const center=Math.abs(seat.cell.x-seatingCenterX(hall,areas));
  return {front,center,total:front+center};
}
export function seatPriorityScore(seat,hall,areas){
  return seatPriorityParts(seat,hall,areas).total;
}
export function compareSeatPriority(a,b,hall,areas){
  const pa=seatPriorityParts(a,hall,areas),pb=seatPriorityParts(b,hall,areas);
  return pa.total-pb.total||pa.front-pb.front||pa.center-pb.center||a.cell.x-b.cell.x||a.cell.y-b.cell.y;
}
export function windowPriority(seats,hall,areas){
  return seats.reduce((acc,s)=>{
    const p=seatPriorityParts(s,hall,areas);
    acc.total+=p.total;
    acc.worst=Math.max(acc.worst,p.total);
    acc.front+=p.front;
    acc.center+=p.center;
    return acc;
  },{total:0,worst:0,front:0,center:0});
}
export function compareWindowPriority(a,b){
  return a.total-b.total||a.worst-b.worst||a.front-b.front||a.center-b.center;
}
export function horizontalSeatWindows(seats,count){
  if(count<=0)return [];
  const rows=new Map();
  for(const s of seats){
    const k=s.block+'|'+s.cell.y;
    if(!rows.has(k))rows.set(k,[]);
    rows.get(k).push(s);
  }
  const out=[];
  for(const row of rows.values()){
    row.sort((a,b)=>a.cell.x-b.cell.x);
    let run=[];
    const flush=()=>{
      if(run.length>=count){
        for(let i=0;i<=run.length-count;i++)out.push(run.slice(i,i+count));
      }
      run=[];
    };
    for(const s of row){
      if(run.length&&s.cell.x!==run[run.length-1].cell.x+1)flush();
      run.push(s);
    }
    flush();
  }
  return out;
}
