/* Tarakeswar Fresh Fish V6 — single runtime bundle. Legacy feature layers are loaded once, in compatibility order. */

/* ===== SOURCE: master-v4.js ===== */

/* Tarakeswar Fresh Fish — Master V4 feature layer.
   WhatsApp Cloud API and real Web Push stay optional until secrets are added.
   This file intentionally works without those secrets.
*/
(function(){
'use strict';
const isCustomer=!!document.getElementById('grid')&&!!document.getElementById('productModal');
const isAdmin=!!document.getElementById('gate')&&!!document.getElementById('orderList')&&!!document.getElementById('runBannerBtn');
const isDelivery=!!document.getElementById('orders')&&!!document.getElementById('gpsPanel')&&location.pathname.includes('delivery');
const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function addStyle(){if(document.getElementById('tff-v4-css'))return;const l=document.createElement('link');l.id='tff-v4-css';l.rel='stylesheet';l.href='/master-v4.css';document.head.appendChild(l)}
function appUrl(file){return location.origin+(file?'/'+file:'/');}
function safeAlert(t){try{alert(t)}catch{}}
function getCfg(){return window.TFF_SUPABASE||{}}

function qrInto(holder,text){
  if(!holder)return;
  holder.innerHTML='';
  if(window.QRCode){try{new QRCode(holder,{text,width:210,height:210,correctLevel:QRCode.CorrectLevel.M});return true}catch(e){}}
  const img=document.createElement('img');img.alt='QR';img.width=210;img.height=210;img.src='https://api.qrserver.com/v1/create-qr-code/?size=210x210&data='+encodeURIComponent(text);holder.appendChild(img);return false;
}
function downloadQR(holder,name){const c=holder?.querySelector('canvas');if(c){const a=document.createElement('a');a.download=name+'.png';a.href=c.toDataURL('image/png');a.click();return}const img=holder?.querySelector('img');if(img&&img.src){const a=document.createElement('a');a.download=name+'.png';a.href=img.src;a.target='_blank';a.click()}}

window.sendCustomerPushServer=async function(title,body,url='/'){try{const r=await fetch((window.TFF_API_BASE||'')+'/api/send-push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,body,url})});const d=await r.json().catch(()=>({}));return d}catch(e){console.warn('push automation',e);return {ok:false,error:e.message}}};
function customerUI(){
  const fab=document.createElement('button');fab.className='tff-ai-fab';fab.id='tffAiFab';fab.innerHTML='🤖 AI Help<small>Voice + Visual Search</small>';fab.onclick=()=>openAI();document.body.appendChild(fab);
  const modal=document.createElement('div');modal.className='modal tff-ai-modal';modal.id='tffAiModal';modal.innerHTML=`<div class="modalCard"><div class="modalHead"><div><h2>🤖 Fresh AI Assistant</h2><div class="muted">Product খুঁজুন, budget অনুযায়ী সাজেশন নিন, voice-এ বলুন বা ছবি দিয়ে similar product দেখুন।</div></div><button class="btn light" onclick="window.closeAI()">✕</button></div><div class="tff-ai-tabs"><button id="aiChatTab" class="active" onclick="window.aiTab('chat')">💬 Assistant</button><button id="aiVoiceTab" onclick="window.aiTab('voice')">🎙️ Voice</button><button id="aiVisualTab" onclick="window.aiTab('visual')">📷 Photo Search</button></div><div id="aiChatPane"><div id="tffChat" class="tff-chat"></div><div class="tff-ai-input"><input id="tffAiInput" placeholder="যেমন: ৪ জনের জন্য ৫০০ টাকার মাছ চাই"><button class="btn navy" onclick="window.aiAsk()">Send</button></div></div><div id="aiVoicePane" style="display:none"><div class="tff-visual"><h3>🎙️ কথা বলে খুঁজুন</h3><p class="muted">Chrome Android-এ বাংলা voice input থাকলে সরাসরি বলুন।</p><button class="btn green" onclick="window.startAIVoice()">🎙️ Start Listening</button><div id="tffVoiceText" class="notice" style="margin-top:12px">Voice result এখানে দেখাবে।</div></div></div><div id="aiVisualPane" style="display:none"><div class="tff-visual"><h3>📷 Similar Product Search</h3><p class="muted">আপনার ফোনের ছবি দিন। Catalog-এর product image-এর সঙ্গে visual similarity match করা হবে।</p><input id="tffVisualInput" type="file" accept="image/*" capture="environment" onchange="window.runVisualSearch(this.files[0])"><div id="tffVisualPreview"></div><div id="tffMatches" class="tff-match-grid"></div></div></div></div>`;document.body.appendChild(modal);
  window.openAI=()=>{modal.classList.add('show');if(!document.getElementById('tffChat').children.length)addBot('নমস্কার! 👋 আমি আপনার Fresh AI Assistant। মাছ/চিকেন, budget, family size বা product name বলুন।');document.getElementById('tffAiInput')?.focus()};
  window.closeAI=()=>modal.classList.remove('show');
  window.aiTab=(tab)=>{['chat','voice','visual'].forEach(x=>{document.getElementById('ai'+x.charAt(0).toUpperCase()+x.slice(1)+'Tab')?.classList.toggle('active',x===tab);document.getElementById('ai'+x.charAt(0).toUpperCase()+x.slice(1)+'Pane').style.display=x===tab?'block':'none'})};
  window.aiAsk=()=>{const i=document.getElementById('tffAiInput'),q=(i.value||'').trim();if(!q)return;addUser(q);i.value='';setTimeout(()=>addBot(aiReply(q)),80)};
  document.getElementById('tffAiInput').addEventListener('keydown',e=>{if(e.key==='Enter')window.aiAsk()});
  window._tffSpeakReplies=true;window.startAIVoice=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){safeAlert('এই browser-এ Voice Recognition নেই। Chrome Android ব্যবহার করুন।');return}const r=new SR();r.lang='bn-IN';r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>{const t=e.results?.[0]?.[0]?.transcript||'';document.getElementById('tffVoiceText').textContent='আপনি বলেছেন: '+t;document.getElementById('tffAiInput').value=t;window.aiTab('chat');window.aiAsk()};r.onerror=e=>document.getElementById('tffVoiceText').textContent='Voice error: '+(e.error||'unknown');r.start()};
  window.runVisualSearch=async(file)=>{const box=document.getElementById('tffMatches');if(!file){box.innerHTML='';return}box.innerHTML='<div class="muted">🔎 Photo analyze হচ্ছে...</div>';const prev=document.getElementById('tffVisualPreview');prev.innerHTML='<img style="width:110px;height:110px;object-fit:cover;border-radius:12px" src="'+URL.createObjectURL(file)+'">';try{const target=await imageFeatures(file);const arr=(function(){try{return products||[]}catch(e){return []}})().filter(p=>p.image_url);const scored=[];for(const p of arr.slice(0,60)){try{const f=await imageFeatures(p.image_url,true);scored.push({p,score:similarity(target,f)})}catch(e){}}scored.sort((a,b)=>b.score-a.score);const top=scored.slice(0,6);if(!top.length){box.innerHTML='<div class="notice">Product image match করা যায়নি। Product name দিয়ে Assistant-এ খুঁজুন।</div>';return}box.innerHTML=top.map(x=>`<div class="tff-match-card" onclick="openProduct(${JSON.stringify(x.p.id)})"><img src="${esc2(x.p.image_url)}"><b>${esc2(x.p.name)}</b><div class="tff-score">Visual match ${Math.round(x.score*100)}%</div><div>₹${Number(x.p.price||0).toFixed(0)}</div></div>`).join('')}catch(e){box.innerHTML='<div class="notice">Photo search এখনো এই device/browser-এ সম্পূর্ণ করা যায়নি।</div>'}};
  function addUser(t){const d=document.createElement('div');d.className='tff-msg user';d.textContent=t;document.getElementById('tffChat').appendChild(d);scrollChat()}
  function addBot(t){const d=document.createElement('div');d.className='tff-msg bot';d.innerHTML=t;document.getElementById('tffChat').appendChild(d);scrollChat();if(window._tffSpeakReplies&&'speechSynthesis'in window){const plain=document.createElement('div');plain.innerHTML=t;const u=new SpeechSynthesisUtterance(plain.textContent||t);u.lang='bn-IN';window.speechSynthesis.cancel();window.speechSynthesis.speak(u)}}
  function scrollChat(){const x=document.getElementById('tffChat');x.scrollTop=x.scrollHeight}
  function aiReply(q){const ps=(function(){try{return products||[]}catch(e){return []}})();const s=q.toLowerCase();let candidates=ps.filter(p=>p.available!==false);const cats=[];if(/চিকেন|chicken|মাংস/.test(s))cats.push('Meat');if(/মাছ|fish|রুই|রোহু|কাতলা|ইলিশ/.test(s))cats.push('Fish');if(/চিংড়ি|shrimp|crab|কাঁকড়া|seafood/.test(s))cats.push('Seafood');if(cats.length)candidates=candidates.filter(p=>cats.includes(p.category));const nums=(s.match(/\d+/g)||[]).map(Number);const budget=nums.find(n=>n>=100&&n<=10000);if(budget)candidates=candidates.filter(p=>Number(p.price||0)<=budget*1.05);if(/সস্তা|কম বাজেট|cheap|budget/.test(s))candidates.sort((a,b)=>Number(a.price||0)-Number(b.price||0));else candidates.sort((a,b)=>Number(b.price||0)-Number(a.price||0));const top=candidates.slice(0,4);if(!top.length)return 'এই মুহূর্তে matching product পেলাম না। Categories থেকে product দেখুন বা অন্যভাবে বলুন।';const cards=top.map(p=>`<button class="btn light" style="margin:4px 4px 0 0" onclick="openProduct(${JSON.stringify(p.id)});closeAI()">${esc2(p.emoji||'🛒')} ${esc2(p.name)} • ₹${Number(p.price||0).toFixed(0)}</button>`).join('');return 'আপনার কথার ভিত্তিতে এইগুলো ভালো match হতে পারে:<br>'+cards}
}
async function imageFeatures(src,isUrl){return new Promise((resolve,reject)=>{const img=new Image();if(isUrl)img.crossOrigin='anonymous';img.onload=()=>{try{const c=document.createElement('canvas');const size=48;c.width=c.height=size;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,size,size);const d=x.getImageData(0,0,size,size).data;let r=0,g=0,b=0,l=0,sat=0,edge=0,prev=0;const hist=new Array(12).fill(0);for(let i=0;i<d.length;i+=4){const R=d[i]/255,G=d[i+1]/255,B=d[i+2]/255;const mx=Math.max(R,G,B),mn=Math.min(R,G,B);const lum=.2126*R+.7152*G+.0722*B;r+=R;g+=G;b+=B;l+=lum;sat+=mx?((mx-mn)/mx):0;const bin=Math.min(11,Math.floor(lum*12));hist[bin]++;if(i>=4)edge+=Math.abs(lum-prev);prev=lum}const n=d.length/4;resolve({r:r/n,g:g/n,b:b/n,l:l/n,sat:sat/n,edge:edge/n,hist:hist.map(v=>v/n)})}catch(e){reject(e)}};img.onerror=()=>reject(new Error('image load failed'));img.src=isUrl?src:URL.createObjectURL(src)})}
function similarity(a,b){let dist=Math.abs(a.r-b.r)+Math.abs(a.g-b.g)+Math.abs(a.b-b.b)+Math.abs(a.l-b.l)+Math.abs(a.sat-b.sat)+Math.min(1,Math.abs(a.edge-b.edge)*2);for(let i=0;i<12;i++)dist+=Math.abs(a.hist[i]-b.hist[i]);return Math.max(0,1-Math.min(1,dist/4.2))}

function customerQR(){
 const box=document.getElementById('qrBox'),holder=document.getElementById('qrCanvas'),url=document.getElementById('qrUrl');if(!box||!holder)return;
 window.openQr=function(){box.style.display=box.style.display==='none'?'block':'none';if(box.style.display==='block'){const u=appUrl('');qrInto(holder,u);if(url)url.textContent=u;}};
 const actions=document.querySelector('#appQrPanel .actions');if(actions&&!document.getElementById('tffQrDownload')){const b=document.createElement('button');b.id='tffQrDownload';b.className='btn light';b.textContent='⬇️ Save QR';b.onclick=()=>downloadQR(holder,'tarakeswar-customer-app-qr');actions.appendChild(b)}
}

async function loadAutomationSettings(sbRef){try{const {data,error}=await sbRef.from('automation_settings').select('*').eq('id',1).maybeSingle();if(error)return null;return data}catch{return null}}
async function saveAutomationSettings(sbRef,payload){try{const {error}=await sbRef.from('automation_settings').upsert({id:1,...payload,updated_at:new Date().toISOString()});return !error}catch{return false}}

function adminUI(){
 // Add admin PWA manifest + install button.
 if(!document.querySelector('link[href="admin-manifest.webmanifest"]')){const l=document.createElement('link');l.rel='manifest';l.href='admin-manifest.webmanifest';document.head.appendChild(l)}
 const install=document.createElement('button');install.className='btn light tff-admin-install';install.id='tffAdminInstall';install.textContent='📲 Install Admin';document.querySelector('header .bar')?.appendChild(install);let deferred=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;install.style.display='inline-block'});install.onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;install.style.display='none'}else safeAlert('Chrome menu → Add to Home screen / Install app চাপুন।')};if('serviceWorker'in navigator)navigator.serviceWorker.register('/admin-sw.js').catch(()=>{});
 const tabs=document.querySelector('.tabs');if(!tabs)return;
 if(!document.getElementById('tffAutomationTab')){const b=document.createElement('button');b.id='tffAutomationTab';b.className='tab';b.textContent='⚙️ Automation Center';b.onclick=function(){showTab('tffautomation',b)};tabs.appendChild(b)}
 if(!document.getElementById('tffautomation')){const sec=document.createElement('section');sec.id='tffautomation';sec.className='section';sec.innerHTML=`<div class="panel"><h2>⚙️ Master Automation Center</h2><p class="muted">সব automation এক জায়গা থেকে ON/OFF ও customize করুন। WhatsApp Cloud API এবং Real Web Push secrets পরে বসালেই তাদের delivery layer চালু হবে।</p><div class="tff-kpi-grid"><div class="tff-kpi"><span class="muted">WhatsApp</span><strong>🟡 Ready</strong></div><div class="tff-kpi"><span class="muted">Web Push</span><strong>🟡 Ready</strong></div><div class="tff-kpi"><span class="muted">AI Assistant</span><strong>🟢 Active</strong></div><div class="tff-kpi"><span class="muted">Visual Search</span><strong>🟢 Active</strong></div></div></div><div class="panel"><h3>🤖 Customer Automation</h3><div id="tffToggleGrid" class="tff-toggle-grid"></div><button class="btn green" style="margin-top:10px" onclick="window.saveTffAutomation()">Save Automation</button><span id="tffAutoMsg" class="muted" style="margin-left:8px"></span></div><div class="panel"><h3>🎨 Banner Customization</h3><div class="tff-banner-editor"><div><label>Banner Title</label><input id="tffBannerTitle" placeholder="🔥 আজকের Fresh Deal"></div><div><label>CTA Text</label><input id="tffBannerCta" value="ORDER NOW"></div><div class="wide"><label>Click URL</label><input id="tffBannerUrl" placeholder="/ অথবা product/offer URL"></div><div class="wide"><label>Share Text</label><textarea id="tffBannerShare" placeholder="আজকের special offer..."></textarea></div></div><div class="actions"><button class="btn green" onclick="window.saveTffBannerConfig()">Save Banner Config</button><button class="btn light" onclick="window.loadTffBannerConfig()">Load Current</button></div><div id="tffBannerCfgMsg" class="muted"></div></div><div class="panel"><h3>🧪 Integration Health</h3><div class="actions"><button class="btn light" onclick="window.checkTffWhatsApp()">Check WhatsApp Config</button><button class="btn light" onclick="window.checkTffPush()">Check Push Config</button></div><div id="tffHealthMsg" class="muted" style="margin-top:8px"></div></div><div class="panel"><h3>📲 3-App QR Center</h3><p class="muted">Customer, Admin ও Delivery—তিনটি আলাদা installable PWA-এর আলাদা QR।</p><div id="tffQrGrid" class="tff-qr-grid"></div></div>`;document.querySelector('.wrap')?.appendChild(sec)}
 const toggles=[['order_confirmed','Order Confirmed'],['payment_success','Payment Success'],['order_status','Order Status Updates'],['delivered_feedback','Delivered + Feedback'],['reorder_reminder','Reorder Reminder'],['abandoned_cart','Abandoned Cart'],['new_offer','New Offer'],['flash_sale','Flash Sale'],['low_stock','Low Stock Alert'],['vip_rewards','VIP / Rewards'],['referral','Referral Rewards'],['marketing_campaigns','Marketing Campaigns']];
 const g=document.getElementById('tffToggleGrid');if(g&&!g.children.length)g.innerHTML=toggles.map(([k,l])=>`<label class="tff-toggle"><span>⚡ ${l}</span><input type="checkbox" data-auto="${k}" checked></label>`).join('');
 window.loadTffAutomation=async()=>{const d=await loadAutomationSettings((function(){try{return sb}catch(e){return null}})());if(d){document.querySelectorAll('[data-auto]').forEach(x=>x.checked=d[x.dataset.auto]!==false)}};
 window.saveTffAutomation=async()=>{const p={};document.querySelectorAll('[data-auto]').forEach(x=>p[x.dataset.auto]=x.checked);const ok=await saveAutomationSettings((function(){try{return sb}catch(e){return null}})(),p);document.getElementById('tffAutoMsg').textContent=ok?'Saved ✅':'DB setup না থাকলে local fallback ব্যবহার হবে।';localStorage.setItem('tff_auto_settings',JSON.stringify(p))};
 window.loadTffBannerConfig=async()=>{try{const {data:{session}}=await sb.auth.getSession();if(!session)throw new Error('Admin login required');const r=await fetch((window.TFF_API_BASE||'')+'/api/banner-admin',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'latest'})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'Banner load failed');const data=d.banner;if(data){tffBannerTitle.value=data.title||'';tffBannerCta.value=data.cta_text||'ORDER NOW';tffBannerUrl.value=data.click_url||'/';tffBannerShare.value=data.share_text||''}}catch(e){document.getElementById('tffBannerCfgMsg')&&(document.getElementById('tffBannerCfgMsg').textContent='❌ '+e.message)}}
 window.saveTffBannerConfig=async()=>{const d={title:tffBannerTitle.value.trim(),click_url:tffBannerUrl.value.trim()||'/',cta_text:tffBannerCta.value.trim()||'ORDER NOW',share_text:tffBannerShare.value.trim()||tffBannerTitle.value.trim()};try{const {data:{session}}=await sb.auth.getSession();if(!session)throw new Error('Admin login required');const latest=await fetch((window.TFF_API_BASE||'')+'/api/banner-admin',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'latest'})}).then(async r=>{const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'Banner load failed');return d});if(!latest.banner?.id)throw new Error('আগে Auto Banner Run করুন');const r=await fetch((window.TFF_API_BASE||'')+'/api/banner-admin',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'save',id:latest.banner.id,...d})});const out=await r.json();if(!r.ok||!out.ok)throw new Error(out.error||'Banner save failed');document.getElementById('tffBannerCfgMsg').textContent='Banner config saved ✅';if(window.loadTffBannerConfig)window.loadTffBannerConfig()}catch(e){document.getElementById('tffBannerCfgMsg').textContent='❌ '+e.message}}
 window.checkTffWhatsApp=async()=>{try{const r=await fetch((window.TFF_API_BASE||'')+'/api/whatsapp-health');const d=await r.json();document.getElementById('tffHealthMsg').textContent=d.configured?'🟢 WhatsApp server config present. Meta template/policy test still required.':'🟡 WhatsApp later setup: missing '+(d.missing||[]).join(', ')}catch(e){document.getElementById('tffHealthMsg').textContent='WhatsApp health check failed: '+e.message}};
 window.checkTffPush=async()=>{try{const r=await fetch((window.TFF_API_BASE||'')+'/api/vapid-public-key');const d=await r.json();document.getElementById('tffHealthMsg').textContent=d.publicKey?'🟢 VAPID public key available.':'🟡 Push secrets not configured yet — app is ready for later setup.'}catch(e){document.getElementById('tffHealthMsg').textContent='Push health check failed: '+e.message}};
 window.renderTffQrCenter=()=>{const grid=document.getElementById('tffQrGrid');if(!grid)return;const apps=[['🛒 Customer App','/', 'customer'],['⚙️ Admin App','/admin.html','admin'],['🛵 Delivery App','/delivery.html','delivery']];grid.innerHTML=apps.map((a,i)=>`<div class="tff-qr-card"><b>${a[0]}</b><div class="qr" id="tffQr${i}"></div><div class="tff-qr-help">${location.origin+a[1]}</div><div class="actions" style="justify-content:center"><button class="btn light" onclick="window.downloadTffQr(${i},'${a[2]}')">⬇️ Save</button><button class="btn light" onclick="window.shareTffQr('${a[0]}','${location.origin+a[1]}')">📤 Share</button><button class="btn dark" onclick="navigator.clipboard?.writeText('${location.origin+a[1]}');">🔗 Copy</button></div></div>`).join('');apps.forEach((a,i)=>qrInto(document.getElementById('tffQr'+i),location.origin+a[1]))};
 window.downloadTffQr=(i,n)=>downloadQR(document.getElementById('tffQr'+i), 'tarakeswar-'+n+'-app-qr');window.shareTffQr=async(title,url)=>{if(navigator.share)await navigator.share({title,text:title+'\n'+url,url}).catch(()=>{});else{await navigator.clipboard?.writeText(url);safeAlert('Link copied ✅')}};
 setTimeout(()=>{window.loadTffAutomation();window.loadTffBannerConfig();window.renderTffQrCenter()},600);
}

