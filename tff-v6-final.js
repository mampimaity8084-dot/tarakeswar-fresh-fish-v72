/* Tarakeswar Fresh Fish V6 FINAL — clean UX, AI product studio, AI cart actions, realtime, automation helpers. */
(function(){'use strict';
const $=id=>document.getElementById(id);
const customer=!!$('grid')&&!location.pathname.toLowerCase().includes('admin');
const admin=location.pathname.toLowerCase().includes('admin.html');
const delivery=location.pathname.toLowerCase().includes('delivery.html');
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]) )}
function style(){if($('tffV6Style'))return;const s=document.createElement('style');s.id='tffV6Style';s.textContent=`
/* V6 cleanup: one canonical bottom bar, no old floating utility layers. */
.tff-v6-customer .tff51-update,.tff-v6-customer .feedbackFloat,.tff-v6-customer .trackFloat{display:none!important}
.tff-v6-customer .tff-ai-fab{bottom:78px!important;right:14px!important}
.tff-v6-customer .cartDock{bottom:66px!important}
.tff-v6-customer .appNav{bottom:0!important}
.tff-v6-ai-action{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.tff-v6-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #dbe3ea;background:#f7fafc;border-radius:999px;padding:7px 10px;font-weight:800}
.tff-v6-studio{background:#fff;border:1px solid #e4e9ef;border-radius:20px;padding:16px;margin-top:14px}
.tff-v6-studio-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.tff-v6-studio input,.tff-v6-studio select,.tff-v6-studio textarea{width:100%;padding:11px;border:1px solid #d7dde5;border-radius:11px;font:inherit}
.tff-v6-preview{max-width:220px;max-height:220px;object-fit:contain;border-radius:14px;border:1px solid #e3e8ee;background:#fafafa}
.tff-v6-low{color:#a35d00;font-weight:900}.tff-v6-out{color:#b42318;font-weight:900}.tff-v6-ok{color:#08733e;font-weight:900}
.tff-v6-health{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.tff-v6-health>div{background:#f5f8fb;border-radius:14px;padding:12px}
@media(max-width:700px){.tff-v6-studio-grid,.tff-v6-health{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.tff-v6-studio-grid,.tff-v6-health{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function adminSession(){return window.sb?.auth?.getSession?.().then(x=>x.data?.session).catch(()=>null)}
async function post(path,body){const s=await adminSession();if(!s)throw Error('Admin login required');const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.access_token},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Request failed');return d}

// AI Product Studio: upload one product photo and get editable catalog metadata.
function addProductStudio(){
 if(!admin||$('tffV6ProductStudio'))return;
 const host=document.querySelector('.wrap');if(!host)return;
 const sec=document.createElement('section');sec.className='tff-v6-studio';sec.id='tffV6ProductStudio';sec.innerHTML=`
 <h2>🤖 AI Product Studio</h2>
 <p class="muted">একটি product photo দিন। AI নাম, category, description, unit, tags, preparation info এবং price-এর <b>editable suggestion</b> বানাবে। Price ছবির ভিত্তিতে নিশ্চিত নয়—আপনি approve না করা পর্যন্ত database-এ লেখা হবে না।</p>
 <div class="tff-v6-studio-grid">
   <div><label><b>📷 Product Photo</b></label><input id="v6ProductImage" type="file" accept="image/*"><div style="margin-top:10px"><img id="v6ProductPreview" class="tff-v6-preview" style="display:none"></div></div>
   <div><label><b>Product hint (optional)</b></label><input id="v6ProductHint" placeholder="যেমন: দেশি কাতলা, 1 KG"><label style="display:block;margin-top:9px"><b>Price hint (optional)</b></label><input id="v6PriceHint" inputmode="decimal" placeholder="যেমন: 450"><label style="display:block;margin-top:9px"><b>Stock hint (optional)</b></label><input id="v6StockHint" inputmode="decimal" placeholder="যেমন: 12"></div>
 </div>
 <div class="actions" style="margin-top:12px"><button class="btn navy" id="v6AnalyzeProduct">✨ Analyze & Draft</button><button class="btn green" id="v6SaveProduct" disabled>💾 Approve & Save Product</button><button class="btn light" id="v6ClearProduct">Clear</button></div>
 <div id="v6ProductResult" class="notice" style="margin-top:12px;display:none"></div>
 <div id="v6ProductFields" class="tff-v6-studio-grid" style="display:none;margin-top:12px">
  <div><label>Name</label><input id="v6Name"></div><div><label>Category</label><input id="v6Category"></div><div><label>Price ₹</label><input id="v6Price" inputmode="decimal"></div><div><label>Unit</label><input id="v6Unit"></div><div><label>Stock Qty</label><input id="v6Stock" inputmode="decimal"></div><div><label>Tags</label><input id="v6Tags"></div><div style="grid-column:1/-1"><label>Description</label><textarea id="v6Description" rows="4"></textarea></div><div style="grid-column:1/-1"><label>Preparation / Cutting</label><input id="v6Prep"></div>
 </div>
 <div style="margin-top:14px"><b>📚 Bulk catalog helper</b><p class="muted">একসঙ্গে অনেক product-এর নাম/price/stock CSV import করার জন্য CSV template download করুন। AI Studio দিয়ে ছবির metadata draft করে তারপর import/approve করতে পারবেন।</p><button class="btn light" id="v6CsvTemplate">⬇️ Download CSV Template</button></div>`;
 host.appendChild(sec);
 const file=$('v6ProductImage'),preview=$('v6ProductPreview'),result=$('v6ProductResult'),fields=$('v6ProductFields'),save=$('v6SaveProduct');let draft=null;
 file.onchange=()=>{const f=file.files?.[0];if(!f)return;preview.src=URL.createObjectURL(f);preview.style.display='block'};
 $('v6AnalyzeProduct').onclick=async()=>{const f=file.files?.[0];if(!f){result.style.display='block';result.textContent='📷 আগে product photo দিন।';return}if(f.size>6*1024*1024){result.style.display='block';result.textContent='ছবিটি 6 MB-এর মধ্যে দিন।';return}result.style.display='block';result.textContent='⏳ AI product analysis চলছে...';try{const dataUrl=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});draft=await post('/api/ai-product-studio',{image_data_url:dataUrl,hint:$('v6ProductHint').value.trim(),price_hint:$('v6PriceHint').value.trim(),stock_hint:$('v6StockHint').value.trim()});const p=draft.product||{};$('v6Name').value=p.name||'';$('v6Category').value=p.category||'Fish';$('v6Price').value=p.price??'';$('v6Unit').value=p.unit||'KG';$('v6Stock').value=p.stock_qty??'';$('v6Tags').value=Array.isArray(p.tags)?p.tags.join(', '):(p.tags||'');$('v6Description').value=p.description||'';$('v6Prep').value=p.preparation||'';fields.style.display='grid';save.disabled=false;result.innerHTML='✅ Draft তৈরি হয়েছে। <b>Price/stock/description দেখে নিজে approve করুন</b> তারপর Save চাপুন.'}catch(e){result.textContent='❌ '+e.message}};
 save.onclick=async()=>{if(!draft)return;try{save.disabled=true;result.textContent='⏳ Product save হচ্ছে...';const p={name:$('v6Name').value.trim(),category:$('v6Category').value.trim()||'Fish',price:Number($('v6Price').value||0),unit:$('v6Unit').value.trim()||'KG',stock_qty:Number($('v6Stock').value||0),description:$('v6Description').value.trim(),tags:$('v6Tags').value.split(',').map(x=>x.trim()).filter(Boolean),preparation:$('v6Prep').value.trim()};if(!p.name||!p.price){throw Error('Name এবং valid price দিন')}const data=await post('/api/ai-product-studio',{action:'save',product:p,image_data_url:draft.image_data_url||null});result.textContent='✅ Product saved. Customer app refresh হলে নতুন product দেখা যাবে।';save.disabled=true}catch(e){save.disabled=false;result.textContent='❌ '+e.message}};
 $('v6ClearProduct').onclick=()=>{file.value='';preview.style.display='none';fields.style.display='none';result.style.display='none';save.disabled=true;draft=null};
 $('v6CsvTemplate').onclick=()=>{const csv='name,category,price,unit,stock_qty,description,image_url,available\nKatla,Fish,450,KG,10,Fresh Katla,,true\nChingri,Seafood,600,KG,5,Fresh shrimp,,true\n';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='tff-product-import-template.csv';a.click()}
}

// Customer AI: voice + safe add-to-cart actions returned by the server.
function enhanceCustomerAI(){
 if(!customer)return;document.body.classList.add('tff-v6-customer');
 const input=$('tffAiInput');if(!input)return;
 window.tffV6AskAI=async(q)=>{const products=(window.tffProducts||[]).slice(0,120).map(p=>({id:p.id,name:p.name,category:p.category,price:p.price,unit:p.unit,available:p.available!==false,stock_qty:p.stock_qty??null,description:p.description||''}));const r=await fetch('/api/ai-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,context:{products,cart:(window.tffCart||[]).map(x=>({id:x.id,name:x.name,price:x.price})),profile:JSON.parse(localStorage.getItem('tff_profile')||'{}')}})});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'AI unavailable');return d};
 window.tffV6ApplyAIActions=(actions)=>{let added=0;for(const a of (actions||[])){if(a?.type!=='add_to_cart')continue;const p=(window.tffProducts||[]).find(x=>String(x.id)===String(a.product_id));const qty=Math.max(1,Math.min(20,Number(a.quantity||1)));if(p&&p.available!==false){for(let i=0;i<qty;i++)window.tffCart.push({...p,prep:a.preparation||''});added+=qty}}if(added){window.tffUpdateCart?.();window.tffRender?.();window.tffSaveDraftSoon?.();return `🛒 ${added}টি item cart-এ যোগ হয়েছে। নিচের Checkout button থেকে order confirm করুন।`}return ''};
 // Use a single voice button inside the existing AI input row.
 const row=input.parentElement;if(row&&!$('tffV6VoiceBtn')){const b=document.createElement('button');b.id='tffV6VoiceBtn';b.className='btn light';b.textContent='🎙️';b.title='বাংলায় বলে order করুন';b.onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('এই browser-এ voice recognition নেই। Chrome Android ব্যবহার করুন।');return}const r=new SR();r.lang='bn-IN';r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>{input.value=e.results?.[0]?.[0]?.transcript||'';window.aiAsk?.()};r.onerror=()=>{};r.start()};row.insertBefore(b,row.lastElementChild)}
}

function realtime(){if(!window.sb?.channel)return;try{const channel=window.sb.channel('tff-v6-realtime');channel.on('postgres_changes',{event:'*',schema:'public',table:'fish'},()=>{if(customer&&typeof window.loadProducts==='function')window.loadProducts()}).on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>{if(customer&&typeof window.trackOrder==='function'){const r=$('trackOrderNo');if(r&&r.value)window.trackOrder()}}).on('postgres_changes',{event:'*',schema:'public',table:'offers'},()=>{if(customer&&typeof window.loadOffers==='function')window.loadOffers()}).subscribe()}catch(e){console.warn('realtime',e)}}
function smartStock(){if(!customer||!window.tffProducts)return;document.querySelectorAll('.card').forEach(card=>{const text=card.textContent||'';if(/Only 0 left/i.test(text))card.classList.add('tff-v6-out')})}
function boot(){style();addProductStudio();enhanceCustomerAI();realtime();setTimeout(smartStock,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));else setTimeout(boot,900);
})();
