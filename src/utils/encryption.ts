/**
 * Utility for encrypting and decrypting content
 */

// This is a mock of the server-side encryption
// In a real app, we'd use the Web Crypto API with similar parameters as the server
const DISPLAY_KEY = "secure-novel-reader-display";

/**
 * Simple XOR encryption/decryption (client-side only, for demonstration)
 * @param text Text to encrypt or decrypt
 * @returns Encrypted or decrypted text
 */
export const xorEncryptDecrypt = (text: string): string => {
  if (!text) return "";
  
  let result = "";
  for (let i = 0; i < text.length; i++) {
    // XOR operation with key character
    const charCode = text.charCodeAt(i) ^ DISPLAY_KEY.charCodeAt(i % DISPLAY_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};

/**
 * Base64 encode a string
 * @param text Text to encode
 * @returns Base64 encoded string
 */
export const base64Encode = (text: string): string => {
  try {
    return btoa(encodeURIComponent(text));
  } catch (e) {
    console.error("Encoding error:", e);
    return "";
  }
};

/**
 * Base64 decode a string
 * @param encoded Base64 encoded string
 * @returns Decoded string
 */
export const base64Decode = (encoded: string): string => {
  try {
    return decodeURIComponent(atob(encoded));
  } catch (e) {
    console.error("Decoding error:", e);
    return "";
  }
};

/**
 * Encrypt text for transmission
 * @param text Plain text
 * @returns Encrypted text (Base64 + XOR)
 */
export const encryptText = (text: string): string => {
  return base64Encode(xorEncryptDecrypt(text));
};

/**
 * Decrypt text from transmission
 * @param encrypted Encrypted text (Base64 + XOR)
 * @returns Plain text
 */
export const decryptText = (encrypted: string): string => {
  return xorEncryptDecrypt(base64Decode(encrypted));
};

/**
 * Obfuscate text for display (to prevent easy copy/paste)
 * @param text Text to obfuscate
 * @returns Obfuscated text safe for rendering
 */
export const obfuscateForDisplay = (text: string): string => {
  // Split into paragraphs first
  return text.split('\n').map(paragraph => {
    // For each paragraph, wrap words while preserving spaces
    return `<p>${paragraph.split(/(\s+)/).map((part, index) => {
      // If it's a space sequence, preserve it exactly
      if (part.match(/^\s+$/)) {
        return part;
      }
      // Otherwise wrap the text in spans
      return `<span data-char="${index}" class="novel-char">${part}</span>`;
    }).join('')}</p>`;
  }).join('\n');
};

/**
 * Generate CSS for obfuscated text
 * Used to add to page head to make inspection more difficult
 */
export const generateObfuscationCSS = (): string => {
  return `
    .novel-content {
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: keep-all;
    }
    
    .novel-content p {
      margin-bottom: 1.5em;
      line-height: 1.8;
    }
    
    .novel-char {
      display: inline;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      position: relative;
    }
    
    .novel-content p:last-child {
      margin-bottom: 0;
    }
  `;
};
