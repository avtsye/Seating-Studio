import assert from 'node:assert/strict';
import {assignedBeforeHall,remainingPeopleForHall,removePersonFromOtherHalls,normalizeWorkspace,duplicatePeopleAcrossHalls} from '../src/workspace.js';

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
