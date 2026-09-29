# Threads AI Bot for Vezilka

Project for the course **Electronic and Mobile Commerce** at the Faculty of Computer Science and Engineering (FINKI), Ss. Cyril and Methodius University, Skopje. Built on the course template, provided by the teaching staff for a different social media app (this one is for Threads). The original template instructions are in [TEMPLATE.md](TEMPLATE.md).

---

## Overview

An AI Bot that navigates through **Threads** on its own, reads the public posts of a profile, hashtag or feed, recognises which of them are written in Macedonian and donates them in batches to **[Vezilka](https://doniraj.vezilka.ai)**, the open corpus for preserving the Macedonian language.

The Bot is not a scraper with hardcoded selectors. On every step it takes a snapshot of the page, sends it to Gemini together with the goal and the history of what it already did and Gemini answers with the single next action: NAVIGATE, CLICK, TYPE, SCROLL, WAIT, EXTRACT, LOGIN or FINISH. The loop repeats until the goal is reached or the step limit is hit.

---

## Features

- **Extraction sessions** - Point the Bot at a PROFILE, HASHTAG, KEYWORD or FEED_URL, start it and watch the action log fill up with what it did on every step.
- **Agentic navigation** - Gemini decides every step from a compact description of the page, so the Bot can survive layout changes.
- **Macedonian detection** - Every extracted post gets a Macedonian confidence score between 0.0 and 1.0, calculated from the **Cyrillic alphabet**, **Macedonian-only letters** and **common Macedonian words**.
- **Donation batches** - Group posts so they can be sent together, approve the batch and submit it. Only posts with a confidence of at least 0.5 can be sent to Vezilka.
- **Status polling** - A scheduled job asks Vezilka every hour what happened to the submitted batches and records the result.
- **Login persistence** - Playwright keeps the Threads cookies in a profile folder, so the Bot logs in once and stays logged in between runs.

---

## Tech Stack

| Layer               | Technology                                |
|---------------------|-------------------------------------------|
| Frontend            | React 19, TypeScript, MUI v9, Vite        |
| Backend             | Java 21, Spring Boot 3.4.3                |
| Security            | Spring Security + Stateless JWT           |
| Database            | PostgreSQL 17.4                           |
| Migrations          | Flyway                                    |
| Build Tool          | Maven                                     |
| Utilities           | Lombok, Springdoc OpenAPI                 |
| Browser Automation  | Playwright for Java 1.63.0                |
| LLM                 | Google Gemini (`gemini-3.5-flash-lite`)   |
| Donation API        | Vezilka Public Donation API v1            |
| Tests               | JUnit 5, AssertJ, Mockito, Testcontainers |

---

## The agentic loop

`AbstractSocialNetworkBot.execute(...)` is a final template method. It is the same for every social media app, and only the surrounding classes change.

```
for each step, up to bot.max-steps-per-target:

  1. Perceive   BrowserAgent.snapshot()
                PlaywrightBrowserAgent runs a script in the page and returns [ELEMENTS] (clickable items)
                and [POST] blocks (url, author, time, text, media)

  2. Decide     LlmClient.decideNextAction(snapshot, goal, history)
                GeminiLlmClient builds the prompt out of RULES + GOAL + STATE + PAGE
                and parses the JSON answer into a BotDecision

  3. Act        the action is dispatched onto the BrowserAgent, on EXTRACT the
                ContentExtractor parses the snapshot and the LanguageDetector rates every post
```

**The Bot stops:**
1. When Gemini reports the goal is reached
2. When the same action, other than SCROLL, repeats 3 times in a row
3. When Gemini doesn't answer at all
4. When the step budget is spent

Whatever was collected up to that point is saved.

---

## Architecture

### Backend (under `ai-bot-backend/src/main/java/`)

```
mk.ukim.finki.aibotbackend
│
├── bot/
│   │
│   ├── browser/       BrowserAgent, PlaywrightBrowserAgent, PageSnapshot
│   │
│   ├── core/          SocialNetworkBot, AbstractSocialNetworkBot,
│   │                  ThreadsBot, BotOrchestratorImpl
│   │
│   ├── extraction/    ContentExtractor, ThreadsContentExtractor,
│   │                  LanguageDetector, MacedonianLanguageDetector
│   │
│   └── llm/           LlmClient, GeminiLlmClient, BotAction, BotDecision
│
├── config/            BotProperties, AsyncConfig, JpaConfig,
│                      JwtWebSecurityConfig, OpenApiConfig
│
├── integration/
│   │
│   └── vezilka/       VezilkaClient, HttpVezilkaClient, VezilkaProperties,
│                      TextDonationRequest, DonationReceipt
│
├── jobs/              DonationStatusScheduler
│
├── listener/          SessionStartedListener
│
├── model/
│   │
│   ├── domain/        User, ExtractionSession, ExtractionTarget,
│   │                  ExtractedPost, MediaItem, DonationBatch, BotActionLog
│   │
│   ├── dto/           record DTOs with from() and to*() mapping
│   │
│   ├── enums/         SocialNetwork, SessionStatus, TargetType,
│   │                  DonationStatus, MediaType, BotActionType
│   │
│   └── exception/     VezilkaIntegrationException, BotExecutionException, ...
│
├── repository/        Spring Data JPA repositories
│
├── service/
│   │
│   ├── application/   DTO in, DTO out
│   │
│   └── domain/        entities only
│
└── web/               controllers, JWT filter, exception handlers
```

### Frontend (under `ai-bot-frontend/`)

```
src
│
├── api/               axios clients and response types
│
├── contexts/          React contexts
│
├── providers/         the context providers
│
├── hooks/             useSessions, usePosts, useDonations, useDashboard, ...
│
└── ui/
    │
    ├── components/
    │   │
    │   ├── common/    Ornament, WovenCard, SectionHeading,
    │   │              StatusBadge, StatusThread, EmptyState
    │   │
    │   ├── session/   SessionCard, StartSessionDialog, SessionLogViewer
    │   │
    │   ├── post/      PostCard, PostGrid, PostFilters
    │   │
    │   └── donation/  DonationBatchCard, SubmitDonationDialog
    │
    └── pages/         home, session, post, donation, auth
```

---

## Setup

### 1. Database

```bash
cd ai-bot-backend
docker compose up -d
```

### 2. Backend environment

Create `ai-bot-backend/.env`. It is gitignored and is never committed.

```properties
JWT_SECRET_KEY=your_long_random_string

GEMINI_API_KEY=your_gemini_key
VEZILKA_API_KEY=your_vezilka_key

THREADS_USERNAME=your_threads_username
THREADS_PASSWORD=your_threads_password
THREADS_USER_DATA_DIR=./.playwright-profile
```

| Variable                | Where it comes from                                            |
|-------------------------|----------------------------------------------------------------|
| `JWT_SECRET_KEY`        | Any long random string you generate yourself                   |
| `GEMINI_API_KEY`        | https://aistudio.google.com/apikey                             |
| `VEZILKA_API_KEY`       | Issued by the Vezilka administrator through doniraj.vezilka.ai |
| `THREADS_USERNAME`      | Username of the Threads account the Bot browses with           |
| `THREADS_PASSWORD`      | Password of the Threads account the Bot browses with           |
| `THREADS_USER_DATA_DIR` | Folder where Playwright stores the cookies                     |

### 3. Run the backend

Java 21 is required. Lombok does not work on newer JDKs.

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
./mvnw spring-boot:run
```

Backend on http://localhost:8080, Swagger UI on http://localhost:8080/swagger-ui.html

### 4. Run the frontend

```bash
cd ai-bot-frontend
npm install
npm run dev
```

Frontend on http://localhost:5173, it talks to the backend through `VITE_BASE_API_URL` from `.env.development`.

---

## How to use the Bot

1. Register at `/register` and log in at `/login`. Every session belongs to a user.
2. On `/sessions`, create a session and give it a target, for example a PROFILE with value `midkast091`.
3. Start it. The action log fills up live while the Bot works, and the Chromium window is visible because `bot.headless=false`.
4. On `/posts`, review what was collected. Each post carries a Macedonian confidence score.
5. On `/donations`, group the posts you want into a batch, approve it, then submit it to Vezilka.
6. The batch goes DRAFT, APPROVED, SUBMITTED, and the hourly job writes back ACCEPTED or REJECTED.

---

## How the Bot logs in the first time

Threads shows a login wall to anonymous visitors, so the Bot needs a real session before it can read anything.

1. `bot.headless=false` is the value in `application-dev.properties`, so the first run opens a visible Chromium window.
2. `ThreadsBot.login()` opens `https://www.threads.com` and checks whether a password field is present. If there is none, it is already logged in and returns.
3. If the wall is there, it goes to `/login`, fills the form with the values from `THREADS_USERNAME` and `THREADS_PASSWORD`, and clicks the submit button (the button label is tried in Macedonian, then English, then by `type=submit` as the default value).
4. After the click it returns to the home page up to three times (because the redirect takes a couple of seconds) to confirm the session.
5. Playwright is started with `launchPersistentContext`, so the cookies land in `THREADS_USER_DATA_DIR` (`./.playwright-profile` by default). Every later run finds the session already open and step 3 never happens.

**If the automatic login fails (ex. Because Threads asks for a verification code), run once with the window open and log in by hand. The cookies are saved the same way and the Bot continues on its own from then on.**

---

## Tested targets

All four target types were run end to end against the live site, and in every run the posts and their media were persisted.

| Target type | Example value                                             | Posts | Media | Duration |
|-------------|-----------------------------------------------------------|-------|-------|----------|
| `PROFILE`   | `midkast091`                                              | 7     | 26    | 1:02     |
| `HASHTAG`   | `македонија`                                              | 11    | 19    | 1:18     |
| `KEYWORD`   | `скопски мостови`                                         | 23    | 24    | 2:23     |
| `FEED_URL`  | `https://www.threads.com/@slobodenpecat/post/DdeWH2ECHqi` | 1     | 5     | 1:24     |

The keyword run is the heaviest one, 23 posts over 15 actions, because the search results page keeps loading more content and the Bot scrolled 11 times before it had enough. The confidence scores ranged from 1.0 on pure Macedonian text down to 0.0 on posts written entirely in English.

---

## LLM usage per session

The loop spends at most one Gemini request per step, so the cost of a session is the number of steps it takes.

| Measure                        | Typical value                                          |
|--------------------------------|--------------------------------------------------------|
| Requests per session           | 6 to 15, capped by `bot.max-steps-per-target=15`       |
| Prompt size per request        | up to about 27,000 characters, of which 25,000 is page |
| Input tokens per session       | roughly 60,000 to 150,000 (estimate, Cyrillic heavy)   |
| Output tokens per session      | under 1,500, the answer is one small JSON per step     |
| Wall clock per session         | one to two and a half minutes                          |
| Money cost                     | zero, the free tier covers it                          |

The free tier of `gemini-3.5-flash-lite` allows 15 requests per minute, 250,000 tokens per minute and 500 requests per day. At around 10 requests per session that is roughly **50 sessions per day** before the daily quota is reached.

`GeminiLlmClient` sleeps five seconds before every request. Without it, a session would fire its steps faster than 15 per minute and the API would answer with 429. The model matters too. The earlier Flash model allowed only 5 requests per minute and 20 per day, which was not enough for a single session. Flash-Lite was chosen because its quotas are counted per model, not per project.

---

## Configuration

| Property                    | Default                          | Meaning                                              |
|-----------------------------|----------------------------------|------------------------------------------------------|
| `bot.max-steps-per-target`  | `15`                             | Hard ceiling of loop iterations per target           |
| `bot.headless`              | `false`                          | Whether the Playwright browser shows a window        |
| `llm.model`                 | `gemini-3.5-flash-lite`          | Flash Lite gives 15 requests per minute on free tier |
| `llm.api-url`               | Gemini `/v1beta/interactions`    | The endpoint the prompt is posted to                 |
| `vezilka.base-url`          | `https://doniraj.vezilka.ai`     | Base URL of the donation API                         |
| `threads.user-data-dir`     | `./.playwright-profile`          | Where Playwright keeps the Threads cookies           |

---

## Vezilka integration

The donations use the **public HTTP donation API v1**, not the browser extension and not automated form submission. Requests are authenticated with an API key in the `X-Donation-Api-Key` header, which is the server to server form of identity.

| Method | Path                             | Purpose                |
|--------|----------------------------------|------------------------|
| POST   | `/api/public/v1/donations/text/` | Submit a text donation |
| GET    | `/api/public/v1/donations/{id}/` | Read back its status   |

Three details of the API that are easy to get wrong:

1. **Every request is a batch** - even a single donation must be wrapped in an `items` array.
2. **HTTP 200 does not mean the donation was accepted** - the response is 200 even when every item inside it was refused. The real verdict is in `results[0].status`, so that is the field `HttpVezilkaClient` checks, not the HTTP code.
3. **A duplicate is not an error** - when `deduped` is true the content is already in the corpus and the batch counts as done.

Before submitting, `DonationServiceImpl.submit` drops every post scoring under `0.5` and joins the rest into one paragraph. Short isolated sentences are frequently rejected as `not_macedonian`, while a longer paragraph passes the language check reliably.

Vezilka decides immediately, there is no pending queue, so `DonationStatusScheduler` mostly confirms a verdict that is already final. It still runs hourly, because the batch is marked `SUBMITTED` the moment the receipt arrives and the status is read back separately.

---

## Pages

| Page           | URL              | Description                                                                    |
|----------------|------------------|--------------------------------------------------------------------------------|
| Home           | `/`              | Hero and an overview band with the totals                                      |
| Sessions       | `/sessions`      | All extraction sessions, create and start a new one                            |
| Session detail | `/sessions/{id}` | Targets, status and the full action log of one run                             |
| Posts          | `/posts`         | Everything extracted, filtered by session or donation state plus a text search |
| Post detail    | `/posts/{id}`    | Full text, media and metadata of one post                                      |
| Donations      | `/donations`     | Batches with their path from DRAFT through to ACCEPTED                         |

---

## Tests

### To run the tests

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
./mvnw test
```

28 tests, no skips. Docker must be running in the background.

| Test                              | Covers                                                                                                                                        |
|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `ThreadsBotTest`                  | URL building for all four target types (PROFILE, HASHTAG, KEYWORD and FEED_URL)                                                               |
| `GeminiLlmClientTest`             | Parsing the model answer, the repetition guard                                                                                                |
| `ThreadsContentExtractorTest`     | `[POST]` block parsing, skipping empty blocks or duplicates that appear in one snapshot, empty snapshots that return nothing                  |
| `MacedonianLanguageDetectorTest`  | A high score on Macedonian, a low score on Serbian/Bulgarian Cyrillic, almost zero on English and null, blank or emoji only text scoring zero |
| `UserRepositoryTest`              | `findByUsername` and `existsByUsername` against a real PostgreSQL started by Testcontainers                                                   |
| `ExtractionSessionRepositoryTest` | Filtering sessions by status and by social media app and loading a session together with its targets through the entity graph                 |
| `DonationServiceIntegrationTest`  | createBatch to approve to submit, the confidence filter and polling                                                                           |
| `AiBotBackendApplicationTests`    | The Spring context starts with every bean wired, against a Testcontainers database                                                            |