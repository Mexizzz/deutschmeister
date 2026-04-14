/* srs.js — Spaced Repetition System (SM-2 simplified) */
'use strict';

const SRS = (() => {
  // card shape: { wordId, interval, easeFactor, nextReview, reviewCount, lastResult }
  const DEFAULT_EASE = 2.5;
  const MIN_EASE     = 1.3;
  const INTERVALS    = [1, 3]; // days for first two reviews

  function getCards() { return Storage.getSRSCards(); }
  function saveCards(cards) { Storage.setSRSCards(cards); }

  // Add words to the SRS deck (called when a vocabulary lesson is completed)
  function addWords(wordIds) {
    const cards = getCards();
    const now   = Date.now();
    wordIds.forEach(id => {
      if (!cards[id]) {
        cards[id] = {
          wordId:      id,
          interval:    1,
          easeFactor:  DEFAULT_EASE,
          nextReview:  now,
          reviewCount: 0,
          lastResult:  null,
        };
      }
    });
    saveCards(cards);
  }

  // Get words due for review (nextReview <= now)
  function getDueCards(limit = 20) {
    const cards = getCards();
    const now   = Date.now();
    return Object.values(cards)
      .filter(c => c.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview)
      .slice(0, limit);
  }

  // Record a review result
  // quality: 0=Again, 1=Good, 2=Easy
  function recordReview(wordId, quality) {
    const cards = getCards();
    const card  = cards[wordId];
    if (!card) return;

    const now = Date.now();
    card.reviewCount++;
    card.lastResult = quality;

    if (quality === 0) {
      // Again — reset
      card.interval   = 1;
      card.easeFactor = Math.max(MIN_EASE, card.easeFactor - 0.2);
    } else {
      // Good or Easy
      if (card.reviewCount <= 2) {
        card.interval = INTERVALS[card.reviewCount - 1] || card.interval;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      if (quality === 2) {
        card.easeFactor += 0.15;
        card.interval   = Math.round(card.interval * 1.3);
      } else {
        card.easeFactor = Math.max(MIN_EASE, card.easeFactor - 0.05 + 0.1 * quality);
      }
    }

    card.nextReview = now + card.interval * 24 * 60 * 60 * 1000;
    cards[wordId] = card;
    saveCards(cards);
    return card;
  }

  function getDueCount() {
    const cards = getCards();
    const now   = Date.now();
    return Object.values(cards).filter(c => c.nextReview <= now).length;
  }

  function getTotalCount() { return Object.keys(getCards()).length; }

  function getMasteredCount() {
    const cards = getCards();
    return Object.values(cards).filter(c => c.interval >= 21).length;
  }

  // Force all cards to be due (for testing)
  function resetAllDue() {
    const cards = getCards();
    const now   = Date.now();
    Object.keys(cards).forEach(id => { cards[id].nextReview = now; });
    saveCards(cards);
  }

  return { addWords, getDueCards, recordReview, getDueCount, getTotalCount, getMasteredCount, resetAllDue };
})();
