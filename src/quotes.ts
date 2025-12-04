// Inspirational quotes for mindfulness and digital wellbeing
export const QUOTES = [
  {
    text: "Attention is your most valuable currency.",
    author: "Unscroll mantra"
  },
  {
    text: "The quality of your attention determines the quality of your life.",
    author: "Cal Newport"
  },
  {
    text: "In an age of constant distraction, the ability to focus is a superpower.",
    author: "Nir Eyal"
  },
  {
    text: "You are not a machine. Rest, reflect, reconnect.",
    author: "Tristan Harris"
  },
  {
    text: "Every time you check your phone, ask: Is this what I want to be doing right now?",
    author: "Catherine Price"
  },
  {
    text: "The scroll is infinite. Your time is not.",
    author: "Digital Minimalism"
  },
  {
    text: "Reclaiming your attention is reclaiming your life.",
    author: "Jenny Odell"
  },
  {
    text: "What you pay attention to grows.",
    author: "Mindful Tech"
  },
  {
    text: "Presence is the greatest present.",
    author: "Zen Proverb"
  },
  {
    text: "The algorithm knows what you want. Do you?",
    author: "Center for Hum Tech"
  }
];

export const getRandomQuote = () => {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
};
