export function seatPriorityParts(seat, hall, areas){
  const stages=(areas||[]).filter(a=>a.type==='stage').flatMap(a=>a.cells||[]);
  const front=stages.length?Math.min(...stages.map(c=>Math.abs(seat.cell.y-c.y))):seat.cell.y;
  const center=Math.abs(seat.cell.x-(hall.gridWidth-1)/2);
  return {front,center};
}
export function compareSeatPriority(a,b,hall,areas){
  const pa=seatPriorityParts(a,hall,areas),pb=seatPriorityParts(b,hall,areas);
  return pa.front-pb.front||pa.center-pb.center;
}
export function windowPriority(seats,hall,areas){
  return seats.reduce((acc,s)=>{const p=seatPriorityParts(s,hall,areas);acc.front+=p.front;acc.center+=p.center;return acc},{front:0,center:0});
}
export function compareWindowPriority(a,b){
  return a.front-b.front||a.center-b.center;
}
