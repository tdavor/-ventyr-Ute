"use strict";

let albumMission = null;
let albumPhotos = [];
let photoUrls = [];

function familyMarkup() {
  return `<h1>${t("Förälder och barn")}</h1><p class="badge">${t("4–8 år · Flera tillfällen")}</p>${missionCards(familyAdventures)}`;
}

function memoriesMarkup() {
  return `<h1>${t("Vår minnesbok")}</h1><p>${t("Albumet finns på den här enheten.")}</p>
    ${missionCards([...familyAdventures, ...localMissions(), ...cityMissions, cityTour, finale])}`;
}

function albumMarkup() {
  return `<h1>${t("Bilder och minnen")}</h1><h2>${escapeHtml(localizedMission(albumMission).title)}</h2>
    <label>${t("Skriv en rad om ert äventyr")}<textarea id="memory-note" maxlength="1500"></textarea></label>
    ${button("Spara minnet", "save-note")}
    <label>${t("Lägg till bilder")}<input id="album-input" type="file" accept="image/*" multiple></label>
    <p>${t("Välj bilder från kameran eller galleriet.")}</p>
    <p id="album-status" role="status"></p><div id="album-photos"></div>`;
}

let albumDatabase;
function openAlbumDatabase() {
  if (!albumDatabase) albumDatabase = new Promise((resolve,reject) => {
    const request = indexedDB.open("aventyr-memories",1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("photos",{keyPath:"id"});
      request.result.createObjectStore("notes",{keyPath:"id"});
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { albumDatabase = null; reject(request.error); };
  });
  return albumDatabase;
}

async function albumStore(store, mode, operation) {
  const database = await openAlbumDatabase();
  return new Promise((resolve,reject) => {
    const transaction = database.transaction(store,mode);
    const request = operation(transaction.objectStore(store));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = transaction.onabort = () => reject(transaction.error);
  });
}

async function loadAlbum() {
  const id = albumMission.id;
  try {
    const [photos,note] = await Promise.all([
      albumStore("photos","readonly",store=>store.getAll()),
      albumStore("notes","readonly",store=>store.get(id))
    ]);
    if (screen !== "album" || albumMission.id !== id) return;
    albumPhotos = photos.filter(photo=>photo.mission === id);
    document.querySelector("#memory-note").value = note?.text || "";
    renderPhotos();
  } catch {
    document.querySelector("#album-status").textContent = t("Det gick inte att spara. Försök igen.");
  }
}

function renderPhotos() {
  photoUrls.forEach(url=>URL.revokeObjectURL(url));
  photoUrls = [];
  const target = document.querySelector("#album-photos");
  target.innerHTML = albumPhotos.length ? albumPhotos.map(photo => {
    const url = URL.createObjectURL(photo.blob);
    photoUrls.push(url);
    return `<article class="panel"><img src="${url}" alt="">
      <div class="tabs"><button class="secondary" data-photo-share="${photo.id}">${t("Dela bilden")}</button>
      <button class="secondary" data-photo-delete="${photo.id}">${t("Ta bort")}</button></div></article>`;
  }).join("") : `<p>${t("Inga bilder ännu.")}</p>`;
}

async function preparePhoto(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1,1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1,Math.round(bitmap.width * scale));
  canvas.height = Math.max(1,Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height);
  bitmap.close();
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob ? resolve(blob) : reject(Error("Image encoding failed")),"image/jpeg",0.85));
}

document.addEventListener("change",async event=>{
  if (event.target.id !== "album-input") return;
  const input = event.target;
  const mission = albumMission.id;
  input.disabled = true;
  try {
    for (const file of input.files) {
      const blob = await preparePhoto(file);
      await albumStore("photos","readwrite",store=>store.put({
        id:crypto.randomUUID(),mission,blob,date:Date.now()
      }));
    }
    if (screen === "album" && albumMission.id === mission) await loadAlbum();
  } catch {
    if (screen === "album") document.querySelector("#album-status").textContent = t("Kunde inte spara bilden. Försök med en annan bild.");
  } finally {
    input.disabled = false;
    input.value = "";
  }
});

document.addEventListener("click",async event=>{
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "save-note") {
    try {
      await albumStore("notes","readwrite",store=>store.put({id:albumMission.id,text:document.querySelector("#memory-note").value}));
      document.querySelector("#album-status").textContent = t("Minnet sparades.");
    } catch { window.alert(t("Det gick inte att spara. Försök igen.")); }
  }
  const id = button.dataset.photoShare || button.dataset.photoDelete;
  if (!id) return;
  const photo = albumPhotos.find(item=>item.id === id);
  if (!photo) return;
  try {
    if (button.dataset.photoDelete) {
      if (!window.confirm(t("Ta bort bilden?"))) return;
      await albumStore("photos","readwrite",store=>store.delete(id));
      albumPhotos = albumPhotos.filter(item=>item.id !== id);
      renderPhotos();
    } else {
      if (window.AndroidAlbum) {
        const reader = new FileReader();
        reader.onload = ()=>window.AndroidAlbum.sharePhoto(reader.result.split(",")[1]);
        reader.readAsDataURL(photo.blob);
      } else {
        const file = new File([photo.blob],"aventyr-memory.jpg",{type:"image/jpeg"});
        await navigator.share({files:[file],title:localizedMission(albumMission).title});
      }
    }
  } catch { window.alert(t("Kunde inte dela bilden.")); }
});
