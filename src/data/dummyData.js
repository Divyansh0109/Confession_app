import { getIdentityFromId } from '../utils/identity';

const now = Date.now();
const h = (hours) => now - hours * 60 * 60 * 1000;
const m = (mins) => now - mins * 60 * 1000;

export const DUMMY_CONFESSIONS = [
  {
    id: '1',
    text: "I've been crushing on my professor for 2 semesters and I genuinely look forward to 8 AM lectures just to see them. I've never told anyone this.",
    tag: 'Crush',
    timestamp: h(1),
    reactions: { Love: 247, Funny: 12, Dead: 8, Shocked: 45 },
    commentCount: 34,
    authorId: 1,
  },
  {
    id: '2',
    text: "Failed my mid sem exam but told my parents I got 90%. Been lying for 3 months. The anxiety is eating me alive. I don't know how much longer I can keep this up.",
    tag: 'Secrets',
    timestamp: h(2),
    reactions: { Love: 312, Funny: 67, Dead: 189, Shocked: 201 },
    commentCount: 89,
    authorId: 2,
  },
  {
    id: '3',
    text: "My roommate cries every night thinking I'm asleep. I pretend not to hear because I don't know what to say. I wish I was braver.",
    tag: 'College',
    timestamp: h(3),
    reactions: { Love: 589, Funny: 4, Dead: 12, Shocked: 78 },
    commentCount: 112,
    authorId: 3,
  },
  {
    id: '4',
    text: "I write 'studied hard' in my diary but actually spent 6 hours rewatching the same anime. My GPA is crying.",
    tag: 'Funny',
    timestamp: h(5),
    reactions: { Love: 145, Funny: 432, Dead: 321, Shocked: 23 },
    commentCount: 55,
    authorId: 4,
  },
  {
    id: '5',
    text: "Fell in love with my best friend over the pandemic. Never said a word. Now she's with someone else and I have to watch it every day in the group chat.",
    tag: 'Love',
    timestamp: h(7),
    reactions: { Love: 831, Funny: 9, Dead: 45, Shocked: 67 },
    commentCount: 203,
    authorId: 5,
  },
  {
    id: '6',
    text: "I ghost my friends for weeks and then act shocked when they stop trying. I know exactly what I'm doing. I just don't know how to stop.",
    tag: 'Rant',
    timestamp: h(10),
    reactions: { Love: 289, Funny: 23, Dead: 134, Shocked: 178 },
    commentCount: 67,
    authorId: 6,
  },
  {
    id: '7',
    text: "My entire personality is being the 'smart, together' friend but I haven't submitted an assignment on time in 4 months.",
    tag: 'College',
    timestamp: h(14),
    reactions: { Love: 523, Funny: 387, Dead: 267, Shocked: 45 },
    commentCount: 143,
    authorId: 7,
  },
  {
    id: '8',
    text: "I have a crush on someone in my college but I panic every time I see them and pretend to get an urgent call. I've done this 11 times.",
    tag: 'Crush',
    timestamp: h(18),
    reactions: { Love: 398, Funny: 456, Dead: 89, Shocked: 34 },
    commentCount: 78,
    authorId: 8,
  },
  {
    id: '9',
    text: "Sometimes I just want someone to ask if I'm okay, not because they're expecting me to say 'fine', but because they actually want to know.",
    tag: 'Love',
    timestamp: h(24),
    reactions: { Love: 1024, Funny: 5, Dead: 8, Shocked: 12 },
    commentCount: 234,
    authorId: 9,
  },
  {
    id: '10',
    text: "I pretend to be busy so I don't have to attend club events. The truth is I desperately want friends but I have no idea how to make them.",
    tag: 'Rant',
    timestamp: h(30),
    reactions: { Love: 712, Funny: 34, Dead: 23, Shocked: 89 },
    commentCount: 156,
    authorId: 10,
  },
  {
    id: '11',
    text: "My parents spent all their savings for my education and I spend most of my time doing absolutely nothing. The guilt is suffocating.",
    tag: 'Secrets',
    timestamp: h(36),
    reactions: { Love: 445, Funny: 8, Dead: 234, Shocked: 312 },
    commentCount: 98,
    authorId: 11,
  },
  {
    id: '12',
    text: "I stayed up until 5 AM helping my classmate with their assignment while mine is completely empty. I have a problem saying no.",
    tag: 'College',
    timestamp: h(42),
    reactions: { Love: 367, Funny: 123, Dead: 89, Shocked: 56 },
    commentCount: 72,
    authorId: 12,
  },
  {
    id: '13',
    text: "I have a groupchat with my besties where we pretend to be 'on our grind'. We all secretly know none of us have opened a textbook this week.",
    tag: 'Funny',
    timestamp: h(48),
    reactions: { Love: 287, Funny: 634, Dead: 445, Shocked: 67 },
    commentCount: 134,
    authorId: 13,
  },
  {
    id: '14',
    text: "Overheard two people talking about how annoying I am. I went home and cried for 3 hours. Now I act louder around them on purpose.",
    tag: 'Rant',
    timestamp: h(54),
    reactions: { Love: 478, Funny: 45, Dead: 67, Shocked: 234 },
    commentCount: 89,
    authorId: 14,
  },
  {
    id: '15',
    text: "There's someone in my batch who smiles at me every morning. That small smile is genuinely the best part of my entire day.",
    tag: 'Crush',
    timestamp: m(45),
    reactions: { Love: 931, Funny: 23, Dead: 5, Shocked: 12 },
    commentCount: 187,
    authorId: 15,
  },
  {
    id: '16',
    text: "I've applied to 47 internships. Got rejected from 46. I told everyone I'm 'still deciding'. I'm dying inside.",
    tag: 'College',
    timestamp: m(30),
    reactions: { Love: 756, Funny: 78, Dead: 234, Shocked: 345 },
    commentCount: 211,
    authorId: 16,
  },
  {
    id: '17',
    text: "I never actually read the textbook chapters. I just read Reddit summaries and YouTube comments before exams. 8.7 CGPA so far.",
    tag: 'Funny',
    timestamp: m(20),
    reactions: { Love: 234, Funny: 789, Dead: 456, Shocked: 123 },
    commentCount: 167,
    authorId: 17,
  },
  {
    id: '18',
    text: "I borrowed money from a friend 6 months ago and pretend to forget every time we meet. I just don't have it and I'm too ashamed to say so.",
    tag: 'Secrets',
    timestamp: m(10),
    reactions: { Love: 345, Funny: 56, Dead: 123, Shocked: 456 },
    commentCount: 98,
    authorId: 18,
  },
  {
    id: '19',
    text: "I've been in the same 'talking' stage with someone for 8 months. Neither of us says what we actually feel. I think we're both cowards.",
    tag: 'Love',
    timestamp: m(5),
    reactions: { Love: 678, Funny: 234, Dead: 45, Shocked: 89 },
    commentCount: 145,
    authorId: 19,
  },
  {
    id: '20',
    text: "I've cried in the college bathroom 3 times this semester. It's somehow become a comfort zone. The tiles are very therapeutic.",
    tag: 'Rant',
    timestamp: m(2),
    reactions: { Love: 523, Funny: 345, Dead: 78, Shocked: 34 },
    commentCount: 76,
    authorId: 20,
  },
];

