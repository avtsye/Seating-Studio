import assert from 'node:assert/strict';
import {seatStorageKey,migrateAssignments,assignmentDisplayEntries,assignedSeatNumber,sanitizeAssignments} from '../src/assignment-store.js';

const seats=[
  {number:1001,cell:{x:4,y:2}},
  {number:1002,cell:{x:5,y:2}},
  {number:1003,cell:{x:6,y:2}}
];

assert.equal(seatStorageKey(seats[1]),'5,2');
assert.deepEqual(
  migrateAssignments({'1002':'p2'},seats),
  {'5,2':'p2'},
  'legacy numeric assignments must migrate to physical seat coordinates'
);
assert.deepEqual(
  migrateAssignments({'5,2':'p2'},seats),
  {'5,2':'p2'},
  'coordinate assignments must stay stable'
);
const renumbered=[
  {number:2007,cell:{x:4,y:2}},
  {number:2008,cell:{x:5,y:2}},
  {number:2009,cell:{x:6,y:2}}
];
assert.equal(
  assignedSeatNumber({'5,2':'p2'},renumbered,'p2'),
  '2008',
  'assignment must remain on the same physical seat when display numbering changes'
);
assert.deepEqual(
  assignmentDisplayEntries({'5,2':'p2'},renumbered),
  [['2008','p2']]
);
console.log('assignment-store tests passed');
