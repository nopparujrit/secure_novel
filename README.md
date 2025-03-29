## You can visit my website on https://secure-novel.vercel.app/

The only requirement is having Node.js & npm installed

Follow these steps:

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
# 3: Install the necessary dependencies.
npm i

```
Create `.env.local` file in the root directory with:
```
VITE_API_BASE_URL="http://localhost:5000/api"
ENCRYPTION_KEY=your_32_byte_encryption_key
ENCRYPTION_IV=your_16_byte_iv
NORMALIZATION_METHOD=NFD
```
Start the development server:
```bash
npm run dev
```

# Secure Novel Reader Project

## Overview
This project implements a secure system for storing and displaying novel content while protecting it from unauthorized access and copying. Below is an analysis of the data flow and encryption/decryption points.

## Data Flow & Security Analysis

### 1. **Data Storage and Encryption**
- Novel chapters are stored in **MongoDB atlast** in an encrypted format.
- **AES-256-CBC** algorithm is used for encryption.
- Encryption uses:
  - A **32-byte encryption key** (`ENCRYPTION_KEY`).
  - A **16-byte initialization vector** (`ENCRYPTION_IV`).
  - Both values are stored as **environment variables** for security.

### 2. **Server-Side**
- The server (`server/index.js`) manages decryption.
- The server exposes an **API endpoint (`/api/decrypt`)** to handle decryption requests.
- When a chapter is requested:
  1. The server retrieves the **encrypted content** from MongoDB.
  2. Decrypts the content using **encryption keys**.
  3. Sends the **decrypted content** to the client.

### 3. **Client-Side**
- The frontend (`src/services/novelService.ts`) fetches chapters securely.
- When a user requests a chapter:
  1. Makes an API call to fetch the **encrypted chapter**.
  2. Uses `decryptContent` function from `utils/encryption.ts` to decrypt it.
  3. The decrypted content is displayed in the **`ProtectedContent` component**.

### 4. **Content Protection**
- The `ProtectedContent` component includes multiple security mechanisms:
  - **Content obfuscation** using `obfuscateForDisplay`.
  - **Copy protection mechanisms**.
  - **Prevention of text selection**.
  - **Blocking keyboard shortcuts for copying**.
  - **Disabling the context menu**.
  - **Blocking drag and drop actions**.

### 6. **Visual Representation of Data Flow**
```
[Text Files]
    ↓ (importChapters.js)
[Encryption] → [MongoDB]
    ↓
[Server API]
    ↓ (Encrypted Data)
[Client Request]
    ↓
[Server Decryption]
    ↓ (Decrypted Data)
[Protected Display]
```

## Conclusion
This project ensures **robust security** for novel content by implementing **AES-256 encryption**, **server-side decryption**, and **client-side protections** to prevent unauthorized access or copying. These measures create a secure and seamless reading experience for users.




