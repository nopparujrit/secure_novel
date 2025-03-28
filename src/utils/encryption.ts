import CryptoJS from 'crypto-js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

export const decryptContent = async (encryptedHex: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/decrypt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ encryptedContent: encryptedHex }),
    });

    if (!response.ok) {
      throw new Error('Decryption failed');
    }

    const { decryptedContent } = await response.json();
    return decryptedContent;
  } catch (e) {
    console.error("Decryption error:", e);
    return "";
  }
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
