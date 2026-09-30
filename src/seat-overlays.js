export function removeBlockedCells(blockedSeats,cells){
  const cut=new Set((cells||[]).map(c=>c.x+','+c.y));
  return (blockedSeats||[]).filter(c=>!cut.has(c.x+','+c.y));
}
