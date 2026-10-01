import { chromium } from 'playwright';

const base='http://127.0.0.1:8000';
async function waitForServer(){
  for(let i=0;i<50;i++){
    try{const r=await fetch(base+'/');if(r.ok)return}catch{}
    await new Promise(r=>setTimeout(r,200));
  }
  throw new Error('local server did not start');
}
function watch(page,label){
  const errors=[];
  page.on('pageerror',e=>errors.push(label+' pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(label+' console: '+m.text())});
  return errors;
}
await waitForServer();
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(()=>{
    localStorage.setItem('seating-studio-onboarding-v1','done');
    localStorage.setItem('seating-studio-whats-new-2026-10','seen');
  });

  const page=await context.newPage();
  const errors=watch(page,'main');
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.waitForSelector('#viewport');
  await page.waitForSelector('#modeBuild.active');
  if(errors.length)throw new Error(errors.join('\n'));

  await page.click('#modeAssign');
  await page.waitForSelector('#modeAssign.active');
  await page.click('#settingsButton');
  await page.waitForSelector('#settingsDialog[open]');
  await page.fill('#shortcutSearch','q');
  await page.click('#saveSettings');
  await page.waitForSelector('#settingsDialog',{state:'hidden'});

  await page.click('#modeResult');
  await page.waitForSelector('#modeResult.active');
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('#modeResult.active');
  if(errors.length)throw new Error(errors.join('\n'));

  const kiosk=await context.newPage();
  const kioskErrors=watch(kiosk,'kiosk');
  await kiosk.goto(base+'/?kiosk=1',{waitUntil:'networkidle'});
  await kiosk.waitForSelector('body.kiosk-mode');
  await kiosk.waitForSelector('#kioskExitBar:not(.hidden)');
  if(kioskErrors.length)throw new Error(kioskErrors.join('\n'));

  const offline=await context.newPage();
  const offlineErrors=watch(offline,'offline');
  await offline.goto(base+'/dist/Seating-Studio-Offline.html',{waitUntil:'networkidle'});
  await offline.waitForSelector('#viewport');
  await offline.click('#modeAssign');
  await offline.waitForSelector('#modeAssign.active');
  if(offlineErrors.length)throw new Error(offlineErrors.join('\n'));

  console.log('browser smoke tests passed');
} finally {
  await browser.close();
}
