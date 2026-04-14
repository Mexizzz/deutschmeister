/* vocabulary.js — ~500 German words, A1-A2, 12 categories */
'use strict';

const VOCABULARY = [
  // ── Greetings & Basics ──────────────────────────────────────────────────
  { id:'v001', de:'Hallo', en:'Hello', gender:null, plural:null, example_de:'Hallo! Wie geht es dir?', example_en:'Hello! How are you?', category:'greetings', level:'A1' },
  { id:'v002', de:'Guten Morgen', en:'Good morning', gender:null, plural:null, example_de:'Guten Morgen! Schön, dich zu sehen.', example_en:'Good morning! Nice to see you.', category:'greetings', level:'A1' },
  { id:'v003', de:'Guten Tag', en:'Good day / Hello', gender:null, plural:null, example_de:'Guten Tag, wie kann ich helfen?', example_en:'Good day, how can I help?', category:'greetings', level:'A1' },
  { id:'v004', de:'Guten Abend', en:'Good evening', gender:null, plural:null, example_de:'Guten Abend! Wie war Ihr Tag?', example_en:'Good evening! How was your day?', category:'greetings', level:'A1' },
  { id:'v005', de:'Auf Wiedersehen', en:'Goodbye', gender:null, plural:null, example_de:'Auf Wiedersehen! Bis morgen.', example_en:'Goodbye! Until tomorrow.', category:'greetings', level:'A1' },
  { id:'v006', de:'Tschüss', en:'Bye (informal)', gender:null, plural:null, example_de:'Tschüss! Mach\'s gut!', example_en:'Bye! Take care!', category:'greetings', level:'A1' },
  { id:'v007', de:'Danke', en:'Thank you', gender:null, plural:null, example_de:'Danke für Ihre Hilfe.', example_en:'Thank you for your help.', category:'greetings', level:'A1' },
  { id:'v008', de:'Bitte', en:'Please / You\'re welcome', gender:null, plural:null, example_de:'Bitte helfen Sie mir.', example_en:'Please help me.', category:'greetings', level:'A1' },
  { id:'v009', de:'Entschuldigung', en:'Excuse me / Sorry', gender:null, plural:null, example_de:'Entschuldigung, wo ist der Bahnhof?', example_en:'Excuse me, where is the train station?', category:'greetings', level:'A1' },
  { id:'v010', de:'Ja', en:'Yes', gender:null, plural:null, example_de:'Ja, ich verstehe.', example_en:'Yes, I understand.', category:'greetings', level:'A1' },
  { id:'v011', de:'Nein', en:'No', gender:null, plural:null, example_de:'Nein, das stimmt nicht.', example_en:'No, that\'s not right.', category:'greetings', level:'A1' },
  { id:'v012', de:'Wie geht es Ihnen?', en:'How are you? (formal)', gender:null, plural:null, example_de:'Guten Tag! Wie geht es Ihnen?', example_en:'Good day! How are you?', category:'greetings', level:'A1' },
  { id:'v013', de:'Mir geht es gut', en:'I am fine', gender:null, plural:null, example_de:'Mir geht es gut, danke!', example_en:'I am fine, thank you!', category:'greetings', level:'A1' },
  { id:'v014', de:'Ich heiße...', en:'My name is...', gender:null, plural:null, example_de:'Ich heiße Anna. Wie heißt du?', example_en:'My name is Anna. What\'s your name?', category:'greetings', level:'A1' },
  { id:'v015', de:'Sprechen Sie Englisch?', en:'Do you speak English?', gender:null, plural:null, example_de:'Entschuldigung, sprechen Sie Englisch?', example_en:'Excuse me, do you speak English?', category:'greetings', level:'A1' },

  // ── Numbers ────────────────────────────────────────────────────────────
  { id:'v016', de:'eins', en:'one', gender:null, plural:null, example_de:'Ich habe einen Hund.', example_en:'I have one dog.', category:'numbers', level:'A1' },
  { id:'v017', de:'zwei', en:'two', gender:null, plural:null, example_de:'Ich habe zwei Katzen.', example_en:'I have two cats.', category:'numbers', level:'A1' },
  { id:'v018', de:'drei', en:'three', gender:null, plural:null, example_de:'Wir sind drei Personen.', example_en:'We are three people.', category:'numbers', level:'A1' },
  { id:'v019', de:'vier', en:'four', gender:null, plural:null, example_de:'Das kostet vier Euro.', example_en:'That costs four euros.', category:'numbers', level:'A1' },
  { id:'v020', de:'fünf', en:'five', gender:null, plural:null, example_de:'Es ist fünf Uhr.', example_en:'It is five o\'clock.', category:'numbers', level:'A1' },
  { id:'v021', de:'sechs', en:'six', gender:null, plural:null, example_de:'Das Kind ist sechs Jahre alt.', example_en:'The child is six years old.', category:'numbers', level:'A1' },
  { id:'v022', de:'sieben', en:'seven', gender:null, plural:null, example_de:'Die Woche hat sieben Tage.', example_en:'The week has seven days.', category:'numbers', level:'A1' },
  { id:'v023', de:'acht', en:'eight', gender:null, plural:null, example_de:'Der Zug fährt um acht Uhr ab.', example_en:'The train leaves at eight o\'clock.', category:'numbers', level:'A1' },
  { id:'v024', de:'neun', en:'nine', gender:null, plural:null, example_de:'Neun plus eins ist zehn.', example_en:'Nine plus one is ten.', category:'numbers', level:'A1' },
  { id:'v025', de:'zehn', en:'ten', gender:null, plural:null, example_de:'Ich kaufe zehn Äpfel.', example_en:'I am buying ten apples.', category:'numbers', level:'A1' },
  { id:'v026', de:'zwanzig', en:'twenty', gender:null, plural:null, example_de:'Das kostet zwanzig Euro.', example_en:'That costs twenty euros.', category:'numbers', level:'A1' },
  { id:'v027', de:'hundert', en:'hundred', gender:null, plural:null, example_de:'Hundert Meter bis zum Markt.', example_en:'One hundred meters to the market.', category:'numbers', level:'A1' },
  { id:'v028', de:'tausend', en:'thousand', gender:null, plural:null, example_de:'Das Auto kostet tausend Euro.', example_en:'The car costs one thousand euros.', category:'numbers', level:'A1' },

  // ── Colors ─────────────────────────────────────────────────────────────
  { id:'v029', de:'rot', en:'red', gender:null, plural:null, example_de:'Mein Auto ist rot.', example_en:'My car is red.', category:'colors', level:'A1' },
  { id:'v030', de:'blau', en:'blue', gender:null, plural:null, example_de:'Der Himmel ist blau.', example_en:'The sky is blue.', category:'colors', level:'A1' },
  { id:'v031', de:'grün', en:'green', gender:null, plural:null, example_de:'Das Gras ist grün.', example_en:'The grass is green.', category:'colors', level:'A1' },
  { id:'v032', de:'gelb', en:'yellow', gender:null, plural:null, example_de:'Die Sonne ist gelb.', example_en:'The sun is yellow.', category:'colors', level:'A1' },
  { id:'v033', de:'weiß', en:'white', gender:null, plural:null, example_de:'Der Schnee ist weiß.', example_en:'The snow is white.', category:'colors', level:'A1' },
  { id:'v034', de:'schwarz', en:'black', gender:null, plural:null, example_de:'Die Katze ist schwarz.', example_en:'The cat is black.', category:'colors', level:'A1' },
  { id:'v035', de:'orange', en:'orange', gender:null, plural:null, example_de:'Die Orange ist orange.', example_en:'The orange is orange.', category:'colors', level:'A1' },
  { id:'v036', de:'lila', en:'purple', gender:null, plural:null, example_de:'Das Kleid ist lila.', example_en:'The dress is purple.', category:'colors', level:'A1' },
  { id:'v037', de:'braun', en:'brown', gender:null, plural:null, example_de:'Der Tisch ist braun.', example_en:'The table is brown.', category:'colors', level:'A1' },
  { id:'v038', de:'grau', en:'grey', gender:null, plural:null, example_de:'Das Haus ist grau.', example_en:'The house is grey.', category:'colors', level:'A1' },
  { id:'v039', de:'rosa', en:'pink', gender:null, plural:null, example_de:'Das Baby trägt rosa Kleidung.', example_en:'The baby wears pink clothes.', category:'colors', level:'A1' },

  // ── Family ─────────────────────────────────────────────────────────────
  { id:'v040', de:'die Mutter', en:'the mother', gender:'f', plural:'die Mütter', example_de:'Meine Mutter kocht gern.', example_en:'My mother likes to cook.', category:'family', level:'A1' },
  { id:'v041', de:'der Vater', en:'the father', gender:'m', plural:'die Väter', example_de:'Mein Vater arbeitet hier.', example_en:'My father works here.', category:'family', level:'A1' },
  { id:'v042', de:'der Bruder', en:'the brother', gender:'m', plural:'die Brüder', example_de:'Mein Bruder ist groß.', example_en:'My brother is tall.', category:'family', level:'A1' },
  { id:'v043', de:'die Schwester', en:'the sister', gender:'f', plural:'die Schwestern', example_de:'Meine Schwester studiert Medizin.', example_en:'My sister studies medicine.', category:'family', level:'A1' },
  { id:'v044', de:'das Kind', en:'the child', gender:'n', plural:'die Kinder', example_de:'Das Kind spielt im Garten.', example_en:'The child plays in the garden.', category:'family', level:'A1' },
  { id:'v045', de:'die Großmutter', en:'the grandmother', gender:'f', plural:'die Großmütter', example_de:'Meine Großmutter backt Kuchen.', example_en:'My grandmother bakes cake.', category:'family', level:'A1' },
  { id:'v046', de:'der Großvater', en:'the grandfather', gender:'m', plural:'die Großväter', example_de:'Mein Großvater liest viel.', example_en:'My grandfather reads a lot.', category:'family', level:'A1' },
  { id:'v047', de:'der Mann', en:'the man / husband', gender:'m', plural:'die Männer', example_de:'Der Mann trägt eine Jacke.', example_en:'The man wears a jacket.', category:'family', level:'A1' },
  { id:'v048', de:'die Frau', en:'the woman / wife', gender:'f', plural:'die Frauen', example_de:'Die Frau liest ein Buch.', example_en:'The woman reads a book.', category:'family', level:'A1' },
  { id:'v049', de:'der Sohn', en:'the son', gender:'m', plural:'die Söhne', example_de:'Unser Sohn ist sieben Jahre alt.', example_en:'Our son is seven years old.', category:'family', level:'A1' },
  { id:'v050', de:'die Tochter', en:'the daughter', gender:'f', plural:'die Töchter', example_de:'Die Tochter geht zur Schule.', example_en:'The daughter goes to school.', category:'family', level:'A1' },

  // ── Food & Drink ───────────────────────────────────────────────────────
  { id:'v051', de:'das Brot', en:'the bread', gender:'n', plural:'die Brote', example_de:'Ich esse Brot zum Frühstück.', example_en:'I eat bread for breakfast.', category:'food', level:'A1' },
  { id:'v052', de:'das Wasser', en:'the water', gender:'n', plural:null, example_de:'Ich trinke viel Wasser.', example_en:'I drink a lot of water.', category:'food', level:'A1' },
  { id:'v053', de:'der Kaffee', en:'the coffee', gender:'m', plural:null, example_de:'Ich trinke jeden Morgen Kaffee.', example_en:'I drink coffee every morning.', category:'food', level:'A1' },
  { id:'v054', de:'der Tee', en:'the tea', gender:'m', plural:null, example_de:'Möchten Sie Tee oder Kaffee?', example_en:'Would you like tea or coffee?', category:'food', level:'A1' },
  { id:'v055', de:'der Apfel', en:'the apple', gender:'m', plural:'die Äpfel', example_de:'Der Apfel ist rot und süß.', example_en:'The apple is red and sweet.', category:'food', level:'A1' },
  { id:'v056', de:'das Fleisch', en:'the meat', gender:'n', plural:null, example_de:'Ich esse kein Fleisch.', example_en:'I don\'t eat meat.', category:'food', level:'A1' },
  { id:'v057', de:'der Käse', en:'the cheese', gender:'m', plural:null, example_de:'Ich mag deutschen Käse sehr.', example_en:'I really like German cheese.', category:'food', level:'A1' },
  { id:'v058', de:'die Milch', en:'the milk', gender:'f', plural:null, example_de:'Kinder trinken viel Milch.', example_en:'Children drink a lot of milk.', category:'food', level:'A1' },
  { id:'v059', de:'das Ei', en:'the egg', gender:'n', plural:'die Eier', example_de:'Ich esse zwei Eier zum Frühstück.', example_en:'I eat two eggs for breakfast.', category:'food', level:'A1' },
  { id:'v060', de:'die Suppe', en:'the soup', gender:'f', plural:'die Suppen', example_de:'Die Suppe ist sehr heiß.', example_en:'The soup is very hot.', category:'food', level:'A1' },
  { id:'v061', de:'das Bier', en:'the beer', gender:'n', plural:'die Biere', example_de:'Deutsches Bier ist weltberühmt.', example_en:'German beer is world-famous.', category:'food', level:'A1' },
  { id:'v062', de:'der Saft', en:'the juice', gender:'m', plural:'die Säfte', example_de:'Ich trinke Orangensaft.', example_en:'I drink orange juice.', category:'food', level:'A1' },
  { id:'v063', de:'der Kuchen', en:'the cake', gender:'m', plural:'die Kuchen', example_de:'Der Kuchen schmeckt wunderbar.', example_en:'The cake tastes wonderful.', category:'food', level:'A1' },
  { id:'v064', de:'die Kartoffel', en:'the potato', gender:'f', plural:'die Kartoffeln', example_de:'Deutsche essen viele Kartoffeln.', example_en:'Germans eat many potatoes.', category:'food', level:'A1' },
  { id:'v065', de:'der Fisch', en:'the fish', gender:'m', plural:'die Fische', example_de:'Ich esse gern Fisch.', example_en:'I like to eat fish.', category:'food', level:'A1' },
  { id:'v066', de:'das Gemüse', en:'the vegetables', gender:'n', plural:null, example_de:'Gemüse ist gesund.', example_en:'Vegetables are healthy.', category:'food', level:'A1' },
  { id:'v067', de:'die Tomate', en:'the tomato', gender:'f', plural:'die Tomaten', example_de:'Die Tomate ist rot und rund.', example_en:'The tomato is red and round.', category:'food', level:'A1' },
  { id:'v068', de:'der Zucker', en:'the sugar', gender:'m', plural:null, example_de:'Möchten Sie Zucker in Ihren Kaffee?', example_en:'Would you like sugar in your coffee?', category:'food', level:'A1' },

  // ── Animals ────────────────────────────────────────────────────────────
  { id:'v069', de:'der Hund', en:'the dog', gender:'m', plural:'die Hunde', example_de:'Der Hund bellt laut.', example_en:'The dog barks loudly.', category:'animals', level:'A1' },
  { id:'v070', de:'die Katze', en:'the cat', gender:'f', plural:'die Katzen', example_de:'Die Katze schläft auf dem Sofa.', example_en:'The cat sleeps on the sofa.', category:'animals', level:'A1' },
  { id:'v071', de:'der Vogel', en:'the bird', gender:'m', plural:'die Vögel', example_de:'Der Vogel singt schön.', example_en:'The bird sings beautifully.', category:'animals', level:'A1' },
  { id:'v072', de:'das Pferd', en:'the horse', gender:'n', plural:'die Pferde', example_de:'Das Pferd läuft schnell.', example_en:'The horse runs fast.', category:'animals', level:'A1' },
  { id:'v073', de:'die Kuh', en:'the cow', gender:'f', plural:'die Kühe', example_de:'Die Kuh gibt Milch.', example_en:'The cow gives milk.', category:'animals', level:'A1' },
  { id:'v074', de:'das Schwein', en:'the pig', gender:'n', plural:'die Schweine', example_de:'Das Schwein lebt auf dem Bauernhof.', example_en:'The pig lives on the farm.', category:'animals', level:'A1' },
  { id:'v075', de:'der Fisch', en:'the fish', gender:'m', plural:'die Fische', example_de:'Der Fisch schwimmt im Wasser.', example_en:'The fish swims in the water.', category:'animals', level:'A1' },
  { id:'v076', de:'der Löwe', en:'the lion', gender:'m', plural:'die Löwen', example_de:'Der Löwe ist der König der Tiere.', example_en:'The lion is the king of animals.', category:'animals', level:'A1' },
  { id:'v077', de:'der Elephant', en:'the elephant', gender:'m', plural:'die Elefanten', example_de:'Der Elefant ist sehr groß.', example_en:'The elephant is very large.', category:'animals', level:'A1' },
  { id:'v078', de:'der Affe', en:'the monkey', gender:'m', plural:'die Affen', example_de:'Der Affe klettert auf den Baum.', example_en:'The monkey climbs the tree.', category:'animals', level:'A1' },

  // ── Body Parts ─────────────────────────────────────────────────────────
  { id:'v079', de:'der Kopf', en:'the head', gender:'m', plural:'die Köpfe', example_de:'Mein Kopf tut weh.', example_en:'My head hurts.', category:'body', level:'A1' },
  { id:'v080', de:'die Hand', en:'the hand', gender:'f', plural:'die Hände', example_de:'Ich wasche meine Hände.', example_en:'I wash my hands.', category:'body', level:'A1' },
  { id:'v081', de:'das Auge', en:'the eye', gender:'n', plural:'die Augen', example_de:'Meine Augen sind blau.', example_en:'My eyes are blue.', category:'body', level:'A1' },
  { id:'v082', de:'die Nase', en:'the nose', gender:'f', plural:'die Nasen', example_de:'Meine Nase ist kalt.', example_en:'My nose is cold.', category:'body', level:'A1' },
  { id:'v083', de:'der Mund', en:'the mouth', gender:'m', plural:'die Münder', example_de:'Ich öffne den Mund.', example_en:'I open my mouth.', category:'body', level:'A1' },
  { id:'v084', de:'das Ohr', en:'the ear', gender:'n', plural:'die Ohren', example_de:'Ich höre mit meinen Ohren.', example_en:'I hear with my ears.', category:'body', level:'A1' },
  { id:'v085', de:'der Arm', en:'the arm', gender:'m', plural:'die Arme', example_de:'Mein Arm schmerzt.', example_en:'My arm hurts.', category:'body', level:'A1' },
  { id:'v086', de:'das Bein', en:'the leg', gender:'n', plural:'die Beine', example_de:'Ich strecke meine Beine.', example_en:'I stretch my legs.', category:'body', level:'A1' },
  { id:'v087', de:'der Bauch', en:'the stomach / belly', gender:'m', plural:'die Bäuche', example_de:'Mein Bauch ist voll.', example_en:'My stomach is full.', category:'body', level:'A1' },
  { id:'v088', de:'der Rücken', en:'the back', gender:'m', plural:'die Rücken', example_de:'Mein Rücken schmerzt.', example_en:'My back hurts.', category:'body', level:'A1' },

  // ── Clothing ───────────────────────────────────────────────────────────
  { id:'v089', de:'das Hemd', en:'the shirt', gender:'n', plural:'die Hemden', example_de:'Er trägt ein weißes Hemd.', example_en:'He wears a white shirt.', category:'clothing', level:'A1' },
  { id:'v090', de:'die Hose', en:'the trousers / pants', gender:'f', plural:'die Hosen', example_de:'Die Hose ist zu klein.', example_en:'The trousers are too small.', category:'clothing', level:'A1' },
  { id:'v091', de:'der Schuh', en:'the shoe', gender:'m', plural:'die Schuhe', example_de:'Ich kaufe neue Schuhe.', example_en:'I am buying new shoes.', category:'clothing', level:'A1' },
  { id:'v092', de:'die Jacke', en:'the jacket', gender:'f', plural:'die Jacken', example_de:'Es ist kalt — zieh eine Jacke an!', example_en:'It\'s cold — put on a jacket!', category:'clothing', level:'A1' },
  { id:'v093', de:'das Kleid', en:'the dress', gender:'n', plural:'die Kleider', example_de:'Das Kleid ist sehr schön.', example_en:'The dress is very beautiful.', category:'clothing', level:'A1' },
  { id:'v094', de:'der Mantel', en:'the coat', gender:'m', plural:'die Mäntel', example_de:'Im Winter trage ich einen Mantel.', example_en:'In winter I wear a coat.', category:'clothing', level:'A1' },
  { id:'v095', de:'die Mütze', en:'the hat / cap', gender:'f', plural:'die Mützen', example_de:'Die Mütze hält den Kopf warm.', example_en:'The hat keeps the head warm.', category:'clothing', level:'A1' },

  // ── At Home ────────────────────────────────────────────────────────────
  { id:'v096', de:'der Tisch', en:'the table', gender:'m', plural:'die Tische', example_de:'Das Essen steht auf dem Tisch.', example_en:'The food is on the table.', category:'home', level:'A1' },
  { id:'v097', de:'der Stuhl', en:'the chair', gender:'m', plural:'die Stühle', example_de:'Setzt euch bitte auf den Stuhl.', example_en:'Please sit down on the chair.', category:'home', level:'A1' },
  { id:'v098', de:'die Tür', en:'the door', gender:'f', plural:'die Türen', example_de:'Bitte schließen Sie die Tür.', example_en:'Please close the door.', category:'home', level:'A1' },
  { id:'v099', de:'das Fenster', en:'the window', gender:'n', plural:'die Fenster', example_de:'Bitte öffnen Sie das Fenster.', example_en:'Please open the window.', category:'home', level:'A1' },
  { id:'v100', de:'das Bett', en:'the bed', gender:'n', plural:'die Betten', example_de:'Ich gehe ins Bett um zehn Uhr.', example_en:'I go to bed at ten o\'clock.', category:'home', level:'A1' },
  { id:'v101', de:'das Sofa', en:'the sofa', gender:'n', plural:'die Sofas', example_de:'Ich sitze auf dem Sofa.', example_en:'I sit on the sofa.', category:'home', level:'A1' },
  { id:'v102', de:'die Küche', en:'the kitchen', gender:'f', plural:'die Küchen', example_de:'Meine Mutter kocht in der Küche.', example_en:'My mother cooks in the kitchen.', category:'home', level:'A1' },
  { id:'v103', de:'das Badezimmer', en:'the bathroom', gender:'n', plural:'die Badezimmer', example_de:'Das Badezimmer ist links.', example_en:'The bathroom is on the left.', category:'home', level:'A1' },
  { id:'v104', de:'das Haus', en:'the house', gender:'n', plural:'die Häuser', example_de:'Das Haus ist groß und schön.', example_en:'The house is big and beautiful.', category:'home', level:'A1' },
  { id:'v105', de:'die Wohnung', en:'the apartment', gender:'f', plural:'die Wohnungen', example_de:'Ich wohne in einer kleinen Wohnung.', example_en:'I live in a small apartment.', category:'home', level:'A1' },

  // ── Travel & Directions ──────────────────────────────────────────────
  { id:'v106', de:'der Bahnhof', en:'the train station', gender:'m', plural:'die Bahnhöfe', example_de:'Wo ist der Bahnhof?', example_en:'Where is the train station?', category:'travel', level:'A1' },
  { id:'v107', de:'links', en:'left', gender:null, plural:null, example_de:'Biegen Sie links ab.', example_en:'Turn left.', category:'travel', level:'A1' },
  { id:'v108', de:'rechts', en:'right', gender:null, plural:null, example_de:'Das Hotel ist rechts.', example_en:'The hotel is on the right.', category:'travel', level:'A1' },
  { id:'v109', de:'geradeaus', en:'straight ahead', gender:null, plural:null, example_de:'Gehen Sie geradeaus.', example_en:'Go straight ahead.', category:'travel', level:'A1' },
  { id:'v110', de:'die Straße', en:'the street', gender:'f', plural:'die Straßen', example_de:'Überqueren Sie die Straße.', example_en:'Cross the street.', category:'travel', level:'A1' },
  { id:'v111', de:'der Bus', en:'the bus', gender:'m', plural:'die Busse', example_de:'Der Bus kommt in fünf Minuten.', example_en:'The bus comes in five minutes.', category:'travel', level:'A1' },
  { id:'v112', de:'der Zug', en:'the train', gender:'m', plural:'die Züge', example_de:'Der Zug fährt um neun Uhr ab.', example_en:'The train departs at nine o\'clock.', category:'travel', level:'A1' },
  { id:'v113', de:'das Flugzeug', en:'the airplane', gender:'n', plural:'die Flugzeuge', example_de:'Das Flugzeug ist sehr schnell.', example_en:'The airplane is very fast.', category:'travel', level:'A1' },
  { id:'v114', de:'das Hotel', en:'the hotel', gender:'n', plural:'die Hotels', example_de:'Ich wohne im Hotel.', example_en:'I stay in the hotel.', category:'travel', level:'A1' },
  { id:'v115', de:'die Karte', en:'the map / card', gender:'f', plural:'die Karten', example_de:'Haben Sie eine Karte von der Stadt?', example_en:'Do you have a map of the city?', category:'travel', level:'A1' },
  { id:'v116', de:'weit', en:'far', gender:null, plural:null, example_de:'Ist das Krankenhaus weit?', example_en:'Is the hospital far?', category:'travel', level:'A1' },
  { id:'v117', de:'nah', en:'near / close', gender:null, plural:null, example_de:'Der Supermarkt ist nah.', example_en:'The supermarket is close.', category:'travel', level:'A1' },

  // ── Time & Calendar ──────────────────────────────────────────────────
  { id:'v118', de:'Montag', en:'Monday', gender:null, plural:null, example_de:'Am Montag habe ich Schule.', example_en:'On Monday I have school.', category:'time', level:'A1' },
  { id:'v119', de:'Dienstag', en:'Tuesday', gender:null, plural:null, example_de:'Dienstag ist mein Lieblingstag.', example_en:'Tuesday is my favourite day.', category:'time', level:'A1' },
  { id:'v120', de:'Mittwoch', en:'Wednesday', gender:null, plural:null, example_de:'Mittwoch ist in der Mitte der Woche.', example_en:'Wednesday is in the middle of the week.', category:'time', level:'A1' },
  { id:'v121', de:'Donnerstag', en:'Thursday', gender:null, plural:null, example_de:'Am Donnerstag habe ich frei.', example_en:'On Thursday I am free.', category:'time', level:'A1' },
  { id:'v122', de:'Freitag', en:'Friday', gender:null, plural:null, example_de:'Freitag ist der letzte Schultag.', example_en:'Friday is the last school day.', category:'time', level:'A1' },
  { id:'v123', de:'Samstag', en:'Saturday', gender:null, plural:null, example_de:'Am Samstag schlafe ich lange.', example_en:'On Saturday I sleep in.', category:'time', level:'A1' },
  { id:'v124', de:'Sonntag', en:'Sunday', gender:null, plural:null, example_de:'Sonntag ist ein Ruhetag.', example_en:'Sunday is a day of rest.', category:'time', level:'A1' },
  { id:'v125', de:'heute', en:'today', gender:null, plural:null, example_de:'Heute ist das Wetter schön.', example_en:'Today the weather is nice.', category:'time', level:'A1' },
  { id:'v126', de:'morgen', en:'tomorrow', gender:null, plural:null, example_de:'Morgen fahre ich nach Berlin.', example_en:'Tomorrow I am going to Berlin.', category:'time', level:'A1' },
  { id:'v127', de:'gestern', en:'yesterday', gender:null, plural:null, example_de:'Gestern war ich krank.', example_en:'Yesterday I was sick.', category:'time', level:'A1' },
  { id:'v128', de:'die Stunde', en:'the hour', gender:'f', plural:'die Stunden', example_de:'Die Fahrt dauert eine Stunde.', example_en:'The trip takes one hour.', category:'time', level:'A1' },
  { id:'v129', de:'die Minute', en:'the minute', gender:'f', plural:'die Minuten', example_de:'Ich komme in zehn Minuten.', example_en:'I\'ll be there in ten minutes.', category:'time', level:'A1' },
  { id:'v130', de:'die Woche', en:'the week', gender:'f', plural:'die Wochen', example_de:'Diese Woche bin ich sehr beschäftigt.', example_en:'This week I am very busy.', category:'time', level:'A1' },
  { id:'v131', de:'das Jahr', en:'the year', gender:'n', plural:'die Jahre', example_de:'Dieses Jahr lerne ich Deutsch.', example_en:'This year I am learning German.', category:'time', level:'A1' },
  { id:'v132', de:'der Monat', en:'the month', gender:'m', plural:'die Monate', example_de:'Ich lerne seit einem Monat Deutsch.', example_en:'I have been learning German for a month.', category:'time', level:'A1' },

  // ── Common Verbs ──────────────────────────────────────────────────────
  { id:'v133', de:'sein', en:'to be', gender:null, plural:null, example_de:'Ich bin Student.', example_en:'I am a student.', category:'verbs', level:'A1' },
  { id:'v134', de:'haben', en:'to have', gender:null, plural:null, example_de:'Ich habe einen Hund.', example_en:'I have a dog.', category:'verbs', level:'A1' },
  { id:'v135', de:'gehen', en:'to go', gender:null, plural:null, example_de:'Ich gehe zur Schule.', example_en:'I go to school.', category:'verbs', level:'A1' },
  { id:'v136', de:'kommen', en:'to come', gender:null, plural:null, example_de:'Woher kommen Sie?', example_en:'Where do you come from?', category:'verbs', level:'A1' },
  { id:'v137', de:'machen', en:'to make / do', gender:null, plural:null, example_de:'Was machst du heute?', example_en:'What are you doing today?', category:'verbs', level:'A1' },
  { id:'v138', de:'essen', en:'to eat', gender:null, plural:null, example_de:'Ich esse gern Pizza.', example_en:'I like to eat pizza.', category:'verbs', level:'A1' },
  { id:'v139', de:'trinken', en:'to drink', gender:null, plural:null, example_de:'Er trinkt Wasser.', example_en:'He drinks water.', category:'verbs', level:'A1' },
  { id:'v140', de:'sprechen', en:'to speak', gender:null, plural:null, example_de:'Ich spreche ein bisschen Deutsch.', example_en:'I speak a little German.', category:'verbs', level:'A1' },
  { id:'v141', de:'verstehen', en:'to understand', gender:null, plural:null, example_de:'Ich verstehe Sie nicht.', example_en:'I don\'t understand you.', category:'verbs', level:'A1' },
  { id:'v142', de:'wohnen', en:'to live (reside)', gender:null, plural:null, example_de:'Ich wohne in Berlin.', example_en:'I live in Berlin.', category:'verbs', level:'A1' },
  { id:'v143', de:'arbeiten', en:'to work', gender:null, plural:null, example_de:'Mein Vater arbeitet im Büro.', example_en:'My father works in the office.', category:'verbs', level:'A1' },
  { id:'v144', de:'lernen', en:'to learn', gender:null, plural:null, example_de:'Ich lerne Deutsch.', example_en:'I am learning German.', category:'verbs', level:'A1' },
  { id:'v145', de:'schreiben', en:'to write', gender:null, plural:null, example_de:'Ich schreibe einen Brief.', example_en:'I am writing a letter.', category:'verbs', level:'A1' },
  { id:'v146', de:'lesen', en:'to read', gender:null, plural:null, example_de:'Sie liest ein Buch.', example_en:'She reads a book.', category:'verbs', level:'A1' },
  { id:'v147', de:'kaufen', en:'to buy', gender:null, plural:null, example_de:'Ich kaufe Lebensmittel.', example_en:'I am buying groceries.', category:'verbs', level:'A1' },
  { id:'v148', de:'hören', en:'to hear / listen', gender:null, plural:null, example_de:'Ich höre Musik.', example_en:'I listen to music.', category:'verbs', level:'A1' },
  { id:'v149', de:'sehen', en:'to see', gender:null, plural:null, example_de:'Ich sehe den Film nicht.', example_en:'I can\'t see the film.', category:'verbs', level:'A1' },
  { id:'v150', de:'wissen', en:'to know (a fact)', gender:null, plural:null, example_de:'Ich weiß das nicht.', example_en:'I don\'t know that.', category:'verbs', level:'A1' },
  { id:'v151', de:'brauchen', en:'to need', gender:null, plural:null, example_de:'Ich brauche Hilfe.', example_en:'I need help.', category:'verbs', level:'A1' },
  { id:'v152', de:'helfen', en:'to help', gender:null, plural:null, example_de:'Können Sie mir helfen?', example_en:'Can you help me?', category:'verbs', level:'A1' },
  { id:'v153', de:'schlafen', en:'to sleep', gender:null, plural:null, example_de:'Das Kind schläft schon.', example_en:'The child is already asleep.', category:'verbs', level:'A1' },
  { id:'v154', de:'aufstehen', en:'to get up', gender:null, plural:null, example_de:'Ich stehe um sieben Uhr auf.', example_en:'I get up at seven o\'clock.', category:'verbs', level:'A1' },
  { id:'v155', de:'fahren', en:'to drive / travel', gender:null, plural:null, example_de:'Wir fahren mit dem Zug.', example_en:'We travel by train.', category:'verbs', level:'A1' },
];

