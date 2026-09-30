export function removeBlockedCells(blockedSeats,cells){
  const cut=new Set((cells||[]).map(c=>c.x+','+c.y));
  return (blockedSeats||[]).filter(c=>!cut.has(c.x+','+c.y));
}

export function removeBlockedCell(blockedSeats,cell){
  if(!cell)return blockedSeats||[];
  const target=cell.x+','+cell.y;
  return (blockedSeats||[]).filter(c=>c.x+','+c.y!==target);
}

export function toggleBlockedCells(blockedSeats,cells,seatCells){
  const seatSet=new Set((seatCells||[]).map(c=>c.x+','+c.y));
  const blocked=new Map((blockedSeats||[]).map(c=>[c.x+','+c.y,c]));
  for(const c of cells||[]){
    const k=c.x+','+c.y;
    if(!seatSet.has(k))continue;
    if(blocked.has(k))blocked.delete(k);
    else blocked.set(k,{x:c.x,y:c.y});
  }
  return [...blocked.values()];
}
