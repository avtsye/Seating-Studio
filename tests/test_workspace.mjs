import assert from 'node:assert/strict';
import {assignedBeforeHall,remainingPeopleForHall,removePersonFromOtherHalls,normalizeWorkspace,duplicatePeopleAcrossHalls,normalizeGroupRouting,groupsForHall,unroutedGroups,personAllowedInHall,eligiblePeopleForHall,splitGroupAcrossHalls,splitHallForPerson} from '../src/workspace.js';

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
