
/* TFF V7 Smart Experience Layer
   Non-destructive additive upgrade:
   - time/festival greetings
   - robot/LED AI assistant with voice
   - customer visual product search + gallery/camera resize
   - admin Festival & AI control center
   - coordinated theme application
*/
(function(){
'use strict';
const path=location.pathname.toLowerCase();
const isCustomer=!path.includes('admin.html')&&!path.includes('delivery.html');
const isAdmin=path.includes('admin.html');
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function getSB(){
  try{
    const c=window.TFF_SUPABASE||{};
    if(window.supabase?.createClient&&c.url&&c.publishableKey) return window.supabase.createClient(c.url,c.publishableKey);
  }catch(e){}
  return null;
}
async function getBranding(){
  const defaults={
    enabled:true, theme:'customer', greeting_enabled:true,
    morning:'শুভ সকাল! Tarakeswar Fresh Fish-এ আপনাকে স্বাগতম। আজ কী খুঁজছেন?',
    afternoon:'শুভ অপরাহ্ন! Tarakeswar Fresh Fish-এ আপনাকে স্বাগতম। কীভাবে সাহায্য করতে পারি?',
    evening:'শুভ সন্ধ্যা! Tarakeswar Fresh Fish-এ আপনাকে স্বাগতম। আজকের fresh stock দেখুন।',
    night:'শুভ রাত্রি! Tarakeswar Fresh Fish-এ আপনাকে স্বাগতম। আগামীকালের অর্ডার চাইলে এখনই বুক করুন।',
    festival_enabled:false, festival_name:'', festival_greeting:'', festival_start:'', festival_end:'',
    theme_accent:'', theme_navy:'', theme_bg:'', logo_url:'', splash_url:'', ai_avatar_url:'', banner_url:''
  };
  try{
    const sb=getSB();
    if(!sb) return defaults;
    const {data}=await sb.from('tff_ai_branding').select('*').eq('id',1).maybeSingle();
    return {...defaults,...(data||{})};
  }catch(e){return defaults}
}
function timeGreeting(b){
  if(b?.festival_enabled && b.festival_greeting && inRange(b.festival_start,b.festival_end)) return b.festival_greeting;
  const h=new Date().getHours();
  if(h<12)return b.morning;
  if(h<17)return b.afternoon;
  if(h<21)return b.evening;
  return b.night;
}
function inRange(a,b){
  if(!a&&!b)return false;
  const now=Date.now(), s=a?new Date(a).getTime():0, e=b?new Date(b).getTime():Infinity;
  return (!Number.isNaN(s)?now>=s:true)&&(!Number.isNaN(e)?now<=e:true);
}
function applyBranding(b){
  if(!b)return;
  const root=document.documentElement;
  if(b.theme_accent)root.style.setProperty('--green',b.theme_accent);
  if(b.theme_navy)root.style.setProperty('--navy',b.theme_navy);
  if(b.theme_bg)root.style.setProperty('--bg',b.theme_bg);
  if(isCustomer && b.logo_url){
    document.querySelectorAll('header img.logo,.logo').forEach(x=>x.src=b.logo_url);
  }
  if(b.banner_url && isCustomer){
    const hero=document.querySelector('.hero');
    if(hero && !hero.querySelector('.tff-festival-banner')){
      const im=document.createElement('img'); im.className='tff-festival-banner'; im.src=b.banner_url; im.alt='';
      im.style='width:100%;max-height:180px;object-fit:cover;border-radius:18px;margin:0 0 12px';
      hero.prepend(im);
    }
  }
  if(b.festival_name && isCustomer) document.title='Tarakeswar Fresh Fish • '+b.festival_name;
}
function addStyles(){
  if($('tffV7Style'))return;
  const s=document.createElement('style');s.id='tffV7Style';s.textContent=`
  .tff-v7-fab{position:fixed;right:14px;bottom:142px;width:62px;height:62px;border:0;border-radius:50%;z-index:10020;background:#071b34;color:#fff;box-shadow:0 8px 26px #0004;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .tff-v7-fab .led{position:absolute;right:6px;top:6px;width:10px;height:10px;border-radius:50%;background:#38ef93;box-shadow:0 0 10px #38ef93;animation:tffled 1.1s infinite}
  .tff-v7-fab img{width:44px;height:44px;border-radius:50%;object-fit:contain}.tff-v7-fab .robot{font-size:30px}
  @keyframes tffled{50%{opacity:.35;transform:scale(.75)}}
  .tff-v7-overlay{position:fixed;inset:0;background:#06132766;z-index:10030;display:none}
  .tff-v7-panel{position:absolute;right:12px;bottom:92px;width:min(430px,calc(100vw - 24px));max-height:72vh;background:#fff;border-radius:24px;box-shadow:0 20px 60px #0004;overflow:hidden}
  .tff-v7-head{background:linear-gradient(135deg,#071b34,#0b7e49);color:#fff;padding:13px 15px;display:flex;align-items:center;gap:10px}
  .tff-v7-avatar{width:42px;height:42px;border-radius:50%;object-fit:contain;background:#fff}.tff-v7-led{width:8px;height:8px;border-radius:50%;background:#43f59b;box-shadow:0 0 9px #43f59b}
  .tff-v7-chat{padding:12px;max-height:40vh;overflow:auto;background:#f6f8fb}.tff-v7-msg{padding:10px 12px;border-radius:15px;margin:7px 0;max-width:88%;line-height:1.45}.tff-v7-bot{background:#fff;border:1px solid #e4e9ef}.tff-v7-user{background:#dff7e9;margin-left:auto}.tff-v7-actions{display:flex;gap:7px;flex-wrap:wrap;padding:9px 12px}.tff-v7-input{display:flex;gap:7px;padding:10px;border-top:1px solid #e5e7eb}.tff-v7-input input{flex:1;padding:11px;border:1px solid #d7dde5;border-radius:12px}.tff-v7-input button{border:0;border-radius:12px;padding:10px 12px;font-weight:900}
  .tff-v7-visual{border-top:1px solid #e5e7eb;padding:10px 12px}.tff-v7-visual input{width:100%}.tff-v7-visual img{display:none;max-width:100%;max-height:150px;object-fit:contain;border-radius:12px;margin-top:8px}
  .tff-v7-speak{animation:tffSpeak .65s infinite alternate}.tff-v7-thinking{opacity:.55}@keyframes tffSpeak{to{transform:scale(1.06)}}
  .tff-v7-welcome{position:fixed;right:16px;bottom:215px;z-index:10019;background:#071b34;color:#fff;padding:10px 13px;border-radius:15px;max-width:290px;box-shadow:0 10px 30px #0003;font-weight:800}
  .tff-v7-admin-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.tff-v7-admin-grid input,.tff-v7-admin-grid textarea,.tff-v7-admin-grid select{width:100%;padding:10px;border:1px solid #d7dde5;border-radius:10px;font:inherit}.tff-v7-admin-grid textarea{min-height:70px}.tff-v7-full{grid-column:1/-1}
  @media(max-width:520px){.tff-v7-admin-grid{grid-template-columns:1fr}.tff-v7-fab{bottom:140px}.tff-v7-panel{bottom:84px}}
  `;
  document.head.appendChild(s);
}
async function resizeImage(file,max=1280,quality=.82){
  if(!file)return null;
  return new Promise((resolve,reject)=>{
    const img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      try{
        let w=img.naturalWidth,h=img.naturalHeight,scale=Math.min(1,max/Math.max(w,h));
        w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));
        const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);
        resolve(c.toDataURL('image/jpeg',quality));URL.revokeObjectURL(url);
      }catch(e){reject(e)}
    };img.onerror=()=>reject(Error('Image load failed'));img.src=url;
  });
}
async function visualSearch(dataUrl){
  const r=await fetch('/api/ai-visual-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image_data_url:dataUrl,products:(window.tffProducts||window.products||[]).slice(0,120).map(p=>({id:p.id,name:p.name,category:p.category,price:p.price,unit:p.unit,available:p.available!==false,description:p.description||''}))})});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Visual search unavailable');return d;
}
function speak(text){
  if(!('speechSynthesis'in window))return;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text).replace(/<[^>]*>/g,''));u.lang='bn-IN';u.rate=.96;u.pitch=1;u.onstart=()=>document.querySelector('.tff-v7-avatar')?.classList.add('tff-v7-speak');u.onend=()=>document.querySelector('.tff-v7-avatar')?.classList.remove('tff-v7-speak');speechSynthesis.speak(u)}catch(e){}
}
function initCustomer(b){
  addStyles();
  const fab=document.createElement('button');fab.className='tff-v7-fab';fab.id='tffV7Fab';fab.innerHTML='<span class="led"></span><span class="robot">🤖</span>';document.body.appendChild(fab);
  const overlay=document.createElement('div');overlay.className='tff-v7-overlay';overlay.id='tffV7Overlay';
  overlay.innerHTML=`<div class="tff-v7-panel" role="dialog" aria-label="AI Assistant">
    <div class="tff-v7-head"><img class="tff-v7-avatar" src="${esc(b.ai_avatar_url||'')}" onerror="this.style.display='none'"><span class="robot" style="${b.ai_avatar_url?'display:none':''}">🤖</span><div style="flex:1"><b>Tarakeswar AI Assistant</b><div style="font-size:12px"><span class="tff-v7-led"></span> Smart shopping assistant</div></div><button id="tffV7Close" style="background:none;border:0;color:#fff;font-size:22px">×</button></div>
    <div class="tff-v7-chat" id="tffV7Chat"></div>
    <div class="tff-v7-actions"><button id="tffV7Voice">🎤 Voice</button><button id="tffV7Visual">📸 Product Photo</button><button id="tffV7Stop">🔇 Stop Voice</button></div>
    <div class="tff-v7-visual" id="tffV7VisualBox" style="display:none"><b>📸 ছবি দিয়ে product খুঁজুন</b><input id="tffV7Photo" type="file" accept="image/*" capture="environment"><img id="tffV7Preview"></div>
    <div class="tff-v7-input"><input id="tffV7Input" placeholder="যেমন: আজকের fresh মাছ দেখাও"><button id="tffV7Send">Send</button></div>
  </div>`;
  document.body.appendChild(overlay);
  const chat=$('tffV7Chat'), input=$('tffV7Input');
  const add=(html,bot=true)=>{const d=document.createElement('div');d.className='tff-v7-msg '+(bot?'tff-v7-bot':'tff-v7-user');d.innerHTML=html;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;return d};
  const open=()=>{overlay.style.display='block';if(!chat.dataset.welcomed){chat.dataset.welcomed='1';const g=timeGreeting(b);add('🤖 '+esc(g));speak(g)}};
  // Smart first-open greeting: show a small robot welcome bubble, speak once, then disappear automatically.
  const welcomeText=timeGreeting(b);
  const welcome=document.createElement('div');
  welcome.className='tff-v7-welcome';
  welcome.id='tffV7Welcome';
  welcome.innerHTML='🤖 '+esc(welcomeText);
  document.body.appendChild(welcome);
  let welcomeTimer=setTimeout(()=>{welcome.remove()},7000);
  if(b.greeting_enabled!==false){
    setTimeout(()=>{
      try{speak(welcomeText)}catch(e){}
      setTimeout(()=>{if(document.getElementById('tffV7Welcome'))document.getElementById('tffV7Welcome').remove()},6000);
    },250);
  }
  welcome.onclick=()=>{clearTimeout(welcomeTimer);welcome.remove();open()};
  fab.onclick=()=>{if(welcome.parentNode)welcome.remove();open()};
  $('tffV7Close').onclick=()=>{overlay.style.display='none';speechSynthesis?.cancel?.()};
  overlay.addEventListener('click',e=>{if(e.target===overlay){overlay.style.display='none';speechSynthesis?.cancel?.()}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){overlay.style.display='none';speechSynthesis?.cancel?.()}});
  $('tffV7Stop').onclick=()=>speechSynthesis?.cancel?.();
  async function ask(q){
    add(esc(q),false);const wait=add('🤖 Thinking…');wait.classList.add('tff-v7-thinking');
    try{
      const r=await fetch('/api/ai-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,context:{products:(window.tffProducts||window.products||[]).slice(0,120),cart:window.tffCart||window.cart||[],profile:JSON.parse(localStorage.getItem('tff_profile')||'{}')}}});
      const d=await r.json();wait.remove();
      const text=d.text||d.error||'এই মুহূর্তে নিশ্চিত তথ্য পাওয়া গেল না।';
      add(esc(text).replace(/\n/g,'<br>'));speak(text);
      if(Array.isArray(d.actions)&&d.actions.length&&typeof window.addToCart==='function'){
        for(const a of d.actions){const p=(window.tffProducts||[]).find(x=>String(x.id)===String(a.product_id));if(p)window.addToCart(p.id,Number(a.quantity||1),a.preparation||'')}
      }
    }catch(e){wait.remove();const t='দুঃখিত, AI এখন সংযুক্ত নয়। তবে আমি catalog-এর নিশ্চিত তথ্যের বাইরে কোনো দাম বা stock বানিয়ে বলব না।';add(esc(t));speak(t)}
  }
  $('tffV7Send').onclick=()=>{const q=input.value.trim();if(q){input.value='';ask(q)}};
  input.addEventListener('keydown',e=>{if(e.key==='Enter')$('tffV7Send').click()});
  $('tffV7Voice').onclick=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert('এই browser-এ voice input support নেই।');return}
    const r=new SR();r.lang='bn-IN';r.interimResults=false;r.continuous=false;
    $('tffV7Voice').textContent='🎙️ শুনছি…';
    r.onresult=e=>{input.value=e.results[0][0].transcript;$('tffV7Send').click()};
    r.onerror=()=>{$('tffV7Voice').textContent='🎤 Voice'};
    r.onend=()=>{$('tffV7Voice').textContent='🎤 Voice'};
    try{r.start()}catch(e){$('tffV7Voice').textContent='🎤 Voice'}
  };
  $('tffV7Visual').onclick=()=>{$('tffV7VisualBox').style.display=$('tffV7VisualBox').style.display==='none'?'block':'none'};
  $('tffV7Photo').onchange=async e=>{
    const file=e.target.files?.[0];if(!file)return;const preview=$('tffV7Preview');preview.style.display='block';
    try{
      const data=await resizeImage(file,1280,.82);preview.src=data;
      add('📸 ছবি বিশ্লেষণ করছি…');
      const d=await visualSearch(data);
      const matches=Array.isArray(d.matches)?d.matches:[];
      if(!matches.length){add('ছবির সঙ্গে নিশ্চিতভাবে মিলে এমন product পাওয়া যায়নি।');return}
      add('ছবির সঙ্গে মিল পাওয়া product:<br>'+matches.slice(0,5).map(m=>`<button class="btn light" style="margin:4px" onclick="openProduct(${JSON.stringify(m.id)})">🛒 ${esc(m.name)}${m.price!=null?' • ₹'+Number(m.price).toFixed(0):''}</button>`).join(''));
    }catch(err){add('ছবি থেকে product শনাক্ত করা এখন সম্ভব হচ্ছে না। '+esc(err.message||''))}
  };
}
async function initAdmin(b){
  addStyles();
  const tabs=document.querySelector('.tabs');if(!tabs||$('tffV7AiBrandTab'))return;
  const btn=document.createElement('button');btn.id='tffV7AiBrandTab';btn.className='tab';btn.textContent='🤖 AI & Festival';tabs.appendChild(btn);
  const sec=document.createElement('section');sec.id='tffV7AiBrand';sec.className='section';sec.style.display='none';
  sec.innerHTML=`<div class="panel"><h2>🤖 AI Assistant + Festival Branding</h2><p class="muted">Customer AI-এর greeting, voice, avatar ও festival experience এক জায়গা থেকে control করুন।</p>
  <div class="tff-v7-admin-grid">
  <div><label>Morning</label><input id="v7Morning"></div><div><label>Afternoon</label><input id="v7Afternoon"></div>
  <div><label>Evening</label><input id="v7Evening"></div><div><label>Night</label><input id="v7Night"></div>
  <div><label>Festival Name</label><input id="v7Festival"></div><div><label>Festival Greeting</label><input id="v7FestGreeting"></div>
  <div><label>Start</label><input id="v7Start" type="datetime-local"></div><div><label>End</label><input id="v7End" type="datetime-local"></div>
  <div><label>Theme Accent</label><input id="v7Accent" placeholder="#b91c1c"></div><div><label>Theme Navy</label><input id="v7Navy" placeholder="#3b0a0a"></div>
  <div><label>Theme Background</label><input id="v7Bg" placeholder="#fff7ed"></div><div><label>Logo URL</label><input id="v7Logo"></div>
  <div><label>AI Avatar URL</label><input id="v7Avatar"></div><div><label>Festival Banner URL</label><input id="v7Banner"></div>
  <div class="tff-v7-full"><label>Festival Theme</label><select id="v7Theme"><option value="customer">Default</option><option value="durga-puja">Durga Puja</option><option value="kali-puja">Kali Puja</option><option value="independence">Independence Day</option></select></div>
  </div>
  <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn green" id="v7Save">💾 Save Branding</button><button class="btn light" id="v7Preview">👁️ Preview Greeting</button><span id="v7Out" class="muted"></span></div></div>`;
  document.querySelector('.wrap')?.appendChild(sec);
  btn.onclick=()=>{document.querySelectorAll('.section').forEach(x=>x.style.display='none');sec.style.display='block'};
  const vals={morning:b.morning,afternoon:b.afternoon,evening:b.evening,night:b.night,festival:b.festival_name,festGreeting:b.festival_greeting,start:b.festival_start?.slice(0,16)||'',end:b.festival_end?.slice(0,16)||'',accent:b.theme_accent,navy:b.theme_navy,bg:b.theme_bg,logo:b.logo_url,avatar:b.ai_avatar_url,banner:b.banner_url,theme:b.theme||'customer'};
  Object.entries(vals).forEach(([k,v])=>{const el=$('v7'+k[0].toUpperCase()+k.slice(1));if(el)el.value=v||''});
  $('v7Preview').onclick=()=>{const t=timeGreeting({...b,festival_enabled:true,festival_greeting:$('v7FestGreeting').value,festival_start:$('v7Start').value,festival_end:$('v7End').value,morning:$('v7Morning').value,afternoon:$('v7Afternoon').value,evening:$('v7Evening').value,night:$('v7Night').value});alert(t)};
  $('v7Save').onclick=async()=>{
    const sb=getSB();if(!sb){$('v7Out').textContent='❌ Supabase config নেই';return}
    const payload={id:1,morning:$('v7Morning').value,afternoon:$('v7Afternoon').value,evening:$('v7Evening').value,night:$('v7Night').value,festival_name:$('v7Festival').value,festival_greeting:$('v7FestGreeting').value,festival_start:$('v7Start').value||null,festival_end:$('v7End').value||null,festival_enabled:!!$('v7FestGreeting').value,theme:$('v7Theme').value,theme_accent:$('v7Accent').value,theme_navy:$('v7Navy').value,theme_bg:$('v7Bg').value,logo_url:$('v7Logo').value,splash_url:'',ai_avatar_url:$('v7Avatar').value,banner_url:$('v7Banner').value};
    const {error}=await sb.from('tff_ai_branding').upsert(payload);$('v7Out').textContent=error?'❌ '+error.message:'✅ Saved. Customer app next open-এ theme/greeting পাবে।';
  };
}
async function boot(){
  if(!isCustomer&&!isAdmin)return;
  addStyles();
  const b=await getBranding();applyBranding(b);
  if(isCustomer)initCustomer(b);
  if(isAdmin)initAdmin(b);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));else setTimeout(boot,900);
})();
