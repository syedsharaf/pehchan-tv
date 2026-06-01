/* PehchanTV – main.js */

/* ── Navbar scroll shadow ── */
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').style.boxShadow=
    scrollY>60?'0 4px 32px rgba(0,0,0,.4)':'none';
},{ passive:true });

/* ── Hamburger ── */
const hamburger=document.getElementById('hamburger');
const mobileMenu=document.getElementById('mobileMenu');
hamburger.addEventListener('click',()=>{
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});
function closeMobile(){
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('open');
}

/* ── Fade-up scroll reveal ── */
const revealObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObs.unobserve(e.target);}});
},{threshold:0.12});
document.querySelectorAll('.fade-up').forEach(el=>revealObs.observe(el));

/* ── Back to top ── */
const btt=document.getElementById('btt');
window.addEventListener('scroll',()=>btt.classList.toggle('show',scrollY>400),{passive:true});

/* ── Scroll button (hero) ── */
const scrollBtn=document.getElementById('scrollBtn');
if(scrollBtn){
  window.addEventListener('scroll',()=>{
    scrollBtn.classList.toggle('show',scrollY<300);
    scrollBtn.classList.toggle('hide',scrollY>=300);
  },{passive:true});
  scrollBtn.addEventListener('click',()=>{
    window.scrollTo({top:window.innerHeight,behavior:'smooth'});
  });
}

/* ── Typing animation ── */
const words = ["VOICE", "PehchanTV"];

let i = 0;
let j = 0;
let isDeleting = false;

const typingElement = document.getElementById("typing");

function typeEffect() {
  let currentWord = words[i];

  if (!isDeleting) {
    typingElement.textContent = currentWord.substring(0, j + 1);
    j++;
  } else {
    typingElement.textContent = currentWord.substring(0, j - 1);
    j--;
  }

  let speed = isDeleting ? 80 : 150;

  if (!isDeleting && j === currentWord.length) {
    speed = 2000; // pause
    isDeleting = true;
  } else if (isDeleting && j === 0) {
    isDeleting = false;
    i = (i + 1) % words.length;
    speed = 300;
  }

  setTimeout(typeEffect, speed);
}

typeEffect();

/* ── Lang switcher ── */
const langSwitch=document.getElementById('langSwitch');
const langBtn=document.getElementById('langBtn');
if(langBtn){
  langBtn.addEventListener('click',e=>{
    e.stopPropagation();
    langSwitch.classList.toggle('active');
  });
  document.addEventListener('click',()=>langSwitch.classList.remove('active'));
}
function setLang(lang){
  const sel=document.querySelector('.goog-te-combo');
  if(sel){sel.value=lang;sel.dispatchEvent(new Event('change'));}
  if(langSwitch)langSwitch.classList.remove('active');
}

/* ════════════════════════════════════
   SLIDER ENGINE
════════════════════════════════════ */
const CARDS_PER_PAGE=6;
const sliderState={};

function getCardWidth(){
  const w=window.innerWidth;
  if(w<=480)return w*0.82+18;
  if(w<=768)return 278;
  if(w<=1024)return 308;
  return 338;
}

const typeLabels={reel:'🎬 Reel',post:'🖼️ Post',square:'🎬 Reel',video:'🎥 Video'};

/* Build slider block */
function buildSliderBlock(cat){
  const block=document.createElement('div');
  block.className='slider-block';
  block.id=`block-${cat.id}`;
  if(!allowedSliderIds.includes(cat.id))block.classList.add('hidden');
  block.innerHTML=`
    <div class="slider-header">
      <div class="slider-header-left">
        <div class="slider-cat-tag">${cat.icon} ${cat.label}</div>
        <div class="slider-title">${cat.title}</div>
        <div class="slider-desc">${cat.description}</div>
      </div>
      <div class="slider-nav-btns">
        <button class="slider-nav-btn" id="prev-${cat.id}" aria-label="Previous">‹</button>
        <button class="slider-nav-btn" id="next-${cat.id}" aria-label="Next">›</button>
      </div>
    </div>
    <div class="slider-track-wrap">
      <div class="slider-track" id="track-${cat.id}"></div>
    </div>
    <div class="slider-dots" id="dots-${cat.id}"></div>`;
  return block;
}