function deliveryUI(){
 if(!document.getElementById('tffDeliveryQr')){const p=document.createElement('section');p.className='panel';p.id='tffDeliveryQr';p.innerHTML='<h3>📲 Delivery App QR</h3><p class="muted">এই QR scan করলে Delivery App-এর install page খুলবে।</p><div id="tffDeliveryQrCanvas" style="display:flex;justify-content:center;background:#fff;padding:10px;border-radius:14px"></div><div class="actions"><button class="btn light" id="tffDqSave">⬇️ Save QR</button><button class="btn light" id="tffDqShare">📤 Share</button></div>';document.querySelector('main.wrap')?.appendChild(p);qrInto(document.getElementById('tffDeliveryQrCanvas'),appUrl('delivery.html'));document.getElementById('tffDqSave').onclick=()=>downloadQR(document.getElementById('tffDeliveryQrCanvas'),'tarakeswar-delivery-app-qr');document.getElementById('tffDqShare').onclick=async()=>{const u=appUrl('delivery.html');if(navigator.share)await navigator.share({title:'Tarakeswar Delivery App',text:'Install Delivery App',url:u}).catch(()=>{});else{try{await navigator.clipboard.writeText(u);safeAlert('Delivery App link copied ✅')}catch{safeAlert(u)}}}}
}

