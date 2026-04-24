// You can add or remove any words from this list based on your moderation rules
const badWords = [
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "pussy", 
  "bastard", "slut", "whore", "fag", "nigger", "nigga", "retard"
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Checks if any of the bad words exist as standalone words in the text
  return badWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}