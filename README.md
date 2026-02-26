# 🌐 File Upload Frontend

> A modern React + Vite frontend for streaming large files from **Google Drive to Cloudflare R2**. Features real-time upload progress tracking, file management, and a clean responsive UI built with Tailwind CSS v4.

---

## ✨ Features

- 🔗 **Paste any Google Drive link** — supports all public share URL formats
- 📊 **Real-time progress** — live progress bars via polling while uploads stream in the background
- 🗂️ **File management** — list all uploads with size, status, and timestamp; delete files with one click
- 🎨 **Modern UI** — built with Tailwind CSS v4, lucide-react icons, and smooth transitions
- 📱 **Responsive** — works across all screen sizes

---

## 🧰 Tech Stack

| Layer           | Technology      |
| --------------- | --------------- |
| Framework       | React 19        |
| Build tool      | Vite 7          |
| Language        | TypeScript 5    |
| Styling         | Tailwind CSS v4 |
| HTTP client     | Axios           |
| Icons           | lucide-react    |
| Date formatting | date-fns        |
| Package manager | pnpm            |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FileList.tsx        # File table with status, progress, delete
│   │   └── UploadForm.tsx      # Google Drive URL input + submit
│   ├── services/
│   │   └── api.ts              # Axios API client + FileRecord type
│   ├── App.tsx                 # Root component + polling logic
│   ├── index.css               # Tailwind v4 + CSS design tokens
│   └── main.tsx                # React entry point
├── public/
├── .env                        # Environment variables (not committed)
├── vite.config.ts
└── tsconfig.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3030
```

For production, set this to your deployed backend URL:

```env
VITE_API_URL=https://your-backend-domain.com
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Backend server running (see [backend README](../backend/README.md))

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

App starts at `http://localhost:5173`

### Production Build

```bash
pnpm run build      # Outputs to dist/
pnpm run preview    # Preview the production build locally
```

---

## 🔄 How It Works

1. User pastes a public Google Drive link and clicks **Upload**
2. Frontend calls `POST /files/upload` → backend responds immediately with a `PENDING` record
3. Frontend polls `GET /files` every **3 seconds** while any file is in `PENDING` or `DOWNLOADING` state
4. Progress bars update in real time as the backend streams the file to R2
5. Status changes to `COMPLETED` (or `FAILED`) when the upload finishes

### File Status States

| Status        | Meaning                            |
| ------------- | ---------------------------------- |
| `PENDING`     | Upload queued, waiting to start    |
| `DOWNLOADING` | Actively streaming from Drive → R2 |
| `COMPLETED`   | File is available in R2            |
| `FAILED`      | Upload failed (check backend logs) |

---

## 🌐 Deployment (Vercel)

The frontend deploys to Vercel with zero configuration:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository directly in the Vercel dashboard. Set the **Root Directory** to `frontend/` and add the environment variable:

```
VITE_API_URL=https://your-backend-domain.com
```

---

## 📜 Scripts

| Script             | Description                       |
| ------------------ | --------------------------------- |
| `pnpm run dev`     | Start Vite dev server with HMR    |
| `pnpm run build`   | Type-check + build for production |
| `pnpm run preview` | Preview production build locally  |
| `pnpm run lint`    | Run ESLint                        |
