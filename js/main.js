const LAB_STORAGE = {
  rooms: "labRooms",
  computers: "labComputers",
  bookings: "labBookings",
  schedules: "labSchedules"
};

function getData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch (e) { return []; }
}
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function seedData() {
  // Migrate older LocalStorage versions: old builds used status "available".
  // Dashboard treats "inactive" as closed; all other room statuses are open.
  const existingRooms = getData(LAB_STORAGE.rooms);
  if (existingRooms.length) {
    const normalizedRooms = existingRooms.map(r => ({...r, status: (r.status === "inactive" || r.status === "disabled") ? "inactive" : "active"}));
    if (JSON.stringify(existingRooms) !== JSON.stringify(normalizedRooms)) saveData(LAB_STORAGE.rooms, normalizedRooms);
  }
  if (!localStorage.getItem(LAB_STORAGE.rooms)) {
    const rooms = [
      { roomId:"LAB-01", roomName:"LAB 01", building:"อาคาร 1", floor:"2", computerCount:40, status:"active" },
      { roomId:"LAB-02", roomName:"LAB 02", building:"อาคาร 1", floor:"2", computerCount:30, status:"active" },
      { roomId:"LAB-03", roomName:"LAB 03", building:"อาคาร 2", floor:"3", computerCount:50, status:"active" }
    ];
    saveData(LAB_STORAGE.rooms, rooms);
  }
  if (!localStorage.getItem(LAB_STORAGE.computers)) {
    const rooms = getData(LAB_STORAGE.rooms), computers = [];
    rooms.forEach(room => {
      for (let i=1; i<=room.computerCount; i++) {
        computers.push({ computerId:`${room.roomId}-PC-${String(i).padStart(2,"0")}`, computerName:`PC-${String(i).padStart(2,"0")}`, roomId:room.roomId, status:"active" });
      }
    });
    saveData(LAB_STORAGE.computers, computers);
  }

  if (!localStorage.getItem(LAB_STORAGE.schedules)) {
    const schedules = [
      {scheduleId:"CLS-001",roomId:"LAB-01",day:"1",startTime:"10:00",endTime:"12:00",courseCode:"CS101",courseName:"Web Programming",teacher:"อาจารย์สมชาย",group:"1"},
      {scheduleId:"CLS-002",roomId:"LAB-01",day:"3",startTime:"13:00",endTime:"15:00",courseCode:"CS204",courseName:"Database",teacher:"อาจารย์มาลี",group:"2"},
      {scheduleId:"CLS-003",roomId:"LAB-02",day:"2",startTime:"09:00",endTime:"11:00",courseCode:"CS210",courseName:"Python Programming",teacher:"อาจารย์กิตติ",group:"1"},
      {scheduleId:"CLS-004",roomId:"LAB-03",day:"5",startTime:"13:00",endTime:"16:00",courseCode:"CS301",courseName:"Computer Network",teacher:"อาจารย์วิชัย",group:"1"}
    ];
    saveData(LAB_STORAGE.schedules, schedules);
  }
  if (!localStorage.getItem(LAB_STORAGE.bookings)) {
    const today = new Date().toISOString().slice(0,10);
    const bookings = [
      { bookingId:"BK-DEMO-001", studentName:"Demo Student", studentId:"67123456", phone:"", roomId:"LAB-01", computerId:"LAB-01-PC-05", date:today, startTime:"10:00", endTime:"12:00", status:"confirmed" },
      { bookingId:"BK-DEMO-002", studentName:"Demo Student", studentId:"67123457", phone:"", roomId:"LAB-01", computerId:"LAB-01-PC-12", date:today, startTime:"13:00", endTime:"15:00", status:"confirmed" },
      { bookingId:"BK-DEMO-003", studentName:"Demo Student", studentId:"67123458", phone:"", roomId:"LAB-02", computerId:"LAB-02-PC-20", date:today, startTime:"09:00", endTime:"11:00", status:"confirmed" }
    ];
    saveData(LAB_STORAGE.bookings, bookings);
  }
}
function getRooms(){ return getData(LAB_STORAGE.rooms); }
function getComputers(){ return getData(LAB_STORAGE.computers); }
function getBookings(){ return getData(LAB_STORAGE.bookings); }
function getSchedules(){ return getData(LAB_STORAGE.schedules); }
function isRoomInClass(roomId,date,start,end){ const day=String(new Date(date+"T00:00:00").getDay()||7); return getSchedules().some(x=>x.roomId===roomId&&x.day===day&&overlap(start,end,x.startTime,x.endTime)); }
function generateId(prefix) { return prefix + Date.now().toString().slice(-10); }
function overlap(startA,endA,startB,endB) {
  return startA < endB && startB < endA;
}
function isComputerBooked(computerId,date,start,end) {
  return getBookings().some(b => b.computerId===computerId && b.date===date && b.status!=="cancelled" && overlap(start,end,b.startTime,b.endTime));
}

