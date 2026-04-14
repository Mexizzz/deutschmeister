/* phrases.js — Common German phrases by situation */
'use strict';

const PHRASES = [
  // ── At a Restaurant ─────────────────────────────────────────────────────
  { id:'p001', category:'restaurant', de:'Einen Tisch für zwei, bitte.', en:'A table for two, please.', level:'A1' },
  { id:'p002', category:'restaurant', de:'Die Speisekarte, bitte.', en:'The menu, please.', level:'A1' },
  { id:'p003', category:'restaurant', de:'Ich hätte gerne...', en:'I would like...', level:'A1' },
  { id:'p004', category:'restaurant', de:'Was empfehlen Sie?', en:'What do you recommend?', level:'A1' },
  { id:'p005', category:'restaurant', de:'Die Rechnung, bitte.', en:'The bill, please.', level:'A1' },
  { id:'p006', category:'restaurant', de:'Das Essen war sehr lecker!', en:'The food was very delicious!', level:'A1' },
  { id:'p007', category:'restaurant', de:'Ich bin Vegetarier.', en:'I am a vegetarian.', level:'A1' },
  { id:'p008', category:'restaurant', de:'Ohne Zucker, bitte.', en:'Without sugar, please.', level:'A1' },

  // ── Shopping ────────────────────────────────────────────────────────────
  { id:'p009', category:'shopping', de:'Wie viel kostet das?', en:'How much does that cost?', level:'A1' },
  { id:'p010', category:'shopping', de:'Das ist zu teuer.', en:'That is too expensive.', level:'A1' },
  { id:'p011', category:'shopping', de:'Haben Sie das in Größe M?', en:'Do you have that in size M?', level:'A1' },
  { id:'p012', category:'shopping', de:'Ich nehme das.', en:'I\'ll take that.', level:'A1' },
  { id:'p013', category:'shopping', de:'Kann ich mit Karte bezahlen?', en:'Can I pay by card?', level:'A1' },
  { id:'p014', category:'shopping', de:'Wo finde ich...?', en:'Where can I find...?', level:'A1' },

  // ── Directions ──────────────────────────────────────────────────────────
  { id:'p015', category:'directions', de:'Wo ist der Bahnhof?', en:'Where is the train station?', level:'A1' },
  { id:'p016', category:'directions', de:'Wie komme ich zum Hotel?', en:'How do I get to the hotel?', level:'A1' },
  { id:'p017', category:'directions', de:'Biegen Sie links/rechts ab.', en:'Turn left / right.', level:'A1' },
  { id:'p018', category:'directions', de:'Gehen Sie geradeaus.', en:'Go straight ahead.', level:'A1' },
  { id:'p019', category:'directions', de:'Es ist ca. 10 Minuten zu Fuß.', en:'It\'s about 10 minutes on foot.', level:'A1' },
  { id:'p020', category:'directions', de:'Ich habe mich verlaufen.', en:'I am lost.', level:'A1' },

  // ── Introductions ────────────────────────────────────────────────────────
  { id:'p021', category:'introductions', de:'Ich heiße...', en:'My name is...', level:'A1' },
  { id:'p022', category:'introductions', de:'Ich komme aus...', en:'I come from...', level:'A1' },
  { id:'p023', category:'introductions', de:'Ich wohne in...', en:'I live in...', level:'A1' },
  { id:'p024', category:'introductions', de:'Ich bin ... Jahre alt.', en:'I am ... years old.', level:'A1' },
  { id:'p025', category:'introductions', de:'Ich lerne Deutsch seit ... Monaten.', en:'I have been learning German for ... months.', level:'A1' },
  { id:'p026', category:'introductions', de:'Es freut mich, Sie kennenzulernen.', en:'Pleased to meet you.', level:'A1' },
  { id:'p027', category:'introductions', de:'Was machen Sie beruflich?', en:'What do you do for work?', level:'A2' },

  // ── Health & Emergencies ─────────────────────────────────────────────────
  { id:'p028', category:'health', de:'Ich brauche einen Arzt.', en:'I need a doctor.', level:'A1' },
  { id:'p029', category:'health', de:'Mir geht es nicht gut.', en:'I don\'t feel well.', level:'A1' },
  { id:'p030', category:'health', de:'Ich habe Kopfschmerzen.', en:'I have a headache.', level:'A1' },
  { id:'p031', category:'health', de:'Rufen Sie bitte die Polizei!', en:'Please call the police!', level:'A1' },
  { id:'p032', category:'health', de:'Wo ist die nächste Apotheke?', en:'Where is the nearest pharmacy?', level:'A1' },

  // ── At the Hotel ─────────────────────────────────────────────────────────
  { id:'p033', category:'hotel', de:'Ich habe eine Reservierung.', en:'I have a reservation.', level:'A1' },
  { id:'p034', category:'hotel', de:'Haben Sie ein Zimmer frei?', en:'Do you have a room available?', level:'A1' },
  { id:'p035', category:'hotel', de:'Um wie viel Uhr ist Check-out?', en:'What time is check-out?', level:'A1' },
  { id:'p036', category:'hotel', de:'Das Zimmer gefällt mir sehr.', en:'I really like the room.', level:'A1' },
];

const PHRASE_CATEGORIES = [
  { id:'restaurant',    name:'At the Restaurant', icon:'🍽️' },
  { id:'shopping',      name:'Shopping',          icon:'🛍️' },
  { id:'directions',    name:'Asking Directions', icon:'🗺️' },
  { id:'introductions', name:'Introductions',     icon:'🤝' },
  { id:'health',        name:'Health & Emergency',icon:'🏥' },
  { id:'hotel',         name:'At the Hotel',      icon:'🏨' },
];

function getPhrasesByCategory(categoryId) {
  return PHRASES.filter(p => p.category === categoryId);
}
