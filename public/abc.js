function renderEvents() {
  const grid = document.getElementById('galleryGrid');

  const items = EVENTS.slice(0, visibleCount).map((ev, i) => `
    <div class="gallery-item g${(i%7)+1} ${i===0?'span2':''}" onclick="openEventGallery('${ev.id}')">
      
      <img src="${ev.thumbnail}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />

      <div class="gallery-label">${ev.shortTitle}</div>

      <div class="gl-hover-label">
        <span>View Gallery</span>
        <small>${ev.photos.length} Photos</small>
      </div>
    </div>
  `).join('');

  grid.innerHTML = items;
}