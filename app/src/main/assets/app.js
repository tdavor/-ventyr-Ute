"use strict";

const storageKey = "aventyr-ute-v1";
const app = document.querySelector("#app");
const groupName = { friend: "Med en kompis", family: "Med familjen" };
const storyClues = [
  "Nära dammen börjar en stig. Vart kan den leda?",
  "Stigen delar sig vid en stor sten. På kartan syns ett märke.",
  "Märket visar var skattjakten börjar. Nu kan ni ge er ut tillsammans!"
];

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.completed) && Array.isArray(saved.custom)) return saved;
  } catch {}
  return { completed: [], custom: [], finaleDone: false };
}

let progress = readProgress();
let language = progress.language === "en" ? "en" : "sv";

function t(swedish) {
  return language === "en" ? english[swedish] ?? swedish : swedish;
}

function localizedMission(mission) {
  const translation = language === "en" ? englishMissions[mission.id] : undefined;
  if (!translation) return mission;
  const [title, place, bring, instructions] = translation;
  return { ...mission, title, place, bring, instructions };
}
let screen = "home";
let group = "family";
let current = null;
let newPiece = false;
let returnTo = "list";

function saveProgress(next) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
    progress = next;
    return true;
  } catch {
    window.alert(t("Det gick inte att spara. Försök igen."));
    return false;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function pieceCount() {
  return Math.min(3, progress.completed.length);
}

function mapMarkup() {
  const pieces = pieceCount();
  return `<p class="badge">${language === "en" ? `${pieces} of 3 map pieces` : `${pieces} av 3 kartbitar`}</p>
    <div class="map" aria-hidden="true">${[0, 1, 2].map(index => index < pieces
      ? `<span class="found"><img class="art" src="piece${index + 1}.webp" alt=""></span>`
      : "<span>?</span>").join("")}</div>`;
}

function button(text, action, cls = "primary") {
  return `<button type="button" class="${cls}" data-action="${action}">${t(text)}</button>`;
}

function homeMarkup() {
  return `<header><strong>Äventyr ute</strong><div class="header-actions"><label class="language">
    <span class="visually-hidden">${t("Språk")}</span>
    <select id="language" lang="${language}">
      <option value="sv" lang="sv" ${language === "sv" ? "selected" : ""}>Svenska</option>
      <option value="en" lang="en" ${language === "en" ? "selected" : ""}>English</option>
    </select></label>${button("För föräldrar", "parents", "secondary")}</div></header>
    <h1>${t("Den försvunna kartan")}</h1>
    <p>${t("Lös uppdrag utomhus med familjen eller en kompis. Hitta tre kartbitar och lås upp en skattjakt.")}</p>
    <div class="home-actions">
      ${button("Välj ett uppdrag", "list")}
      ${pieceCount() === 3 ? button(progress.finaleDone ? "Gör skattjakten igen" : "Starta skattjakten", "final", "secondary") : ""}
    </div>
    <div class="stack">
      ${button("Förälder och barn", "family", "secondary")}
      ${button("Vår minnesbok", "memories", "secondary")}
      ${button("Överraska oss", "surprise", "secondary")}
      ${button("Göteborg – Lär känna din stad", "city", "secondary")}
    </div>
    <img src="park.webp" alt="">
    ${mapMarkup()}`;
}

function listMarkup() {
  return `<h1>${t("Välj ett uppdrag")}</h1>
    ${groupMarkup()}
    ${missionCards(localMissions().filter(mission => matchesGroup(mission, group)))}`;
}

function localMissions() {
  return [...neighborhoodActivities, ...missions, ...progress.custom];
}

function matchesGroup(mission, selectedGroup) {
  return mission.group === "both" || mission.group === selectedGroup;
}

function groupMarkup() {
  return `<div class="tabs" aria-label="${t("Vem följer med?")}">${Object.entries(groupName).map(([key, name]) =>
    `<button class="secondary" type="button" data-action="group" data-id="${key}" aria-pressed="${key === group}">${t(name)}</button>`).join("")}</div>`;
}

function missionCards(entries) {
  return `<div class="stack">${entries.map(localizedMission).map(mission =>
    `<button type="button" class="card" data-action="mission" data-id="${escapeHtml(mission.id)}">
      <strong>${mission.icon} ${escapeHtml(mission.title)}</strong>
      <span>${mission.chapters ? t("4–8 år · Flera tillfällen") : mission.minutes + " min"} · ${escapeHtml(mission.place)}${progress.completed.includes(mission.id) ? " · " + t("Klart") : ""}</span>
    </button>`).join("")}</div>`;
}

function surpriseMarkup() {
  return `<h1>${t("Överraska oss")}</h1>
    ${groupMarkup()}
    <h2>${t("Hur mycket tid har ni?")}</h2>
    <div class="tabs">${[15, 30, 60].map(minutes =>
      `<button class="secondary" type="button" data-action="surprise-pick" data-id="${minutes}">${minutes} min</button>`).join("")}</div>`;
}

function stampedAreas() {
  return new Set(cityMissions
    .filter(mission => mission.area && progress.completed.includes(mission.id))
    .map(mission => mission.area));
}

function cityMarkup() {
  const stamps = stampedAreas();
  return `<h1>${t("Göteborg – Lär känna din stad")}</h1>
    <h2>${t("Göteborgspasset")}</h2>
    <p>${t("Samla stämplar från tre olika områden för att låsa upp en egen Göteborgstur.")}</p>
    <p class="badge">${t("Stämplade områden")}: ${stamps.size}/${Object.keys(cityAreas).length}</p>
    ${stamps.size >= 3 ? button("Min Göteborgstur", "city-tour") : ""}
    ${Object.entries(cityAreas).map(([key, name]) => `<section class="city-area">
      <h2>${name}${stamps.has(key) ? " · ✓" : ""}</h2>
      ${missionCards(cityMissions.filter(mission => mission.area === key))}
    </section>`).join("")}
    <section class="city-area">
      <h2>${t("Flera områden")}</h2>
      ${missionCards(cityMissions.filter(mission => !mission.area))}
    </section>`;
}

function openMission(mission, origin = screen) {
  if (!mission) return;
  current = mission;
  returnTo = origin;
  show("mission");
}

function missionMarkup() {
  const mission = localizedMission(current);
  return `<h1>${escapeHtml(mission.title)}</h1>
    <p class="badge">${mission.chapters ? t("4–8 år · Flera tillfällen") : mission.minutes + " min"} · ${t(groupName[mission.group] || "Tillsammans")}</p>
    ${mission.id === "park" ? '<img src="mission.webp" alt="">' : ""}
    <p><strong>${t("Plats:")}</strong> ${escapeHtml(mission.place)}</p>
    <div class="panel"><p>${escapeHtml(mission.instructions)}</p></div>
    ${mission.bring ? `<p><strong>${t("Ta med:")}</strong> ${escapeHtml(mission.bring)}</p>` : ""}
    <p class="muted">${t("Läs uppdraget tillsammans. Lägg undan mobilen och tryck här när ni är tillbaka.")}</p>
    ${familyAdventures.some(m => m.id === current.id) ? `<div class="panel"><h2>${t("Till den vuxna")}</h2><p>${escapeHtml(current.prep[language === "en" ? 1 : 0])}</p></div>` : ""}
    ${button("Bilder och minnen", "album", "secondary")}
    ${button("Vi är klara", "complete")}`;
}

function rewardMarkup() {
  const completedFinale = current.id === "final";
  return `<div class="center"><h1>${t(completedFinale ? "Ni löste mysteriet!" :
    newPiece ? "Ni hittade en kartbit!" : "Bra jobbat tillsammans!")}</h1>
    ${mapMarkup()}
    <p>${t(completedFinale ? "Nu är det er tur att hitta på en skattjakt för familjen eller era kompisar."
      : newPiece ? storyClues[pieceCount() - 1] : "Välj ett nytt uppdrag när ni vill gå ut igen.")}</p>
    <div class="home-actions">
      ${button("Lägg till ett minne", "album")}
      ${button("Välj ett uppdrag", "list")}
      ${returnTo === "city" ? button("Till Göteborgspasset", "city", "secondary") : ""}
      ${button("Se kartan", "home", "secondary")}
    </div></div>`;
}

function parentsMarkup() {
  return `<h1>${t("För föräldrar")}</h1>
    <p>${t("Skapa ett eget uppdrag. Ge gärna barnet och den som följer med varsin roll.")}</p>
    <form id="mission-form">
      <label>${t("Namn")}<input name="title" required maxlength="60"></label>
      <label>${t("Vem följer med?")}<select name="group">
        <option value="family">${t("Med familjen")}</option><option value="friend">${t("Med en kompis")}</option>
      </select></label>
      <label>${t("Tid i minuter")}<input name="minutes" type="number" min="5" max="120" value="20" required></label>
      <label>${t("Plats")}<input name="place" required maxlength="60" placeholder="${t("Till exempel parken")}"></label>
      <label>${t("Vad ska ni göra?")}<textarea name="instructions" required maxlength="500"></textarea></label>
      <label>${t("Ta med (valfritt)")}<input name="bring" maxlength="120"></label>
      <button class="primary" type="submit">${t("Spara uppdrag")}</button>
    </form>`;
}

const views = { home: homeMarkup, list: listMarkup, mission: missionMarkup, reward: rewardMarkup, parents: parentsMarkup, surprise: surpriseMarkup, city: cityMarkup, family: familyMarkup, album: albumMarkup, memories: memoriesMarkup };

function show(next, { scroll = true } = {}) {
  screen = next;
  document.documentElement.lang = language;
  app.innerHTML = `${next !== "home" ? button("‹ Tillbaka", "back", "secondary") : ""}${views[next]()}`;
  if (scroll) {
    window.scrollTo(0, 0);
    const title = app.querySelector("h1");
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  }
}

window.gameBack = () => {
  if (screen === "home") return false;
  show(screen === "mission" ? returnTo : screen === "album" ? "mission" : "home");
  return true;
};

app.addEventListener("click", event => {
  const selected = event.target.closest("button[data-action]");
  if (!selected) return;
  const { action, id } = selected.dataset;
  switch (action) {
    case "group":
      group = id;
      show(screen, { scroll: false });
      app.querySelector('[aria-pressed="true"]').focus();
      break;
    case "mission":
      openMission([...localMissions(), ...cityMissions, ...familyAdventures, cityTour, finale].find(mission => mission.id === id));
      break;
    case "surprise-pick": {
      const eligible = localMissions().filter(mission =>
        matchesGroup(mission, group) && mission.minutes <= Number(id));
      const remaining = eligible.filter(mission => !progress.completed.includes(mission.id));
      const choices = remaining.length ? remaining : eligible;
      openMission(choices[Math.floor(Math.random() * choices.length)]);
      break;
    }
    case "city-tour":
      if (stampedAreas().size >= 3) openMission(cityTour);
      break;
    case "final":
      openMission(finale, "home");
      break;
    case "complete": {
      if (current.id === finale.id) {
        if (!saveProgress({ ...progress, finaleDone: true })) return;
        newPiece = false;
      } else {
        const completed = progress.completed.includes(current.id)
          ? progress.completed : [...progress.completed, current.id];
        newPiece = Math.min(3, completed.length) > pieceCount();
        if (!saveProgress({ ...progress, completed })) return;
      }
      show("reward");
      break;
    }
    case "album":
      albumMission = current;
      show("album");
      loadAlbum();
      break;
    case "back":
      window.gameBack();
      break;
    case "home":
    case "list":
    case "parents":
    case "surprise":
    case "city":
    case "family":
    case "memories":
      show(action);
      break;
  }
});

app.addEventListener("change", event => {
  const select = event.target;
  if (select.id !== "language" || !["sv", "en"].includes(select.value)) return;
  if (saveProgress({ ...progress, language: select.value })) language = select.value;
  show("home", { scroll: false });
  app.querySelector("#language").focus();
});

app.addEventListener("submit", event => {
  if (event.target.id !== "mission-form") return;
  event.preventDefault();
  const form = new FormData(event.target);
  const field = name => form.get(name).trim();
  const mission = {
    id: "custom-" + Date.now(), title: field("title"), group: field("group"),
    place: field("place"), instructions: field("instructions"), bring: field("bring"),
    minutes: Number(field("minutes")), icon: "🌟"
  };
  if (!mission.title || !mission.place || !mission.instructions) {
    window.alert(t("Fyll i namn, plats och vad ni ska göra."));
    return;
  }
  if (!saveProgress({ ...progress, custom: [...progress.custom, mission] })) return;
  group = mission.group;
  show("list");
});

show("home");
