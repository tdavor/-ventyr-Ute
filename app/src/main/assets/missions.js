"use strict";

const missions = [
  ["park", "friend", "Parkens hemlighet", 20, "Park", "Papper och penna",
    "Hitta tre olika löv. Rita varsitt löv utan att visa det för den andra. Byt teckningar och försök hitta lövet som din kompis ritade.", "🍂"],
  ["spar", "friend", "Spår i kvarteret", 15, "Kvarteret", "",
    "Gå en runda tillsammans. Turas om att leta efter något runt, något randigt och något blått. Berätta hur ni upptäckte varje sak.", "👣"],
  ["meddelande", "friend", "Göm ett meddelande", 25, "Park eller gård", "Papper och penna",
    "Skriv ett hemligt ord på en lapp. En av er gömmer lappen på en plats som ni båda får vara på och ger tre ledtrådar. Hämta lappen och byt roller.", "✉️"],
  ["karta", "friend", "Två halvor, en karta", 25, "Park", "Papper och pennor",
    "Rita varsin halva av en karta över parken. Lägg ihop kartan. Markera ett mål och följ kartan dit tillsammans.", "🗺️"],
  ["konst", "friend", "Konst på marken", 15, "Park eller gård", "",
    "Leta efter nedfallna löv och kvistar. Bygg början på ett djur var. Byt plats och bygg färdigt varandras djur, långt från gångvägen.", "🎨"],
  ["steg", "friend", "Steg i takt", 15, "Park eller gård", "",
    "Hitta på varsin följd med tre rörelser. Lär ut dem till varandra och slå ihop dem till en gemensam dans.", "🕺"],
  ["saga", "friend", "Sagan bakom bänken", 20, "Park", "",
    "Välj tre saker ni ser. Turas om att säga en mening var i en saga tills alla tre saker har fått en roll.", "📖"],
  ["farger", "friend", "Färgjakt", 15, "Park eller gård", "",
    "Ge din kompis två färger att leta efter. Byt roller och avsluta med att tillsammans hitta något som har båda era favoritfärger.", "🌈"],
  ["roller", "family", "Byt roller", 25, "Park eller kvarter", "",
    "Barnet visar vägen till tre platser i ett område ni känner till och berättar varför de valdes. På vägen hem väljer den vuxna ett eget stopp.", "🧭"],
  ["ljud", "family", "Ljudkartan", 20, "Park", "Papper och penna",
    "Sitt ute tillsammans och lyssna i en minut. Rita in ljuden på en karta. Jämför vad ni hörde och från vilket håll.", "👂"],
  ["skatt", "family", "Barnens skattjakt", 30, "Park eller gård", "Papper och penna",
    "Barnet väljer ett hemligt mål och ritar tre ledtrådar. Den vuxna försöker hitta målet medan barnet följer med och säger varmt eller kallt.", "🔎"],
  ["favorit", "family", "Mitt favoritställe", 25, "Kvarteret", "",
    "Gå till varsin plats ni tycker om. Berätta för varandra om ett minne från platsen. Kom överens om en ny plats att utforska nästa gång.", "💚"],
  ["trad", "family", "Trädets porträtt", 20, "Park", "Papper och pennor",
    "Välj ett träd tillsammans. Sätt er på varsin sida och rita det ni ser. Jämför teckningarna och upptäck vad som såg olika ut från era platser.", "🌳"],
  ["picknick", "family", "Hitta picknickplatsen", 25, "Park", "Ett mellanmål",
    "Barnet letar efter en plats med skugga och den vuxna efter en plats att sitta på. Välj en plats som passar båda och dela mellanmålet.", "🧺"],
  ["djur", "family", "Vem var här?", 20, "Park eller skogsstig", "",
    "Leta tillsammans efter tre tecken på djur, till exempel fågelsång eller en kotte som ett djur har gnagt på. Hitta på varsin förklaring till vad som kan ha hänt.", "🐾"],
  ["promenad", "family", "Promenad med tre frågor", 20, "Kvarteret", "",
    "Promenera tillsammans. Ställ tre frågor var: något om förr, något om idag och något om framtiden. Turas om att lyssna och svara.", "💬"],
].map(([id, group, title, minutes, place, bring, instructions, icon]) =>
  ({ id, group, title, minutes, place, bring, instructions, icon }));

const finale = {
  id: "final", title: "Den sista skattjakten", minutes: 30, place: "Park eller gård",
  bring: "Papper och penna", icon: "⭐",
  instructions: "Välj tillsammans ett mål som ni kan gå till. En av er ritar tre ledtrådar som leder dit. De andra löser ledtrådarna medan alla följer med. När ni hittat målet, byt roller och skapa en ny jakt."
};