/* Build embed card with IntersectionObserver */
function buildEmbedCard(item,catId,idx){
  const card=document.createElement('div');
  card.className='embed-card';
  card.id=`card-${catId}-${idx}`;
  card.dataset.loaded='false';
  card.innerHTML=`
    <div class="embed-frame-wrap ${item.type}" id="fw-${catId}-${idx}">
      <div class="embed-placeholder" id="ph-${catId}-${idx}">
        <div class="ph-icon">${typeLabels[item.type]||'🖼️'}</div>
        <div class="ph-spinner"></div>
      </div>
    </div>
    <div class="embed-card-info">
      <div class="embed-card-type">${typeLabels[item.type]||'🖼️ Post'}</div>
      <div class="embed-card-title">${item.title||''}</div>
      <div class="embed-card-caption">${item.caption||''}</div>
    </div>`;

  const obs=new IntersectionObserver((entries,o)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting||card.dataset.loaded==='true')return;
      card.dataset.loaded='true';
      const fw=document.getElementById(`fw-${catId}-${idx}`);
      const ph=document.getElementById(`ph-${catId}-${idx}`);
      const {w,h}=getIframeDimensions(item.url,item.type);
      const iframe=document.createElement('iframe');
      iframe.src=item.url;
      iframe.width=w;
      iframe.height=h;
      iframe.style.cssText='border:none;position:absolute;inset:0;width:100%;height:100%;display:block;';
      iframe.allowFullscreen=true;
      iframe.setAttribute('allow','autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
      iframe.onload=()=>{if(ph)ph.style.display='none';};
      iframe.onerror=()=>{if(ph)ph.innerHTML='<div class="ph-icon">⚠️</div>';};
      if(fw)fw.appendChild(iframe);
      o.unobserve(entry.target);
    });
  },{threshold:0.15});
  obs.observe(card);
  return card;
}

/* Parse width/height from FB embed URL */
function getIframeDimensions(url,type){
  try{
    const u=new URL(url);
    const w=u.searchParams.get('width')||'476';
    const h=u.searchParams.get('height')||'476';
    return{w,h};
  }catch{
    return{w:'476',h:type==='reel'?'560':'476'};
  }
}

/* Load more card */
function buildLoadMoreCard(catId){
  const card=document.createElement('div');
  card.className='embed-card load-more-card';
  card.id=`loadmore-${catId}`;
  card.innerHTML=`<div class="lm-inner"><div class="lm-icon">▶</div><div class="lm-text">Load More</div></div>`;
  card.addEventListener('click',()=>loadMore(catId));
  return card;
}

/* Load next batch */
function loadMore(catId){
  const state=sliderState[catId];
  if(!state)return;
  const{track,allItems}=state;
  const start=state.loadedCount;
  const end=Math.min(start+CARDS_PER_PAGE,allItems.length);
  if(start>=allItems.length)return;
  const lm=document.getElementById(`loadmore-${catId}`);
  for(let i=start;i<end;i++)track.insertBefore(buildEmbedCard(allItems[i],catId,i),lm);
  state.loadedCount=end;
  state.totalCards=track.querySelectorAll('.embed-card:not(.load-more-card)').length;
  if(state.loadedCount>=allItems.length)lm.style.display='none';
  buildSmartDots(catId);
  const nc=document.getElementById(`card-${catId}-${start}`);
  if(nc)track.scrollTo({left:nc.offsetLeft-track.offsetLeft,behavior:'smooth'});
}