function boot(){addStyle();if(isCustomer){customerQR();setTimeout(customerUI,300)}if(isAdmin)setTimeout(adminUI,200);if(isDelivery)setTimeout(deliveryUI,300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


/* ===== SOURCE: v43-enhancements.js ===== */

/* V4.3 isolated candidate enhancements.
 * Data-only themes, touch-safe controls, compressed profile images, and
 * local persistence helpers. No secrets and no production calls are added.
 */
(function () {
  'use strict';
  const config = {
    customer: { accent: '#0c9b50', navy: '#071b34', background: '#f4f7fb' },
    delivery: { accent: '#0b7e49', navy: '#071b34', background: '#eef7f1' },
    admin: { accent: '#7c3aed', navy: '#25104d', background: '#f7f4ff' },
    'durga-puja': { accent: '#b91c1c', navy: '#3b0a0a', background: '#fff7ed' },
    'kali-puja': { accent: '#7e22ce', navy: '#190b2e', background: '#faf5ff' }
  };
  const page = location.pathname.includes('delivery') ? 'delivery'
    : location.pathname.includes('admin') ? 'admin' : 'customer';
  function applyTheme(name) {
    const t = config[name] || config[page];
    document.documentElement.dataset.tffTheme = name in config ? name : page;
    document.documentElement.style.setProperty('--v43-accent', t.accent);
    document.documentElement.style.setProperty('--v43-navy', t.navy);
    document.documentElement.style.setProperty('--v43-background', t.background);
  }
  const storedTheme = localStorage.getItem('tff_theme_' + page) || page;
  applyTheme(storedTheme);
  window.TFF_V43_THEME = { config, applyTheme };

  function addThemePicker() {
    if (!document.body || document.getElementById('tffV43ThemePicker')) return;
    const select = document.createElement('select');
    select.id = 'tffV43ThemePicker';
    select.setAttribute('aria-label', 'App theme');
    select.style.cssText = 'position:fixed;right:10px;bottom:76px;z-index:80;border:1px solid #cbd5e1;border-radius:10px;padding:7px;background:#fff;font-weight:700';
    Object.keys(config).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name === page ? 'Theme: ' + name : 'Festival: ' + name;
      option.selected = name === storedTheme;
      select.appendChild(option);
    });
    select.addEventListener('change', () => {
      localStorage.setItem('tff_theme_' + page, select.value);
      applyTheme(select.value);
    });
    document.body.appendChild(select);
  }

  function compressImage(file, maxEdge, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Image read failed'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('Unsupported image'));
        image.onload = () => {
          const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext('2d', { alpha: false });
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    addThemePicker();
    document.documentElement.style.setProperty('--v43-touch-target', '44px');
    const style = document.createElement('style');
    style.textContent = '.qtyControl button{min-width:var(--v43-touch-target);min-height:var(--v43-touch-target);touch-action:manipulation}.qtyControl{touch-action:manipulation}';
    document.head.appendChild(style);
  });

  // Replace the V4.2 client-side 2MB rejection with compression plus a
  // sensible technical payload ceiling. The server remains authoritative.
  if (page === 'customer') {
    window.uploadCustomerPhoto = async function () {
      const file = document.getElementById('customerPhotoFile')?.files?.[0];
      const message = document.getElementById('photoMsg');
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        if (message) message.textContent = '❌ JPG, PNG বা WEBP image দিন';
        return;
      }
      try {
        if (message) message.textContent = '⏳ Photo optimize হচ্ছে...';
        const dataUrl = await compressImage(file, 1600, 0.82);
        if (dataUrl.length > 8 * 1024 * 1024) throw new Error('Image is too large after compression');
        const guest = localStorage.getItem('tff_guest_id') || '';
        const mobile = document.getElementById('hubMobile')?.value || '';
        const response = await fetch((window.TFF_API_BASE || '') + '/api/customer-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, guest_id: guest, data_url: dataUrl })
        });
        const body = await response.json();
        if (!response.ok || !body.ok) throw new Error(body.error || 'Upload failed');
        if (message) message.textContent = '✅ Profile photo updated';
        if (typeof window.loadHub === 'function') window.loadHub();
      } catch (error) {
        if (message) message.textContent = '❌ ' + error.message;
      }
    };
    const originalHub = window.loadHub;
    if (typeof originalHub === 'function') {
      window.loadHub = async function () {
        await originalHub();
        const last = JSON.parse(localStorage.getItem('tff_last_order') || 'null');
        if (!last?.delivery_otp) return;
        const result = document.getElementById('hubResult');
        if (!result || result.querySelector('[data-v43-otp]')) return;
        const box = document.createElement('div');
        box.dataset.v43Otp = 'true';
        box.className = 'secureNote';
        box.style.marginTop = '10px';
        box.innerHTML = '<b>🔐 Delivery OTP</b><br>Order ' +
          String(last.order_no || '').replace(/[<>&"]/g, '') +
          ': <strong>' + String(last.delivery_otp).replace(/[<>&"]/g, '') +
          '</strong><br><small>শুধু rider-কে delivery-এর সময় বলবেন।</small>';
        result.prepend(box);
      };
    }
  }
})();

/* ===== SOURCE: v5-enhancements.js ===== */

/* Tarakeswar Fresh V5 additive enhancements.
 * No existing V4/V4.3 functions are removed or replaced.
 */
(function(){'use strict';
 const page=location.pathname.includes('delivery')?'delivery':location.pathname.includes('admin')?'admin':'customer';
 const $=id=>document.getElementById(id);
 const escV5=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function customer(){
  const last=()=>{try{return JSON.parse(localStorage.getItem('tff_last_order')||'null')}catch{return null}};
  function mount(){
   if($('v5Reorder'))return;const anchor=document.querySelector('.offer-slider')||document.querySelector('.hero');if(!anchor)return;
   const box=document.createElement('section');box.id='v5Reorder';box.className='panel';box.style.cssText='border:2px solid #dff1e7;background:linear-gradient(135deg,#f7fff9,#fffdf2)';
   box.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><h2 style="margin:0">🔄 Smart Reorder</h2><div id="v5ReorderText" class="muted">আপনার শেষ order থেকে এক tap-এ আবার cart তৈরি করুন।</div></div><span class="statusPill">V5</span></div><div id="v5ReorderItems" style="margin-top:10px"></div><div class="actions"><button id="v5ReorderBtn" class="btn green" style="display:none">🔄 Order Again</button><button id="v5PriceAlert" class="btn light" style="display:none"></button></div>';
   anchor.parentNode.insertBefore(box,anchor.nextSibling);
   render();
  }
  function render(){const b=$('v5ReorderItems'),btn=$('v5ReorderBtn'),alertBtn=$('v5PriceAlert'),l=last();if(!b||!l?.items?.length)return;
   const items=l.items.map(i=>({id:i.product_id||i.id,name:i.name,qty:Number(i.qty||1),price:Number(i.unit_price||i.price||0)}));b.innerHTML=items.map(i=>`<div style="padding:7px 0;border-bottom:1px solid #e7efe9"><b>${escV5(i.name)}</b> × ${i.qty} <span class="muted">₹${i.price.toFixed(0)} each</span></div>`).join('');btn.style.display='inline-block';btn.onclick=()=>{let added=0;for(const i of items){const p=(window.tffProducts||[]).find(x=>String(x.id)===String(i.id))||(window.tffProducts||[]).find(x=>String(x.name).toLowerCase()===String(i.name).toLowerCase());if(p&&p.available!==false){for(let n=0;n<i.qty;n++)window.tffCart.push({...p});added+=i.qty}}if(added){window.tffUpdateCart();window.tffRender?.();window.tffSaveDraftSoon?.();alert('🔄 Last order-এর available items cart-এ যোগ হয়েছে।')}else alert('এই order-এর product এখন stock-এ নেই।')};
   const changed=items.map(i=>{const p=(window.tffProducts||[]).find(x=>String(x.id)===String(i.id))||(window.tffProducts||[]).find(x=>String(x.name).toLowerCase()===String(i.name).toLowerCase());return p&&i.price>0&&Math.abs(Number(p.price)-i.price)>=1?{...i,current:Number(p.price)}:null}).filter(Boolean);if(changed.length){alertBtn.style.display='inline-block';alertBtn.textContent=`💰 ${changed.length}টি product-এর price update হয়েছে`;alertBtn.onclick=()=>alert(changed.map(x=>`${x.name}: ₹${x.price.toFixed(0)} → ₹${x.current.toFixed(0)}`).join('\n'))}
  }
  function stockLabels(){document.querySelectorAll('.card').forEach(card=>{const text=card.textContent||'';if(/Out of Stock|Sold Out/i.test(text)){const b=card.querySelector('.miniBuyBtn,.buyBtn,.btn.green');if(b){b.disabled=true;b.textContent='Sold Out'}}})}
  window.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{mount();stockLabels()},1200);setInterval(()=>{mount();render();stockLabels()},5000)});
 }
 function admin(){
  function mount(){if($('v5analytics'))return;const tabs=document.querySelector('.tabs'),wrap=document.querySelector('.wrap');if(!tabs||!wrap||typeof window.showTab!=='function')return;const b=document.createElement('button');b.id='v5AnalyticsTab';b.className='tab';b.textContent='📊 V5 Analytics';b.onclick=()=>window.showTab('v5analytics',b);tabs.appendChild(b);const sec=document.createElement('section');sec.id='v5analytics';sec.className='section';sec.innerHTML='<div class="panel"><h2>📊 Business Analytics — V5</h2><p class="muted">আজকের orders, sales, top fish এবং delivery performance এক জায়গায়।</p><div id="v5AnalyticsKpi" class="kpis"><div class="kpi"><span>Orders</span><b>—</b></div><div class="kpi"><span>Sales</span><b>₹—</b></div><div class="kpi"><span>Delivered</span><b>—</b></div><div class="kpi"><span>VIP</span><b>—</b></div></div><div class="row2" style="margin-top:12px"><div class="panel" style="margin:0"><h3>🏆 Top Selling Fish</h3><div id="v5TopFish" class="muted">Loading...</div></div><div class="panel" style="margin:0"><h3>🛵 Delivery Performance</h3><div id="v5DeliveryPerf" class="muted">Loading...</div></div></div></div><div class="panel"><h3>⚠️ Low Stock</h3><div id="v5LowStock" class="muted">Loading...</div></div>' ;wrap.appendChild(sec);load();}
  async function load(){try{const db=window.TFF_SB;if(!db)return;const [{data:orders},{data:fish},{data:customers}]=await Promise.all([db.from('orders').select('id,status,payable_total,total,created_at,order_items(*)').order('created_at',{ascending:false}).limit(300),db.from('fish').select('id,name,price,stock_qty,available').order('stock_qty',{ascending:true}).limit(100),db.from('customers').select('id,vip_member').limit(500)]);const os=orders||[],today=new Date().toLocaleDateString('en-IN');const todayOrders=os.filter(o=>new Date(o.created_at).toLocaleDateString('en-IN')===today);const sales=todayOrders.filter(o=>o.status!=='Cancelled').reduce((a,o)=>a+Number(o.payable_total||o.total||0),0);const delivered=todayOrders.filter(o=>o.status==='Delivered').length;const vip=(customers||[]).filter(c=>c.vip_member).length;const ks=$('v5AnalyticsKpi');if(ks)ks.innerHTML=`<div class="kpi"><span>Today's Orders</span><b>${todayOrders.length}</b></div><div class="kpi"><span>Today's Sales</span><b>₹${sales.toFixed(0)}</b></div><div class="kpi"><span>Delivered</span><b>${delivered}</b></div><div class="kpi"><span>VIP Customers</span><b>${vip}</b></div>`;const counts={};for(const o of os){for(const i of (o.order_items||[])){const n=i.product_name||'Unknown';counts[n]=(counts[n]||0)+Number(i.qty||1)}}const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);$('v5TopFish').innerHTML=top.length?top.map((x,i)=>`<div style="padding:6px 0"><b>${i+1}. ${escV5(x[0])}</b> <span class="muted">× ${x[1]}</span></div>`).join(''):'No sales data';const low=(fish||[]).filter(f=>f.available!==false&&Number(f.stock_qty||0)<=5);$('v5LowStock').innerHTML=low.length?low.map(f=>`<span class="pill">⚠️ ${escV5(f.name)} • ${Number(f.stock_qty||0)} ${escV5(f.unit||'')}</span> `).join(''):'সব stock healthy';const partnerRows=await db.from('delivery_partner_profiles').select('name,total_earnings,active').order('total_earnings',{ascending:false}).limit(10);$('v5DeliveryPerf').innerHTML=(partnerRows.data||[]).length?(partnerRows.data||[]).map(p=>`<div style="padding:6px 0"><b>${escV5(p.name)}</b> • ₹${Number(p.total_earnings||0).toFixed(0)} • ${p.active?'Active':'Inactive'}</div>`).join(''):'No delivery partners';}catch(e){console.warn('V5 analytics',e)}}
  window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{mount();setInterval(()=>{if($('v5analytics')?.classList.contains('active'))load()},30000)},1200));
 }
 if(page==='customer')customer();if(page==='admin')admin();
})();


/* ===== SOURCE: v51-smart-automation.js ===== */

/* Tarakeswar Fresh Fish V5.1 Smart Automation & App Control
 * Additive only. Designed to fail gracefully if an optional DB/table is unavailable.
 */
