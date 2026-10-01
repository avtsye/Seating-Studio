const clone=v=>JSON.parse(JSON.stringify(v));

export function fitHallToContent({hall,areas,blockedSeats,assignments,padding=1,minSize=10,maxSize=200}){
  const nextAreas=clone(areas||[]);
  const nextBlocked=clone(blockedSeats||[]);
  const nextAssignments={...(assignments||{})};
  const cells=nextAreas.flatMap(a=>a.cells||[]);
  if(!cells.length){
    return {
      changed:false,
      hall:{...(hall||{})},
      areas:nextAreas,
      blockedSeats:nextBlocked,
      assignments:nextAssignments,
      shiftX:0,
      shiftY:0
    };
  }
  const minX=Math.min(...cells.map(c=>c.x));
  const minY=Math.min(...cells.map(c=>c.y));
  const maxX=Math.max(...cells.map(c=>c.x));
  const maxY=Math.max(...cells.map(c=>c.y));
  const shiftX=Math.max(0,minX-padding);
  const shiftY=Math.max(0,minY-padding);
  const wantedWidth=Math.max(minSize,Math.min(maxSize,maxX-shiftX+1+padding));
  const wantedHeight=Math.max(minSize,Math.min(maxSize,maxY-shiftY+1+padding));
  const currentWidth=Math.max(minSize,Math.min(maxSize,Number(hall?.gridWidth)||maxSize));
  const currentHeight=Math.max(minSize,Math.min(maxSize,Number(hall?.gridHeight)||maxSize));
  const gridWidth=Math.min(currentWidth,wantedWidth);
  const gridHeight=Math.min(currentHeight,wantedHeight);
  const changed=shiftX>0||shiftY>0||gridWidth!==(hall?.gridWidth)||gridHeight!==(hall?.gridHeight);

  if(shiftX||shiftY){
    for(const area of nextAreas){
      for(const c of area.cells||[]){
        c.x-=shiftX;
        c.y-=shiftY;
      }
    }
  }

  const movedBlocked=nextBlocked
    .map(c=>({x:c.x-shiftX,y:c.y-shiftY}))
    .filter(c=>c.x>=0&&c.y>=0&&c.x<gridWidth&&c.y<gridHeight);

  const movedAssignments={};
  for(const [seatKey,pid] of Object.entries(nextAssignments)){
    const match=/^(-?\d+),(-?\d+)$/.exec(seatKey);
    if(!match){movedAssignments[seatKey]=pid;continue}
    const x=Number(match[1])-shiftX;
    const y=Number(match[2])-shiftY;
    if(x>=0&&y>=0&&x<gridWidth&&y<gridHeight)movedAssignments[x+','+y]=pid;
  }

  return {
    changed,
    hall:{...(hall||{}),gridWidth,gridHeight},
    areas:nextAreas,
    blockedSeats:movedBlocked,
    assignments:movedAssignments,
    shiftX,
    shiftY
  };
}