/* Smart dots — max 5 */
function buildSmartDots(catId){
  const state=sliderState[catId];
  const dotsEl=document.getElementById(`dots-${catId}`);
  if(!state||!dotsEl)return;
  const lm=document.getElementById(`loadmore-${catId}`);
  const hasMore=lm&&lm.style.display!=='none';
  const total=state.totalCards+(hasMore?1:0);
  const cur=state.currentDot||0;
  dotsEl.innerHTML='';
  if(total<=1)return;
  const MAX=5;
  let indices=[];
  if(total<=MAX){
    indices=Array.from({length:total},(_,i)=>i);
  }else{
    const set=new Set([0,total-1,cur]);
    if(cur>0)set.add(cur-1);
    if(cur<total-1)set.add(cur+1);
    let i=1;
    while(set.size<MAX&&i<total-1)set.add(i++);
    indices=Array.from(set).sort((a,b)=>a-b);
  }
  indices.forEach((di,pos)=>{
    if(pos>0&&di-indices[pos-1]>1){
      const sp=document.createElement('span');
      sp.className='slider-dot-ellipsis';sp.textContent='…';
      dotsEl.appendChild(sp);
    }
    const dot=document.createElement('button');
    dot.className='slider-dot'+(di===cur?' active':'');
    dot.setAttribute('aria-label',`Slide ${di+1}`);
    dot.addEventListener('click',()=>scrollToDot(catId,di));
    dotsEl.appendChild(dot);
  });
}

function scrollToDot(catId,idx){
  const state=sliderState[catId];
  if(!state)return;
  const cards=state.track.querySelectorAll('.embed-card');
  const target=cards[idx];
  if(!target)return;
  state.currentDot=idx;
  state.track.scrollTo({left:target.offsetLeft-state.track.offsetLeft,behavior:'smooth'});
  buildSmartDots(catId);
  updateNavBtns(catId);
}

function slideByOne(catId,dir){
  const state=sliderState[catId];
  if(!state)return;
  const cards=state.track.querySelectorAll('.embed-card');
  const ni=Math.max(0,Math.min(cards.length-1,state.currentDot+dir));
  scrollToDot(catId,ni);
}

function updateNavBtns(catId){
  const state=sliderState[catId];
  const prev=document.getElementById(`prev-${catId}`);
  const next=document.getElementById(`next-${catId}`);
  if(!state||!prev||!next)return;
  prev.disabled=state.track.scrollLeft<=4;
  next.disabled=state.track.scrollLeft+state.track.clientWidth>=state.track.scrollWidth-4;
}

/* Wire slider */
function wireSlider(cat){
  const track=document.getElementById(`track-${cat.id}`);
  const prev=document.getElementById(`prev-${cat.id}`);
  const next=document.getElementById(`next-${cat.id}`);
  if(!track)return;
  sliderState[cat.id]={track,allItems:cat.items||[],loadedCount:0,totalCards:0,currentDot:0};
  const state=sliderState[cat.id];
  const first=state.allItems.slice(0,CARDS_PER_PAGE);
  first.forEach((item,i)=>track.appendChild(buildEmbedCard(item,cat.id,i)));
  state.loadedCount=first.length;
  state.totalCards=first.length;
  if(state.allItems.length>CARDS_PER_PAGE)track.appendChild(buildLoadMoreCard(cat.id));
  buildSmartDots(cat.id);
  prev.addEventListener('click',()=>slideByOne(cat.id,-1));
  next.addEventListener('click',()=>slideByOne(cat.id,+1));
  prev.disabled=true;
  track.addEventListener('scroll',()=>{
    const idx=Math.round(track.scrollLeft/getCardWidth());
    if(idx!==state.currentDot){state.currentDot=idx;buildSmartDots(cat.id);updateNavBtns(cat.id);}
  },{passive:true});
  let tx=0;
  track.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',e=>{
    const dx=tx-e.changedTouches[0].clientX;
    if(Math.abs(dx)>50)slideByOne(cat.id,dx>0?1:-1);
  },{passive:true});
}

