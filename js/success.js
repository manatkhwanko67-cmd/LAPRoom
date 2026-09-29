
document.addEventListener("DOMContentLoaded",()=>{
 const id=localStorage.getItem("lastBookingId"),b=getBookings().find(x=>x.bookingId===id),box=document.getElementById("successInfo");
 if(!b){box.innerHTML="<p>ไม่พบข้อมูลการจอง</p>";return;}
 const checked=b.status==="checked-in";
 box.innerHTML=`<div class="success-details">
 <div><span>Booking ID</span><strong>${b.bookingId}</strong></div>
 <div><span>ห้อง / เครื่อง</span><strong>${roomName(b.roomId)} / ${computerName(b.computerId)}</strong></div>
 <div><span>วันที่</span><strong>${formatDate(b.date)}</strong></div>
 <div><span>เวลา</span><strong>${b.startTime} - ${b.endTime}</strong></div>
 <div><span>ผู้จอง</span><strong>${b.studentName}</strong></div>
 <div><span>สถานะ</span><strong class="${checked?"green":"status-text-blue"}">${checked?"🟢 Checked In ✓":"🔵 Confirmed"}</strong></div>
 <div class="checkin-warning"><span>⏱️ Check-in</span><strong>${checked?"เช็คอินเรียบร้อยแล้ว":"เช็คอินได้ทันที หรือภายใน 20 นาทีหลังเวลาเริ่ม"}</strong></div>
 </div>`;
});
