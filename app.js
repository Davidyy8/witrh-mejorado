const planInput = document.getElementById("planText");
const addBtn = document.getElementById("addPlanBtn");
const activeList = document.getElementById("activePlans");
const completedList = document.getElementById("completedPlans");

const plansRef = db.ref("planes");

addBtn.addEventListener("click", () => {
  const text = planInput.value.trim();
  if (text) {
    const newPlanRef = plansRef.push();
    newPlanRef.set({
      text,
      completed: false,
      timestamp: Date.now()
    });
    planInput.value = "";
  }
});

plansRef.on("value", (snapshot) => {
  const data = snapshot.val() || {};
  activeList.innerHTML = "";
  completedList.innerHTML = "";

  Object.entries(data).forEach(([id, plan]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${plan.text}</strong>`;

    if (plan.completed) {
      const date = new Date(plan.completedAt).toLocaleString();
      li.innerHTML += `<br><em>Completado el ${date}</em>`;
      if (plan.photoURL) {
        const img = document.createElement("img");
        img.src = plan.photoURL;
        li.appendChild(img);
      }
      completedList.appendChild(li);
    } else {
      const completeBtn = document.createElement("button");
      completeBtn.textContent = "Completar ❤️";
      completeBtn.onclick = () => handleComplete(id);
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Eliminar 🗑️";
      deleteBtn.onclick = () => plansRef.child(id).remove();
      li.appendChild(completeBtn);
      li.appendChild(deleteBtn);
      activeList.appendChild(li);
    }
  });
});

function handleComplete(id) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const ref = storage.ref(`fotos/${id}-${Date.now()}`);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      plansRef.child(id).update({
        completed: true,
        completedAt: Date.now(),
        photoURL: url
      });
    }
  };
  fileInput.click();
}
