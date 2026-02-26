## You can visit my website on https://secure-novel.vercel.app/

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

# Secure Novel Reader Project

## Overview
This project implements a secure system for storing and displaying novel content while protecting it from unauthorized access and copying. Below is an analysis of the data flow and encryption/decryption points within the codebase.

## Data Flow & Security Analysis

### 1. **Import Flow**
```
[Novel Text Files (.txt)]
         ↓
[importChapters.js]
         ↓
[Encryption Process]
    (AES-256-CBC)
    - ENCRYPTION_KEY (32 bytes)
    - ENCRYPTION_IV (16 bytes)
         ↓
[MongoDB Database]
(Stores encrypted chapters)
```

### 2. **Client Interaction Flow**
```
[Client/Browser]
    1. User navigates to chapter
    ↓
[Frontend]
    2. Makes API request
    ↓
[Server]
    3. Receives chapter request
    ↓
[MongoDB Query]
    4. Fetches chapter
    ↓
[Server Decryption] ) (This is a simplified version of Server Decryption. In real process, the server sends encrypted data to frontend, and the frontend makes an API request to the server to decrypt that data.)
    5. Decrypts content
    ↓
[Server Response]
    6. Sends decrypted content
    ↓
[Client Processing]
    7. Renders chapter
    ↓
[Security Measures]
    8. Applies protection
    ↓
[User Display]
    9. Protected readable content
```





