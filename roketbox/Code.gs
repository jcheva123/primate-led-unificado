// Pegá este código en Extensiones → Apps Script de una hoja NUEVA.
const ROCKET_TOKEN = "80eT0uaz2jz302pw5Xc4V_aKUWU-CiwS";
function setupRocket() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Ejecutá desde Apps Script vinculado a tu Google Sheet.');
  PropertiesService.getScriptProperties().setProperty('ROCKET_SHEET_ID', ss.getId());
  rocketSheet_();
}
function rocketSheet_() {
  const id=PropertiesService.getScriptProperties().getProperty('ROCKET_SHEET_ID');
  if(!id) throw new Error('Ejecutá setupRocket primero.');
  const ss=SpreadsheetApp.openById(id);
  let s=ss.getSheetByName('Rocket');
  if(!s){s=ss.insertSheet('Rocket');s.appendRow(['Fecha','Gym','Box','Caminata','Sesiones Box (JSON)','Actualizado']);s.setFrozenRows(1);s.getRange('A:A').setNumberFormat('@');s.getRange('A1:F1').setBackground('#263b20').setFontColor('#d0fc73').setFontWeight('bold');s.autoResizeColumns(1,6);}
  return s;
}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON)}
function read_(s){const days={};if(s.getLastRow()>1)s.getRange(2,1,s.getLastRow()-1,6).getValues().forEach(r=>{const k=r[0] instanceof Date?Utilities.formatDate(r[0],'America/Argentina/Buenos_Aires','yyyy-MM-dd'):String(r[0]);if(!/^\d{4}-\d{2}-\d{2}$/.test(k))return;let sessions=[];try{sessions=JSON.parse(r[4]||'[]')}catch{}days[k]={gym:r[1]===true,box:r[2]===true,walk:r[3]===true};if(sessions.length)days[k].sessions=sessions;});return {version:1,days};}
function doGet(e){try{if(e.parameter.token!==ROCKET_TOKEN)throw new Error('Acceso inválido');return json_({ok:true,data:read_(rocketSheet_())})}catch(err){return json_({ok:false,error:err.message})}}
function doPost(e){const lock=LockService.getScriptLock();try{
if(e.parameter.token!==ROCKET_TOKEN)throw new Error('Acceso inválido');
if(e.parameter.action!=='patch')throw new Error('Acción inválida');
const patch=JSON.parse(e.parameter.days);if(!patch||Array.isArray(patch)||typeof patch!=='object')throw new Error('Datos inválidos');
for(const [k,v] of Object.entries(patch)){if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||v!==null&&(!v||typeof v!=='object'||['gym','box','walk'].some(t=>typeof v[t]!=='boolean')||v.sessions&&(!Array.isArray(v.sessions)||v.sessions.length>200||v.sessions.some(x=>!x||typeof x.id!=='string'||!Number.isFinite(x.seconds)||x.seconds<0||!Number.isInteger(x.rounds)||x.rounds<1||!Number.isFinite(x.work)||x.work<=0||!Number.isFinite(x.rest)||x.rest<0))))throw new Error('Registro inválido');}
lock.waitLock(20000);const s=rocketSheet_();for(const [k,v] of Object.entries(patch)){let row=0;if(s.getLastRow()>1){const rows=s.getRange(2,1,s.getLastRow()-1,1).getDisplayValues();row=rows.findIndex(r=>r[0]===k)+2;if(row===1)row=0}if(v===null){if(row)s.deleteRow(row);continue}const values=[[k,!!v.gym,!!v.box,!!v.walk,JSON.stringify(v.sessions||[]),new Date()]];const dest=row||s.getLastRow()+1;s.getRange(dest,1).setNumberFormat('@');s.getRange(dest,1,1,6).setValues(values);}
SpreadsheetApp.flush();return json_({ok:true});
}catch(err){return json_({ok:false,error:err.message})}finally{if(lock.hasLock())lock.releaseLock()}}
