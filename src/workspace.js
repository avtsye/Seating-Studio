export const WORKSPACE_VERSION=1;

const copy=v=>JSON.parse(JSON.stringify(v));

export function hallSnapshot(state){
  return {
    hall:copy(state.hall||{}),
    areas:copy(state.areas||[]),
    assignments:copy(state.assignments||{}),
    assignmentLocks:copy(state.assignmentLocks||{}),
    areaLocks:copy(state.areaLocks||[]),
    blockedSeats:copy(state.blockedSeats||[])
  };
}

export function sharedProjectSnapshot(state){
  return {
    name:state.project?.name||'פרויקט שיבוץ',
    note:state.project?.note||'',
    people:copy(state.people||[]),
    groupPriorities:copy(state.groupPriorities||{}),
    groupColors:copy(state.groupColors||{}),
    groupCatalog:copy(state.groupCatalog||[]),
    groupLocks:copy(state.groupLocks||[]),
    savedViews:copy(state.savedViews||[]),
    activityLog:copy(state.activityLog||[]),
    scenarios:copy(state.scenarios||[]),
    settings:copy(state.settings||{})
  };
}

export function assignedPeople(assignments){
  return new Set(Object.values(assignments||{}).filter(Boolean));
}

export function assignedBeforeHall(project,hallId){
  const out=new Set();
  for(const hall of project?.halls||[]){
    if(hall.id===hallId)break;
    for(const pid of assignedPeople(hall.data?.assignments))out.add(pid);
  }
  return out;
}

export function remainingPeopleForHall(project,hallId){
  const used=assignedBeforeHall(project,hallId);
  return (project?.people||[]).filter(p=>!used.has(p.id));
}

export function removePersonFromOtherHalls(project,personId,exceptHallId){
  let removed=false;
  for(const hall of project?.halls||[]){
    if(hall.id===exceptHallId)continue;
    const assignments=hall.data?.assignments||{};
    for(const [seat,pid] of Object.entries(assignments)){
      if(pid===personId){delete assignments[seat];removed=true}
    }
  }
  return removed;
}

export function normalizeWorkspace(raw){
  const ws=raw&&typeof raw==='object'?copy(raw):{};
  ws.version=WORKSPACE_VERSION;
  ws.projects=Array.isArray(ws.projects)?ws.projects.filter(p=>p&&Array.isArray(p.halls)&&p.halls.length):[];
  if(!ws.projects.length)return null;
  if(!ws.projects.some(p=>p.id===ws.activeProjectId))ws.activeProjectId=ws.projects[0].id;
  for(const p of ws.projects){
    if(!p.halls.some(h=>h.id===p.activeHallId))p.activeHallId=p.halls[0].id;
    p.people=Array.isArray(p.people)?p.people:[];
    p.groupPriorities=p.groupPriorities&&typeof p.groupPriorities==='object'?p.groupPriorities:{};
    p.groupColors=p.groupColors&&typeof p.groupColors==='object'?p.groupColors:{};
    p.groupCatalog=Array.isArray(p.groupCatalog)?[...new Set(p.groupCatalog.filter(Boolean))]:[];
    p.groupLocks=Array.isArray(p.groupLocks)?[...new Set(p.groupLocks.filter(Boolean))]:[];
    p.savedViews=Array.isArray(p.savedViews)?p.savedViews:[];
    p.activityLog=Array.isArray(p.activityLog)?p.activityLog.slice(-250):[];
    p.scenarios=Array.isArray(p.scenarios)?p.scenarios.slice(-20):[];
    p.settings=p.settings&&typeof p.settings==='object'?p.settings:{};
    for(const hall of p.halls){
      hall.data=hall.data&&typeof hall.data==='object'?hall.data:{};
      hall.data.assignmentLocks=hall.data.assignmentLocks&&typeof hall.data.assignmentLocks==='object'?hall.data.assignmentLocks:{};
      hall.data.areaLocks=Array.isArray(hall.data.areaLocks)?[...new Set(hall.data.areaLocks.filter(Boolean))]:[];
    }
    normalizeGroupRouting(p);
  }
  return ws;
}

export function duplicatePeopleAcrossHalls(project){
  const firstHall=new Map(),duplicates=[];
  for(const hall of project?.halls||[]){
    for(const pid of assignedPeople(hall.data?.assignments)){
      const first=firstHall.get(pid);
      if(first&&first!==hall.id)duplicates.push({personId:pid,firstHallId:first,duplicateHallId:hall.id});
      else if(!first)firstHall.set(pid,hall.id);
    }
  }
  return duplicates;
}

function projectGroups(project){
  return [...new Set([...(project?.groupCatalog||[]),...(project?.people||[]).map(p=>p.group).filter(Boolean)])];
}

export function normalizeGroupRouting(project){
  const halls=new Set((project?.halls||[]).map(h=>h.id));
  const groups=projectGroups(project);
  project.routingMode=project?.routingMode==='by-group'?'by-group':'cascade';
  const raw=project?.groupHallRules&&typeof project.groupHallRules==='object'?project.groupHallRules:{};
  const next={};
  for(const group of groups){
    const hallId=raw[group];
    if(hallId==='__all__'||halls.has(hallId))next[group]=hallId;
  }
  project.groupHallRules=next;
  return project;
}

export function groupsForHall(project,hallId){
  normalizeGroupRouting(project);
  if(project.routingMode!=='by-group')return null;
  return new Set(Object.entries(project.groupHallRules).filter(([,id])=>id===hallId||id==='__all__').map(([group])=>group));
}

export function unroutedGroups(project){
  normalizeGroupRouting(project);
  if(project.routingMode!=='by-group')return [];
  const groups=projectGroups(project);
  return groups.filter(g=>!project.groupHallRules[g]);
}

export function personAllowedInHall(project,hallId,person){
  if(!project||!person)return false;
  normalizeGroupRouting(project);
  if(project.routingMode!=='by-group'||!person.group)return true;
  const rule=project.groupHallRules?.[person.group];
  if(rule==='__all__')return splitHallForPerson(project,person)===hallId;
  return rule===hallId;
}

export function eligiblePeopleForHall(project,hallId,excludedIds=new Set()){
  const excluded=excludedIds instanceof Set?excludedIds:new Set(excludedIds||[]);
  return (project?.people||[]).filter(person=>!excluded.has(person.id)&&personAllowedInHall(project,hallId,person));
}

export function splitGroupAcrossHalls(project,group){
  const halls=project?.halls||[];
  const people=(project?.people||[]).filter(p=>p.group===group);
  const out=new Map(halls.map(h=>[h.id,[]]));
  if(!halls.length)return out;
  const base=Math.floor(people.length/halls.length),extra=people.length%halls.length;
  let offset=0;
  halls.forEach((hall,index)=>{
    const count=base+(index<extra?1:0);
    out.set(hall.id,people.slice(offset,offset+count));
    offset+=count;
  });
  return out;
}

export function splitHallForPerson(project,person){
  if(!project||!person?.group)return null;
  normalizeGroupRouting(project);
  if(project.groupHallRules?.[person.group]!=='__all__')return null;
  const split=splitGroupAcrossHalls(project,person.group);
  for(const [hallId,people] of split)if(people.some(p=>p.id===person.id))return hallId;
  return null;
}
