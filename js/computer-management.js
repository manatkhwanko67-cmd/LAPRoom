document.addEventListener("DOMContentLoaded",()=>{
 const sel=document.getElementById("computerRoomSelect"),grid=document.getElementById("computerAdminGrid");
 getRooms().forEach(r=>sel.add(new Option(r.roomName,r.roomId)));
 function render(){const pcs=getComputers().filter(c=>c.roomId===sel.value);grid.innerHTML=pcs.map(c=>`<button class="computer-card ${c.status==="active"?"available":"disabled"} admin-pc" data-id="${c.computerId}"><span class="pc-icon">💻</span><strong>${c.computerName}</strong><small>${c.status==="active"?"🟢 ว่าง":"⚫ เครื่องมีปัญหา / ปิดใช้งาน"}</small></button>`).join("");document.querySelectorAll(".admin-pc").forEach(b=>b.onclick=()=>{const arr=getComputers(),c=arr.find(x=>x.computerId===b.dataset.id);c.status=c.status==="active"?"inactive":"active";saveData(LAB_STORAGE.computers,arr);render();});}
sel.onchange=render;render();
});
