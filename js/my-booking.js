document.addEventListener("DOMContentLoaded",()=>{
 refreshBookingStatuses();
 const box=document.getElementById("myBookings");
 const bookings=getBookings().filter(b=>b.status!=="cancelled").sort((a,b)=>b.bookingId.localeCompare(a.bookingId));
 if(!bookings.length){box.innerHTML='<div class="empty">ยังไม่มีรายการจอง</div>';return;}
 box.innerHTML=bookings.map(b=>{
   const checked=b.status==="checked-in";
   return `<article class="booking-card"><div><span class="eyebrow">${b.bookingId}</span><h3>${roomName(b.roomId)} · ${computerName(b.computerId)}</h3><p>📅 ${formatDate(b.date)} &nbsp; 🕐 ${b.startTime} - ${b.endTime}</p><p>👤 ${b.studentName} (${b.studentId})</p><p class="checkin-note">${checked?"✅ เช็คอินแล้ว":`⏱️ เช็คอินได้ทันที หรือภายใน 20 นาทีหลัง ${b.startTime}`}</p></div><div><span class="status-pill ${checked?"green-pill":b.status==="cancelled"?"red-pill":"blue-pill"}">${checked?"🟢 Checked In":b.status==="cancelled"?"🔴 Cancelled":"🔵 Confirmed"}</span>${!checked?`<button class="btn btn-primary small checkin-btn" data-id="${b.bookingId}">เช็คอิน</button>`:""}<button class="btn btn-danger small cancel-btn" data-id="${b.bookingId}">ยกเลิก</button></div></article>`;
 }).join("");
 document.querySelectorAll(".checkin-btn").forEach(btn=>btn.onclick=()=>{
   const result=checkInBooking(btn.dataset.id); alert(result.message); location.reload();
 });
 document.querySelectorAll(".cancel-btn").forEach(btn=>btn.onclick=()=>{
   if(!confirm("ยืนยันการยกเลิกการจองนี้?"))return;
   const arr=getBookings(),i=arr.findIndex(b=>b.bookingId===btn.dataset.id);
   if(i>=0){arr[i].status="cancelled";arr[i].cancelReason="ยกเลิกโดยผู้จอง";saveData(LAB_STORAGE.bookings,arr);location.reload();}
 });
});