/* Category tabs */
function buildTabs(categories){
  const inner=document.getElementById('catTabInner');
  if(!inner)return;
  inner.innerHTML='';
  const allBtn=document.createElement('button');
  allBtn.className='cat-tab active';
  allBtn.dataset.target='all';
  allBtn.innerHTML='<span class="cat-tab-icon">🎬</span> All';
  allBtn.addEventListener('click',()=>scrollToBlock('all',allBtn));
  inner.appendChild(allBtn);
  categories.forEach(cat=>{
    const btn=document.createElement('button');
    btn.className='cat-tab';
    btn.dataset.target=cat.id;
    btn.innerHTML=`<span class="cat-tab-icon">${cat.icon}</span> ${cat.label}`;
    btn.addEventListener('click',()=>scrollToBlock(cat.id,btn));
    inner.appendChild(btn);
  });
}

function scrollToBlock(id,btn){
  document.querySelectorAll('.cat-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const tabBar=document.getElementById('catTabBar');
  const offset=(tabBar?tabBar.offsetHeight:0)+90+16;
  const target=id==='all'?document.querySelector('.slider-block'):document.getElementById(`block-${id}`);
  if(target)window.scrollTo({top:target.offsetTop-offset,behavior:'smooth'});
}

/* Active tab on scroll */
window.addEventListener('scroll',()=>{
  const mid=scrollY+innerHeight/2;
  let activeId=null;
  document.querySelectorAll('.slider-block').forEach(b=>{
    if(b.offsetTop<=mid)activeId=b.id.replace('block-','');
  });
  if(activeId){
    document.querySelectorAll('.cat-tab').forEach(t=>{
      t.classList.toggle('active',t.dataset.target===activeId);
    });
  }
},{passive:true});

/* Sliders visible on this page */
const allowedSliderIds=['community-news','interviews','event-highlights'];

/* ════════════════════════════════════
   FEATURED VERTICAL CARDS (events section)
════════════════════════════════════ */
function buildFeaturedSection(){
  const root=document.getElementById('featuredCardsRoot');
  if(!root||!window.mediaData)return;
  window.mediaData.forEach(cat=>{
    if(cat.id!=='event-highlights')return;
    const items=(cat.items||[]).slice(0,3);
    if(!items.length)return;
    const wrap=document.createElement('div');
    wrap.className='slider-block';
    wrap.id=`featured-${cat.id}`;
    root.appendChild(wrap);
    const col=document.createElement('div');
    col.id=`fcol-${cat.id}`;
    col.className='featured-cards-col';
    wrap.appendChild(col);
    items.forEach((item,i)=>col.appendChild(buildFeaturedCard(item,cat,i)));
  });
}

function buildFeaturedCard(item,cat,idx){
  const card=document.createElement('div');
  card.className='embed-card';
  card.id=`fc-${cat.id}-${idx}`;
  card.innerHTML=`
    <div class="embed-frame-wrap ${item.type}" id="ffw-${cat.id}-${idx}">
      <div class="embed-placeholder" id="fph-${cat.id}-${idx}">
        <div class="ph-icon">${typeLabels[item.type]||'🖼️'}</div>
        <div class="ph-spinner"></div>
      </div>
    </div>
    <div class="embed-card-info">
      <div class="embed-card-type">${typeLabels[item.type]||'🖼️ Post'}</div>
      <div class="embed-card-title">${item.title||''}</div>
      <div class="embed-card-caption">${item.caption||''}</div>
    </div>`;
  const obs=new IntersectionObserver((entries,o)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const fw=document.getElementById(`ffw-${cat.id}-${idx}`);
      const ph=document.getElementById(`fph-${cat.id}-${idx}`);
      const{w,h}=getIframeDimensions(item.url,item.type);
      const iframe=document.createElement('iframe');
      iframe.src=item.url;
      iframe.width=w;iframe.height=h;
      iframe.style.cssText='border:none;position:absolute;inset:0;width:100%;height:100%;display:block;';
      iframe.allowFullscreen=true;
      iframe.setAttribute('allow','autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
      iframe.onload=()=>{if(ph)ph.style.display='none';};
      iframe.onerror=()=>{if(ph)ph.innerHTML='<div class="ph-icon">⚠️</div>';};
      if(fw)fw.appendChild(iframe);
      o.unobserve(entry.target);
    });
  },{threshold:0.1});
  obs.observe(card);
  return card;
}

