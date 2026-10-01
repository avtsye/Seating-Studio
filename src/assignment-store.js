export function seatStorageKey(seatOrCell){
  const c=seatOrCell?.cell||seatOrCell;
  return c&&Number.isInteger(c.x)&&Number.isInteger(c.y)?c.x+','+c.y:'';
}

export function migrateAssignments(raw,seats){
  const source=raw&&typeof raw==='object'?raw:{};
  const list=Array.isArray(seats)?seats:[];
  const valid=new Set(list.map(seatStorageKey));
  const byNumber=new Map(list.map(s=>[String(s.number),s]));
  const out={};
  for(const [oldKey,pid] of Object.entries(source)){
    if(!pid)continue;
    if(valid.has(oldKey)){out[oldKey]=pid;continue}
    const seat=byNumber.get(String(oldKey));
    if(seat)out[seatStorageKey(seat)]=pid;
  }
  return out;
}

export function assignmentDisplayEntries(assignments,seats){
  const a=assignments&&typeof assignments==='object'?assignments:{};
  return (seats||[]).map(s=>[String(s.number),a[seatStorageKey(s)]])
    .filter(([,pid])=>Boolean(pid));
}

export function assignedSeatNumber(assignments,seats,personId){
  const found=(seats||[]).find(s=>assignments?.[seatStorageKey(s)]===personId);
  return found?String(found.number):null;
}

export function sanitizeAssignments(assignments,seats,people){
  const raw=migrateAssignments(assignments,seats);
  const validPeople=new Set((people||[]).map(p=>p.id));
  const seenPeople=new Set();
  const out={};
  for(const seat of seats||[]){
    const k=seatStorageKey(seat),pid=raw[k];
    if(!pid||!validPeople.has(pid)||seenPeople.has(pid))continue;
    out[k]=pid;
    seenPeople.add(pid);
  }
  return out;
}
