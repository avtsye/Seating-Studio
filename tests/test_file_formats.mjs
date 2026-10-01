import assert from 'node:assert/strict';
import {buildXlsx,makeZip} from '../src/file-formats.js';

const xlsx=buildXlsx({
  'מוזמנים':[['מזהה','שם','קבוצה'],['P-1','אברהם','א']],
  'אולמות':[['אולם','מקומות'],['אולם 1',120]]
});
assert.ok(xlsx instanceof Uint8Array);
assert.ok(xlsx.length>1000);
assert.equal(xlsx[0],0x50);
assert.equal(xlsx[1],0x4b);

const zip=makeZip([['hello.txt',new TextEncoder().encode('hello')]]);
assert.equal(zip[0],0x50);
assert.equal(zip[1],0x4b);
console.log('file format tests passed');
