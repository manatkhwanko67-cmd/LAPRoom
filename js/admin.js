
document.addEventListener("DOMContentLoaded",()=>{
 refreshBookingStatuses();
 const rooms=getRooms(),pcs=getComputers(),bookings=getBookings().filter(b=>b.status!=="cancelled");
 const checked=bookings.filter(b=>b.checkedIn).length;
 document.getElementById("adminStats").innerHTML=`
 <div class="card stat-card"><div class="stat-icon">🏫</div><div><strong>${rooms.length}</strong><small>ห้อง Lab ทั้งหมด</small></div></div>
 <div class="card stat-card"><div class="stat-icon">💻</div><div><strong>${pcs.length}</strong><small>Computer ทั้งหมด</small></div></div>
 <div class="card stat-card"><div class="stat-icon">📋</div><div><strong>${bookings.length}</strong><small>Booking ที่ใช้งาน</small></div></div>
 <div class="card stat-card blue"><div class="stat-icon">✅</div><div><strong>${checked}</strong><small>Checked-in</small></div></div>`;
 const rows=bookings.slice(-10).reverse();
 document.getElementById("recentBookings").innerHTML=rows.length?`<table><thead><tr><th>Booking</th><th>Student</th><th>Room</th><th>PC</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>${rows.map(b=>`<tr><td>${b.bookingId}</td><td><strong>${b.studentName}</strong><br><small>${b.studentId}</small></td><td>${roomName(b.roomId)}</td><td>💻 ${computerName(b.computerId)}</td><td>${formatDate(b.date)}</td><td>${b.startTime}-${b.endTime}</td><td><span class="status-pill ${b.checkedIn?"green-pill":"blue-pill"}">${b.checkedIn?"🟢 Checked In":"🔵 Confirmed"}</span></td></tr>`).join("")}</tbody></table>`:'<div class="empty">ยังไม่มี Booking</div>';
});
