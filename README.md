# 🌌 Subjective Test AI (Study Buddy)

A premium, university-standard **AI-powered subjective exam portal** built with a dark cyberpunk aesthetic. It allows students to generate customized test papers on any topic, write their answers in a distraction-free environment, get real-time AI guidance/hints, and receive evaluations compared against top standards.

🚀 **Designed for Vercel deployment** with native Gemini 1.5 Flash AI integration and instant offline fallbacks.

---

## ✨ Features

- **🧠 Smart AI Test Builder**: Configure exams dynamically by topic, count (2–10+ questions), difficulty (Easy, Medium, Hard), and exam type (Strict, Open Book, Guided).
- **✍️ distraction-free Exam Portal**: A beautiful screen splitting question navigation on the left and a clean **Cyberpunk Editor Core** on the right.
- **⚡ Real-time AI Hints**: Request conceptual clues for any question, powered by Gemini 1.5 Flash.
- **💾 Offline-First Auto-Save**: Automatic draft saving to localStorage with a live `Draft Synced Offline` status and character/word counter.
- **🏆 AI Grading & Feedback**: Standardized marking, keyword highlighting, topper answer matching, and actionable improvement feedback (via Gemini integration).
- **🎮 Responsive Cyberpunk UI**: Fully custom glassmorphic panels, neon state indicators, micro-animations, and smooth transitions built using Tailwind CSS v4 and Framer Motion.

---

## 🛠️ Tech Stack

- **Core**: Next.js 16 (App Router, Turbopack) & React 19
- **Styling**: Tailwind CSS v4 (with PostCSS)
- **Animations**: Framer Motion
- **Interactions**: Lucide React Icons & Canvas Confetti (for test completions)
- **AI Engine**: Gemini 1.5 Flash (direct client-side API Integration with simulator fallbacks)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
Ensure you have **Node.js 18.x or 20.x** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your **Google Gemini API Key**:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: If no API key is specified, the application automatically launches in **Simulator Mode** using pre-configured mock questions and evaluation loops.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Deploy on Vercel

The easiest way to deploy this project is to connect your GitHub repository directly to Vercel:

1. Go to [Vercel](https://vercel.com/new).
2. Import the `subjective-test-ai` repository.
3. In the **Environment Variables** section, configure the following key:
   - `NEXT_PUBLIC_GEMINI_API_KEY` (Value: Your Gemini API Key from [Google AI Studio](https://aistudio.google.com/))
4. Click **Deploy**. Vercel will automatically build and publish your Next.js application.

---

## 📂 Project Structure

```
├── public/                 # Static assets (logos, icons)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── generator/      # Test builder screen
│   │   ├── exam/           # Exam workspace (interactive editor, AI hints)
│   │   ├── history/        # Previous evaluations log
│   │   └── results/        # Exam scorecard and feedback
│   ├── components/         # Reusable UI cards, forms, and alerts
│   ├── context/            # Local/Global state providers
│   └── lib/                # API helpers (Gemini API connector & offline mocks)
└── package.json            # Scripts & project dependencies
```
