
document.addEventListener("DOMContentLoaded", () => {
  const roomSelect=document.getElementById("roomSelect"), dateSelect=document.getElementById("dateSelect");
  const start=document.getElementById("startTime"), end=document.getElementById("endTime");
  const rooms=getRooms().filter(r=>r.status==="active");
  rooms.forEach(r=>roomSelect.add(new Option(r.roomName,r.roomId)));
  if(!rooms.length){roomSelect.innerHTML='<option value="">ไม่มีห้อง Lab ที่เปิดใช้งาน</option>';}
  const today=new Date().toISOString().slice(0,10); dateSelect.value=today; dateSelect.min=today;
  for(let h=8;h<=21;h++){
    const a=`${String(h).padStart(2,"0")}:00`, b=`${String(h+1).padStart(2,"0")}:00`;
    start.add(new Option(a,a)); end.add(new Option(b,b));
  }
  start.value="10:00"; end.value="12:00";
  const requestedRoom=new URLSearchParams(location.search).get("room");
  if(requestedRoom && rooms.some(r=>r.roomId===requestedRoom)) roomSelect.value=requestedRoom;
  const dayNames=["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์"], dayNums=[1,2,3,4,5];
  const slots=[["08:00","10:00"],["10:00","12:00"],["13:00","15:00"],["15:00","17:00"],["17:00","19:00"]];
  function renderSchedule(roomId){
    const schedules=getSchedules().filter(x=>x.roomId===roomId);
    const head='<div class="head">เวลา</div>'+dayNames.map(d=>`<div class="head">${d}</div>`).join("");
    let html=head;
    slots.forEach(slot=>{
      html+=`<div class="time">${slot[0]}<br>${slot[1]}</div>`;
      dayNums.forEach(day=>{
        const matches=schedules.filter(x=>Number(x.day)===day&&overlap(slot[0],slot[1],x.startTime,x.endTime));
        if(matches.length){
          const x=matches[0];
          html+=`<div class="schedule-cell class"><div class="class-status">🟠 มีเรียน</div><div class="course-code">${x.courseCode||"CLASS"}</div><div class="course-name">${x.courseName}</div><div class="teacher">${x.teacher||"-"}</div><div class="group">กลุ่ม ${x.group||"-"}</div></div>`;
        }else html+=`<div class="schedule-cell free"><div class="free-status">🟢 ห้องว่าง</div><div class="free-text">สามารถจองได้</div></div>`;
      });
    });
    document.getElementById("scheduleTable").innerHTML=`<div class="schedule-grid">${html}</div><div class="legend" style="padding:8px 4px"><span><i class="dot status-orange-dot"></i> มีเรียน</span><span><i class="dot status-green-dot"></i> ห้องว่าง</span></div>`;
  }
  function render(){
    const room=getRooms().find(r=>r.roomId===roomSelect.value); if(!room)return;
    const date=dateSelect.value,s=start.value,e=end.value;
    const classNow=isRoomInClass(room.roomId,date,s,e);
    const pcs=getComputers().filter(c=>c.roomId===room.roomId);
    if(s>=e){document.getElementById("computerGrid").innerHTML='<div class="empty">เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด</div>';return;}
    const available=classNow?0:pcs.filter(c=>c.status==="active"&&!isComputerBooked(c.computerId,date,s,e)).length;
    const booked=classNow?0:pcs.filter(c=>c.status==="active"&&isComputerBooked(c.computerId,date,s,e)).length;
    const status=classNow?"class":available===0?"full":available<pcs.filter(c=>c.status==="active").length?"partial":"available";
    const labels={available:["🟢","ห้องว่าง"],partial:["🔴","มีการจองบางส่วน"],full:["⚫","เต็ม / เครื่องไม่พร้อมใช้งาน"],class:["🟠","มีเรียน"]};
    document.getElementById("roomSummary").innerHTML=`
      <div class="room-summary-main status-${status}"><p class="eyebrow">${room.roomName}</p><h2>${labels[status][0]} ${labels[status][1]}</h2><p>📍 ${room.building} · ชั้น ${room.floor}</p></div>
      <div class="summary-stat"><strong>${pcs.length}</strong><span>คอมทั้งหมด</span></div>
      <div class="summary-stat green-stat"><strong>${available}</strong><span>คอมว่าง</span></div>
      <div class="summary-stat red-stat"><strong>${booked}</strong><span>ถูกจอง</span></div>`;
    document.getElementById("scheduleTitle").textContent=`ตารางเรียนห้อง ${room.roomName}`;
    renderSchedule(room.roomId);
    document.getElementById("computerGrid").innerHTML=pcs.map(c=>{
      const disabled=c.status!=="active", isBooked=!disabled&&isComputerBooked(c.computerId,date,s,e);
      const cls=classNow?"class-disabled":disabled?"disabled":isBooked?"booked":"available";
      return `<button class="computer-card ${cls}" ${isBooked||disabled||classNow?"disabled":""} data-id="${c.computerId}">
        <span class="pc-icon">💻</span><strong>${c.computerName}</strong>
        <small>${classNow?"🟠 มีเรียน":disabled?"⚫ เครื่องมีปัญหา / ปิดใช้งาน":isBooked?"🔴 จองแล้ว":"🟢 ว่าง"}</small>
      </button>`;
    }).join("");
    document.querySelectorAll(".computer-card.available").forEach(btn=>btn.onclick=()=>{
      const q=new URLSearchParams({room:room.roomId,computer:btn.dataset.id,date,start:s,end:e});
      location.href=`booking.html?${q}`;
    });
  }
  [roomSelect,dateSelect,start,end].forEach(x=>x.addEventListener("change",render));
  render();
});
