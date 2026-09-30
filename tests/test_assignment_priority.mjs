import assert from 'node:assert/strict';
import {seatPriorityParts,compareSeatPriority,windowPriority,compareWindowPriority} from '../src/assignment-priority.js';

const hall={gridWidth:20};
const noStage=[];
const s=(x,y)=>({cell:{x,y}});

// Forward position is primary.
assert.ok(compareSeatPriority(s(0,1),s(9,2),hall,noStage)<0,'front row must beat a more central seat one row behind');
// Center decides only when equally forward.
assert.ok(compareSeatPriority(s(9,2),s(0,2),hall,noStage)<0,'center must win within the same forward depth');

// A stage defines the front edge.
const topStage=[{type:'stage',cells:[{x:0,y:0},{x:10,y:0}]}];
assert.ok(compareSeatPriority(s(9,1),s(9,3),hall,topStage)<0,'nearer to a top stage must be better');
const bottomStage=[{type:'stage',cells:[{x:0,y:10},{x:10,y:10}]}];
assert.ok(compareSeatPriority(s(9,9),s(9,7),hall,bottomStage)<0,'nearer to a bottom stage must be better');

// Group/window comparison is lexicographic: total forward depth first, then center.
const wFront=windowPriority([s(0,1),s(19,1)],hall,noStage);
const wBackCenter=windowPriority([s(9,2),s(10,2)],hall,noStage);
assert.ok(compareWindowPriority(wFront,wBackCenter)<0,'a group placed further forward must win even if another option is more central');

console.log('assignment priority tests passed');
