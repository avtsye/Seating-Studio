import assert from 'node:assert/strict';
import {seatPriorityParts,seatPriorityScore,compareSeatPriority,windowPriority,compareWindowPriority,horizontalSeatWindows} from '../src/assignment-priority.js';

const hall={gridWidth:12};
const s=(x,y,block=1)=>({cell:{x,y},block});
const fullSeats=[{type:'chair',cells:Array.from({length:8},(_,y)=>Array.from({length:12},(_,x)=>({x,y}))).flat()}];

// Default shape: front has 2/3 weight and center has 1/3 weight.
// A central seat can still beat an extreme-edge seat, but front matters twice as much.
assert.ok(seatPriorityScore(s(5,2),hall,fullSeats)<seatPriorityScore(s(0,2),hall,fullSeats),
  'center must materially affect priority within the same forward depth');

// One row back costs the same as moving two columns away from center.
const pA=seatPriorityScore(s(5,2),hall,fullSeats);
const pB=seatPriorityScore(s(3,1),hall,fullSeats);
assert.equal(pA,pB,'one row back should equal two columns away from center');

// A seat next to an aisle or wall gets a 1.5-point improvement, but the bonus is not cumulative.
const aisleAreas=[...fullSeats,{type:'aisle',cells:[{x:4,y:3}]}];
const plain=seatPriorityScore(s(6,3),hall,aisleAreas);
const byAisle=seatPriorityScore(s(5,3),hall,aisleAreas);
assert.equal(seatPriorityParts(s(5,3),hall,aisleAreas).edgeBonus,1.5,'aisle-adjacent seat should get a 1.5 bonus');
assert.equal(plain-byAisle,1.5,'aisle bonus should improve an otherwise equivalent seat by exactly 1.5');

const wallSeat=seatPriorityParts(s(0,3),hall,fullSeats);
assert.equal(wallSeat.edgeBonus,1.5,'wall-adjacent seat should get a 1.5 bonus');

const wallAndAisle=[...fullSeats,{type:'aisle',cells:[{x:1,y:3}]}];
assert.equal(seatPriorityParts(s(0,3),hall,wallAndAisle).edgeBonus,1.5,'wall and aisle together should still give only one 1.5 bonus');

// Symmetry around the center.
assert.equal(seatPriorityScore(s(4,2),hall,fullSeats),seatPriorityScore(s(7,2),hall,fullSeats),
  'left and right positions at the same center distance should be equal');

// Stage still defines which direction is "front".
const topStage=[{type:'stage',cells:[{x:0,y:0},{x:11,y:0}]},...fullSeats];
assert.ok(compareSeatPriority(s(5,1),s(5,3),hall,topStage)<0,'nearer to a top stage must be better');
const bottomStage=[{type:'stage',cells:[{x:0,y:10},{x:11,y:10}]},...fullSeats];
assert.ok(compareSeatPriority(s(5,9),s(5,7),hall,bottomStage)<0,'nearer to a bottom stage must be better');

// Group windows use the same combined front+center score.
const centeredRow=windowPriority([s(5,2),s(6,2)],hall,fullSeats);
const edgeRow=windowPriority([s(0,2),s(1,2)],hall,fullSeats);
assert.ok(compareWindowPriority(centeredRow,edgeRow)<0,
  'center should materially affect group placement at the same forward depth');

// Windows must stay inside one physical row and cannot wrap at row boundaries.
const seats=[s(0,1),s(1,1),s(2,1),s(0,2),s(1,2),s(2,2)];
const wins=horizontalSeatWindows(seats,2);
assert.equal(wins.length,4,'two rows of three seats should produce four horizontal windows of two');
assert.ok(wins.every(w=>w[0].cell.y===w[1].cell.y),'a group window must never cross rows');
assert.ok(wins.every(w=>w[1].cell.x===w[0].cell.x+1),'group seats must be horizontally adjacent');

const gapWins=horizontalSeatWindows([s(0,1),s(1,1),s(3,1),s(4,1)],3);
assert.equal(gapWins.length,0,'a gap must prevent a false contiguous group window');

console.log('assignment priority tests passed');
