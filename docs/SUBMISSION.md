# Submission drafts

Fill in the bracketed parts after you've run the app yourself. Nothing below has been tested against the live Gemini API.

## Title
Professor Reverse

## Tagline
You teach the AI. It finds what you don't know.

## Description (Devpost)
Every AI study tool explains things to you. You read the answer, feel like you understood it, and find out otherwise in the exam.

Professor Reverse flips it. You paste your notes, then explain a concept to Sam, a student who has never seen the topic. Behind the scenes, each of your explanations is graded against your notes. Sam then asks about the biggest hole: "wait, why does that happen?" Every third turn he repeats back a slightly wrong version of what you said, and you have to catch it.

When you finish, the Gap Report shows which concepts you explained solidly, shakily, or skipped. The quiz that follows uses wrong answers taken from your own shaky explanations, so the distractors are the exact mistakes you were about to make.

**How it works:** Gemini does two separate jobs per turn. First it grades your message against the source concepts and returns JSON. Then it writes Sam's reply aimed at the top gap. Keeping those apart is what makes Sam's confusion feel precise. A serverless proxy keeps the API key out of the browser.

**Built with:** React, Vite, Tailwind, GSAP, pdf.js, Web Audio, Gemini.

## What I learned
[Write 3 or 4 sentences in your own words. Candidates: splitting grading from replying; making Sam's replies short enough to feel like a student; handling free-tier rate limits; how much the GSAP face changed the feel.]

## AI tools used
Claude Code wrote most of the first implementation from my written spec. Gemini powers the grading, Sam, and the quiz inside the app.

## 2-minute video script
| Time | Show | Say |
|---|---|---|
| 0:00 to 0:10 | Landing page, the scroll flip | "Every AI app explains things to you. This one makes you do the explaining." |
| 0:10 to 0:25 | Paste notes, Sam appears | "I paste my biology notes. Sam has never heard of any of it." |
| 0:25 to 1:10 | Teach mode. Explain something vaguely on purpose, then let Sam catch it. Then let Sam repeat back a wrong version and catch that | "I'll be vague about this on purpose. Watch where he gets confused." |
| 1:10 to 1:40 | Gap Report, then two quiz questions | "Solid, shaky, skipped. The quiz wrong answers are my own misconceptions." |
| 1:40 to 2:00 | Code or architecture slide | "Two calls per turn: grade, then reply. Key stays server-side. Built with Claude Code, powered by Gemini." |

Record the Sam-catches-a-gap moment at least three times. It depends on what the model says that take.

## Checklist
- [ ] Run it with a real key and teach one full session
- [ ] Deploy and test the live URL
- [ ] Public repo, `git log -p | grep -i key` returns nothing
- [ ] Video, screenshots, this text
- [ ] Submit Thursday afternoon, not at 9:55pm
