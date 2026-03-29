const ADJECTIVES = [
  'Silent', 'Lost', 'Hidden', 'Phantom', 'Midnight', 'Broken', 'Lonely',
  'Wandering', 'Secret', 'Fading', 'Restless', 'Sleepless', 'Forgotten',
  'Drifting', 'Shattered', 'Burning', 'Hollow', 'Trembling', 'Fearless', 'Cursed',
];

const NOUNS = [
  'Wolf', 'Soul', 'Star', 'Echo', 'Storm', 'Moon', 'Shadow', 'Flame',
  'Dream', 'Ghost', 'Heart', 'Petal', 'River', 'Sky', 'Whisper',
  'Angel', 'Hunter', 'Rain', 'Spark', 'Tide',
];

// Generate a random identity pairing
export const getRandomIdentity = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
};

// Get deterministic identity from an id (consistent per post author)
export const getIdentityFromId = (id) => {
  const numericId = typeof id === 'string'
    ? id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : id;
  const adj = ADJECTIVES[numericId % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(numericId / ADJECTIVES.length) % NOUNS.length];
  return `${adj} ${noun}`;
};