const commentNames = [
  'Wandering Rain', 'Burning Star', 'Silent Echo', 'Phantom River',
  'Lost Dream', 'Restless Moon', 'Hidden Flame', 'Drifting Soul',
];

export const DUMMY_COMMENTS = {
  '1': [
    { id: 'c1', authorName: commentNames[0], text: "Same... I literally dress nicely on lecture days now 😭", timestamp: h(0.5) },
    { id: 'c2', authorName: commentNames[1], text: "This is so painfully relatable. Sending strength 💜", timestamp: h(0.8) },
    { id: 'c3', authorName: commentNames[2], text: "Have you ever made eye contact for too long and then wanted to leave the planet?", timestamp: h(1) },
  ],
  '2': [
    { id: 'c4', authorName: commentNames[3], text: "The anxiety of maintaining a lie is worse than the original mistake 😭", timestamp: h(1.5) },
    { id: 'c5', authorName: commentNames[4], text: "You're not alone. More people do this than you think.", timestamp: h(2) },
    { id: 'c6', authorName: commentNames[5], text: "bro just tell them... they'll understand eventually 😭", timestamp: h(2.5) },
  ],
  '3': [
    { id: 'c7', authorName: commentNames[6], text: "Sometimes just sitting there and being present IS the right thing to do 🥺", timestamp: h(2) },
    { id: 'c8', authorName: commentNames[7], text: "You sound like a really good person. Knowing is enough sometimes.", timestamp: h(3) },
  ],
  '5': [
    { id: 'c9', authorName: commentNames[0], text: "Reading this felt like looking in a mirror. Exact. Same. Thing. 💔", timestamp: h(5) },
    { id: 'c10', authorName: commentNames[1], text: "bro the group chat kills differently", timestamp: h(6) },
    { id: 'c11', authorName: commentNames[2], text: "Say something. Even if it's too late, your heart will feel lighter.", timestamp: h(7) },
  ],
  '9': [
    { id: 'c12', authorName: commentNames[3], text: "Are you okay?", timestamp: h(20) },
    { id: 'c13', authorName: commentNames[4], text: "Genuinely asking — are you doing alright? 💜", timestamp: h(21) },
    { id: 'c14', authorName: commentNames[5], text: "I see you. You're not invisible. 🌙", timestamp: h(22) },
  ],
};

// Helper to get total reactions for sorting
export const getTotalReactions = (confession) =>
  Object.values(confession.reactions).reduce((a, b) => a + b, 0);

// Add author names to all confessions
export const CONFESSIONS_WITH_AUTHORS = DUMMY_CONFESSIONS.map((c) => ({
  ...c,
  authorName: getIdentityFromId(c.authorId),
}));
