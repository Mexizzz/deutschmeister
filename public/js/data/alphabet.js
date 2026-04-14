/* alphabet.js — German alphabet with pronunciation guide */
'use strict';

const ALPHABET = [
  { letter:'A', ipa:'aː', sound:'like "a" in "father"', example_de:'der Apfel', example_en:'the apple', emoji:'🍎' },
  { letter:'B', ipa:'beː', sound:'like English "b"', example_de:'das Buch', example_en:'the book', emoji:'📚' },
  { letter:'C', ipa:'tseː', sound:'like "ts" or "k"', example_de:'das Café', example_en:'the café', emoji:'☕' },
  { letter:'D', ipa:'deː', sound:'like English "d"', example_de:'der Dank', example_en:'the thanks', emoji:'🙏' },
  { letter:'E', ipa:'eː', sound:'like "e" in "they"', example_de:'das Ei', example_en:'the egg', emoji:'🥚' },
  { letter:'F', ipa:'ɛf', sound:'like English "f"', example_de:'der Fisch', example_en:'the fish', emoji:'🐟' },
  { letter:'G', ipa:'ɡeː', sound:'like "g" in "go"', example_de:'das Glas', example_en:'the glass', emoji:'🥛' },
  { letter:'H', ipa:'haː', sound:'like English "h" (always sounded)', example_de:'das Haus', example_en:'the house', emoji:'🏠' },
  { letter:'I', ipa:'iː', sound:'like "ee" in "see"', example_de:'das Eis', example_en:'the ice', emoji:'🧊' },
  { letter:'J', ipa:'jɔt', sound:'like "y" in "yes"', example_de:'das Jahr', example_en:'the year', emoji:'📅' },
  { letter:'K', ipa:'kaː', sound:'like English "k"', example_de:'die Katze', example_en:'the cat', emoji:'🐱' },
  { letter:'L', ipa:'ɛl', sound:'like English "l"', example_de:'die Lampe', example_en:'the lamp', emoji:'💡' },
  { letter:'M', ipa:'ɛm', sound:'like English "m"', example_de:'die Mutter', example_en:'the mother', emoji:'👩' },
  { letter:'N', ipa:'ɛn', sound:'like English "n"', example_de:'die Nacht', example_en:'the night', emoji:'🌙' },
  { letter:'O', ipa:'oː', sound:'like "o" in "go" but shorter', example_de:'das Obst', example_en:'the fruit', emoji:'🍊' },
  { letter:'P', ipa:'peː', sound:'like English "p"', example_de:'das Papier', example_en:'the paper', emoji:'📄' },
  { letter:'Q', ipa:'kuː', sound:'"kv" sound', example_de:'die Quelle', example_en:'the source', emoji:'💧' },
  { letter:'R', ipa:'ɛʁ', sound:'guttural, from back of throat', example_de:'der Regen', example_en:'the rain', emoji:'🌧️' },
  { letter:'S', ipa:'ɛs', sound:'"z" before vowels, "s" elsewhere', example_de:'die Sonne', example_en:'the sun', emoji:'☀️' },
  { letter:'T', ipa:'teː', sound:'like English "t"', example_de:'die Tür', example_en:'the door', emoji:'🚪' },
  { letter:'U', ipa:'uː', sound:'like "oo" in "food"', example_de:'die Uhr', example_en:'the clock', emoji:'🕐' },
  { letter:'V', ipa:'faʊ', sound:'like "f" — "Vater" sounds like "Fater"', example_de:'der Vater', example_en:'the father', emoji:'👨' },
  { letter:'W', ipa:'veː', sound:'like English "v"', example_de:'das Wasser', example_en:'the water', emoji:'💧' },
  { letter:'X', ipa:'ɪks', sound:'like "ks"', example_de:'die Xylophon', example_en:'the xylophone', emoji:'🎵' },
  { letter:'Y', ipa:'ʏpsilɔn', sound:'like German "ü"', example_de:'der Yo-yo', example_en:'the yo-yo', emoji:'🪀' },
  { letter:'Z', ipa:'tsɛt', sound:'"ts" sound — "Zehn" = "tsen"', example_de:'zehn', example_en:'ten', emoji:'🔟' },
  // German special characters
  { letter:'Ä', ipa:'ɛː', sound:'like "e" in "bed" (long)', example_de:'die Äpfel', example_en:'the apples', emoji:'🍎', special:true },
  { letter:'Ö', ipa:'øː', sound:'like "u" in "burn" (round lips)', example_de:'die Öffnung', example_en:'the opening', emoji:'⭕', special:true },
  { letter:'Ü', ipa:'yː', sound:'say "ee" while rounding your lips', example_de:'die Türen', example_en:'the doors', emoji:'🚪', special:true },
  { letter:'ß', ipa:'ɛstsɛt', sound:'"ss" sound — sharp S', example_de:'die Straße', example_en:'the street', emoji:'🛣️', special:true },
];

const PRONUNCIATION_TIPS = [
  { rule:'ie', sound:'long "ee"', examples:['liebe (love)', 'Bier (beer)', 'viel (much)'] },
  { rule:'ei', sound:'"eye" sound', examples:['ein (a)', 'weit (far)', 'Stein (stone)'] },
  { rule:'eu / äu', sound:'"oy" sound', examples:['heute (today)', 'neu (new)', 'Räuber (robber)'] },
  { rule:'ch', sound:'"back of throat" after a/o/u; soft hiss after i/e', examples:['Bach (stream)', 'ich (I)', 'Bücher (books)'] },
  { rule:'sch', sound:'like English "sh"', examples:['Schule (school)', 'waschen (wash)'] },
  { rule:'sp / st', sound:'"shp" / "sht" at start of word', examples:['sprechen (speak)', 'Student (student)'] },
  { rule:'w', sound:'like English "v"', examples:['Wasser (water)', 'wir (we)'] },
  { rule:'v', sound:'like English "f" usually', examples:['Vater (father)', 'vier (four)'] },
  { rule:'z', sound:'"ts" sound', examples:['zehn (ten)', 'Zug (train)'] },
];
