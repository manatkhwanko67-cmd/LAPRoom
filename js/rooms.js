document.addEventListener("DOMContentLoaded",()=>{
  const box=document.getElementById("roomsGrid");
  function render(){
    const rooms=getRooms();
    box.innerHTML=rooms.map(r=>{
      const pcs=getComputers().filter(c=>c.roomId===r.roomId);
      const activePC=pcs.filter(c=>c.status==="active").length;
      const booked=pcs.filter(c=>c.status!=="active").length;
      const active=r.status==="active";
      const statusClass=!active?"black-pill":activePC===0?"black-pill":booked>0?"red-pill":"green-pill";
      const statusText=!active?"⚫ ปิดใช้งาน":activePC===0?"⚫ เต็ม / ไม่พร้อมใช้งาน":booked>0?"🔴 มีการใช้งาน":"🟢 ว่าง";
      return `<article class="card room-card ${!active?"inactive-card":""}">
        <div class="room-card-top"><span class="room-number">${r.roomId}</span><span class="status-pill ${statusClass}">${statusText}</span></div>
        <h2>${r.roomName}</h2><p>📍 ${r.building} · ชั้น ${r.floor}</p>
        <div class="room-card-stats"><div><strong>${pcs.length}</strong><span>คอมทั้งหมด</span></div><div><strong>${activePC}</strong><span>พร้อมใช้งาน</span></div><div><strong>${booked}</strong><span>ถูกใช้งาน/ไม่พร้อม</span></div></div>
        <a class="btn ${active?"btn-primary":"btn-secondary"} full" href="${active?`dashboard.html?room=${r.roomId}`:"#"}" ${active?"":"onclick='return false;'"}>${active?"💻 ดูห้องและจอง":"⚫ ปิดใช้งาน"}</a>
      </article>`;
    }).join("") || '<div class="empty">ยังไม่มีห้อง Lab</div>';
  }
  render();
});