function getBookingStartDateTime(b) {
  return new Date(`${b.date}T${b.startTime}:00`);
}
function getBookingEndDateTime(b) {
  return new Date(`${b.date}T${b.endTime}:00`);
}
function refreshBookingStatuses() {
  const bookings = getBookings();
  const now = new Date();
  let changed = false;
  bookings.forEach(b => {
    if (b.status === "confirmed" && !b.checkedIn) {
      const start = getBookingStartDateTime(b);
      const graceEnd = new Date(start.getTime() + 20 * 60 * 1000);
      if (now >= graceEnd) {
        b.status = "cancelled";
        b.autoCancelled = true;
        b.cancelReason = "ไม่เช็คอินภายใน 20 นาที";
        b.cancelledAt = now.toISOString();
        changed = true;
      }
    }
  });
  if (changed) saveData(LAB_STORAGE.bookings, bookings);
  return bookings;
}
function checkInBooking(bookingId) {
  const bookings = getBookings();
  const b = bookings.find(x => x.bookingId === bookingId);
  if (!b || b.status !== "confirmed" || b.checkedIn) return {ok:false,message:"ไม่สามารถเช็คอินรายการนี้ได้"};
  const now = new Date();
  const start = getBookingStartDateTime(b);
  const graceEnd = new Date(start.getTime() + 20*60*1000);
  const end = getBookingEndDateTime(b);
  // Check-in can be done immediately after booking, even before the scheduled start.
  // The 20-minute no-show rule only applies when the booking has NOT been checked in.
  if (now >= graceEnd) {
    b.status="cancelled"; b.autoCancelled=true; b.cancelReason="ไม่เช็คอินภายใน 20 นาที"; b.cancelledAt=now.toISOString();
    saveData(LAB_STORAGE.bookings, bookings);
    return {ok:false,message:"หมดเวลาเช็คอิน 20 นาที ระบบปล่อยเครื่องว่างแล้ว"};
  }
  if (now >= end) return {ok:false,message:"หมดเวลาจองแล้ว"};
  b.checkedIn=true; b.checkedInAt=now.toISOString(); b.status="checked-in";
  saveData(LAB_STORAGE.bookings, bookings);
  return {ok:true,message:"เช็คอินสำเร็จ"};
}
function getBookingDisplayStatus(b) {
  refreshBookingStatuses();
  if (b.autoCancelled) return "Auto Cancelled";
  if (b.status==="checked-in") return "Checked In";
  if (b.status==="cancelled") return "Cancelled";
  return "Confirmed";
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date+"T00:00:00").toLocaleDateString("th-TH",{year:"numeric",month:"long",day:"numeric"});
}
function roomName(roomId) {
  const r=getRooms().find(x=>x.roomId===roomId); return r ? r.roomName : roomId;
}
function computerName(computerId) {
  const c=getComputers().find(x=>x.computerId===computerId); return c ? c.computerName : computerId;
}
function pathDepth(){ return location.pathname.includes("/pages/") || location.pathname.includes("/admin/") ? "../" : ""; }

document.addEventListener("DOMContentLoaded", () => {
  seedData();
  refreshBookingStatuses();
  const root = pathDepth();

  // Responsive mobile navigation
  const sidebar = document.getElementById("sidebar");
  const menuButton = document.querySelector(".menu-btn");

  if (sidebar && menuButton) {
    let overlay = document.getElementById("mobileNavOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "mobileNavOverlay";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
    }

    const closeMenu = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    };

    menuButton.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      overlay.classList.toggle("show", open);
    });

    overlay.addEventListener("click", closeMenu);
    sidebar.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  }

  document.querySelectorAll("a[href]").forEach(a => {
    // Relative links are already written for each page.
  });
});
