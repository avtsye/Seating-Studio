import assert from 'node:assert/strict';
import {setBlockedCells} from '../src/seat-overlays.js';

const seats=[{x:0,y:0},{x:1,y:0},{x:2,y:0}];

assert.deepEqual(setBlockedCells([{x:1,y:0}],[{x:1,y:0}],seats,false),[],
  'explicit unblock must remove an existing blocked seat');
assert.deepEqual(setBlockedCells([],[{x:1,y:0}],seats,true),[{x:1,y:0}],
  'explicit block must add an available physical seat');
assert.deepEqual(setBlockedCells([{x:1,y:0}],[{x:1,y:0},{x:2,y:0}],seats,false),[],
  'unblock mode must be idempotent across a drag');
assert.deepEqual(setBlockedCells([],[{x:9,y:9}],seats,true),[],
  'non-seat cells must be ignored');
assert.deepEqual(setBlockedCells([{x:1,y:0}],[{x:1,y:0}],seats,true),[{x:1,y:0}],
  'blocking an already blocked seat must not duplicate the marker');

console.log('blocked-seat state tests passed');
