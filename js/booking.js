document.addEventListener("DOMContentLoaded",()=>{
  const p=new URLSearchParams(location.search), roomId=p.get("room"), computerId=p.get("computer"), date=p.get("date"), start=p.get("start"), end=p.get("end");
  const room=getRooms().find(r=>r.roomId===roomId);
  const info=document.getElementById("bookingInfo");
  if(!room||!computerId||!date||!start||!end){info.innerHTML='<div class="error-box">ข้อมูลการจองไม่ครบ กรุณากลับไปเลือกจาก Dashboard</div>';document.getElementById("bookingForm").style.display="none";return;}
  const roomHasClass = isRoomInClass(roomId,date,start,end);
  info.innerHTML=`<div class="booking-selected"><span>ห้อง</span><strong>${room.roomName}</strong><span>เครื่อง</span><strong>${computerName(computerId)}</strong><span>วันที่</span><strong>${formatDate(date)}</strong><span>เวลา</span><strong>${start} - ${end}</strong></div>${roomHasClass ? '<div class="class-booking-warning">🔵 ช่วงเวลานี้มีตารางเรียน ไม่สามารถจองคอมพิวเตอร์ได้</div>' : ''}`;
  if(roomHasClass){
    document.getElementById("bookingForm").style.display="none";
    document.getElementById("bookingError").textContent="ไม่สามารถจองได้: ห้องนี้มีการเรียนในช่วงเวลาที่เลือก";
    document.getElementById("bookingError").classList.remove("hidden");
    return;
  }
  const error=document.getElementById("bookingError");
  document.getElementById("bookingForm").onsubmit=e=>{
    e.preventDefault(); error.classList.add("hidden");
    const bookings=getBookings();
    if(isRoomInClass(roomId,date,start,end)){error.textContent="ไม่สามารถจองได้: ห้องนี้มีการเรียนในช่วงเวลาที่เลือก";error.classList.remove("hidden");return;}
    if(isComputerBooked(computerId,date,start,end)){error.textContent="ไม่สามารถจองได้: เครื่องนี้ถูกจองในช่วงเวลาที่ทับซ้อนกันแล้ว";error.classList.remove("hidden");return;}
    const checkInNow=document.getElementById("checkInNow")?.checked;
    const booking={bookingId:generateId("BK-"),studentName:document.getElementById("studentName").value.trim(),studentId:document.getElementById("studentId").value.trim(),phone:document.getElementById("phone").value.trim(),roomId,computerId,date,startTime:start,endTime:end,status:checkInNow?"checked-in":"confirmed",checkedIn:checkInNow,checkedInAt:checkInNow?new Date().toISOString():null,autoCancelled:false,checkInEarly:checkInNow};
    bookings.push(booking);saveData(LAB_STORAGE.bookings,bookings);localStorage.setItem("lastBookingId",booking.bookingId);location.href="success.html";
  };
});
