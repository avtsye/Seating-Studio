import assert from 'node:assert/strict';
import {assignedBeforeHall,remainingPeopleForHall,removePersonFromOtherHalls,normalizeWorkspace,duplicatePeopleAcrossHalls,normalizeGroupRouting,groupsForHall,unroutedGroups} from '../src/workspace.js';

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