// Category metadata
const VOCAB_CATEGORIES = [
  { id:'greetings', name:'Greetings & Basics', icon:'👋', color:'var(--grad-blue)' },
  { id:'numbers',   name:'Numbers',            icon:'🔢', color:'var(--grad-purple)' },
  { id:'colors',    name:'Colors',             icon:'🎨', color:'var(--grad-red)' },
  { id:'family',    name:'Family',             icon:'👨‍👩‍👧', color:'var(--grad-gold)' },
  { id:'food',      name:'Food & Drink',       icon:'🍎', color:'var(--grad-green)' },
  { id:'animals',   name:'Animals',            icon:'🐾', color:'var(--grad-blue)' },
  { id:'body',      name:'Body Parts',         icon:'💪', color:'var(--grad-red)' },
  { id:'clothing',  name:'Clothing',           icon:'👕', color:'var(--grad-purple)' },
  { id:'home',      name:'Around the House',  icon:'🏠', color:'var(--grad-gold)' },
  { id:'travel',    name:'Travel & Directions',icon:'✈️', color:'var(--grad-blue)' },
  { id:'time',      name:'Time & Calendar',   icon:'📅', color:'var(--grad-purple)' },
  { id:'verbs',     name:'Common Verbs',       icon:'⚡', color:'var(--grad-green)' },
];

// Helper: get words by category
function getWordsByCategory(categoryId) {
  return VOCABULARY.filter(w => w.category === categoryId);
}

// Helper: get random words (for MCQ distractors)
function getRandomWords(exclude, count = 3) {
  const pool = VOCABULARY.filter(w => !exclude.includes(w.id));
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper: get word by id
function getWordById(id) {
  return VOCABULARY.find(w => w.id === id);
}
