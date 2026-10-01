import assert from 'node:assert/strict';
import {assignedBeforeHall,remainingPeopleForHall,removePersonFromOtherHalls,normalizeWorkspace,duplicatePeopleAcrossHalls,normalizeGroupRouting,groupsForHall,unroutedGroups,personAllowedInHall,eligiblePeopleForHall,splitGroupAcrossHalls,splitHallForPerson,hallSnapshot,sharedProjectSnapshot} from '../src/workspace.js';

const project={
  id:'p1',
  people:[{id:'a'},{id:'b'},{id:'c'}],
  halls:[
    {id:'h1',data:{assignments:{'1,1':'a','2,1':'b'}}},
    {id:'h2',data:{assignments:{'1,1':'c'}}}
  ],
  activeHallId:'h1'
};
assert.deepEqual([...assignedBeforeHall(project,'h2')].sort(),['a','b']);
assert.deepEqual(remainingPeopleForHall(project,'h2').map(p=>p.id),['c']);
assert.equal(removePersonFromOtherHalls(project,'a','h2'),true);
assert.deepEqual(project.halls[0].data.assignments,{'2,1':'b'});
const ws=normalizeWorkspace({projects:[project],activeProjectId:'missing'});
assert.equal(ws.activeProjectId,'p1');
assert.equal(ws.projects[0].activeHallId,'h1');
console.log('workspace tests passed');

const routed={
  routingMode:'by-group',
  people:[{id:'1',group:'A'},{id:'2',group:'B'},{id:'3',group:'C'}],
  halls:[{id:'h1'},{id:'h2'}],
  groupHallRules:{A:'h1',B:'h2',C:'missing'}
};
normalizeGroupRouting(routed);
assert.equal(routed.routingMode,'by-group','group routing mode must be preserved');
assert.deepEqual([...groupsForHall(routed,'h1')],['A'],'hall routing must select only mapped groups');
assert.deepEqual(unroutedGroups(routed),['C'],'invalid or missing hall mappings must remain visibly unrouted');

const sharedGroupProject={
  routingMode:'by-group',
  people:[{id:'1',group:'A'},{id:'2',group:'B'}],
  halls:[{id:'h1'},{id:'h2'}],
  groupHallRules:{A:'__all__',B:'h2'}
};
normalizeGroupRouting(sharedGroupProject);
assert.deepEqual([...groupsForHall(sharedGroupProject,'h1')],['A'],
  'group can target all linked halls and be eligible in the first hall');
assert.deepEqual([...groupsForHall(sharedGroupProject,'h2')].sort(),['A','B'],
  'group targeting all linked halls must remain eligible in later halls');
assert.deepEqual(unroutedGroups(sharedGroupProject),[],
  'all-halls routing is a valid configured route');

const splitProject={
  routingMode:'by-group',
  people:[
    {id:'a1',group:'A'},{id:'a2',group:'A'},{id:'a3',group:'A'},
    {id:'a4',group:'A'},{id:'a5',group:'A'}
  ],
  halls:[{id:'h1'},{id:'h2'}],
  groupHallRules:{A:'__all__'}
};
const split=splitGroupAcrossHalls(splitProject,'A');
assert.deepEqual(split.get('h1').map(p=>p.id),['a1','a2','a3'],
  'mandatory equal split gives the first hall the remainder');
assert.deepEqual(split.get('h2').map(p=>p.id),['a4','a5'],
  'mandatory equal split puts the remaining part in the next hall');
assert.equal(splitHallForPerson(splitProject,splitProject.people[3]),'h2');
assert.equal(personAllowedInHall(splitProject,'h1',splitProject.people[3]),false,
  'a person from an all-halls group belongs to one required split hall, not every hall');
assert.deepEqual(eligiblePeopleForHall(splitProject,'h2').map(p=>p.id),['a4','a5'],
  'each hall receives only its required share of an all-halls group');

const catalogWs=normalizeWorkspace({activeProjectId:'p',projects:[{id:'p',activeHallId:'h',people:[],groupCatalog:['A','B','A'],halls:[{id:'h',data:{assignments:{}}}]}]});
assert.deepEqual(catalogWs.projects[0].groupCatalog,['A','B'],
  'workspace normalization must preserve managed empty groups without duplicates');

const emptyManaged={
  routingMode:'by-group',
  people:[],
  groupCatalog:['Saved'],
  halls:[{id:'h1'},{id:'h2'}],
  groupHallRules:{Saved:'h2'}
};
normalizeGroupRouting(emptyManaged);
assert.equal(emptyManaged.groupHallRules.Saved,'h2',
  'empty managed groups keep routing configuration');
assert.deepEqual(unroutedGroups(emptyManaged),[],
  'managed empty groups count as configured groups');


const advancedState={
  hall:{name:'A',gridWidth:20,gridHeight:10},
  areas:[{id:'a',name:'מרכז',type:'chair',cells:[{x:1,y:1}]}],
  assignments:{'1,1':'p1'},
  assignmentLocks:{'1,1':true},
  areaLocks:['מרכז'],
  blockedSeats:[],
  project:{name:'P',note:''},
  people:[{id:'p1',name:'א',group:'G'}],
  groupPriorities:{G:1},
  groupColors:{G:'#123456'},
  groupCatalog:['G'],
  groupLocks:['G'],
  savedViews:[{name:'V',mode:'assign'}],
  activityLog:[{at:1,title:'x'}],
  settings:{showGrid:true}
};
const hs=hallSnapshot(advancedState);
assert.deepEqual(hs.assignmentLocks,{'1,1':true},'hall snapshot persists seat locks');
assert.deepEqual(hs.areaLocks,['מרכז'],'hall snapshot persists area locks');
const ss=sharedProjectSnapshot(advancedState);
assert.deepEqual(ss.groupLocks,['G'],'project snapshot persists group locks');
assert.equal(ss.savedViews[0].name,'V','project snapshot persists saved views');
assert.equal(ss.activityLog[0].title,'x','project snapshot persists activity history');

const normalizedAdvanced=normalizeWorkspace({
  activeProjectId:'p',
  projects:[{
    id:'p',activeHallId:'h',people:[],groupCatalog:[],
    groupLocks:['G','G'],savedViews:[{name:'V'}],activityLog:[{at:1,title:'A'}],
    halls:[{id:'h',data:{assignments:{},assignmentLocks:{'1,1':true},areaLocks:['A','A']}}]
  }]
});
assert.deepEqual(normalizedAdvanced.projects[0].groupLocks,['G']);
assert.deepEqual(normalizedAdvanced.projects[0].halls[0].data.areaLocks,['A']);
assert.equal(normalizedAdvanced.projects[0].halls[0].data.assignmentLocks['1,1'],true);


const scenarioWs=normalizeWorkspace({
  activeProjectId:'p',
  projects:[{
    id:'p',activeHallId:'h',people:[],groupCatalog:[],
    scenarios:[{id:'s1',name:'תרחיש',at:1,project:{id:'nested',halls:[]}}],
    halls:[{id:'h',data:{assignments:{}}}]
  }]
});
assert.equal(scenarioWs.projects[0].scenarios.length,1,'workspace keeps saved scenarios');
assert.equal(scenarioWs.projects[0].scenarios[0].name,'תרחיש');