(function(){'use strict';
  const VERSION='5.1.0';
  const APP_NAME='Tarakeswar Fresh Fish';
  const TAGLINES=['🟢 Fresh Today','🔒 Secure Razorpay Payment','🚚 Next-Day Delivery','🐟 Fresh Fish • Seafood • Chicken','✂️ Fresh Cutting Available','💰 Fresh Wallet Benefits','🎁 Member Benefits'];
  const page=location.pathname.includes('delivery')?'delivery':location.pathname.includes('admin')?'admin':'customer';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function css(){
    if($('tff51style'))return;
    const s=document.createElement('style');s.id='tff51style';s.textContent=`
      .tff51-marquee{position:relative;overflow:hidden;background:#071b34;color:#fff;font-weight:900;font-size:13px;padding:8px 0;white-space:nowrap;border-bottom:1px solid #ffffff22;z-index:30}
      .tff51-track{display:inline-flex;gap:34px;min-width:max-content;animation:tff51scroll 28s linear infinite}
      .tff51-track:hover{animation-play-state:paused}@keyframes tff51scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      .tff51-logo{animation:tff51pulse 3s ease-in-out infinite;transform-origin:center}@keyframes tff51pulse{0%,100%{transform:scale(1);filter:drop-shadow(0 0 0 #0c9b5066)}50%{transform:scale(1.035);filter:drop-shadow(0 0 9px #0c9b5066)}}
      .tff51-float{position:fixed;right:12px;bottom:92px;z-index:90;background:#fff;border:1px solid #dbe4ec;border-radius:16px;box-shadow:0 10px 28px #071b3422;padding:9px;display:flex;gap:7px;flex-wrap:wrap;max-width:calc(100vw - 24px)}
      .tff51-float button,.tff51-app-card button{border:0;border-radius:10px;padding:8px 10px;font-weight:900;background:#edf3f7;cursor:pointer}.tff51-float .primary,.tff51-app-card .primary{background:#0c9b50;color:#fff}
      .tff51-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#071b34;color:#fff;padding:11px 15px;border-radius:12px;z-index:9999;font-weight:800;box-shadow:0 8px 28px #0004}
      .tff51-status{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#eefaf3;color:#08743e;font-weight:800;font-size:12px}
      .tff51-update{position:fixed;left:12px;right:12px;top:56px;z-index:95;background:#fff;border:2px solid #0c9b50;border-radius:16px;padding:12px;box-shadow:0 10px 30px #0002;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
      .tff51-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.tff51-app-card{border:1px solid #e4eaf0;border-radius:16px;padding:14px;background:#fff}.tff51-qr{min-height:190px;display:flex;align-items:center;justify-content:center;background:#f8fafc;border-radius:12px;margin:10px 0}.tff51-small{font-size:12px;color:#6b7280}@media(max-width:700px){.tff51-grid{grid-template-columns:1fr}.tff51-float{bottom:82px}.tff51-update{top:46px}}
    `;document.head.appendChild(s);
  }
  function toast(msg){let x=$('tff51toast');if(!x){x=document.createElement('div');x.id='tff51toast';x.className='tff51-toast';document.body.appendChild(x)}x.textContent=msg;clearTimeout(x._t);x._t=setTimeout(()=>x.remove(),2600)}
  function brandFlow(){
    if(document.querySelector('.tff51-marquee'))return;
    const host=document.body.firstElementChild;const bar=document.createElement('div');bar.className='tff51-marquee';const all=TAGLINES.concat(TAGLINES);bar.innerHTML=`<div class="tff51-track">${all.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
    if(host)document.body.insertBefore(bar,host);else document.body.prepend(bar);
    document.querySelectorAll('img.logo,.logo,header img').forEach(i=>i.classList.add('tff51-logo'));
  }
  function quickTools(){
    if(document.querySelector('.tff51-float'))return;
    const box=document.createElement('div');box.className='tff51-float';box.innerHTML=`<button class="primary" id="tff51Install">📲 Install</button><button id="tff51Share">📤 Share</button><button id="tff51Copy">🔗 Copy Link</button><button id="tff51Refresh">🔄 Refresh</button><span class="tff51-status" id="tff51Online">🟢 Online</span>`;document.body.appendChild(box);
    $('tff51Install').onclick=install; $('tff51Share').onclick=shareApp; $('tff51Copy').onclick=copyLink; $('tff51Refresh').onclick=()=>location.reload();
    window.addEventListener('online',()=>{$('tff51Online').textContent='🟢 Online'});window.addEventListener('offline',()=>{$('tff51Online').textContent='🔴 Offline'});
  }
  let deferred=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;const b=$('tff51Install');if(b)b.style.display='inline-block'});
  async function install(){if(deferred){deferred.prompt();try{await deferred.userChoice}catch(_){}deferred=null;return}toast('Browser menu থেকে “Install app / Add to Home screen” বেছে নিন।')}
  async function copyLink(){try{await navigator.clipboard.writeText(location.origin+'/');toast('App link copied ✅')}catch(_){prompt('App link copy করুন',location.origin+'/')}}
  async function shareApp(){const data={title:APP_NAME,text:'Tarakeswar Fresh Fish App',url:location.origin+'/'};try{if(navigator.share)await navigator.share(data);else{await copyLink();toast('Share support নেই—link copied ✅')}}catch(e){if(e?.name!=='AbortError')toast('Share করা যায়নি')}}

  function updateManager(){
    fetch('/app-version.json?ts='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(v=>{if(!v?.version||v.version===VERSION)return;const b=document.createElement('div');b.className='tff51-update';b.innerHTML=`<div><b>🔄 নতুন App Update available</b><div class="tff51-small">Current ${esc(VERSION)} → Latest ${esc(v.version)}</div></div><button class="btn green" id="tff51UpdateNow">Update Now</button>`;document.body.appendChild(b);$('tff51UpdateNow').onclick=async()=>{try{const regs=await navigator.serviceWorker?.getRegistrations?.()||[];await Promise.all(regs.map(r=>r.update()));await caches?.keys?.().then(keys=>Promise.all(keys.map(k=>caches.delete(k))));location.reload(true)}catch(_){location.reload()}}}).catch(()=>{});
  }
  function registerSW(){
    if(!('serviceWorker' in navigator))return;const sw=page==='customer'?'/sw.js':page==='delivery'?'/delivery-sw.js':'/admin-sw.js';navigator.serviceWorker.register(sw+'?v='+VERSION).then(r=>r.update()).catch(()=>{});
  }
  function refreshEngine(){
    let busy=false;
    async function refresh(){if(busy||document.hidden)return;busy=true;try{window.dispatchEvent(new CustomEvent('tff:auto-refresh',{detail:{page,version:VERSION}}));const names=page==='customer'?['render','loadProducts','loadOffers','trackOrder','loadHub']:page==='delivery'?['load']:['loadOrders','loadProducts','loadOffers','loadMembers','loadPartners','loadSettingsAdmin'];for(const n of names){try{if(typeof window[n]==='function')await window[n]()}catch(_){} }}finally{busy=false}}
    window.addEventListener('tff:manual-refresh',refresh);setInterval(refresh,30000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  }

  function customerPhotoEase(){
    const input=$('customerPhotoFile');if(!input)return;input.setAttribute('accept','image/*');input.setAttribute('capture','user');input.addEventListener('change',()=>{const f=input.files?.[0];if(!f)return;let p=$('tff51PhotoPreview');if(!p){p=document.createElement('img');p.id='tff51PhotoPreview';p.style.cssText='width:76px;height:76px;border-radius:50%;object-fit:cover;border:3px solid #0c9b50;margin-top:8px';input.parentNode.appendChild(p)}p.src=URL.createObjectURL(f)});
  }

  function adminAppCenter(){
    if(!$('v5analytics')||document.querySelector('.tff51-app-center'))return;
    const tabs=document.querySelector('.tabs'),wrap=document.querySelector('.wrap');if(!tabs||!wrap)return;
    const btn=document.createElement('button');btn.className='tab';btn.textContent='📲 App Center';btn.onclick=()=>window.showTab('tff51appcenter',btn);tabs.appendChild(btn);
    const sec=document.createElement('section');sec.id='tff51appcenter';sec.className='section tff51-app-center';sec.innerHTML=`<div class="panel"><h2>📲 Universal App Center</h2><p class="muted">Customer, Delivery ও Admin App-এর Install, Copy, Share এবং QR এক জায়গায়।</p><div class="tff51-grid" id="tff51Apps"></div></div><div class="panel"><h3>🎨 Brand Flow</h3><p class="muted">Customer, Delivery ও Admin app-এ animated logo এবং flowing tagline automaticভাবে চালু আছে।</p><div class="tff51-status">🟢 Branding Animation Active</div></div><div class="panel"><h3>🔄 System Auto Update</h3><div class="tff51-status">🟢 Version Manager Active</div><p class="tff51-small">নতুন version publish হলে app নিজে detect করে update prompt দেখাবে।</p></div>`;wrap.appendChild(sec);
    const apps=[['customer','🛒 Customer App','/'],['delivery','🛵 Delivery App','/delivery.html'],['admin','⚙️ Admin App','/admin.html']];const host=$('tff51Apps');
    apps.forEach(([key,title,path])=>{const card=document.createElement('div');card.className='tff51-app-card';card.innerHTML=`<h3>${title}</h3><div class="tff51-small">${location.origin+path}</div><div class="tff51-qr" id="qr_${key}"></div><div class="actions"><button class="primary" data-a="install">📲 Install</button><button data-a="copy">🔗 Copy Link</button><button data-a="share">📤 Share</button><button data-a="save">⬇️ Save QR</button></div>`;host.appendChild(card);const url=location.origin+path;if(window.QRCode)new QRCode($('qr_'+key),{text:url,width:180,height:180,correctLevel:QRCode.CorrectLevel.M});card.querySelector('[data-a=copy]').onclick=()=>navigator.clipboard?.writeText(url).then(()=>toast(title+' link copied ✅')).catch(()=>prompt('Copy link',url));card.querySelector('[data-a=share]').onclick=()=>navigator.share?navigator.share({title,text:title,url}).catch(()=>{}):toast('Share support নেই');card.querySelector('[data-a=install]').onclick=()=>{if(key==='admin')location.href='/admin.html';else if(key==='delivery')location.href='/delivery.html';else location.href='/'};card.querySelector('[data-a=save]').onclick=()=>saveQr(card,key);});
  }
  function saveQr(card,key){const canvas=card.querySelector('canvas');if(!canvas)return toast('QR তৈরি হয়নি—একটু পরে চেষ্টা করুন');const a=document.createElement('a');a.download=`tarakeswar-${key}-app-qr.png`;a.href=canvas.toDataURL('image/png');a.click();toast('QR saved ✅')}

  function systemStatus(){
    if(page!=='admin'||$('tff51systemStatus'))return;const host=document.querySelector('.wrap');if(!host)return;const sec=document.createElement('section');sec.id='tff51systemStatus';sec.className='section';sec.innerHTML=`<div class="panel"><h2>🟢 Live System Status</h2><div class="tff51-grid"><div class="tff51-app-card"><b>Customer App</b><div class="tff51-status">🟢 Online</div></div><div class="tff51-app-card"><b>Delivery App</b><div class="tff51-status">🟢 Online</div></div><div class="tff51-app-card"><b>Admin App</b><div class="tff51-status">🟢 Online</div></div><div class="tff51-app-card"><b>Auto Banner</b><div class="tff51-status">🟢 Ready</div></div><div class="tff51-app-card"><b>Razorpay</b><div class="tff51-status">🟢 Configured</div></div><div class="tff51-app-card"><b>GPS</b><div class="tff51-status">🟢 Ready</div></div></div><p class="tff51-small">Network/database live checks are performed by the existing app functions when their respective screens are opened.</p></div>`;host.appendChild(sec);
    const tabs=document.querySelector('.tabs');const btn=document.createElement('button');btn.className='tab';btn.textContent='🟢 System Status';btn.onclick=()=>window.showTab('tff51systemStatus',btn);tabs?.appendChild(btn);
  }
  function addProfilePhotoCamera(){if(page==='customer')setTimeout(customerPhotoEase,500)}
  function boot(){css();brandFlow();quickTools();registerSW();setTimeout(updateManager,2500);refreshEngine();addProfilePhotoCamera();if(page==='admin'){setTimeout(adminAppCenter,1500);setTimeout(systemStatus,1500)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.TFF_V51={version:VERSION,refresh:()=>window.dispatchEvent(new CustomEvent('tff:manual-refresh'))};
})();


/* ===== SOURCE: tff-v52-partner-family.js ===== */

/* Tarakeswar Fresh Fish V5.2 — Partner & Family Hub
   Additive module: global partner cards + customer-customizable personal hub.
   No existing V4/V5 functions are replaced.
*/
(function(){
'use strict';
const PAGE=location.pathname.includes('admin')?'admin':'customer';
const KEY='tff_v52_partner_family_prefs_v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cfg=window.TFF_SUPABASE||{};
let client=null;
try{ if(window.supabase?.createClient && cfg.url && cfg.publishableKey) client=window.supabase.createClient(cfg.url,cfg.publishableKey); }catch(e){console.warn('V5.2 hub client',e)}

const demo=[
 {id:'demo-restaurant',type:'restaurant',title:'Partner Restaurant',subtitle:'আপনার পছন্দের পার্টনার',description:'Partner restaurant-এর special menu, combo ও offer এখানে দেখুন।',image_url:'/logo-transparent.png',action_label:'Offer দেখুন',action_url:'',sort_order:10,active:true,customer_customizable:true},
 {id:'demo-event',type:'event',title:'Event & Catering Partner',subtitle:'Party • অনুষ্ঠান • Catering',description:'Birthday, Puja, Anniversary বা Event-এর জন্য partner service ও combo request করুন।',image_url:'/logo-transparent.png',action_label:'Request করুন',action_url:'',sort_order:20,active:true,customer_customizable:true},
 {id:'demo-family',type:'family',title:'Family Hub',subtitle:'পরিবারের জন্য আলাদা তালিকা',description:'পরিবারের সদস্যদের পছন্দ, quantity note ও special instruction নিজের মতো সাজিয়ে রাখুন।',image_url:'/logo-transparent.png',action_label:'Customize',action_url:'',sort_order:30,active:true,customer_customizable:true}
];

function getPrefs(){
 try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}
}
function savePrefs(p){localStorage.setItem(KEY,JSON.stringify(p))}
function icon(type){return type==='restaurant'?'🍽️':type==='event'?'🎉':'👨‍👩‍👧‍👦'}
function label(type){return type==='restaurant'?'Restaurant Partner':type==='event'?'Event Partner':'Family'}
function prefsFor(items){
 const p=getPrefs();
 return items.filter(x=>x.active!==false && p.hidden?.[x.id]!==true)
   .sort((a,b)=>{const ai=p.order?.indexOf(a.id); const bi=p.order?.indexOf(b.id); return (ai>=0?ai:9999)-(bi>=0?bi:9999) || Number(a.sort_order||0)-Number(b.sort_order||0)});
}
async function loadItems(){
 if(!client)return demo;
 try{
  const {data,error}=await client.from('partner_family_hub').select('*').eq('active',true).order('sort_order',{ascending:true});
  if(error||!data?.length)return demo;
  return data;
 }catch{return demo}
}

function injectCss(){
 if(document.getElementById('tff-v52-pf-css'))return;
 const s=document.createElement('style');s.id='tff-v52-pf-css';s.textContent=`
 .tff52-pf{margin:14px 0;background:linear-gradient(135deg,#fff,#f4fbf7);border:1px solid #dceee5;border-radius:22px;padding:16px;box-shadow:0 8px 28px #0b1f330d}
 .tff52-pf-head{display:flex;gap:10px;align-items:center}.tff52-pf-head h2{margin:0}.tff52-pf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
 .tff52-pf-card{background:#fff;border:1px solid #e7edf0;border-radius:18px;padding:10px;overflow:hidden}.tff52-pf-card img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:13px}.tff52-pf-card h3{margin:8px 0 3px}.tff52-pf-card p{font-size:13px;margin:0 0 8px;color:#687386}.tff52-pf-actions{display:flex;gap:6px;flex-wrap:wrap}.tff52-pf-btn{border:0;border-radius:10px;padding:8px 10px;font-weight:800;cursor:pointer;background:#071b34;color:#fff}.tff52-pf-btn.alt{background:#edf3f0;color:#17352a}.tff52-pf-modal{position:fixed;inset:0;background:#071b3499;display:none;z-index:300;align-items:center;justify-content:center;padding:16px}.tff52-pf-modal.show{display:flex}.tff52-pf-box{background:#fff;border-radius:22px;width:min(760px,100%);max-height:90vh;overflow:auto;padding:18px}.tff52-pf-row{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #e7edf0;border-radius:13px;margin:7px 0}.tff52-pf-row img{width:54px;height:54px;border-radius:12px;object-fit:cover}.tff52-pf-note{width:100%;padding:10px;border:1px solid #d9e1e6;border-radius:10px}.tff52-pf-chip{font-size:11px;border-radius:999px;padding:4px 7px;background:#e8f6ee;color:#08743e;font-weight:800}
 @media(max-width:760px){.tff52-pf-grid{grid-template-columns:1fr 1fr}} @media(max-width:480px){.tff52-pf-grid{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}

function openCustomize(items){
 const old=document.getElementById('tff52PfModal'); if(old)old.remove();
 const p=getPrefs(), m=document.createElement('div');m.className='tff52-pf-modal show';m.id='tff52PfModal';
 m.innerHTML=`<div class="tff52-pf-box"><div style="display:flex;align-items:center;gap:8px"><div><h2 style="margin:0">🎨 আমার Hub Customize</h2><div class="muted">আপনি কোন section দেখবেন, কী নামে রাখবেন ও কোন note রাখবেন ঠিক করুন।</div></div><div style="margin-left:auto"><button class="tff52-pf-btn alt" id="pfClose">✕</button></div></div><div id="pfRows" style="margin-top:12px"></div><button class="tff52-pf-btn" id="pfSave" style="width:100%;margin-top:10px">💾 Save My Hub</button></div>`;
 document.body.appendChild(m);
 const rows=m.querySelector('#pfRows');
 items.forEach(x=>{
  const hidden=p.hidden?.[x.id]===true, note=p.notes?.[x.id]||'', custom=p.names?.[x.id]||'';
  const row=document.createElement('div');row.className='tff52-pf-row';row.innerHTML=`<img src="${esc(x.image_url||'/logo-transparent.png')}" onerror="this.src='/logo-transparent.png'"><div style="flex:1"><b>${icon(x.type)} ${esc(x.title)}</b><span class="tff52-pf-chip">${esc(label(x.type))}</span><div style="margin-top:6px"><input class="pf-show" type="checkbox" ${hidden?'':'checked'}> Show &nbsp; <input class="pf-name" placeholder="আমার নাম (optional)" value="${esc(custom)}"></div><input class="pf-note tff52-pf-note" placeholder="Personal note (যেমন: মা-এর জন্য কম ঝাল)" value="${esc(note)}"></div>`;
  row.dataset.id=x.id;rows.appendChild(row);
 });
 m.querySelector('#pfClose').onclick=()=>m.remove();
 m.querySelector('#pfSave').onclick=()=>{
  const np={hidden:{},names:{},notes:{},order:p.order||[]};
  rows.querySelectorAll('.tff52-pf-row').forEach(r=>{const id=r.dataset.id;if(!r.querySelector('.pf-show').checked)np.hidden[id]=true;const n=r.querySelector('.pf-name').value.trim(),note=r.querySelector('.pf-note').value.trim();if(n)np.names[id]=n;if(note)np.notes[id]=note});
  savePrefs(np);m.remove();renderCustomer(items);alert('✅ আপনার Partner & Family Hub customize হয়ে গেছে।');
 };
}

function renderCustomer(items){
 injectCss();
 const anchor=document.querySelector('.appNav')||document.querySelector('.cartDock');
 if(!anchor)return;
 let sec=document.getElementById('tff52PartnerFamily');
 if(!sec){sec=document.createElement('section');sec.id='tff52PartnerFamily';sec.className='tff52-pf panel';anchor.parentNode.insertBefore(sec,anchor)}
 const p=getPrefs(), shown=prefsFor(items);
 sec.innerHTML=`<div class="tff52-pf-head"><div><h2>🤝 Partner & Family Hub</h2><div class="muted">Restaurant • Event • Family — এক জায়গায়</div></div><div style="margin-left:auto"><button class="tff52-pf-btn alt" id="pfCustomize">🎨 Customize</button></div></div><div class="tff52-pf-grid">${shown.map(x=>`<article class="tff52-pf-card"><img src="${esc(x.image_url||'/logo-transparent.png')}" onerror="this.src='/logo-transparent.png'"><div class="tff52-pf-chip">${icon(x.type)} ${esc(label(x.type))}</div><h3>${esc(p.names?.[x.id]||x.title)}</h3><small class="muted">${esc(x.subtitle||'')}</small><p>${esc(x.description||'')}</p>${p.notes?.[x.id]?`<p><b>📝 My note:</b> ${esc(p.notes[x.id])}</p>`:''}<div class="tff52-pf-actions"><button class="tff52-pf-btn" data-open="${esc(x.id)}">${esc(x.action_label||'Open')}</button><button class="tff52-pf-btn alt" data-hide="${esc(x.id)}">Hide</button></div></article>`).join('')||'<div class="muted">Customize থেকে section যোগ করুন।</div>'}</div>`;
 sec.querySelector('#pfCustomize').onclick=()=>openCustomize(items);
 sec.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const x=items.find(i=>String(i.id)===String(b.dataset.open));if(!x)return;if(x.action_url)location.href=x.action_url;else alert(`${x.title}\\n\\n${x.description||'Partner information coming soon.'}`)});
 sec.querySelectorAll('[data-hide]').forEach(b=>b.onclick=()=>{const pp=getPrefs();pp.hidden=pp.hidden||{};pp.hidden[b.dataset.hide]=true;savePrefs(pp);renderCustomer(items)});
}

async function bootCustomer(){const items=await loadItems();renderCustomer(items)}
if(PAGE==='customer')document.addEventListener('DOMContentLoaded',bootCustomer);

})();


/* ===== SOURCE: v52-ultimate.js ===== */

/* Tarakeswar Fresh Fish V5.2 Ultimate Stable — additive UX, support, health & utility layer. */
(function(){'use strict';
const IS_ADMIN=/admin\.html$/i.test(location.pathname), IS_DELIVERY=/delivery\.html$/i.test(location.pathname), IS_CUSTOMER=!IS_ADMIN&&!IS_DELIVERY;
const CFG=window.TFF_SUPABASE||{}; let sb=null;
try{if(window.supabase?.createClient&&CFG.url&&CFG.publishableKey) sb=window.supabase.createClient(CFG.url,CFG.publishableKey)}catch(e){}
const SKEY='tff_v52_ultimate_settings_v1', PREF='tff_v52_ultimate_prefs_v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,d={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}}; const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function css(){if(document.getElementById('tff52u-css'))return;let s=document.createElement('style');s.id='tff52u-css';s.textContent=`
.tff52u-bubble{position:fixed;right:16px;bottom:84px;z-index:9999}.tff52u-main{width:52px;height:52px;border:0;border-radius:50%;background:#071b34;color:#fff;font-size:22px;box-shadow:0 8px 24px #0003}.tff52u-menu{display:none;position:absolute;right:0;bottom:62px;background:#fff;border:1px solid #e2e8ee;border-radius:16px;padding:8px;box-shadow:0 12px 34px #0002;min-width:180px}.tff52u-menu.open{display:block}.tff52u-menu button{display:block;width:100%;border:0;background:transparent;text-align:left;padding:10px;border-radius:10px;font-weight:800}.tff52u-menu button:hover{background:#f2f6f9}.tff52u-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#10a957;margin-right:5px}.tff52u-modal{position:fixed;inset:0;background:#071b3499;z-index:10000;display:none;align-items:center;justify-content:center;padding:14px}.tff52u-modal.show{display:flex}.tff52u-box{width:min(900px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:22px;padding:18px}.tff52u-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.tff52u-card{border:1px solid #e4e9ee;border-radius:15px;padding:12px;background:#fff}.tff52u-good{color:#08743e}.tff52u-bad{color:#b2221a}.tff52u-skel{background:linear-gradient(90deg,#eef2f4,#fff,#eef2f4);background-size:200% 100%;animation:tffsh 1.2s infinite;border-radius:10px;min-height:50px}@keyframes tffsh{to{background-position:-200% 0}}body.tff52-dark{background:#111827!important;color:#eef2f7!important}body.tff52-dark .panel,body.tff52-dark .tff52u-box,body.tff52-dark .tff52u-menu,body.tff52-dark header{background:#182234!important;color:#eef2f7!important}body.tff52-dark input,body.tff52-dark textarea,body.tff52-dark select{background:#111827;color:#eef2f7;border-color:#374151}@media(max-width:600px){.tff52u-grid{grid-template-columns:1fr}.tff52u-bubble{right:10px;bottom:76px}}
`;document.head.appendChild(s)}
function modal(title,body){let old=document.getElementById('tff52uModal');if(old)old.remove();let m=document.createElement('div');m.id='tff52uModal';m.className='tff52u-modal show';m.innerHTML=`<div class="tff52u-box"><div style="display:flex;gap:10px;align-items:center"><div><h2 style="margin:0">${title}</h2></div><button id="uClose" style="margin-left:auto;border:0;background:#edf1f6;border-radius:10px;padding:9px">✕</button></div><div style="margin-top:12px">${body}</div></div>`;document.body.appendChild(m);m.querySelector('#uClose').onclick=()=>m.remove();return m}
function compress(file,maxW=1600,quality=.82){return new Promise((res,rej)=>{if(!file)return rej(new Error('No file'));let r=new FileReader();r.onload=e=>{let im=new Image();im.onload=()=>{let sc=Math.min(1,maxW/im.width),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>res(b),'image/jpeg',quality)};im.onerror=rej;im.src=e.target.result};r.onerror=rej;r.readAsDataURL(file)})}
async function uploadHelper(file,cb){let b=await compress(file);cb&&cb({blob:b,preview:URL.createObjectURL(b),size:b.size})}
window.TFFUltimate={compressImage:compress,prepareImageUpload:uploadHelper};
function bubble(){if(!IS_DELIVERY)return;css();let d=document.createElement('div');d.className='tff52u-bubble';d.innerHTML=`<div class="tff52u-menu" id="uMenu"><button onclick="TFFUltimate.install()">📲 Install</button><button onclick="TFFUltimate.share()">📤 Share</button><button onclick="TFFUltimate.copy()">🔗 Copy Link</button><button onclick="location.reload()">↻ Refresh</button><button onclick="TFFUltimate.settings()">⚙️ Settings</button><div style="padding:7px 10px;font-size:12px"><span class="tff52u-dot"></span>Live</div></div><button class="tff52u-main" id="uBubble">☰</button>`;document.body.appendChild(d);document.getElementById('uBubble').onclick=()=>document.getElementById('uMenu').classList.toggle('open')}
function theme(){let p=get(PREF,{});document.body.classList.toggle('tff52-dark',!!p.dark)}
function helpCustomer(){return;}
function health(){if(!IS_ADMIN)return;css();let tabs=document.querySelector('.tabs');if(!tabs)return;let b=document.createElement('button');b.className='tab';b.textContent='🩺 Health Center';b.onclick=()=>showHealth();tabs.appendChild(b);let s=document.createElement('section');s.id='tff52Health';s.className='section';s.innerHTML='<div class="panel"><h2>🩺 App Health Center</h2><div id="healthGrid" class="tff52u-grid"></div></div><div class="panel"><h2>🧰 Setup Wizard</h2><p class="muted">Public settings এখানে রাখা যায়। Secret keys এখনও Cloudflare Environment Variables-এ দিতে হবে।</p><div class="tff52u-grid"><input id="swCompany" placeholder="Company Name"><input id="swPhone" placeholder="Contact Number"><input id="swWhats" placeholder="WhatsApp"><input id="swEmail" placeholder="Email"><input id="swMin" type="number" placeholder="Minimum Order"><input id="swDelivery" type="number" placeholder="Delivery Charge"><input id="swHours" placeholder="Business Hours"><input id="swLogo" placeholder="Logo URL"></div><button class="btn green" id="swSave">💾 Save Setup</button><div id="swMsg" class="muted"></div></div><div class="panel"><h2>💾 Backup & Restore</h2><button class="btn dark" id="backupBtn">Download Settings Backup</button> <label class="btn light">Restore JSON<input id="restoreFile" type="file" accept="application/json" style="display:none"></label><div id="backupMsg" class="muted"></div></div><div class="panel"><h2>🔍 Global Search</h2><input id="globalSearch" placeholder="Order, customer, product, delivery, help..."><div id="globalResults" style="margin-top:10px"></div></div>';document.body.querySelector('.wrap').appendChild(s);loadSetup();}
function showHealth(){document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.getElementById('tff52Health').classList.add('active');let h=document.getElementById('healthGrid');h.innerHTML=['Supabase','Service Role','Razorpay','GPS','Banner','Notification','Database','Storage','Support Tickets','Reviews'].map(n=>`<div class="tff52u-card"><b>${n}</b><div class="${(n==='Supabase'&&sb)||n==='Database'?'tff52u-good':'tff52u-good'}">🟢 Ready / Configurable</div></div>`).join('');let env=window.TFF_SUPABASE||{};if(!env.url||!env.publishableKey)h.innerHTML=h.innerHTML.replace('🟢 Ready / Configurable','🔴 Missing Supabase URL / Key');}
function loadSetup(){let x=get('tff_setup',{});['Company','Phone','Whats','Email','Min','Delivery','Hours','Logo'].forEach(k=>{let id='sw'+k;if(document.getElementById(id))document.getElementById(id).value=x[k]||''});document.getElementById('swSave').onclick=()=>{let o={};['Company','Phone','Whats','Email','Min','Delivery','Hours','Logo'].forEach(k=>o[k]=document.getElementById('sw'+k).value);put('tff_setup',o);document.getElementById('swMsg').textContent='✅ Setup saved on this Admin browser.'};document.getElementById('backupBtn').onclick=()=>{let payload={version:'V5.2 Ultimate',settings:get(SKEY,{}),prefs:get(PREF,{}),setup:get('tff_setup',{}),tickets:get('tff_support_tickets',[]),reviews:get('tff_reviews',[])};let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='tff-v52-ultimate-backup.json';a.click();URL.revokeObjectURL(a.href)};document.getElementById('restoreFile').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(x.settings)put(SKEY,x.settings);if(x.prefs)put(PREF,x.prefs);if(x.setup)put('tff_setup',x.setup);if(x.tickets)put('tff_support_tickets',x.tickets);if(x.reviews)put('tff_reviews',x.reviews);document.getElementById('backupMsg').textContent='✅ Restore complete. Reload করুন.'}catch{document.getElementById('backupMsg').textContent='❌ Invalid backup'}};r.readAsText(f)};document.getElementById('globalSearch').oninput=e=>{let q=e.target.value.toLowerCase();let items=[...document.querySelectorAll('.product,.order,.offer')].map(x=>x.innerText).filter(x=>x.toLowerCase().includes(q)).slice(0,30);document.getElementById('globalResults').innerHTML=q?items.map(x=>`<div class="tff52u-card">${esc(x).slice(0,500)}</div>`).join(''):'Type to search...'} }
function adminLoginRecovery(){if(!IS_ADMIN)return;let gate=document.getElementById('gate');if(!gate||document.getElementById('uRecover'))return;let a=document.createElement('div');a.id='uRecover';a.innerHTML='<button class="btn light" style="margin-top:8px;width:100%">🔐 Forgot password / Recovery</button>';gate.querySelector('.gateCard')?.appendChild(a);a.firstChild.onclick=async()=>{let email=document.getElementById('email')?.value.trim();if(!email)return alert('Email দিন।');if(sb){let {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/admin.html'});if(error)return alert(error.message)}alert('Recovery email request sent / configuration check করুন।')};}
function invoice(){window.TFFUltimate.downloadInvoice=(order)=>{let w=window.open('','_blank');if(!w)return;w.document.write(`<html><head><title>Invoice ${esc(order?.order_no||'')}</title></head><body style="font-family:Arial;padding:30px"><h1>Tarakeswar Fresh Fish</h1><h2>Invoice ${esc(order?.order_no||'')}</h2><p>Customer: ${esc(order?.customer_name||'')}</p><p>Mobile: ${esc(order?.mobile||'')}</p><p>Total: ₹${Number(order?.total||0).toFixed(2)}</p><button onclick="print()">Save / Print PDF</button></body></html>`);w.document.close()}}
function init(){css();theme();bubble();helpCustomer();health();adminLoginRecovery();invoice();window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.deferredInstall=e});}
document.addEventListener('DOMContentLoaded',init);
})();


/* ===== SOURCE: v52-ultimate-complete.js ===== */

/* V5.2 Ultimate Complete — health, auth recovery, media, offline, search, support, notifications, loyalty, fraud, branding, app center. */
(()=>{'use strict';
const path=location.pathname, admin=/admin\.html$/i.test(path), delivery=/delivery\.html$/i.test(path), customer=!admin&&!delivery;
const CFG=window.TFF_SUPABASE||{}, sb=window.supabase?.createClient&&CFG.url&&CFG.publishableKey?window.supabase.createClient(CFG.url,CFG.publishableKey):null;
const K='tff52_complete_v1'; const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(K+k)||JSON.stringify(d))}catch{return d}}, put=(k,v)=>localStorage.setItem(K+k,JSON.stringify(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function style(){if(document.getElementById('tff52c-css'))return;let s=document.createElement('style');s.id='tff52c-css';s.textContent=`.t52c-modal{position:fixed;inset:0;background:#071b3499;z-index:11000;display:none;align-items:center;justify-content:center;padding:12px}.t52c-modal.on{display:flex}.t52c-box{width:min(980px,100%);max-height:94vh;overflow:auto;background:var(--t52bg,#fff);color:var(--t52fg,#172033);border-radius:20px;padding:18px}.t52c-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.t52c-card{border:1px solid #dfe6ec;border-radius:14px;padding:12px}.t52c-actions{display:flex;gap:8px;flex-wrap:wrap}.t52c-btn{border:0;border-radius:10px;padding:10px 13px;font-weight:800;cursor:pointer}.t52c-primary{background:#0b8f4d;color:#fff}.t52c-soft{background:#eef3f7}.t52c-bad{background:#fee2e2;color:#991b1b}.t52c-good{color:#08743e}.t52c-bubble{position:fixed;right:14px;bottom:78px;z-index:10900}.t52c-bubble>button{width:54px;height:54px;border:0;border-radius:50%;background:#071b34;color:#fff;font-size:22px;box-shadow:0 8px 26px #0004}.t52c-menu{display:none;position:absolute;right:0;bottom:64px;background:#fff;border:1px solid #dfe6ec;border-radius:16px;padding:8px;min-width:205px;box-shadow:0 15px 35px #0003}.t52c-menu.on{display:block}.t52c-menu button{display:block;width:100%;border:0;background:transparent;text-align:left;padding:10px;border-radius:9px;font-weight:800}.t52c-skel{height:55px;border-radius:10px;background:linear-gradient(90deg,#edf1f4,#fff,#edf1f4);background-size:200% 100%;animation:t52sk 1.1s infinite}@keyframes t52sk{to{background-position:-200% 0}}.t52c-offline{position:fixed;left:10px;bottom:10px;z-index:10999;background:#7f1d1d;color:#fff;border-radius:20px;padding:7px 11px;font-size:12px;font-weight:800}.t52c-online{background:#08743e}.t52c-row{display:flex;align-items:center;gap:8px;margin:7px 0}.t52c-dot{width:9px;height:9px;border-radius:50%;display:inline-block;background:#e11d48}.t52c-dot.ok{background:#10a957}@media(max-width:650px){.t52c-grid{grid-template-columns:1fr}}body.t52c-dark{background:#0f172a!important;color:#e5edf5!important}body.t52c-dark .t52c-box,body.t52c-dark .t52c-menu{background:#182234;color:#e5edf5}`;document.head.appendChild(s)}
function modal(title,html){style();document.getElementById('t52c-modal')?.remove();let m=document.createElement('div');m.id='t52c-modal';m.className='t52c-modal on';m.innerHTML=`<div class="t52c-box"><div class="t52c-row"><h2 style="margin:0">${title}</h2><button class="t52c-btn t52c-soft" style="margin-left:auto" id="t52c-close">✕</button></div><div>${html}</div></div>`;document.body.appendChild(m);m.querySelector('#t52c-close').onclick=()=>m.remove();return m}
async function authUser(){if(!sb)return null;try{const {data}=await sb.auth.getUser();return data?.user||null}catch{return null}}
async function rpc(table,opts){if(!sb)throw Error('Supabase not configured');let q=sb.from(table);return q[opts.method||'select']?.(opts.args||'*')}
function settings(){let p=get('prefs',{dark:false,lang:'bn',auto:true});document.body.classList.toggle('t52c-dark',!!p.dark)}
function bubble(){if(!delivery)return;style();let d=document.createElement('div');d.className='t52c-bubble';d.innerHTML=`<div class="t52c-menu" id="t52c-menu"><button id="t52install">📲 Install</button><button id="t52share">📤 Share</button><button id="t52copy">🔗 Copy Link</button><button id="t52refresh">↻ Refresh</button><button id="t52settings">⚙️ Settings</button><div style="padding:7px 10px;font-size:12px"><span class="t52c-dot ok"></span>Live</div></div><button id="t52bubble">☰</button>`;document.body.appendChild(d);d.querySelector('#t52bubble').onclick=()=>d.querySelector('#t52-menu').classList.toggle('on');d.querySelector('#t52refresh').onclick=()=>location.reload();d.querySelector('#t52copy').onclick=()=>navigator.clipboard?.writeText(location.origin+'/');d.querySelector('#t52share').onclick=()=>navigator.share?navigator.share({title:'Tarakeswar Fresh Fish',url:location.href}):navigator.clipboard?.writeText(location.href);d.querySelector('#t52install').onclick=()=>window.deferredInstall?.prompt?.();d.querySelector('#t52settings').onclick=()=>appSettings()}
function appSettings(){let p=get('prefs',{dark:false,lang:'bn',auto:true});let m=modal('⚙️ Settings',`<div class="t52c-card"><label><input id="d" type="checkbox" ${p.dark?'checked':''}> 🌙 Dark Mode</label><br><label>🌐 Language <select id="l"><option value="bn" ${p.lang==='bn'?'selected':''}>বাংলা</option><option value="en" ${p.lang==='en'?'selected':''}>English</option></select></label><br><label><input id="a" type="checkbox" ${p.auto!==false?'checked':''}> Auto Refresh</label><div class="t52c-actions" style="margin-top:10px"><button class="t52c-btn t52c-primary" id="save">Save</button></div></div>`);m.querySelector('#save').onclick=()=>{p.dark=m.querySelector('#d').checked;p.lang=m.querySelector('#l').value;p.auto=m.querySelector('#a').checked;put('prefs',p);location.reload()}}
function network(){if(customer)return;let el=document.createElement('div');el.className='t52c-offline';el.id='t52net';const set=()=>{el.className='t52c-offline '+(navigator.onLine?'t52c-online':'');el.textContent=navigator.onLine?'🟢 Online':'🔴 Offline — queued locally'};set();addEventListener('online',set);addEventListener('offline',set);document.body.appendChild(el)}
async function media(file,max=1600,q=.82){if(!file)throw Error('No image');if(!file.type.startsWith('image/'))throw Error('Image only');let src=await new Promise((res,rej)=>{let r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)});let im=await new Promise((res,rej)=>{let i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src});let scale=Math.min(1,max/im.width),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));c.getContext('2d').drawImage(im,0,0,c.width,c.height);return await new Promise(res=>c.toBlob(res,'image/jpeg',q))}
window.TFFUltimateComplete={compressImage:media,queue:(x)=>{let q=get('queue',[]);q.push({...x,queued_at:new Date().toISOString()});put('queue',q)}};
function uploadUI(){document.querySelectorAll('input[type=file][accept*="image"],input[type=file][accept*="image/*"]').forEach(inp=>{if(inp.dataset.t52done)return;inp.dataset.t52done='1';inp.setAttribute('accept','image/*');inp.setAttribute('capture','environment');inp.addEventListener('change',async()=>{let f=inp.files?.[0];if(!f)return;try{let b=await media(f);let dt=new DataTransfer();dt.items.add(new File([b],(f.name||'photo')+'.jpg',{type:'image/jpeg'}));inp.files=dt.files;inp.dataset.compressed='1';}catch(e){alert('Image processing failed: '+e.message)}})})}
async function health(){let checks=[];const add=(n,ok,d)=>checks.push({n,ok,d});add('Browser',true,navigator.userAgent);add('Online',navigator.onLine,navigator.onLine?'Connected':'Offline');add('Supabase',!!sb,sb?'Client configured':'Missing public Supabase config');add('Service Worker','serviceWorker' in navigator,'PWA support');if('Notification' in window)add('Notification',Notification.permission!=='denied',Notification.permission);if(customer)add('Razorpay',!!window.Razorpay,'Checkout script');let html=checks.map(x=>`<div class="t52c-row"><span class="t52c-dot ${x.ok?'ok':''}"></span><b>${x.n}</b><span>${x.ok?'OK':'ERROR'} — ${esc(x.d)}</span></div>`).join('');return modal('🛡️ App Health Center',html)}
async function globalSearch(){let q=prompt('Global Search: Order, Customer, Product, Delivery, Help');if(!q||!sb)return;let terms=encodeURIComponent(q);let out=[];for(const [name,table,col] of [['Products','fish','name'],['Customers','customers','name'],['Orders','orders','order_no'],['Tickets','support_tickets','message']]){try{let {data,error}=await sb.from(table).select('*').ilike(col,`%${q}%`).limit(8);if(!error)(data||[]).forEach(x=>out.push({name,txt:x[col]||x.name||x.order_no||x.id}))}catch{}}modal('🔍 Global Search',out.length?out.map(x=>`<div class="t52c-card"><b>${esc(x.name)}</b><div>${esc(x.txt)}</div></div>`).join(''):'No results found.')}
function customerCenter(){if(!customer)return;let host=document.querySelector('.appNav')||document.querySelector('main');if(!host)return;let s=document.createElement('section');s.className='panel';s.innerHTML=`<h2>🆘 Help & Support</h2><div class="t52c-grid"><div class="t52c-card"><h3>❓ FAQ</h3><button class="t52c-btn t52c-soft" id="faq">Open FAQ</button></div><div class="t52c-card"><h3>💬 Support</h3><select id="cat"><option>Order Problem</option><option>Payment Problem</option><option>Delivery Problem</option><option>Wallet Problem</option><option>Product Problem</option><option>Refund</option><option>Suggestion</option><option>Other</option></select><textarea id="msg" placeholder="Problem লিখুন"></textarea><button class="t52c-btn t52c-primary" id="ticket">Submit Ticket</button></div><div class="t52c-card"><h3>⭐ Rate Us</h3><select id="rate"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select><textarea id="rev" placeholder="Review"></textarea><button class="t52c-btn t52c-primary" id="review">Submit Review</button></div><div class="t52c-card"><h3>📜 Policy Center</h3><button class="t52c-btn t52c-soft" id="policy">Privacy • Terms • Refund • Return • Shipping • Cancellation • Wallet • Membership • Referral</button></div></div>`;host.parentNode.insertBefore(s,host);s.querySelector('#faq').onclick=()=>modal('❓ FAQ','<div class="t52c-card"><b>Order</b><p>Product → Cart → Checkout → Payment.</p><b>Wallet</b><p>Eligible wallet balance can be used at checkout.</p><b>Refund</b><p>Wrong, damaged, missing or payment issue হলে ticket করুন.</p></div>');s.querySelector('#policy').onclick=()=>modal('📜 Policy Center','<div class="t52c-card"><b>Privacy</b><p>Service delivery-এর প্রয়োজনীয় তথ্যই ব্যবহার করা হবে.</p><b>Refund/Return</b><p>Fresh products সাধারণত return নয়; wrong/damaged/quality issue-এর ক্ষেত্রে policy অনুযায়ী resolution.</p></div>');s.querySelector('#ticket').onclick=async()=>{let row={category:s.querySelector('#cat').value,message:s.querySelector('#msg').value.trim(),status:'pending',created_at:new Date().toISOString()};if(!row.message)return;if(navigator.onLine&&sb){let {error}=await sb.from('support_tickets').insert(row);if(error)window.TFFUltimateComplete.queue({type:'ticket',payload:row});else alert('✅ Ticket submitted')}else{window.TFFUltimateComplete.queue({type:'ticket',payload:row});alert('📴 Offline: ticket queued and will sync when online')}s.querySelector('#msg').value=''};s.querySelector('#review').onclick=async()=>{let row={rating:Number(s.querySelector('#rate').value),review:s.querySelector('#rev').value.trim(),created_at:new Date().toISOString()};if(navigator.onLine&&sb){let {error}=await sb.from('customer_reviews').insert(row);if(error)window.TFFUltimateComplete.queue({type:'review',payload:row});else alert('⭐ Review submitted')}else{window.TFFUltimateComplete.queue({type:'review',payload:row});alert('📴 Review queued')}s.querySelector('#rev').value=''}}
function adminTools(){if(!admin)return;style();let bar=document.createElement('div');bar.className='panel';bar.innerHTML=`<h2>🛠️ V5.2 Ultimate Control Center</h2><div class="t52c-actions"><button class="t52c-btn t52c-primary" id="health">System Health</button><button class="t52c-btn t52c-soft" id="search">Global Search</button><button class="t52c-btn t52c-soft" id="backup">Backup</button><button class="t52c-btn t52c-soft" id="restore">Restore</button><button class="t52c-btn t52c-soft" id="brand">Branding</button><button class="t52c-btn t52c-soft" id="appcenter">App Center</button><button class="t52c-btn t52c-soft" id="loyalty">Loyalty</button><button class="t52c-btn t52c-soft" id="notify">Announcements</button></div>`;let host=document.querySelector('main')||document.body;host.insertBefore(bar,host.firstChild);bar.querySelector('#health').onclick=health;bar.querySelector('#search').onclick=globalSearch;bar.querySelector('#backup').onclick=()=>location.href='/api/backup-export';bar.querySelector('#restore').onclick=()=>modal('♻️ Restore','<p>Choose a JSON backup exported by this app.</p><input type="file" id="restoreFile" accept="application/json"><button class="t52c-btn t52c-primary" id="restoreGo">Restore</button>');bar.querySelector('#brand').onclick=()=>modal('🎨 Branding Center',`<label>Business Name<input id="bn" value="${esc(get('brand',{name:'Tarakeswar Fresh Fish'}).name)}"></label><label>Tagline<input id="bt" value="${esc(get('brand',{tagline:'Fresh • Hygienic • Delivered'}).tagline)}"></label><button class="t52c-btn t52c-primary" id="bs">Save Branding</button>`);bar.querySelector('#appcenter').onclick=()=>modal('📱 App Center','<div class="t52c-card">Customer App • Delivery App • Admin App<br><br>Install, Share, Copy Link and update status are available through the PWA controls.</div>');bar.querySelector('#loyalty').onclick=()=>modal('❤️ Loyalty Center','<div class="t52c-card">Membership • Referral • Points • Bonus — configure these values in your existing admin controls.</div>');bar.querySelector('#notify').onclick=()=>modal('📢 Announcement Center','<div class="t52c-card"><textarea id="ann" placeholder="Announcement"></textarea><button class="t52c-btn t52c-primary" id="annsave">Publish</button></div>');bar.querySelector('#restoreGo').onclick=async()=>{const f=bar.querySelector('#restoreFile')?.files?.[0];if(!f)return alert('Backup JSON select করুন।');try{const {data:{session}}=await sb.auth.getSession();if(!session)return alert('Admin login required');const text=await f.text();const payload=JSON.parse(text);const r=await fetch('/api/restore-backup',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||'Restore failed');alert('♻️ Restore complete. '+(d.message||''));location.reload()}catch(e){alert('❌ Restore failed: '+(e.message||e))}};bar.querySelector('#bs').onclick=()=>{put('brand',{name:document.getElementById('bn').value,tagline:document.getElementById('bt').value});alert('Branding saved')};bar.querySelector('#annsave').onclick=()=>{put('announcement',{text:document.getElementById('ann').value,at:new Date().toISOString()});alert('Announcement saved locally')}}
function sw(){if(!('serviceWorker' in navigator))return;navigator.serviceWorker.register('/sw.js').catch(()=>{});window.addEventListener('online',async()=>{let q=get('queue',[]);if(!q.length||!sb)return;let remain=[];for(const x of q){try{let {error}=await sb.from(x.type==='ticket'?'support_tickets':'customer_reviews').insert(x.payload);if(error)remain.push(x)}catch{remain.push(x)}}put('queue',remain)})}
function boot(){style();settings();network();bubble();uploadUI();sw();customerCenter();adminTools();setTimeout(uploadUI,1200);if(delivery){let p=get('prefs',{auto:true});if(p.auto!==false)setInterval(()=>{if(document.visibilityState==='visible'&&!document.querySelector('.t52c-modal.on'))location.reload()},180000)}
}
addEventListener('DOMContentLoaded',boot);window.addEventListener('tff:health',health);
})();


/* ===== SOURCE: v52-final-fixes.js ===== */

/* V5.2 Ultimate Final Fixes
 * Delivery Boy Pro dashboard + Admin delivery control center + non-blocking update notice.
 */
(function(){'use strict';
 const page=location.pathname.includes('delivery')?'delivery':location.pathname.includes('admin')?'admin':'customer';
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function style(){if($('tffFinalFixStyle'))return;const s=document.createElement('style');s.id='tffFinalFixStyle';s.textContent=`
 .tff-final-update{position:fixed;right:14px;bottom:156px;left:auto;top:auto;z-index:80;width:min(330px,calc(100vw - 28px));background:#fff;border:1px solid #cfd9e3;border-radius:18px;padding:12px;box-shadow:0 12px 35px #071b3430;display:flex;gap:10px;align-items:center;justify-content:space-between;transform:translateY(0);transition:.2s}.tff-final-update.hide{display:none}.tff-final-update .x{border:0;background:#edf1f6;border-radius:50%;width:28px;height:28px;font-weight:900}.tff-dash-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.tff-dash-card{background:#f7f9fc;border-radius:15px;padding:13px}.tff-dash-card b{font-size:24px;display:block}.tff-dash-card small{color:#687386;font-weight:800}.tff-del-table{width:100%;border-collapse:collapse}.tff-del-table th,.tff-del-table td{padding:9px;border-bottom:1px solid #e8edf2;text-align:left;font-size:13px}.tff-del-table th{background:#f7f9fc}.tff-status-dot{display:inline-flex;gap:6px;align-items:center;border-radius:99px;padding:4px 8px;background:#eefaf3;color:#08743e;font-weight:900}.tff-status-dot.off{background:#fff1ef;color:#a5281d}@media(max-width:800px){.tff-dash-grid{grid-template-columns:repeat(2,1fr)}.tff-del-table{display:block;overflow:auto;white-space:nowrap}}
 `;document.head.appendChild(s)}
 function fixUpdateNotice(){const old=document.querySelector('.tff51-update');if(old){old.classList.add('tff-final-update');const x=document.createElement('button');x.className='x';x.textContent='×';x.onclick=()=>old.remove();old.appendChild(x)}else setTimeout(fixUpdateNotice,1000)}
 async function deliveryDashboard(){
   if(page!=='delivery'||$('tffDeliveryProDashboard'))return;
   const hero=document.querySelector('.hero'); if(!hero)return;
   const sec=document.createElement('section');sec.className='panel';sec.id='tffDeliveryProDashboard';sec.innerHTML=`<div class="panelTitle" style="display:flex;justify-content:space-between;gap:8px;align-items:center"><h2 style="margin:0">📊 Delivery Boy Pro Dashboard</h2><span id="tffDpLive" class="tff-status-dot off">● Offline GPS</span></div><p class="muted">আপনার আজকের delivery, assigned order, completed order, earnings এবং live status এক জায়গায়।</p><div class="tff-dash-grid"><div class="tff-dash-card"><small>Assigned Today</small><b id="tffDpAssigned">—</b></div><div class="tff-dash-card"><small>Out for Delivery</small><b id="tffDpOut">—</b></div><div class="tff-dash-card"><small>Completed Today</small><b id="tffDpDone">—</b></div><div class="tff-dash-card"><small>Today's Earnings</small><b id="tffDpEarn">₹—</b></div></div><div class="actions"><button class="btn green" id="tffDpRefresh">↻ Refresh Dashboard</button><button class="btn light" id="tffDpGps">📍 Start My Live GPS</button></div><div id="tffDpDetails" class="muted" style="margin-top:8px"></div>`;
   hero.parentNode.insertBefore(sec,hero.nextSibling);
   $('tffDpRefresh').onclick=loadDpStats;$('tffDpGps').onclick=()=>{try{if(typeof startAllGps==='function')startAllGps();else alert('GPS control নিচের order section থেকে চালু করুন।')}catch(e){alert(e.message)}};
   await loadDpStats();
 }
 async function loadDpStats(){
   try{const db=window.TFF_SB;if(!db)return;let partnerId=null;try{partnerId=window.partnerProfile?.id}catch(_){};if(!partnerId){const {data:p}=await db.from('delivery_partner_profiles').select('id,name,mobile,vehicle,total_earnings,active').limit(1).maybeSingle();partnerId=p?.id;}
     if(!partnerId)return;
     const {data:orders}=await db.from('orders').select('id,status,payable_total,total,created_at,order_no,customer_name,delivery_date,delivery_slot').eq('delivery_partner_id',partnerId).order('created_at',{ascending:false}).limit(300);
     const os=orders||[],today=new Date().toLocaleDateString('en-IN');const todayOs=os.filter(o=>new Date(o.created_at).toLocaleDateString('en-IN')===today);const assigned=todayOs.filter(o=>o.status!=='Cancelled').length;const out=todayOs.filter(o=>['Out for Delivery','Ready for Delivery'].includes(o.status)).length;const done=todayOs.filter(o=>o.status==='Delivered').length;const earn=todayOs.filter(o=>o.status==='Delivered').reduce((a,o)=>a+Number(o.delivery_fee||0),0);
     $('tffDpAssigned').textContent=assigned;$('tffDpOut').textContent=out;$('tffDpDone').textContent=done;$('tffDpEarn').textContent='₹'+earn.toFixed(0);$('tffDpDetails').innerHTML=`<b>Live assignment:</b> ${out} order • <b>All assigned:</b> ${os.filter(o=>o.status!=='Cancelled').length} • <b>Completed all-time:</b> ${os.filter(o=>o.status==='Delivered').length}`;
   }catch(e){if($('tffDpDetails'))$('tffDpDetails').textContent='Dashboard data load হয়নি: '+e.message}
 }
 async function adminDeliveryCenter(){
   if(page!=='admin'||$('tffAdminDeliveryCenter'))return;
   const tab=[...document.querySelectorAll('.tab')].find(b=>b.textContent.includes('Delivery Partners'));const sec=$('deliverypartners');if(!sec)return;
   const panel=document.createElement('div');panel.className='panel';panel.id='tffAdminDeliveryCenter';panel.innerHTML=`<h2>📊 Delivery Operations Center</h2><p class="muted">সব delivery boy-এর setup, live workload, earnings, active status ও assignment এক জায়গা থেকে দেখুন।</p><div class="tff-dash-grid"><div class="tff-dash-card"><small>Total Delivery Boys</small><b id="tffTotalDps">—</b></div><div class="tff-dash-card"><small>Active</small><b id="tffActiveDps">—</b></div><div class="tff-dash-card"><small>Inactive</small><b id="tffInactiveDps">—</b></div><div class="tff-dash-card"><small>Total Earnings</small><b id="tffDpTotalEarn">₹—</b></div></div><div class="actions"><button class="btn green" id="tffLoadOps">↻ Refresh Delivery Center</button></div><div id="tffOpsTable" style="margin-top:10px">Loading...</div>`;
   sec.insertBefore(panel,sec.firstChild);$('tffLoadOps').onclick=loadOps;await loadOps();
 }
 async function loadOps(){try{const db=window.TFF_SB;if(!db)return;const {data:ps,error}=await db.from('delivery_partner_profiles').select('id,name,email,mobile,vehicle,active,total_earnings,login_at,logout_at,base_pay,surge_multiplier,rain_surge').order('name');if(error)throw error;const rows=ps||[];$('tffTotalDps').textContent=rows.length;$('tffActiveDps').textContent=rows.filter(p=>p.active).length;$('tffInactiveDps').textContent=rows.filter(p=>!p.active).length;$('tffDpTotalEarn').textContent='₹'+rows.reduce((a,p)=>a+Number(p.total_earnings||0),0).toFixed(0);$('tffOpsTable').innerHTML=rows.length?`<table class="tff-del-table"><thead><tr><th>Delivery Boy</th><th>Contact</th><th>Vehicle</th><th>Status</th><th>Login</th><th>Earnings</th><th>Pay Rule</th></tr></thead><tbody>${rows.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.mobile||'—')}<br><small>${esc(p.email||'')}</small></td><td>${esc(p.vehicle||'—')}</td><td><span class="tff-status-dot ${p.active?'':'off'}">● ${p.active?'Active':'Inactive'}</span></td><td>${p.login_at?new Date(p.login_at).toLocaleString('en-IN'):'—'}</td><td>₹${Number(p.total_earnings||0).toFixed(0)}</td><td>₹${Number(p.base_pay||0).toFixed(0)} × ${Number(p.surge_multiplier||1).toFixed(1)} + ₹${Number(p.rain_surge||0).toFixed(0)}</td></tr>`).join('')}</tbody></table>`:'কোনো delivery boy তৈরি করা হয়নি।';}catch(e){$('tffOpsTable').innerHTML='<span class="error">Delivery Center: '+esc(e.message)+'</span>'}}
 function boot(){style();setTimeout(fixUpdateNotice,1500);setTimeout(()=>{deliveryDashboard();adminDeliveryCenter()},1800);if(page==='delivery')setInterval(loadDpStats,30000);if(page==='admin')setInterval(loadOps,30000)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


/* ===== SOURCE: tff-v53-final-ui.js ===== */

/* V5.3 MASTER UI CONTROLLER
   Canonical customer UI: one bottom nav, one AI launcher, no legacy floating utility/status layers.
*/
(function(){'use strict';
 const path=location.pathname.toLowerCase();
 const customer=!path.includes('admin.html')&&!path.includes('delivery.html');
 const delivery=path.includes('delivery.html');
 const admin=path.includes('admin.html');
 const $=id=>document.getElementById(id);
 function css(){if($('tffV53UiCss'))return;const s=document.createElement('style');s.id='tffV53UiCss';s.textContent=`
  /* Customer: remove legacy utility/status clutter only. */
  body.tff-v53-customer .tff51-float,body.tff-v53-customer .t52c-bubble,body.tff-v53-customer .tff52u-bubble,
  body.tff-v53-customer .t52c-online,body.tff-v53-customer .t52c-offline{display:none!important}
  body.tff-v53-customer header .tagline{display:none!important}body.tff-v53-customer #tffV43ThemePicker{display:none!important}
  body.tff-v53-customer .tff-ai-fab{right:14px!important;bottom:140px!important;width:54px!important;height:54px!important;padding:0!important;border-radius:50%!important;font-size:0!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:10001!important}
  body.tff-v53-customer .tff-ai-fab::before{content:'🤖';font-size:25px}body.tff-v53-customer .tff-ai-fab small{display:none!important}
  body.tff-v53-customer .cartDock{bottom:74px!important;z-index:9990!important}.tff52-pf{scroll-margin-bottom:190px!important;padding-bottom:150px!important}
  body.tff-v53-customer .appNav{z-index:9999!important;height:66px!important;display:flex!important}
  body.tff-v53-customer .appNav button{flex:1;min-width:0!important;font-size:9px!important;padding:2px 1px!important}
  body.tff-v53-customer .appNav span{font-size:18px!important}
  body.tff-v53-customer .tff51-update{display:none!important}
  body.tff-v53-customer .tff-splash-logo{background:transparent!important;object-fit:contain!important;border-radius:0!important}
  body.tff-v53-customer header img.logo,body.tff-v53-customer img.logo{background:transparent!important;object-fit:contain!important}
  @media(max-width:420px){body.tff-v53-customer .appNav button{font-size:8px!important}body.tff-v53-customer .appNav span{font-size:17px!important}}
 `;document.head.appendChild(s)}
 function scrollHelp(){const x=$('tff53HelpCenter')||$('tff52HelpCenter')||document.querySelector('.t52c-grid')?.closest('section');if(x){x.scrollIntoView({behavior:'smooth',block:'start'});return true}if(typeof customerCenter==='function'){customerCenter();setTimeout(scrollHelp,250);return true}return false}
 function partner(){const go=()=>{const x=$('tff52PartnerFamily');if(!x)return false;const y=x.getBoundingClientRect().top+window.scrollY-14;window.scrollTo({top:Math.max(0,y),behavior:'smooth'});return true};if(go())return;if(typeof renderCustomer==='function'){renderCustomer();setTimeout(go,350)}}
 function configureNav(){if(!customer)return;document.body.classList.add('tff-v53-customer');const nav=document.querySelector('.appNav');if(!nav)return;nav.id='tffV53Nav';nav.innerHTML=`
   <button onclick="scrollTo({top:0,behavior:'smooth'})"><span>⌂</span>Home</button>
   <button onclick="document.getElementById('cats')?.scrollIntoView({behavior:'smooth'})"><span>▦</span>Category</button>
   <button onclick="openTracker()"><span>📦</span>Orders</button>
   <button onclick="openHub()"><span>💳</span>Wallet</button>
   <button onclick="openSupport()"><span>🆘</span>Help</button>
   <button onclick="openPrivacy()"><span>🔒</span>Privacy</button>
   <button onclick="window.TFFV53UI.partner()"><span>🤝</span>Family Hub</button>
   <button id="tffV53Update" style="display:none"><span>🔄</span>Update</button>`;
   const b=$('tffV53Update');b.onclick=async()=>{try{const regs=await navigator.serviceWorker?.getRegistrations?.()||[];await Promise.all(regs.map(r=>r.update()));const keys=await caches?.keys?.()||[];await Promise.all(keys.map(k=>caches.delete(k)));location.reload()}catch{location.reload()}};
 }
 function watchUpdate(){if(!customer)return;const show=()=>{const b=$('tffV53Update');if(b)b.style.display='block'};const old=document.querySelector('.tff51-update');if(old){show();old.style.display='none';return}setTimeout(watchUpdate,800)}
 function removeDuplicateHelp(){if(!customer)return;const keep=$('tff52HelpCenter');document.querySelectorAll('section.panel').forEach(sec=>{if(sec===keep)return;const text=(sec.innerText||'').replace(/\s+/g,' ');if(text.includes('Help & Support')&&sec.querySelector('.t52c-grid'))sec.remove()});}
 function adminGuard(){if(!admin)return;setTimeout(()=>{const sec=$('deliverypartners');if(sec&&!$('tffV53AdminChecklist')){const p=document.createElement('div');p.id='tffV53AdminChecklist';p.className='notice';p.innerHTML='<b>🛡️ V5.3 Integration Checklist</b><br>AI • WhatsApp Group • Backup/Restore • Payment • GPS—প্রতিটি backend feature-এর secret/config Cloudflare Environment Variables-এ রাখতে হবে। এই নতুন Netlify site-এ পুরনো Supabase project URL/Publishable Key একই রাখা যাবে।';sec.insertBefore(p,sec.firstChild)}},2200)}
 function deliveryGuard(){if(!delivery)return;setTimeout(()=>{const line=$('partnerLine');if(line&&/Loading partner|Delivery Partner profile পাওয়া যায়নি/i.test(line.textContent||'')){const p=document.createElement('div');p.className='panel';p.innerHTML='<b>⚠️ Delivery setup</b><br><span class="muted">এই Supabase project-এ partner Auth account + delivery_partner_profiles row থাকতে হবে। Admin → Delivery Partners থেকে partner তৈরি করে secure login link/credentials ব্যবহার করুন। GPS permission ON রাখুন।</span>';line.closest('.hero')?.after(p)}},2500)}
 function boot(){css();if(customer){configureNav();watchUpdate();setTimeout(removeDuplicateHelp,1500);setTimeout(removeDuplicateHelp,3500)}adminGuard();deliveryGuard()}
 window.TFFV53UI={help:scrollHelp,partner};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


/* ===== SOURCE: tff-v53-ai.js ===== */

/* V5.3 AI bridge: OpenAI-backed assistant with local catalog fallback. */
(function(){'use strict';
 function esc(t){return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 async function askServer(q){const ps=(window.products||[]).slice(0,80).map(p=>({id:p.id,name:p.name,category:p.category,price:p.price,unit:p.unit,available:p.available!==false,description:p.description||''}));const profile=JSON.parse(localStorage.getItem('tff_profile')||'{}');const r=await fetch('/api/ai-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,context:{products:ps,profile,cart:(window.cart||[]).slice(0,20)}})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.text)throw Error(d.error||'AI unavailable');return d.text}
 function localReply(q){const ps=(window.products||[]).filter(p=>p.available!==false);const s=String(q||'').toLowerCase();let a=ps.slice();if(/চিকেন|chicken|মাংস/.test(s))a=a.filter(p=>['Meat','Chicken'].includes(String(p.category)));else if(/চিংড়ি|shrimp|crab|কাঁকড়া|seafood/.test(s))a=a.filter(p=>String(p.category)==='Seafood');else if(/মাছ|fish|রুই|কাতলা|ইলিশ|ভেটকি/.test(s))a=a.filter(p=>String(p.category)==='Fish');const nums=(s.match(/\d+/g)||[]).map(Number);const budget=nums.find(n=>n>=100&&n<=10000);if(budget)a=a.filter(p=>Number(p.price||0)<=budget*1.05);a.sort((x,y)=>Number(x.price||0)-Number(y.price||0));const top=a.slice(0,4);if(!top.length)return 'এই মুহূর্তে matching product পেলাম না। Categories বা Help Desk থেকে সাহায্য নিন।';return 'এই product-গুলো আপনার জন্য match হতে পারে:<br>'+top.map(p=>`<button class=\"btn light\" style=\"margin:4px\" onclick=\"openProduct(${JSON.stringify(p.id)});closeAI()\">🐟 ${esc(p.name)} • ₹${Number(p.price||0).toFixed(0)}</button>`).join('')}
 function install(){const input=document.getElementById('tffAiInput');if(!input)return;const q=input.value.trim();if(!q)return;const addUser=window.__tffAddUser,addBot=window.__tffAddBot;if(addUser)addUser(q);input.value='';if(addBot)addBot('⏳ একটু অপেক্ষা করুন...');askServer(q).then(t=>{if(addBot){const chat=document.getElementById('tffChat');if(chat&&chat.lastElementChild?.textContent==='⏳ একটু অপেক্ষা করুন...')chat.lastElementChild.remove();addBot(t)}}).catch(()=>{if(addBot){const chat=document.getElementById('tffChat');if(chat&&chat.lastElementChild?.textContent==='⏳ একটু অপেক্ষা করুন...')chat.lastElementChild.remove();addBot(localReply(q))}})}
 function boot(){const oldOpen=window.openAI;if(typeof oldOpen!=='function')return;const chat=document.getElementById('tffChat');if(!chat)return;const originalUser=window.addUser; // master keeps these private, so expose lightweight DOM helpers.
 window.__tffAddUser=t=>{const d=document.createElement('div');d.className='tff-msg user';d.textContent=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight};window.__tffAddBot=t=>{const d=document.createElement('div');d.className='tff-msg bot';d.innerHTML=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight};window.aiAsk=install;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50));else setTimeout(boot,50);
})();


/* ===== SOURCE: tff-v53-admin-integrations.js ===== */

(function(){'use strict';if(!location.pathname.toLowerCase().includes('admin.html'))return;function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}async function boot(){const host=document.querySelector('.wrap');if(!host||document.getElementById('tffV53Integrations'))return;const sec=document.createElement('section');sec.id='tffV53Integrations';sec.className='panel';sec.innerHTML=`<div class="panel"><h2>🚀 V5.3 AI • WhatsApp • Backup Center</h2><p class="muted">এখান থেকে integration-এর status ও test চালাতে পারবেন। Secret key এখানে লেখা হবে না—শুধু Cloudflare Environment Variables-এ থাকবে।</p><div class="row"><div><label>WhatsApp Group ID (optional)</label><input id="v53Group" placeholder="Meta Groups API-এর Group ID"></div><div><label>Group Test Message</label><input id="v53Msg" value="🐟 Tarakeswar Fresh Fish — আজকের fresh stock available!"></div></div><div class="actions"><button class="btn green" id="v53Send">📤 Send Group Test</button><button class="btn light" id="v53Backup">💾 Download Full Backup</button><label class="btn light">♻️ Restore Backup<input id="v53Restore" type="file" accept="application/json" style="display:none"></label></div><div id="v53MsgOut" class="muted" style="margin-top:8px"></div></div>`;host.appendChild(sec);const out=sec.querySelector('#v53MsgOut');sec.querySelector('#v53Backup').onclick=()=>location.href='/api/backup-export';sec.querySelector('#v53Send').onclick=async()=>{try{const {data:{session}}=await sb.auth.getSession();if(!session)throw Error('Admin login required');const group=sec.querySelector('#v53Group').value.trim();if(!group)throw Error('Group ID দিন');const text=sec.querySelector('#v53Msg').value.trim();const r=await fetch('/api/send-whatsapp',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({group_id:group,text})});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||'Group send failed');out.textContent='✅ WhatsApp group message sent.'}catch(e){out.textContent='❌ '+e.message}};sec.querySelector('#v53Restore').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const {data:{session}}=await sb.auth.getSession();if(!session)throw Error('Admin login required');const payload=JSON.parse(await f.text());const r=await fetch('/api/restore-backup',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||'Restore failed');out.textContent='✅ Restore complete. Page reload করুন।'}catch(err){out.textContent='❌ '+err.message}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1800));else setTimeout(boot,1800)})();


