export function removeBlockedCells(blockedSeats,cells){
  const cut=new Set((cells||[]).map(c=>c.x+','+c.y));
  return (blockedSeats||[]).filter(c=>!cut.has(c.x+','+c.y));
}

export function removeBlockedCell(blockedSeats,cell){
  if(!cell)return blockedSeats||[];
  const target=cell.x+','+cell.y;
  return (blockedSeats||[]).filter(c=>c.x+','+c.y!==target);
}
