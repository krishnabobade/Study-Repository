export const BANNED_WORDS = [
  'motherfucker',
  'bullshit',
  'bastards',
  'assholes',
  'fucking',
  'bastard',
  'asshole',
  'bitch',
  'b1tch',
  'pussy',
  'whore',
  'crap',
  'fuck',
  'sh1t',
  'slut',
  'cunt',
  'dick',
  'fucc',
  'shit',
  'fuk',
  'mf'
];

const CHAR_MAP = {
  'a': '[aA@4*\\s]',
  'b': '[bB8\\s]',
  'c': '[cC(kK\\s]',
  'd': '[dD\\s]',
  'e': '[eE3*\\s]',
  'f': '[fF*phPH\\s]',
  'g': '[gG9\\s]',
  'h': '[hH\\s]',
  'i': '[iI1!|*\\s]',
  'j': '[jJ\\s]',
  'k': '[kKcC\\s]',
  'l': '[lL1|\\s]',
  'm': '[mM\\s]',
  'n': '[nN\\s]',
  'o': '[oO0*\\s]',
  'p': '[pP*\\s]',
  'q': '[qQ\\s]',
  'r': '[rR\\s]',
  's': '[sS5$*\\s]',
  't': '[tT7+\\s]',
  'u': '[uUvV*\\s]',
  'v': '[vVuU\\s]',
  'w': '[wWvvVV\\s]',
  'x': '[xX\\s]',
  'y': '[yY\\s]',
  'z': '[zZ2\\s]'
};

function compileWordRegex(word) {
  const parts = [];
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    const pattern = CHAR_MAP[char] || char;
    if (i < word.length - 1) {
      parts.push(`(?:${pattern})+[\\s\\-_*.,]*`);
    } else {
      parts.push(`(?:${pattern})+`);
    }
  }
  
  const startBoundary = /^[a-z0-9]/i.test(word[0]) ? '\\b' : '';
  const endBoundary = /[a-z0-9]$/i.test(word[word.length - 1]) ? '\\b' : '';
  
  return new RegExp(`${startBoundary}${parts.join('')}${endBoundary}`, 'gi');
}

// Precompile regexes for high performance
const compiledRegexes = BANNED_WORDS.map(compileWordRegex);

/**
 * Censers any banned/profane words within a given text string.
 * It replaces the matched word variations (including repeated characters,
 * spaces, symbol bypasses) with exactly matching length asterisks.
 * 
 * @param {string} text - The input text to censor.
 * @returns {string} The censored text.
 */
export function censorText(text) {
  if (typeof text !== 'string') return text;
  
  let censored = text;
  for (const regex of compiledRegexes) {
    censored = censored.replace(regex, (match) => {
      return '*'.repeat(match.length);
    });
  }
  return censored;
}