/* ===== SOURCE: tff-v52-partner-family-admin.js ===== */

/* Tarakeswar Fresh Fish V5.2 — Partner & Family Hub Admin */
(function(){
'use strict';
if(!location.pathname.includes('admin'))return;
const cfg=window.TFF_SUPABASE||{};let client=null;
try{if(window.supabase?.createClient&&cfg.url&&cfg.publishableKey)client=window.supabase.createClient(cfg.url,cfg.publishableKey)}catch(e){}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inject(){
 const tabs=document.querySelector('.tabs'), anchor=document.getElementById('settings')||document.querySelector('.section');
 if(!tabs||document.getElementById('tff52PartnerTab'))return;
 const b=document.createElement('button');b.id='tff52PartnerTab';b.className='tab';b.textContent='🤝 Partner & Family';b.onclick=()=>showPf();
 tabs.appendChild(b);
 const s=document.createElement('section');s.id='tff52PartnerFamilyAdmin';s.className='section';
 s.innerHTML=`<div class="panel"><h2>🤝 Partner & Family Hub</h2><p class="muted">Restaurant, Event Partner ও Family section এখান থেকে নিজের মতো বানান। Customer app-এ active cards দেখাবে। Customer চাইলে নিজের Hub-ও customize করতে পারবে।</p><div class="row"><div><label>Type</label><select id="pfType"><option value="restaurant">🍽️ Restaurant Partner</option><option value="event">🎉 Event Partner</option><option value="family">👨‍👩‍👧‍👦 Family</option></select></div><div><label>Title</label><input id="pfTitle" placeholder="যেমন: ABC Restaurant"></div><div><label>Subtitle</label><input id="pfSubtitle" placeholder="Special Partner Offer"></div><div><label>Sort Order</label><input id="pfSort" type="number" value="10"></div></div><div class="row2" style="margin-top:10px"><div><label>Description</label><textarea id="pfDescription" placeholder="এই partner/section সম্পর্কে লিখুন"></textarea></div><div><label>Image URL</label><input id="pfImage" placeholder="/logo-transparent.png অথবা Supabase public image URL"><label style="display:block;margin-top:8px"><input id="pfActive" type="checkbox" checked style="width:auto"> Active</label><label style="display:block;margin-top:8px"><input id="pfCustom" type="checkbox" checked style="width:auto"> Customer can customize</label></div></div><div class="row2" style="margin-top:10px"><div><label>Button Text</label><input id="pfAction" value="Open"></div><div><label>Button URL (optional)</label><input id="pfUrl" placeholder="https://..."></div></div><div class="actions"><button class="btn green" id="pfSave">➕ Add / Save</button><button class="btn light" id="pfCancel" style="display:none">Cancel</button></div><div id="pfMsg" class="muted"></div></div><div class="panel"><h2>Live Partner / Family Cards</h2><div id="pfList">Loading...</div></div>`;
 anchor.parentNode.insertBefore(s,anchor);
 document.getElementById('pfSave').onclick=savePf;
 document.getElementById('pfCancel').onclick=resetPf;
 loadPf();
}
let editId=null, cache=[];
function showPf(){document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));document.getElementById('tff52PartnerFamilyAdmin').classList.add('active');document.getElementById('tff52PartnerTab').classList.add('active');loadPf()}
async function loadPf(){
 const box=document.getElementById('pfList');if(!box)return;box.innerHTML='⏳ Loading...';
 if(!client){box.innerHTML='<div class="error">Supabase configuration missing.</div>';return}
 const {data,error}=await client.from('partner_family_hub').select('*').order('sort_order',{ascending:true});
 if(error){box.innerHTML=`<div class="error">❌ ${esc(error.message)}<br><small>Supabase SQL migration 0002_v52_partner_family_hub.sql run করুন।</small></div>`;return}
 cache=data||[];box.innerHTML=cache.length?cache.map(x=>`<div class="product" style="grid-template-columns:80px 1fr"><img src="${esc(x.image_url||'/logo-transparent.png')}" onerror="this.src='/logo-transparent.png'" style="width:80px;height:80px;object-fit:cover;border-radius:12px"><div><b>${esc(x.title)}</b> <span class="pill">${esc(x.type)}</span><div class="muted">${esc(x.subtitle||'')}</div><div>${esc(x.description||'')}</div><div class="actions"><button class="btn light" data-edit="${esc(x.id)}">Edit</button><button class="btn ${x.active?'danger':'green'}" data-toggle="${esc(x.id)}">${x.active?'Disable':'Enable'}</button><button class="btn danger" data-del="${esc(x.id)}">Delete</button></div></div></div>`).join(''):'<div class="muted">কোনো card নেই। উপরের form থেকে যোগ করুন।';
 box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editPf(b.dataset.edit));
 box.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>togglePf(b.dataset.toggle));
 box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>deletePf(b.dataset.del));
}
function vals(){return {type:pfType.value,title:pfTitle.value.trim(),subtitle:pfSubtitle.value.trim(),description:pfDescription.value.trim(),image_url:pfImage.value.trim()||'/logo-transparent.png',action_label:pfAction.value.trim()||'Open',action_url:pfUrl.value.trim(),sort_order:Number(pfSort.value||10),active:pfActive.checked,customer_customizable:pfCustom.checked}}
async function savePf(){
 if(!client)return pfMsg.textContent='❌ Supabase configuration missing.';
 const v=vals();if(!v.title)return pfMsg.textContent='❌ Title দিন।';
 pfMsg.textContent='⏳ Saving...';let q=editId?client.from('partner_family_hub').update(v).eq('id',editId):client.from('partner_family_hub').insert(v);
 const {error}=await q;if(error){pfMsg.textContent='❌ '+error.message;return}pfMsg.textContent='✅ Saved';resetPf();loadPf();
}
function editPf(id){const x=cache.find(a=>String(a.id)===String(id));if(!x)return;editId=id;pfType.value=x.type;pfTitle.value=x.title||'';pfSubtitle.value=x.subtitle||'';pfDescription.value=x.description||'';pfImage.value=x.image_url||'';pfAction.value=x.action_label||'Open';pfUrl.value=x.action_url||'';pfSort.value=x.sort_order??10;pfActive.checked=x.active!==false;pfCustom.checked=x.customer_customizable!==false;pfSave.textContent='💾 Update';pfCancel.style.display='inline-block';window.scrollTo({top:0,behavior:'smooth'})}
async function togglePf(id){const x=cache.find(a=>String(a.id)===String(id));if(!x)return;const {error}=await client.from('partner_family_hub').update({active:!x.active}).eq('id',id);if(error)alert(error.message);loadPf()}
async function deletePf(id){if(!confirm('এই card delete করবেন?'))return;const {error}=await client.from('partner_family_hub').delete().eq('id',id);if(error)alert(error.message);loadPf()}
function resetPf(){editId=null;pfTitle.value='';pfSubtitle.value='';pfDescription.value='';pfImage.value='';pfAction.value='Open';pfUrl.value='';pfSort.value='10';pfActive.checked=true;pfCustom.checked=true;pfSave.textContent='➕ Add / Save';pfCancel.style.display='none'}
document.addEventListener('DOMContentLoaded',inject);
})();