/* ════════════════════════════════════
   INIT — fetch JSON
════════════════════════════════════ */
async function initMediaPage(){
  const root=document.getElementById('slidersRoot');
  const loading=document.getElementById('slidersLoading');
  if(!root)return;
  try{
    const res=await fetch('/data/media-data.json');
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const categories=await res.json();
    if(!Array.isArray(categories)||!categories.length)throw new Error('Empty JSON');
    window.mediaData=categories;
    buildFeaturedSection();
    if(loading)loading.remove();
    buildTabs(categories);
    categories.forEach(cat=>{
      const block=buildSliderBlock(cat);
      root.appendChild(block);
    });
    categories.forEach(cat=>wireSlider(cat));
    if(window.FB&&window.FB.XFBML)window.FB.XFBML.parse(root);
  }catch(err){
    if(loading)loading.innerHTML=`
      <div class="sliders-error">
        <div style="font-size:2.5rem;margin-bottom:16px">⚠️</div>
        <p>Could not load media content. Make sure
          <code style="color:var(--green);background:var(--card);padding:2px 8px;border-radius:4px">/data/media-data.json</code>
          exists and is valid JSON.</p>
        <button class="btn btn-outline" onclick="initMediaPage()" style="margin-top:16px;font-size:.88rem;padding:10px 22px">Retry</button>
      </div>`;
    console.error('[PehchanTV]',err);
  }
}

/* ════════════════════════════════════
   EVENT GALLERY POPUP
════════════════════════════════════ */
let EVENTS=[],currentEvent=null,currentPhotoIdx=0;

async function loadEvents(){
  try{
    const res=await fetch('/data/events.json');
    EVENTS=await res.json();
    renderEvents();
  }catch(e){console.error('[PehchanTV Events]',e);}
}

function renderEvents(){
  const grid=document.getElementById('events-list');
  if(!grid)return;
  grid.innerHTML=EVENTS.map(ev=>`
    <div class="event-card" onclick="openEventGallery('${ev.id}')">
      <div class="event-date">
        <div class="event-date-day">${ev.date.split(' ')[0]}</div>
        <div class="event-date-mon">${ev.date.split(' ')[1]}</div>
      </div>
      <div class="event-body">
        <h4>${ev.title}</h4>
        <p>${ev.desc}</p>
      </div>
    </div>`).join('');
}

