/* grammar.js — German grammar rules, tables, and exercises */
'use strict';

const GRAMMAR = {

  // ── Articles ────────────────────────────────────────────────────────────
  articles: {
    title: 'German Articles (der / die / das)',
    explanation: `German has THREE genders: masculine (der), feminine (die), and neuter (das).
Unlike English, you must memorize the article with each noun.
TIP: Always learn "der Tisch" not just "Tisch"!`,
    definite: {
      label: 'Definite Articles (the)',
      table: [
        ['', 'Masculine', 'Feminine', 'Neuter', 'Plural'],
        ['Nominative', 'der', 'die', 'das', 'die'],
        ['Accusative', 'den', 'die', 'das', 'die'],
        ['Dative',     'dem', 'der', 'dem', 'den'],
      ]
    },
    indefinite: {
      label: 'Indefinite Articles (a / an)',
      table: [
        ['', 'Masculine', 'Feminine', 'Neuter'],
        ['Nominative', 'ein',  'eine', 'ein'],
        ['Accusative', 'einen','eine', 'ein'],
        ['Dative',     'einem','einer','einem'],
      ]
    },
    examples: [
      { de: 'Der Mann ist groß.',   en: 'The man is tall.     (masculine)' },
      { de: 'Die Frau ist klug.',   en: 'The woman is smart.  (feminine)' },
      { de: 'Das Kind spielt.',     en: 'The child plays.     (neuter)' },
    ]
  },

  // ── Cases ────────────────────────────────────────────────────────────────
  cases: {
    nominative: {
      title: 'Nominative Case — The Subject',
      explanation: 'The nominative is used for the SUBJECT of the sentence — who or what is performing the action.',
      examples: [
        { de: 'Der Hund bellt.',      en: 'The dog barks.      (der → der, subject)' },
        { de: 'Die Katze schläft.',   en: 'The cat sleeps.     (die → die, subject)' },
        { de: 'Das Kind weint.',      en: 'The child cries.    (das → das, subject)' },
      ]
    },
    accusative: {
      title: 'Accusative Case — The Direct Object',
      explanation: 'The accusative is used for the DIRECT OBJECT — what is being acted upon. Only masculine changes: der → den.',
      examples: [
        { de: 'Ich sehe den Hund.',   en: 'I see the dog.      (der → den, object)' },
        { de: 'Ich sehe die Katze.',  en: 'I see the cat.      (die → die, no change)' },
        { de: 'Ich sehe das Kind.',   en: 'I see the child.    (das → das, no change)' },
      ]
    },
    dative: {
      title: 'Dative Case — The Indirect Object',
      explanation: 'The dative is used for the INDIRECT OBJECT (to whom / for whom). Used after: mit, von, nach, aus, bei, seit, von, zu, gegenüber.',
      examples: [
        { de: 'Ich gebe dem Mann das Buch.',  en: 'I give the man the book.' },
        { de: 'Ich helfe der Frau.',          en: 'I help the woman.' },
        { de: 'Ich spiele mit dem Kind.',     en: 'I play with the child.' },
      ]
    }
  },

  // ── Verb Conjugation ─────────────────────────────────────────────────────
  conjugation: {
    regular: {
      title: 'Regular Verb Conjugation (Present Tense)',
      explanation: 'Regular verbs follow a pattern. Take the infinitive, remove -en, add endings.',
      pattern: 'stem + ending',
      example_verb: 'lernen (to learn) → lern-',
      table: [
        ['Person', 'Ending', 'lernen example'],
        ['ich (I)',          '-e',   'ich lerne'],
        ['du (you inf.)',    '-st',  'du lernst'],
        ['er/sie/es (he/she/it)', '-t', 'er/sie/es lernt'],
        ['wir (we)',         '-en',  'wir lernen'],
        ['ihr (you pl.)',    '-t',   'ihr lernt'],
        ['Sie/sie (you form./they)', '-en', 'Sie/sie lernen'],
      ]
    },
    sein: {
      title: 'sein (to be) — Irregular',
      table: [
        ['Person',    'sein'],
        ['ich',       'bin'],
        ['du',        'bist'],
        ['er/sie/es', 'ist'],
        ['wir',       'sind'],
        ['ihr',       'seid'],
        ['Sie/sie',   'sind'],
      ]
    },
    haben: {
      title: 'haben (to have) — Irregular',
      table: [
        ['Person',    'haben'],
        ['ich',       'habe'],
        ['du',        'hast'],
        ['er/sie/es', 'hat'],
        ['wir',       'haben'],
        ['ihr',       'habt'],
        ['Sie/sie',   'haben'],
      ]
    }
  },

  // ── Word Order ───────────────────────────────────────────────────────────
  wordOrder: {
    title: 'German Word Order',
    rules: [
      { label: 'SVO (normal)', example_de: 'Ich esse Pizza.', example_en: 'I eat pizza.', tip: 'Subject → Verb → Object' },
      { label: 'V2 Rule', example_de: 'Heute esse ich Pizza.', example_en: 'Today I eat pizza.', tip: 'Verb is ALWAYS second! When another element is first, subject and verb swap.' },
      { label: 'Question (W-word)', example_de: 'Was isst du?', example_en: 'What are you eating?', tip: 'Question word → Verb → Subject → ...' },
      { label: 'Yes/No question', example_de: 'Isst du Pizza?', example_en: 'Do you eat pizza?', tip: 'Verb comes FIRST in yes/no questions.' },
    ]
  },

  // ── Negation ─────────────────────────────────────────────────────────────
  negation: {
    title: 'Negation: nicht vs. kein',
    nicht: {
      label: 'nicht — negates verbs, adjectives, adverbs',
      examples: [
        { de: 'Ich verstehe das nicht.', en: 'I don\'t understand that.' },
        { de: 'Das Essen ist nicht gut.', en: 'The food is not good.' },
      ]
    },
    kein: {
      label: 'kein — negates nouns (replaces ein/eine)',
      examples: [
        { de: 'Ich habe kein Auto.',  en: 'I don\'t have a car.' },
        { de: 'Er hat keine Zeit.',   en: 'He has no time.' },
        { de: 'Sie hat kein Geld.',   en: 'She has no money.' },
      ]
    }
  }
};

