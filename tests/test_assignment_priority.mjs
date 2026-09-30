import assert from 'node:assert/strict';
import {seatPriorityParts,compareSeatPriority,windowPriority,compareWindowPriority,horizontalSeatWindows} from '../src/assignment-priority.js';

const hall={gridWidth:40};
const s=(x,y,block=1)=>({cell:{x,y},block});

// No stage: top is front. Forward position is primary.
assert.ok(compareSeatPriority(s(0,1),s(19,2),hall,[])<0,'front row must beat a more central seat one row behind');
// Center uses the actual seating footprint, not unused grid margins.
const offCenterSeats=[{type:'chair',cells:[{x:20,y:1},{x:21,y:1},{x:22,y:1},{x:23,y:1},{x:24,y:1}]}];
assert.ok(compareSeatPriority(s(22,1),s(10,1),hall,offCenterSeats)<0,'center should follow the seating footprint center');

// A stage defines which side is front.
const topStage=[{type:'stage',cells:[{x:0,y:0},{x:10,y:0}]},{type:'chair',cells:[{x:1,y:2},{x:2,y:3}]}];
assert.ok(compareSeatPriority(s(5,1),s(5,3),hall,topStage)<0,'nearer to a top stage must be better');
const bottomStage=[{type:'stage',cells:[{x:0,y:10},{x:10,y:10}]},{type:'chair',cells:[{x:1,y:7},{x:2,y:8}]}];
assert.ok(compareSeatPriority(s(5,9),s(5,7),hall,bottomStage)<0,'nearer to a bottom stage must be better');

// Group/window comparison: forward dominates center.
const wFront=windowPriority([s(0,1),s(1,1)],hall,[]);
const wBackCenter=windowPriority([s(19,2),s(20,2)],hall,[]);
assert.ok(compareWindowPriority(wFront,wBackCenter)<0,'a group further forward must win even if another option is more central');

// Windows must stay inside one physical row and cannot wrap at row boundaries.
const seats=[s(0,1),s(1,1),s(2,1),s(0,2),s(1,2),s(2,2)];
const wins=horizontalSeatWindows(seats,2);
assert.equal(wins.length,4,'two rows of three seats should produce four horizontal windows of two');
assert.ok(wins.every(w=>w[0].cell.y===w[1].cell.y),'a group window must never cross rows');
assert.ok(wins.every(w=>w[1].cell.x===w[0].cell.x+1),'group seats must be horizontally adjacent');

// A blocked/missing seat breaks a run.
const gapWins=horizontalSeatWindows([s(0,1),s(1,1),s(3,1),s(4,1)],3);
assert.equal(gapWins.length,0,'a gap must prevent a false contiguous group window');

console.log('assignment priority tests passed');