function openEventGallery(id){
  const ev=EVENTS.find(e=>e.id===id);
  if(!ev)return;
  currentEvent=ev;currentPhotoIdx=0;
  document.getElementById('epHero').style.backgroundImage=`url(${ev.thumbnail})`;
  document.getElementById('epHeroTitle').textContent=ev.title;
  document.getElementById('epHeroTags').innerHTML=ev.tags.map(t=>`<span class="ep-tag${t.solid?'':' outline'}">${t.label}</span>`).join('');
  document.getElementById('epHeroDate').innerHTML=`<span>📅 ${ev.date}</span><span>📍 ${ev.location}</span><span>👥 ${ev.guests}</span>`;
  document.getElementById('epDesc').textContent=ev.desc;
  document.getElementById('epDesc2').textContent=ev.desc2;
  document.getElementById('epHighlights').innerHTML=ev.highlights.map(h=>`<li class="ep-highlight">${h}</li>`).join('');
  document.getElementById('epStats').innerHTML=ev.stats.map(s=>`<div class="ep-stat"><div class="ep-stat-num">${s.num}</div><div class="ep-stat-lbl">${s.lbl}</div></div>`).join('');
  document.getElementById('epPhotoCount').textContent=`${ev.photos.length} Photos`;
  document.getElementById('epFooterText').textContent=`Loved ${ev.title}? Let us create something just as memorable for you.`;
  renderThumbs();renderLightbox();
  document.getElementById('evPopupBody').scrollTop=0;
  document.getElementById('evPopupOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeEventGallery(){
  document.getElementById('evPopupOverlay').classList.remove('open');
  document.body.style.overflow='';
}

function renderThumbs(){
  document.getElementById('epThumbs').innerHTML=currentEvent.photos.map((p,i)=>`
    <div class="ep-thumb-item${i===0?' active':''}" onclick="selectPhoto(${i})">
      <img src="${p.img}" alt="${p.caption}" style="width:100%;height:100%;object-fit:cover">
    </div>`).join('');
}

function renderLightbox(){
  const p=currentEvent.photos[currentPhotoIdx];
  document.getElementById('epLbImage').innerHTML=`<img src="${p.img}" alt="${p.caption}" style="width:100%;height:100%;object-fit:cover">`;
  document.getElementById('epLbCaption').textContent=p.caption;
  document.getElementById('epLbCounter').textContent=`${currentPhotoIdx+1} / ${currentEvent.photos.length}`;
  document.querySelectorAll('.ep-thumb-item').forEach((el,i)=>el.classList.toggle('active',i===currentPhotoIdx));
}

function selectPhoto(i){currentPhotoIdx=i;renderLightbox();}

function lbNav(dir){
  currentPhotoIdx=(currentPhotoIdx+dir+currentEvent.photos.length)%currentEvent.photos.length;
  renderLightbox();
}

/* close on Escape */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('srcLightbox').classList.contains('open'))closeLightbox();
    else if(document.getElementById('evPopupOverlay').classList.contains('open'))closeEventGallery();
    else closeSearch();
  }
});

