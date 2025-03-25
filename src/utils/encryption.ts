const DISPLAY_KEY = "secure-novel-reader-display";


export const xorEncryptDecrypt = (text: string): string => {
  if (!text) return "";
  
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ DISPLAY_KEY.charCodeAt(i % DISPLAY_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};


export const base64Encode = (text: string): string => {
  try {
    return btoa(encodeURIComponent(text));
  } catch (e) {
    console.error("Encoding error:", e);
    return "";
  }
};


export const base64Decode = (encoded: string): string => {
  try {
    return decodeURIComponent(atob(encoded));
  } catch (e) {
    console.error("Decoding error:", e);
    return "";
  }
};


export const encryptText = (text: string): string => {
  return base64Encode(xorEncryptDecrypt(text));
};


export const decryptText = (encrypted: string): string => {
  return xorEncryptDecrypt(base64Decode(encrypted));
};


export const obfuscateForDisplay = (text: string): string => {
  return text.split('\n').map(paragraph => {
    return `<p>${paragraph.split(/(\s+)/).map((part, index) => {
      if (part.match(/^\s+$/)) {
        return part;
      }
      return `<span data-char="${index}" class="novel-char">${part}</span>`;
    }).join('')}</p>`;
  }).join('\n');
};

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
