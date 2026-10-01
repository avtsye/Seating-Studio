export function setBlockedCells(blockedSeats,cells,seatCells,shouldBlock){
  const seatSet=new Set((seatCells||[]).map(c=>c.x+','+c.y));
  const blocked=new Map((blockedSeats||[]).map(c=>[c.x+','+c.y,{x:c.x,y:c.y}]));
  for(const c of cells||[]){
    const k=c.x+','+c.y;
    if(!seatSet.has(k))continue;
    if(shouldBlock)blocked.set(k,{x:c.x,y:c.y});
    else blocked.delete(k);
  }
  return [...blocked.values()];
}
