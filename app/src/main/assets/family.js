"use strict";

const familyAdventures = [
  ["letter","✉️",["Brevet från en liten vän","A Letter From a Little Friend"],
   ["Förbered ett brev från en påhittad liten granne som behöver ett hem. Göm brevet där barnet hittar det.","Prepare a letter from an imaginary tiny neighbor who needs a home. Hide it for your child to discover."],
   [["Dag 1 – Upptäck","Day 1 – Discover","Läs brevet tillsammans ute. Barnet väljer en plats och ritar hur den lilla vännen skulle bo där.","Read the letter outdoors together. Your child picks a spot and sketches a home for the tiny friend."],
    ["Dag 2 – Bygg","Day 2 – Build","Bygg ett litet hem av kartong hemma. Barnet bestämmer rum och namn. Den vuxna hjälper till med konstruktionen.","Build a cardboard home together. Your child chooses the rooms and name while you help it stand up."],
    ["Dag 3 – Svaret","Day 3 – A Reply","Lämna ett nytt brev som nämner en detalj barnet har skapat. Svara tillsammans med en teckning och ställ ut hemmet på er egen plats.","Leave a reply mentioning something your child created. Answer with a drawing and display the home in your own space."]]],
  ["expedition","🧭",["Familjens expedition","The Family Expedition"],
   ["Välj ett nytt utflyktsmål tillsammans. Den vuxna ordnar resan och ett hemligt kuvert att öppna på plats.","Choose a new destination together. The adult plans transport and a secret envelope to open on arrival."],
   [["Planera","Plan","Gör papperspass och packa en ryggsäck. Barnet blir expeditionsledare och väljer gruppens namn.","Make paper passports and pack a backpack. Your child leads the expedition and names the team."],
    ["Upptäck","Explore","Öppna kuvertet på plats. Hitta en bas, rita något oväntat och låt barnet välja nästa stopp inom ert område.","Open the envelope at your destination. Find a base, draw a surprise discovery and let your child choose your next nearby stop."],
    ["Välkomna hem","Welcome Home","Laga en enkel återkomstmåltid tillsammans och berätta om expeditionen med era teckningar.","Prepare a simple homecoming meal and tell the expedition story using your drawings."]]],
  ["film","🎬",["Vår egen film","Our Own Film"],
   ["Avsätt två tillfällen. Hjälp barnet välja en berättelse med början, problem och slut.","Set aside two sessions. Help your child choose a story with a beginning, a problem and an ending."],
   [["Skapa","Create","Barnet väljer hjälte och titel. Gör kostymer av sådant ni har och rita tre scener.","Your child picks a hero and title. Make costumes from things you own and sketch three scenes."],
    ["Spela in","Film","Filma tillsammans ute eller hemma med telefonens kamera. Den vuxna spelar en rolig figur och barnet regisserar.","Film outdoors or at home using your phone camera. The adult plays a funny character and your child directs."],
    ["Premiär","Premiere","Rita biljetter och en affisch. Bjud in familjen till premiär och berätta vilken scen ni tyckte bäst om.","Draw tickets and a poster. Invite your family to the premiere and share your favorite scene."]]],
  ["build","🛠️",["Från idé till bygge","From Idea to Creation"],
   ["Välj en kartongbil, ett leksakshus eller en liten båt. Den vuxna sköter verktyg och svåra moment.","Choose a cardboard car, a toy house or a little boat. The adult handles tools and tricky steps."],
   [["Rita planen","Draw the Plan","Barnet ritar vad bygget ska kunna göra. Välj material tillsammans.","Your child draws what the creation should do. Choose materials together."],
    ["Bygg och prova","Build and Test","Bygg i turordning. Prova om huset står stadigt, bilen rullar eller båten flyter i en balja.","Take turns building. Test whether the house stands, the car rolls or the boat floats in a tub."],
    ["Förbättra och fira","Improve and Celebrate","Ändra en sak efter testet. Ge bygget ett namn och ordna en invigning ute eller hemma.","Improve one thing after testing. Name your creation and hold an opening ceremony outdoors or at home."]]],
  ["world","🐉",["Välkommen till min värld","Welcome to My World"],
   ["Låt barnet välja en värld. Den vuxna blir en figur som behöver barnets hjälp och följer barnets idéer.","Let your child choose a world. The adult plays someone who needs help and follows the child's ideas."],
   [["Välj världen","Choose the World","Bygg en drakskola, rymdstation eller djurklinik med enkla saker. Barnet förklarar reglerna.","Build a dragon school, space station or animal clinic from simple things. Your child explains the rules."],
    ["Ett problem","A Problem","Den vuxnas figur får ett problem. Barnet föreslår en lösning. Hämta material ute och skapa det ni behöver tillsammans.","The adult's character has a problem. Your child suggests a solution. Gather materials outdoors and create what you need together."],
    ["Den stora finalen","The Grand Finale","Spela upp räddningen och fira med en ceremoni som barnet hittar på. Rita en bild av er värld.","Act out the rescue and celebrate with a ceremony your child invents. Draw your world."]]],
  ["event","🎉",["En fest vi skapar","A Celebration We Create"],
   ["Välj en person ni känner att bjuda in. Hjälp barnet planera ett litet evenemang som ni kan genomföra.","Choose someone you know to invite. Help your child plan a small event you can carry out together."],
   [["Bjud in","Invite","Barnet väljer anledning och program. Gör en inbjudan och dela upp arbetet.","Your child chooses the occasion and program. Make an invitation and divide the work."],
    ["Förbered","Prepare","Gör dekorationer och ett enkelt mellanmål. Öva en föreställning, sång eller ett quiz tillsammans.","Make decorations and a simple snack. Rehearse a show, song or quiz together."],
    ["Ta emot gästen","Welcome Your Guest","Ordna festen hemma, på gården eller i parken. Barnet är värd och den vuxna hjälper enligt barnets plan.","Hold the celebration at home, in the yard or at a park. Your child hosts and the adult helps with their plan."]]],
  ["time","⏳",["Familjens tidsmaskin","The Family Time Machine"],
   ["Välj ett minne från din barndom som ni kan återskapa och ta fram ett foto eller en sak att berätta om.","Choose a childhood memory you can recreate and bring a photo or object to tell its story."],
   [["Din barndom","Your Childhood","Berätta om en särskild dag. Gör något från den tillsammans: laga maten, bygg något eller lär ut en lek.","Describe a particular day. Recreate something from it together: prepare food, build something or teach a game."],
    ["Barnets dag","Your Child's Day","Barnet planerar en egen dag med två aktiviteter och lär den vuxna hur de går till.","Your child plans a day with two activities and teaches the adult how to do them."],
    ["Välj ett minne","Choose a Memory","Välj varsin sak ni vill göra igen. Rita två bilder och skriv barnets ord bredvid.","Each choose something you'd like to repeat. Draw two pictures and write your child's words beside them."]]]
].map(([key,icon,titles,prep,chapters]) => {
  const id = "family-" + key;
  const instructions = chapters.map((c,i)=>`${i+1}. ${c[0]}\n${c[2]}`).join("\n\n");
  englishMissions[id] = [titles[1],"At home and outdoors","Paper, pencils and materials for your adventure",chapters.map((c,i)=>`${i+1}. ${c[1]}\n${c[3]}`).join("\n\n")];
  return {id,icon,title:titles[0],group:"family",minutes:90,place:"Hemma och ute",bring:"Papper, pennor och material till ert äventyr",instructions,prep,chapters};
});

Object.assign(english, {
  "Ta en bild":"Take a Photo",
  "Kameran kunde inte öppnas.":"Could not open the camera or photo picker.",
  "Förälder och barn":"Parent and Child", "Vår minnesbok":"Our Memory Book",
  "Till den vuxna":"For the Adult", "4–8 år · Flera tillfällen":"Ages 4–8 · Several sessions",
  "Lägg till ett minne":"Add a Memory", "Bilder och minnen":"Photos and Memories",
  "Lägg till bilder":"Add Photos", "Välj bilder från kameran eller galleriet.":"Choose photos from your camera or gallery.",
  "Skriv en rad om ert äventyr":"Write a line about your adventure", "Spara minnet":"Save Memory",
  "Dela bilden":"Share Photo", "Ta bort":"Delete", "Inga bilder ännu.":"No photos yet.",
  "Minnet sparades.":"Memory saved.", "Kunde inte spara bilden. Försök med en annan bild.":"Could not save the photo. Try another image.",
  "Ta bort bilden?":"Delete this photo?", "Kunde inte dela bilden.":"Could not share the photo.",
  "Albumet finns på den här enheten.":"This album is stored on this device."
});
