import assert from 'node:assert/strict';
import {exportPayload,buildReadonlyHtml,buildFindSeatHtml} from '../src/export-packages.js';

const project={
  id:'p1',
  name:'בדיקת פרויקט',
  note:'offline',
  settings:{numberBlockStep:1000,numberSeatStart:1,numberDirection:'ltr',blockOrder:'ltr'},
  people:[
    {id:'u1',internalId:'P-001',name:'אדם א',group:'קבוצה א'},
    {id:'u2',internalId:'P-002',name:'אדם ב',group:'קבוצה ב'}
  ],
  halls:[{
    id:'h1',name:'אולם א',
    data:{
      hall:{gridWidth:10,gridHeight:10},
      areas:[{id:'a1',name:'מרכז',type:'chair',cells:[{x:0,y:0},{x:1,y:0}]}],
      assignments:{'0,0':'u1'},
      blockedSeats:[]
    }
  }]
};

const payload=exportPayload(project);
assert.equal(payload.locations.u1.hallName,'אולם א');
assert.equal(payload.locations.u1.seatNumber,1001);

const view=buildReadonlyHtml(project);
assert.match(view,/<!doctype html>/i);
assert.ok(view.includes('בדיקת פרויקט'));
assert.ok(view.includes('אדם א'));
assert.ok(!/https?:\/\//i.test(view),'read-only export should not require external assets');

const finder=buildFindSeatHtml(project);
assert.match(finder,/<!doctype html>/i);
assert.ok(finder.includes('P-001'));
assert.ok(finder.includes('מצא את המקום שלך'));
assert.ok(!/https?:\/\//i.test(finder),'finder export should not require external assets');

console.log('export package tests passed');
