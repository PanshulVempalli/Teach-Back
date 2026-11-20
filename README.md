# Professor Reverse

A study app where you teach the AI. Paste your notes, explain a concept to Sam (a confused student), and Sam asks questions exactly where your explanation was vague or wrong. Afterwards you get a gap report and a quiz built from your own mistakes.

Teaching exposes gaps that rereading hides. This is the Feynman technique with a partner that checks your answer against the source.

## Features

- **Notes in**: paste text or upload a PDF, TXT or Markdown file. PDFs are parsed in the browser with pdf.js.
- **Teach Mode**: you explain, Sam responds. Every third turn Sam repeats back a subtly wrong version and asks if that's right. You have to catch it.
- **Gap Report**: each key concept is marked solid, shaky or skipped, with animated bars.
- **Misconception Quiz**: wrong options are the misconceptions your own wording implied, not random distractors.
- **Sam's face** changes between confused, curious and enlightened. Small sound cues play on send, on Sam's "aha" and on quiz answers. A mute button sits top right, and `prefers-reduced-motion` is respected.

## How the AI is used

Google Gemini (`gemini-2.5-flash`, free tier) does four jobs:

1. Extracts 5 to 8 key concepts from your notes. These are the answer key.
2. **Grades** each of your messages against the concepts (JSON: solid or shaky, what was wrong, the misconception implied).
3. **Writes Sam's reply**, aimed at the biggest gap found in step 2. Grading and replying are two separate calls, which is why Sam's confusion lands where it should.
4. Writes the quiz, using the recorded misconceptions as distractors.

The browser never sees the API key. It calls `/api/gemini`, a small serverless function that adds the key server-side.

## Run it

```bash
npm install
cp .env.example .env     # set GEMINI_API_KEY (free at aistudio.google.com)
npm run dev
```

## Deploy

On Vercel, import the repo and set `GEMINI_API_KEY` in the project's environment variables. `api/gemini.js` deploys as the serverless function. Never commit `.env`.

## Tech

React, Vite, Tailwind v4, GSAP (ScrollTrigger, `useGSAP`), pdf.js, Web Audio API, Gemini API.

## Known limits

- Notes are truncated at about 24,000 characters. Long PDFs lose their tail.
- Nothing is saved between sessions.
- The Gemini model name should be checked against the current API if calls fail.

## Built with AI assistance

I built this with Claude Code. Claude wrote most of the first implementation from my spec; I directed the design, the two-step grading idea and the scope. Gemini powers the app itself, as described above.
