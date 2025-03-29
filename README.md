The only requirement is having Node.js & npm installed

Follow these steps:

```sh
# 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# 2: Navigate to the project directory.
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

5. Start the development server:
```bash
npm run dev
```
