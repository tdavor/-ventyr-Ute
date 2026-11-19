"use strict";

const cityAreas = {
  hisingen: "Hisingen",
  centrum: "Centrum",
  majorna: "Majorna",
  slottsskogen: "Slottsskogen",
  east: "Östra Göteborg"
};

const activityMissions = [
  ["secret", "", 15, "🕵️",
    ["Hemliga uppdrag", "Ert kvarter", "Papper och penna", "Skriv varsin hemlig uppgift före promenaden. En kan få gruppen att stanna och lyssna, en annan kan få alla att hitta på ett namn för en plats. Efter promenaden gissar ni varandras uppgifter."],
    ["Secret Missions", "Your neighborhood", "Paper and a pencil", "Write one secret task for each person before your walk. One person might get everyone to stop and listen, and another might get the group to invent a name for a place. Guess each other's tasks when you get back."]],
  ["dice", "", 30, "🎲",
    ["Tärningspromenaden", "Ett område ni känner", "En tärning", "Bestäm var ni börjar och när ni vänder tillbaka. Turas om att slå vid ett vägval. Jämnt betyder vänster, udda höger. Välj bara vägar ni får och kan gå på. Barnet får en gång säga Jag bestämmer! och välja riktning."],
    ["The Dice Walk", "A familiar area", "A die", "Agree on where to start and when to turn back. Take turns rolling at a junction. Even means left and odd means right. Stick to paths you can safely use. Once per walk, the child can say My choice! and pick the direction."]],
  ["games", "", 45, "🏅",
    ["Kvarters-OS", "Park eller gård", "En mjuk boll", "Barnen hittar på tre grenar och lär de andra reglerna. Testa till exempel balans längs en linje eller pricka en cirkel med en mjuk boll. I andra omgången försöker ni slå ert gemensamma resultat."],
    ["Neighborhood Games", "Park or yard", "A soft ball", "The children invent three events and teach the others the rules. Try balancing along a line or tossing a soft ball into a circle. In round two, work together to beat your team score."]],
  ["gbg-keillers", "hisingen", 30, "🔭",
    ["Staden från ovan", "Keillers park", "Papper och pennor", "Välj tre saker var som ni ser från utsiktsplatsen. Rita dem utan att visa varandra. Byt teckningar och försök hitta det den andra såg."],
    ["The City From Above", "Keillers Park", "Paper and pencils", "Each pick three things you can see from the viewpoint. Sketch them in secret. Swap drawings and try to find what the other person saw."]],
  ["gbg-eriksberg", "hisingen", 30, "⚓",
    ["Hamndetektiverna", "Eriksberg", "", "Leta efter tre saker som får er att tänka på hamnen eller skeppsbygge. Barnet väljer den mest spännande ledtråden. Hitta tillsammans på en fråga om den att undersöka hemma."],
    ["Harbor Detectives", "Eriksberg", "", "Find three things that remind you of the harbor or shipbuilding. The child picks the most interesting clue. Together, think of a question about it that you can look up at home."]],
  ["gbg-kville", "hisingen", 30, "🗺️",
    ["Mitt kvarter på kartan", "Kvillebäcken", "Papper och penna", "Barnet visar tre platser som det skulle vilja visa en kompis. Rita sedan en enkel karta över promenaden och hitta på ett namn för rundan tillsammans."],
    ["My Neighborhood on the Map", "Kvillebäcken", "Paper and a pencil", "The child leads the way to three places they'd show a friend. Then draw a simple map of the walk and give your route a name together."]],
  ["gbg-haga", "centrum", 20, "🔎",
    ["Husens hemliga detaljer", "Haga", "", "Välj varsin hemlig detalj på ett hus, till exempel ett handtag, en utsmyckning eller ett fönster. Ge tre ledtrådar så att den andra kan hitta detaljen. Byt roller."],
    ["Secrets on the Buildings", "Haga", "", "Each pick a secret detail on a building, such as a handle, an ornament or a window. Give three clues so the other person can spot it. Swap roles."]],
  ["gbg-broar", "centrum", 30, "🌉",
    ["Brobyggarna", "Vid kanalen i centrum", "Papper och penna", "Välj två broar och hitta en likhet och en skillnad. Barnet ritar en egen bro. Den andra personen föreslår en detalj som gör den lättare att använda för fler."],
    ["Bridge Builders", "By a canal in central Göteborg", "Paper and a pencil", "Pick two bridges and find one thing they share and one way they differ. The child draws a bridge of their own. Their partner suggests one detail to make it easier for more people to use."]],
  ["gbg-klippan", "majorna", 30, "✉️",
    ["Ett vykort från Göteborg", "Klippan", "Papper och pennor", "Rita varsin vy vid vattnet. Byt bilder och skriv två meningar som om ni skickade vykorten till någon som aldrig varit i Göteborg."],
    ["A Postcard From Göteborg", "Klippan", "Paper and pencils", "Each sketch a view by the water. Swap pictures and write two sentences as if sending postcards to someone who has never been to Göteborg."]],
  ["gbg-slott", "slottsskogen", 20, "👂",
    ["Tre ljud, tre platser", "Slottsskogen", "Papper och penna", "Stanna på tre platser och lyssna en stund. Rita varsin symbol för ett ljud ni hör. Sätt ihop symbolerna till en ljudkarta över promenaden."],
    ["Three Sounds, Three Places", "Slottsskogen", "Paper and a pencil", "Stop in three places and listen for a moment. Each draw a symbol for a sound you hear. Put the symbols together on a sound map of your walk."]],
  ["gbg-kviberg", "east", 30, "🤸",
    ["Plats för lek", "Kviberg", "", "Välj en plats där ni har plats att röra er. Barnen hittar på en lek med tre regler och lär ut den. Spela en omgång och låt sedan någon annan byta ut en regel."],
    ["Room to Play", "Kviberg", "", "Pick somewhere with room to move. The children invent a game with three rules and teach it to the others. Play a round, then let someone else change one rule."]],
  ["gbg-sparvagn", "", 60, "🚋",
    ["Göteborg med spårvagn", "En hållplats ni väljer", "Papper och penna", "Välj en hållplats ni sällan kliver av vid. Bestäm ett mål i närheten. Barnet skissar vägen från hållplatsen när ni går dit, och en annan i gruppen leder vägen tillbaka med kartan."],
    ["Göteborg by Tram", "A stop of your choice", "Paper and a pencil", "Choose a stop where you rarely get off. Pick a nearby destination. The child sketches your route as you walk there, and someone else leads the way back using the map."]],
  ["gbg-tour", "", 60, "⭐",
    ["Min Göteborgstur", "Tre platser ni väljer", "Papper och penna", "Barnet väljer tre platser och blir gruppens guide. Visa något speciellt på varje stopp och bjud in alla att ställa en fråga. Avsluta med att rita er egen Göteborgstur."],
    ["My Göteborg Tour", "Three places of your choice", "Paper and a pencil", "The child picks three places and becomes the group guide. Show everyone something special at each stop and invite them to ask a question. Finish by drawing your own Göteborg tour."]]
].map(([id, area, minutes, icon, swedish, translated]) => {
  const [title, place, bring, instructions] = swedish;
  englishMissions[id] = translated;
  return { id, area, minutes, icon, title, place, bring, instructions, group: "both" };
});

const neighborhoodActivities = activityMissions.slice(0, 3);
const cityMissions = activityMissions.slice(3, -1);
const cityTour = activityMissions[activityMissions.length - 1];

Object.assign(english, {
  "Överraska oss": "Surprise us",
  "Hur mycket tid har ni?": "How much time do you have?",
  "Göteborg – Lär känna din stad": "Göteborg – Get to Know Your City",
  "Göteborgspasset": "Göteborg Passport",
  "Samla stämplar från tre olika områden för att låsa upp en egen Göteborgstur.": "Collect stamps from three different areas to unlock your own Göteborg tour.",
  "Stämplade områden": "Stamped areas",
  "Flera områden": "Multiple areas",
  "Min Göteborgstur": "My Göteborg Tour",
  "Till Göteborgspasset": "Go to Göteborg Passport"
});