/* ════════════════════════════════════
   SEARCH ENGINE
════════════════════════════════════ */
(function(){
  let _cat='all';

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* word-start match only */
  function matches(text,q){
    return text.toLowerCase().split(/\s+/).some(w=>w.startsWith(q.toLowerCase()));
  }

  function highlight(text,q){
    if(!q)return esc(text);
    const ql=q.toLowerCase();
    return esc(text).replace(/(\S+)/g,word=>{
      const plain=word.toLowerCase();
      if(plain.startsWith(ql))return`<span class="search-hl">${word.slice(0,ql.length)}</span>${word.slice(ql.length)}`;
      return word;
    });
  }

  function buildPool(){
    const pool=[];
    (window.mediaData||[]).forEach(cat=>{
      (cat.items||[]).forEach(item=>{
        pool.push({catId:cat.id,catIcon:cat.icon,catLabel:cat.label,item});
      });
    });
    /* future: add window.articleData here */
    return pool;
  }

  window.openSearch=function(){
    document.getElementById('searchOverlay').classList.add('open');
    document.body.style.overflow='hidden';
    setTimeout(()=>document.getElementById('searchInput').focus(),60);
  };

  function closeSearch(){
    document.getElementById('searchOverlay').classList.remove('open');
    document.body.style.overflow='';
    document.getElementById('searchInput').value='';
    _cat='all';
    resetResults();
  }
  window.closeSearch=closeSearch;

  document.getElementById('searchInput').addEventListener('input',function(){
    const q=this.value.trim();
    if(!q){resetResults();return;}
    clearTimeout(this._t);
    this._t=setTimeout(()=>runSearch(q),220);
  });

  document.getElementById('searchCloseBtn').addEventListener('click',closeSearch);

  function runSearch(q){
    const pool=buildPool();
    const metaEl=document.getElementById('searchMeta');
    const countEl=document.getElementById('searchCount');
    const resultsEl=document.getElementById('searchResults');

    const allMatched=pool.filter(({item})=>matches(item.title||'',q)||matches(item.caption||'',q));
    const matched=allMatched.filter(({catId})=>_cat==='all'||catId===_cat);

    buildPills(allMatched,q);
    metaEl.style.display='';
    countEl.innerHTML=`<strong>${matched.length}</strong> result${matched.length!==1?'s':''} for "<strong>${esc(q)}</strong>"`;

    if(!matched.length){
      resultsEl.innerHTML=`<div class="search-hint"><div class="search-hint-icon">🔍</div><p>No results for "<strong style="color:var(--white)">${esc(q)}</strong>"</p></div>`;
      return;
    }
    const grid=document.createElement('div');
    grid.className='search-grid';
    matched.forEach(entry=>grid.appendChild(buildCard(entry,q)));
    resultsEl.innerHTML='';
    resultsEl.appendChild(grid);
  }

  function buildPills(allMatched,q){
    const el=document.getElementById('searchCatFilters');
    el.innerHTML='';
    const counts={};
    allMatched.forEach(({catId,catLabel,catIcon})=>{
      if(!counts[catId])counts[catId]={label:catLabel,icon:catIcon,n:0};
      counts[catId].n++;
    });
    mkPill(`All (${allMatched.length})`,'all',el,q);
    Object.entries(counts).forEach(([id,{label,icon,n}])=>mkPill(`${icon} ${label} (${n})`,id,el,q));
  }

  function mkPill(text,catId,container,q){
    const btn=document.createElement('button');
    btn.className='search-cat-btn'+(_cat===catId?' active':'');
    btn.textContent=text;
    btn.addEventListener('click',()=>{_cat=catId;runSearch(q);});
    container.appendChild(btn);
  }

  function buildCard({catIcon,catLabel,item},q){
    const previewEmojis={reel:'🎬',post:'🖼️',square:'🎬',video:'🎥'};
    const card=document.createElement('div');
    card.className='src-card';
    card.innerHTML=`
      <div class="src-card-preview">
        <div class="src-card-preview-icon">${previewEmojis[item.type]||'🖼️'}</div>
        <div class="src-card-play">▶ Play</div>
        <div class="src-card-type-badge">${typeLabels[item.type]||'🖼️ Post'}</div>
      </div>
      <div class="src-card-info">
        <div class="src-card-cat">${catIcon} ${catLabel}</div>
        <div class="src-card-title">${highlight(item.title||'',q)}</div>
        <div class="src-card-caption">${highlight(item.caption||'',q)}</div>
      </div>`;
    card.addEventListener('click',()=>openLightbox(item));
    return card;
  }

  function openLightbox(item){
    const overlay=document.getElementById('srcLightbox');
    const frame=document.getElementById('srcLightboxFrame');
    frame.className=`src-lightbox-frame ${item.type}`;
    const{w,h}=getIframeDimensions(item.url,item.type);
    frame.innerHTML=`<iframe src="${item.url}" width="${w}" height="${h}" style="border:none;position:absolute;inset:0;width:100%;height:100%;display:block;" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
    document.getElementById('srcLightboxTitle').textContent=item.title||'';
    document.getElementById('srcLightboxCaption').textContent=item.caption||'';
    overlay.classList.add('open');
  }

  function closeLightbox(){
    document.getElementById('srcLightbox').classList.remove('open');
    document.getElementById('srcLightboxFrame').innerHTML='';
  }
  window.closeLightbox=closeLightbox;

  document.getElementById('srcLightboxClose').addEventListener('click',closeLightbox);
  document.getElementById('srcLightbox').addEventListener('click',function(e){if(e.target===this)closeLightbox();});

  function resetResults(){
    _cat='all';
    document.getElementById('searchMeta').style.display='none';
    document.getElementById('searchResults').innerHTML=`<div class="search-hint"><div class="search-hint-icon">🎬</div><p>Start typing to search videos and reels</p></div>`;
  }
})();

/* ════════════════════════════════════
   DOM READY
════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  initMediaPage();
  loadEvents();
});