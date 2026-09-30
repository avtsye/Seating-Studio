import assert from 'node:assert/strict';
import {seatPriorityParts,seatPriorityScore,compareSeatPriority,windowPriority,compareWindowPriority,horizontalSeatWindows} from '../src/assignment-priority.js';

const hall={gridWidth:12};
const s=(x,y,block=1)=>({cell:{x,y},block});
const fullSeats=[{type:'chair',cells:Array.from({length:8},(_,y)=>Array.from({length:12},(_,x)=>({x,y}))).flat()}];

// Default shape: front has 2/3 weight and center has 1/3 weight.
// A central seat can still beat an extreme-edge seat, but front matters twice as much.
assert.ok(seatPriorityScore(s(5,3),hall,fullSeats)<seatPriorityScore(s(0,0),hall,fullSeats),
  'center must materially affect priority, not only break ties');

// One row back costs the same as moving two columns away from center.
const pA=seatPriorityScore(s(5,2),hall,fullSeats);
const pB=seatPriorityScore(s(3,1),hall,fullSeats);
assert.equal(pA,pB,'one row back should equal two columns away from center');

// Symmetry around the center.
assert.equal(seatPriorityScore(s(4,2),hall,fullSeats),seatPriorityScore(s(7,2),hall,fullSeats),
  'left and right positions at the same center distance should be equal');

// Stage still defines which direction is "front".
const topStage=[{type:'stage',cells:[{x:0,y:0},{x:11,y:0}]},...fullSeats];
assert.ok(compareSeatPriority(s(5,1),s(5,3),hall,topStage)<0,'nearer to a top stage must be better');
const bottomStage=[{type:'stage',cells:[{x:0,y:10},{x:11,y:10}]},...fullSeats];
assert.ok(compareSeatPriority(s(5,9),s(5,7),hall,bottomStage)<0,'nearer to a bottom stage must be better');

// Group windows use the same combined front+center score.
const centeredBack=windowPriority([s(5,2),s(6,2)],hall,fullSeats);
const edgeFront=windowPriority([s(0,0),s(1,0)],hall,fullSeats);
assert.ok(compareWindowPriority(centeredBack,edgeFront)<0,
  'center should still materially affect group placement despite stronger front weight');

// Windows must stay inside one physical row and cannot wrap at row boundaries.
const seats=[s(0,1),s(1,1),s(2,1),s(0,2),s(1,2),s(2,2)];
const wins=horizontalSeatWindows(seats,2);
assert.equal(wins.length,4,'two rows of three seats should produce four horizontal windows of two');
assert.ok(wins.every(w=>w[0].cell.y===w[1].cell.y),'a group window must never cross rows');
assert.ok(wins.every(w=>w[1].cell.x===w[0].cell.x+1),'group seats must be horizontally adjacent');

const gapWins=horizontalSeatWindows([s(0,1),s(1,1),s(3,1),s(4,1)],3);
assert.equal(gapWins.length,0,'a gap must prevent a false contiguous group window');

console.log('assignment priority tests passed');
