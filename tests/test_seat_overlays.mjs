import assert from 'node:assert/strict';
import {removeBlockedCells,removeBlockedCell,toggleBlockedCells} from '../src/seat-overlays.js';

const blocked=[{x:1,y:1},{x:2,y:2},{x:3,y:3}];
assert.deepEqual(removeBlockedCells(blocked,[{x:2,y:2}]),[{x:1,y:1},{x:3,y:3}],
  'erasing a blocked marker must remove only that overlay');
assert.deepEqual(removeBlockedCells(blocked,[{x:9,y:9}]),blocked,
  'erasing elsewhere must not mutate blocked markers');
assert.deepEqual(removeBlockedCells(blocked,[{x:1,y:1},{x:3,y:3}]),[{x:2,y:2}],
  'drag erase must remove every blocked overlay it crosses');
console.log('blocked-seat overlay tests passed');

const physicalSeats=[{x:0,y:0},{x:1,y:0},{x:2,y:0}];
const blockedOne=[{x:1,y:0}];
assert.deepEqual(removeBlockedCell(blockedOne,{x:1,y:0}),[],
  'unblocking must remove the blocked definition itself');
assert.deepEqual(physicalSeats,[{x:0,y:0},{x:1,y:0},{x:2,y:0}],
  'unblocking must leave the physical seat list unchanged');

const seats=[{x:0,y:0},{x:1,y:0},{x:2,y:0}];
assert.deepEqual(toggleBlockedCells([],[{x:1,y:0}],seats),[{x:1,y:0}],
  'toggle on an unblocked seat must mark it blocked');
assert.deepEqual(toggleBlockedCells([{x:1,y:0}],[{x:1,y:0}],seats),[],
  'toggle on an already blocked seat must remove the blocked definition');
assert.deepEqual(toggleBlockedCells([{x:1,y:0}],[{x:0,y:0},{x:1,y:0}],seats),[{x:0,y:0}],
  'a drag toggles each covered seating cell independently');
assert.deepEqual(toggleBlockedCells([],[{x:9,y:9}],seats),[],
  'non-seat cells must be ignored by the blocked toggle');
