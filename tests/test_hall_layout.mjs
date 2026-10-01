import assert from 'node:assert/strict';
import {fitHallToContent} from '../src/hall-layout.js';

const result=fitHallToContent({
  hall:{gridWidth:100,gridHeight:80},
  areas:[{id:'a',cells:[{x:20,y:10},{x:21,y:10},{x:20,y:11},{x:21,y:11}]}],
  blockedSeats:[{x:21,y:11}],
  assignments:{'20,10':'p1','21,10':'p2'},
  padding:1
});
assert.equal(result.changed,true);
assert.equal(result.shiftX,19);
assert.equal(result.shiftY,9);
assert.equal(result.hall.gridWidth,10);
assert.equal(result.hall.gridHeight,10);
assert.deepEqual(result.areas[0].cells,[{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}]);
assert.deepEqual(result.blockedSeats,[{x:2,y:2}]);
assert.deepEqual(result.assignments,{'1,1':'p1','2,1':'p2'});

const empty=fitHallToContent({
  hall:{gridWidth:40,gridHeight:28},
  areas:[],
  blockedSeats:[],
  assignments:{}
});
assert.equal(empty.changed,false);
assert.equal(empty.hall.gridWidth,40);
assert.equal(empty.hall.gridHeight,28);

console.log('hall layout tests passed');

const edge=fitHallToContent({
  hall:{gridWidth:40,gridHeight:28},
  areas:[{id:'edge',cells:[{x:0,y:0},{x:39,y:27}]}],
  blockedSeats:[],
  assignments:{},
  padding:1
});
assert.equal(edge.hall.gridWidth,40,'fit-grid must never enlarge width just to add padding');
assert.equal(edge.hall.gridHeight,28,'fit-grid must never enlarge height just to add padding');