// Grammar exercises
const GRAMMAR_EXERCISES = [
  // Articles
  { id:'g001', type:'choose_article', question:'___ Hund ist groß.', answer:'Der', options:['Der','Die','Das','Ein'], tip:'Hund (dog) is masculine → der' },
  { id:'g002', type:'choose_article', question:'___ Katze schläft.', answer:'Die', options:['Der','Die','Das','Eine'], tip:'Katze (cat) is feminine → die' },
  { id:'g003', type:'choose_article', question:'___ Kind spielt.', answer:'Das', options:['Der','Die','Das','Ein'], tip:'Kind (child) is neuter → das' },
  { id:'g004', type:'choose_article', question:'Ich sehe ___ Mann.', answer:'den', options:['der','den','dem','ein'], tip:'Accusative masculine: der → den' },
  { id:'g005', type:'fill_blank', question:'Ich habe ___ (ein) Buch.', answer:'ein', tip:'Neuter nouns use "ein" in accusative' },

  // Cases
  { id:'g006', type:'translate', question:'The woman reads the book.', answer:'Die Frau liest das Buch.', tip:'Frau=feminine, Buch=neuter accusative stays "das"' },
  { id:'g007', type:'translate', question:'I help the man.', answer:'Ich helfe dem Mann.', tip:'"helfen" takes dative: der → dem' },
  { id:'g008', type:'fill_blank', question:'Ich gebe ___ (die) Frau das Buch.', answer:'der', tip:'Dative feminine: die → der' },

  // Conjugation
  { id:'g009', type:'conjugate', question:'lernen — ich', answer:'lerne', tip:'Regular verb: lern- + e' },
  { id:'g010', type:'conjugate', question:'sein — du', answer:'bist', tip:'sein is irregular: du bist' },
  { id:'g011', type:'conjugate', question:'haben — er', answer:'hat', tip:'haben is irregular: er hat' },
  { id:'g012', type:'conjugate', question:'gehen — wir', answer:'gehen', tip:'Regular: geh- + en' },

  // Word order
  { id:'g013', type:'word_order', question:'Arrange: heute / ich / gehe / zur Schule', answer:'Heute gehe ich zur Schule.', tip:'V2 rule: verb 2nd, subject follows' },
  { id:'g014', type:'word_order', question:'Arrange: du / isst / was', answer:'Was isst du?', tip:'Question word first, then verb, then subject' },

  // Negation
  { id:'g015', type:'fill_blank', question:'Ich habe ___ Zeit. (no time)', answer:'keine', tip:'Negating a noun with article → kein/keine' },
  { id:'g016', type:'fill_blank', question:'Das Wetter ist heute ___ schön. (not)', answer:'nicht', tip:'Negating an adjective → nicht' },
];
