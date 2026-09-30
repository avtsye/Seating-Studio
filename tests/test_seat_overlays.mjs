import assert from 'node:assert/strict';
import {removeBlockedCells} from '../src/seat-overlays.js';

const blocked=[{x:1,y:1},{x:2,y:2},{x:3,y:3}];
assert.deepEqual(removeBlockedCells(blocked,[{x:2,y:2}]),[{x:1,y:1},{x:3,y:3}],
  'erasing a blocked marker must remove only that overlay');
assert.deepEqual(removeBlockedCells(blocked,[{x:9,y:9}]),blocked,
  'erasing elsewhere must not mutate blocked markers');
assert.deepEqual(removeBlockedCells(blocked,[{x:1,y:1},{x:3,y:3}]),[{x:2,y:2}],
  'drag erase must remove every blocked overlay it crosses');
console.log('blocked-seat overlay tests passed');
