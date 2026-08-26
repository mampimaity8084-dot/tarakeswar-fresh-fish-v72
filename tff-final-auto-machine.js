/* TFF FINAL AUTO MACHINE 7.1
   Additive final layer for Customer / Admin / Delivery.
   Goals: automatic app updates, automatic data refresh, safe floating AI,
   top partner hub auto-scroll, customer mini-profile, and no manual refresh dependency.
   This layer never contains secrets and never performs payment/refund/admin mutations by itself.
*/
(function(){
  'use strict';
  const path=location.pathname.toLowerCase();
  const page=path.includes('admin.html')?'admin':path.includes('delivery.html')?'delivery':'customer';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const VERSION_KEY='tff_final_machine_update';
  const RELOAD_KEY='tff_final_machine_reload';

  function addCss(){
    if($('tffFinalMachineCss'))return;
    const s=document.createElement('style');s.id='tffFinalMachineCss';s.textContent=`
      .tff51-update{display:none!important}
      .tff-final-profile{display:flex;align-items:center;gap:7px;border:0;background:#f1f5f9;border-radius:999px;padding:5px 8px 5px 5px;font-weight:900;cursor:pointer;max-width:150px}
      .tff-final-profile img{width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 2px 8px #0002}.tff-final-profile span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .tff-partner-hub{max-width:1180px;margin:10px auto 0;padding:0 16px}.tff-partner-shell{background:linear-gradient(135deg,#071b34,#0c9b50);color:#fff;border-radius:22px;padding:14px;box-shadow:0 10px 28px #071b3420}.tff-partner-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.tff-partner-head h2{margin:0;font-size:19px}.tff-partner-head small{opacity:.85}.tff-partner-track{display:flex;gap:10px;overflow-x:auto;scroll-behavior:smooth;scroll-snap-type:x mandatory;padding:10px 2px 4px;scrollbar-width:none}.tff-partner-track::-webkit-scrollbar{display:none}.tff-partner-card{min-width:230px;scroll-snap-align:start;background:#fff;color:#172033;border-radius:16px;padding:10px;display:flex;gap:10px;align-items:center;box-shadow:0 8px 18px #0002;cursor:pointer}.tff-partner-card img{width:58px;height:58px;border-radius:14px;object-fit:cover;background:#eef2f7}.tff-partner-card b{display:block}.tff-partner-card small{color:#667085}.tff-partner-dots{text-align:center;opacity:.85;font-size:11px}
      .tff-final-ai{position:fixed;right:14px;bottom:calc(86px + env(safe-area-inset-bottom));width:66px;height:66px;border:0;border-radius:50%;z-index:10050;background:radial-gradient(circle at 35% 25%,#ffffff,#8bd8ff 20%,#1976d2 55%,#071b34 100%);box-shadow:0 10px 30px #0004;display:grid;place-items:center;cursor:grab;touch-action:none;transition:transform .2s,opacity .35s}.tff-final-ai.small{transform:scale(.64);opacity:.48}.tff-final-ai.dragging{cursor:grabbing;transition:none}.tff-final-ai .bot3d{width:48px;height:42px;border-radius:16px;background:linear-gradient(145deg,#fff,#d9f3ff);box-shadow:inset -5px -6px 9px #7fb8d955,0 4px 8px #0003;position:relative}.tff-final-ai .bot3d:before{content:'';position:absolute;left:8px;right:8px;top:10px;height:17px;border-radius:10px;background:linear-gradient(180deg,#0c2a4f,#071b34);box-shadow:inset 0 2px 4px #0008}.tff-final-ai .bot3d:after{content:'•  •';position:absolute;left:13px;top:7px;color:#6dffbc;font-weight:1000;letter-spacing:5px;font-size:12px}.tff-final-ai .antenna{position:absolute;width:4px;height:9px;background:#fff;top:-8px;left:32px;border-radius:4px}.tff-final-ai .antenna:after{content:'';position:absolute;width:8px;height:8px;border-radius:50%;background:#57f5a0;left:-2px;top:-5px;box-shadow:0 0 9px #57f5a0}.tff-final-ai .ai-badge{position:absolute;right:-2px;bottom:-2px;background:#ffd84c;color:#241a00;border-radius:999px;padding:2px 5px;font-size:9px;font-weight:1000}
      .tff-final-ai-panel{position:fixed;right:12px;bottom:calc(90px + env(safe-area-inset-bottom));width:min(410px,calc(100vw - 24px));max-height:70vh;z-index:10060;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 20px 70px #0005;display:none}.tff-final-ai-panel.show{display:block}.tff-final-ai-head{background:linear-gradient(135deg,#071b34,#0c9b50);color:#fff;padding:12px;display:flex;gap:9px;align-items:center}.tff-final-ai-head .mini{width:38px;height:38px;border-radius:12px;background:#fff;display:grid;place-items:center;color:#071b34}.tff-final-ai-chat{padding:10px;background:#f6f8fb;max-height:42vh;overflow:auto}.tff-final-ai-msg{padding:9px 11px;border-radius:14px;margin:6px 0;max-width:88%;line-height:1.4}.tff-final-ai-msg.bot{background:#fff;border:1px solid #e5e9ef}.tff-final-ai-msg.user{background:#dff7e9;margin-left:auto}.tff-final-ai-actions{display:flex;gap:6px;flex-wrap:wrap;padding:8px;border-top:1px solid #e5e9ef}.tff-final-ai-actions button,.tff-final-ai-input button{border:0;border-radius:10px;padding:8px 10px;font-weight:900;background:#eef2f7}.tff-final-ai-input{display:flex;gap:6px;padding:9px;border-top:1px solid #e5e9ef}.tff-final-ai-input input{flex:1;border:1px solid #d6dde6;border-radius:10px;padding:10px;font-size:15px}.tff-final-ai-speaking{animation:tffFinalTalk .45s infinite alternate}@keyframes tffFinalTalk{to{transform:translateY(-2px) scale(1.03)}}
      .tff-final-sync{position:fixed;left:10px;bottom:calc(70px + env(safe-area-inset-bottom));z-index:10040;font-size:10px;color:#667085;background:#fff8;border-radius:999px;padding:3px 7px;pointer-events:none}
      @media(max-width:520px){.tff-partner-hub{padding:0 10px}.tff-final-profile span{max-width:70px}.tff-final-ai{right:10px}.tff-final-ai-panel{bottom:calc(76px + env(safe-area-inset-bottom))}}
    `;document.head.appendChild(s);
  }

  function getSupabase(){try{const c=window.TFF_SUPABASE||{};if(window.supabase?.createClient&&c.url&&c.publishableKey)return window.supabase.createClient(c.url,c.publishableKey)}catch(e){}return null}

  async function autoUpdate(){
    try{
      const r=await fetch('/app-version.json?final_machine='+Date.now(),{cache:'no-store'});if(!r.ok)return;const v=await r.json();if(!v?.version)return;
      const current=document.documentElement.getAttribute('data-tff-version')||'7.1-auto-machine';
      if(v.version===current)return;
      const last=sessionStorage.getItem(VERSION_KEY);if(last===v.version)return;
      sessionStorage.setItem(VERSION_KEY,v.version);
      const regs=await navigator.serviceWorker?.getRegistrations?.()||[];await Promise.all(regs.map(x=>x.update().catch(()=>{})));
      await new Promise(r=>setTimeout(r,900));
      if(!sessionStorage.getItem(RELOAD_KEY)){sessionStorage.setItem(RELOAD_KEY,'1');location.reload();}
    }catch(e){}
  }

  function registerSW(){
    if(!('serviceWorker' in navigator))return;
    const sw=page==='customer'?'/sw.js':page==='admin'?'/admin-sw.js':'/delivery-sw.js';
    navigator.serviceWorker.register(sw+'?fm=7.1',{updateViaCache:'none'}).then(r=>r.update().catch(()=>{})).catch(()=>{});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!sessionStorage.getItem(RELOAD_KEY)){sessionStorage.setItem(RELOAD_KEY,'1');location.reload()}});
  }

  function customerProfile(){
    if(page!=='customer'||$('tffFinalProfile'))return;
    const bar=document.querySelector('header .bar');if(!bar)return;
    const old=[...bar.querySelectorAll('button')].find(b=>/Account|👤/.test(b.getAttribute('aria-label')||b.textContent||''));
    const b=document.createElement('button');b.id='tffFinalProfile';b.className='tff-final-profile';b.onclick=()=>window.openHub?.();
    const p=JSON.parse(localStorage.getItem('tff_profile')||'{}');const photo=p.photo_url||'/logo-transparent.png';b.innerHTML=`<img src="${esc(photo)}" onerror="this.src='/logo-transparent.png'"><span>${esc(p.name||'Profile')}</span>`;
    if(old)old.replaceWith(b);else bar.appendChild(b);
    setInterval(()=>{const q=JSON.parse(localStorage.getItem('tff_profile')||'{}');b.querySelector('span').textContent=q.name||'Profile';if(q.photo_url)b.querySelector('img').src=q.photo_url},5000);
  }

  async function partnerHub(){
    if(page!=='customer'||$('tffFinalPartnerHub'))return;
    const slider=document.querySelector('.offer-slider');if(!slider)return;
    const wrap=document.createElement('section');wrap.id='tffFinalPartnerHub';wrap.className='tff-partner-hub';wrap.innerHTML=`<div class="tff-partner-shell"><div class="tff-partner-head"><div><h2>🤝 Partner Hub</h2><small>Partner • Family • Event • Restaurant</small></div><span>↔️ Auto Scroll</span></div><div class="tff-partner-track" id="tffPartnerTrack"><div class="tff-partner-card"><div style="font-size:34px">⏳</div><div><b>Partner Hub</b><small>Loading...</small></div></div></div><div class="tff-partner-dots">Touch করে swipe করুন • Touch করলে auto-scroll pause হবে</div></div>`;
    slider.insertAdjacentElement('afterend',wrap);
    const track=$('tffPartnerTrack');let items=[];try{const sb=getSupabase();if(sb){const q=await sb.from('partner_family_hub').select('*').eq('active',true).order('sort_order',{ascending:true});if(!q.error)items=q.data||[]}}catch(e){}
    if(!items.length)items=[{title:'Restaurant Partner',subtitle:'Special Partner Offer',description:'Partner menu, combo ও offer দেখুন',image_url:'/logo-transparent.png'},{title:'Event & Catering',subtitle:'Party • Puja • Anniversary',description:'Event-এর জন্য partner service request করুন',image_url:'/logo-transparent.png'},{title:'Family Hub',subtitle:'Family ordering support',description:'Family order ও shared cart সুবিধা',image_url:'/logo-transparent.png'}];
    track.innerHTML=items.map((x,i)=>`<div class="tff-partner-card" data-i="${i}" tabindex="0"><img src="${esc(x.image_url||'/logo-transparent.png')}" onerror="this.src='/logo-transparent.png'"><div><b>${esc(x.title||'Partner')}</b><small>${esc(x.subtitle||'')}</small><div style="font-size:12px;margin-top:3px">${esc(x.description||'Tap to explore')}</div></div></div>`).join('');
    let timer=null,paused=false;function start(){clearInterval(timer);timer=setInterval(()=>{if(paused)return;const w=track.clientWidth;track.scrollBy({left:Math.max(210,w*.72),behavior:'smooth'});if(track.scrollLeft+track.clientWidth>=track.scrollWidth-10)track.scrollTo({left:0,behavior:'smooth'})},3600)}
    track.addEventListener('touchstart',()=>{paused=true},{passive:true});track.addEventListener('touchend',()=>{paused=false;start()},{passive:true});track.addEventListener('mouseenter',()=>paused=true);track.addEventListener('mouseleave',()=>paused=false);start();
  }

  function robot3D(){
    if(page==='customer'){
      const old=$('tffV7Fab');
      if(!old){setTimeout(robot3D,700);return}
      if(old.dataset.finalEnhanced==='1')return;
      old.dataset.finalEnhanced='1';old.classList.add('tff-final-ai');old.innerHTML='<span class="bot3d"><i class="antenna"></i></span><span class="ai-badge">AI</span>';
      // Keep the existing V7 AI chat/voice/visual-search panel, but give its robot the final floating behaviour.
      let dragging=false,startX=0,startY=0,origX=0,origY=0;
      const down=e=>{const p=e.touches?.[0]||e;dragging=true;old.classList.add('dragging');startX=p.clientX;startY=p.clientY;const r=old.getBoundingClientRect();origX=r.left;origY=r.top;e.preventDefault?.()};
      const move=e=>{if(!dragging)return;const p=e.touches?.[0]||e;let x=origX+(p.clientX-startX),y=origY+(p.clientY-startY);x=Math.max(6,Math.min(innerWidth-old.offsetWidth-6,x));y=Math.max(8,Math.min(innerHeight-old.offsetHeight-8,y));old.style.left=x+'px';old.style.top=y+'px';old.style.right='auto';old.style.bottom='auto';e.preventDefault?.()};
      const up=()=>{if(!dragging)return;dragging=false;old.classList.remove('dragging');const r=old.getBoundingClientRect();const left=r.left+r.width/2<innerWidth/2?8:innerWidth-r.width-8;old.style.left=left+'px';old.style.top=Math.max(8,Math.min(innerHeight-r.height-8,r.top))+'px';};
      old.addEventListener('pointerdown',down);window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);old.addEventListener('touchstart',down,{passive:false});window.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',up,{passive:true});
      let idle;const idleMini=()=>{clearTimeout(idle);idle=setTimeout(()=>{const ov=$('tffV7Overlay');if(!ov?.style?.display||ov.style.display==='none')old.classList.add('small')},10000)};['pointermove','pointerdown','click'].forEach(ev=>old.addEventListener(ev,()=>{old.classList.remove('small');idleMini()}));idleMini();return;
    }
    if($('tffFinalAI'))return;
    const fab=document.createElement('button');fab.id='tffFinalAI';fab.className='tff-final-ai';fab.setAttribute('aria-label','AI Assistant');fab.innerHTML='<span class="bot3d"><i class="antenna"></i></span><span class="ai-badge">AI</span>';
    document.body.appendChild(fab);
    const panel=document.createElement('section');panel.id='tffFinalAIPanel';panel.className='tff-final-ai-panel';panel.innerHTML=`<div class="tff-final-ai-head"><div class="mini">🤖</div><div style="flex:1"><b>Tarakeswar AI Assistant</b><div style="font-size:11px">বাংলা • Indian Bengali voice • ${page}</div></div><button id="tffFinalAIClose" style="border:0;background:none;color:#fff;font-size:22px">×</button></div><div class="tff-final-ai-chat" id="tffFinalAIChat"></div><div class="tff-final-ai-actions"><button id="tffFinalAIVoice">🎤 Voice</button><button data-q="আমাকে আজকের গুরুত্বপূর্ণ কাজগুলো বলুন">📋 Help</button><button data-q="আজকের system status বলুন">🩺 Status</button></div><div class="tff-final-ai-input"><input id="tffFinalAIInput" placeholder="বাংলায় লিখুন..."><button id="tffFinalAISend">Send</button></div>`;document.body.appendChild(panel);
    const chat=$('tffFinalAIChat'),input=$('tffFinalAIInput');let speaking=false;
    const add=(text,bot=true)=>{const d=document.createElement('div');d.className='tff-final-ai-msg '+(bot?'bot':'user');d.innerHTML=esc(text).replace(/\n/g,'<br>');chat.appendChild(d);chat.scrollTop=chat.scrollHeight};
    function speak(t){if(!('speechSynthesis'in window))return;speaking=true;fab.classList.add('tff-final-ai-speaking');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='bn-IN';u.rate=.96;u.pitch=1.02;u.onend=()=>{speaking=false;fab.classList.remove('tff-final-ai-speaking')};try{speechSynthesis.speak(u)}catch(e){speaking=false;fab.classList.remove('tff-final-ai-speaking')}}
    async function ask(q){add(q,false);add('একটু দেখছি…');const last=chat.lastElementChild;try{const r=await fetch('/api/ai-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,context:{role:page,page,products:(window.tffProducts||window.products||[]).slice(0,80)}})});const d=await r.json().catch(()=>({}));last.remove();const text=d.text||d.error||'এই মুহূর্তে নিশ্চিত তথ্য পাওয়া গেল না।';add(text);speak(text)}catch(e){last.remove();const text='AI সংযোগ এখন পাওয়া যাচ্ছে না। দয়া করে কিছুক্ষণ পরে আবার চেষ্টা করুন।';add(text);speak(text)}}
    const open=()=>{panel.classList.add('show');if(!chat.dataset.w){chat.dataset.w='1';const t=page==='customer'?'নমস্কার! কী কিনতে বা জানতে চান?':page==='admin'?'নমস্কার Admin! আজকের business কাজের summary চাইলে বলুন।':'নমস্কার! আপনার delivery queue বা earnings সম্পর্কে জানতে পারেন।';add(t);speak(t)}};
    fab.onclick=()=>{if(fab.dataset.dragged==='1'){fab.dataset.dragged='';return}open()};$('tffFinalAIClose').onclick=()=>{panel.classList.remove('show');speechSynthesis?.cancel?.()};$('tffFinalAISend').onclick=()=>{const q=input.value.trim();if(q){input.value='';ask(q)}};input.addEventListener('keydown',e=>{if(e.key==='Enter')$('tffFinalAISend').click()});panel.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>ask(b.dataset.q));
    $('tffFinalAIVoice').onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('এই browser-এ voice input support নেই।');return}const r=new SR();r.lang='bn-IN';r.continuous=false;r.interimResults=false;r.onresult=e=>{input.value=e.results[0][0].transcript;$('tffFinalAISend').click()};try{r.start()}catch(e){}};
    let dragging=false,startX=0,startY=0,origX=0,origY=0;const down=e=>{const p=e.touches?.[0]||e;dragging=true;fab.dataset.dragged='1';fab.classList.add('dragging');startX=p.clientX;startY=p.clientY;const r=fab.getBoundingClientRect();origX=r.left;origY=r.top;e.preventDefault?.()};const move=e=>{if(!dragging)return;const p=e.touches?.[0]||e;let x=origX+(p.clientX-startX),y=origY+(p.clientY-startY);x=Math.max(6,Math.min(innerWidth-fab.offsetWidth-6,x));y=Math.max(8,Math.min(innerHeight-fab.offsetHeight-8,y));fab.style.left=x+'px';fab.style.top=y+'px';fab.style.right='auto';fab.style.bottom='auto';e.preventDefault?.()};const up=()=>{if(!dragging)return;dragging=false;fab.classList.remove('dragging');const r=fab.getBoundingClientRect();const left=r.left+r.width/2<innerWidth/2?8:innerWidth-r.width-8;fab.style.left=left+'px';fab.style.top=Math.max(8,Math.min(innerHeight-r.height-8,r.top))+'px';setTimeout(()=>fab.dataset.dragged='',120)};
    fab.addEventListener('pointerdown',down);window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);fab.addEventListener('touchstart',down,{passive:false});window.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',up,{passive:true});
    let idle;function idleMini(){clearTimeout(idle);idle=setTimeout(()=>{if(!panel.classList.contains('show'))fab.classList.add('small')},10000)}['pointermove','pointerdown','click'].forEach(ev=>fab.addEventListener(ev,()=>{fab.classList.remove('small');idleMini()}));idleMini();
  }

  function safeSync(){
    const names=page==='customer'?['loadOffers','loadAutoBanner']:page==='admin'?['loadOrders','loadProducts','loadOffers','loadMembers','loadPartners','loadSettingsAdmin']:['load'];
    const run=async()=>{
      if(page==='customer'){
        const grid=$('grid');
        const text=(grid?.textContent||'').trim();
        if((!window.tffProducts||!window.tffProducts.length)&&(/Loading|লোড|0 items|কোনো product/i.test(text))&&typeof window.loadProducts==='function'){try{await window.loadProducts()}catch(e){}}
      }
      for(const n of names){try{if(typeof window[n]==='function')await window[n]()}catch(e){}}
    };
    let busy=false;const once=async()=>{if(busy||document.hidden)return;busy=true;try{await run()}finally{busy=false}};
    setTimeout(once,5000);setInterval(once,45000);window.addEventListener('online',once);document.addEventListener('visibilitychange',()=>{if(!document.hidden)once()});
    const sb=getSupabase();if(sb?.channel){try{const channel=sb.channel('tff-final-live-'+page).on('postgres_changes',{event:'*',schema:'public',table:'fish'},once).on('postgres_changes',{event:'*',schema:'public',table:'offers'},once).on('postgres_changes',{event:'*',schema:'public',table:'orders'},once);if(page==='customer')channel.on('postgres_changes',{event:'*',schema:'public',table:'banner_assets'},once);channel.subscribe()}catch(e){}}
  }


  async function categoryManager(){
    if(page!=='admin'||$('tffFinalCategoryTab'))return;
    const tabs=document.querySelector('.tabs'),wrap=document.querySelector('.wrap');if(!tabs||!wrap)return;
    const btn=document.createElement('button');btn.id='tffFinalCategoryTab';btn.className='tab';btn.textContent='📂 Categories';tabs.appendChild(btn);
    const sec=document.createElement('section');sec.id='tffFinalCategorySec';sec.className='section';sec.style.display='none';
    sec.innerHTML=`<div class="panel"><h2>📂 Category & Subcategory Automation</h2><p class="muted">Admin নিজে category/subcategory যোগ করতে পারবেন। AI চাইলে নাম/structure suggest করবে।</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="tffCatName" placeholder="Category name যেমন Vegetables"><input id="tffCatParent" placeholder="Parent category (optional)"><input id="tffCatIcon" placeholder="Icon যেমন 🥬"><button class="btn green" id="tffCatAdd">➕ Add Category</button></div><div style="margin-top:8px;display:flex;gap:7px;flex-wrap:wrap"><button class="btn light" id="tffCatAI">🤖 AI Suggest</button><span id="tffCatMsg" class="muted"></span></div><div id="tffCatList" style="margin-top:12px"></div></div>`;
    wrap.appendChild(sec);
    btn.onclick=()=>{document.querySelectorAll('.section').forEach(x=>x.style.display='none');sec.style.display='block';loadCats()};
    async function loadCats(){const list=$('tffCatList');if(!list)return;list.innerHTML='⏳ Loading...';try{const sb=getSupabase();if(!sb)throw Error('Supabase config নেই');const q=await sb.from('tff_categories').select('*').order('sort_order',{ascending:true}).order('name',{ascending:true});if(q.error)throw q.error;const rows=q.data||[];list.innerHTML=rows.length?rows.map(c=>`<div style="border:1px solid #e5e9ef;border-radius:12px;padding:10px;margin:6px 0;display:flex;align-items:center;gap:8px"><span style="font-size:24px">${esc(c.icon||'📂')}</span><div style="flex:1"><b>${esc(c.name)}</b><div class="muted">${esc(c.parent_name||'Main Category')} • ${c.active?'Active':'Inactive'}</div></div><button class="btn light" data-toggle="${c.id}">${c.active?'Pause':'Enable'}</button></div>`).join(''):'No categories yet.';list.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=async()=>{const id=b.dataset.toggle;const row=rows.find(x=>String(x.id)===String(id));await sb.from('tff_categories').update({active:!row.active}).eq('id',id);loadCats()})}catch(e){list.innerHTML='❌ '+esc(e.message||e)}}
    $('tffCatAdd').onclick=async()=>{const name=$('tffCatName').value.trim();if(!name)return alert('Category name দিন');const sb=getSupabase();if(!sb)return;const parent=$('tffCatParent').value.trim();const {error}=await sb.from('tff_categories').insert([{name,parent_name:parent||null,icon:$('tffCatIcon').value.trim()||'📂',active:true,sort_order:100}]);$('tffCatMsg').textContent=error?'❌ '+error.message:'✅ Category added';if(!error){$('tffCatName').value='';loadCats()}};
    $('tffCatAI').onclick=async()=>{const q=$('tffCatName').value.trim()||'Vegetables';$('tffCatMsg').textContent='🤖 Suggesting...';try{const r=await fetch('/api/ai-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:`${q} category-এর জন্য 5টি useful subcategory suggest করুন। শুধু category names দিন।`,context:{role:'admin',page:'admin'}})});const d=await r.json();$('tffCatMsg').textContent=d.text||d.error||'Suggestion unavailable'}catch(e){$('tffCatMsg').textContent='❌ AI unavailable'}};
    loadCats();
  }
  function addSyncBadge(){if($('tffFinalSync'))return;const d=document.createElement('div');d.id='tffFinalSync';d.className='tff-final-sync';d.textContent='🟢 Auto Sync';document.body.appendChild(d);setInterval(()=>{d.textContent=navigator.onLine?'🟢 Auto Sync':'🟠 Offline • Auto Sync পরে হবে'},3000)}

  async function boot(){
    addCss();document.documentElement.setAttribute('data-tff-version','7.1-auto-machine');
    registerSW();autoUpdate();setInterval(autoUpdate,300000);safeSync();addSyncBadge();
    if(page==='customer'){customerProfile();setTimeout(partnerHub,500)}
    robot3D();
    setTimeout(categoryManager,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,700));else setTimeout(boot,700);
})();
