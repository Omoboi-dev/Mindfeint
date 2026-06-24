# Mindfeint architecture

A tour of how the game is put together and where 0G does the real work.

## The idea in one line

One of six answers is a real person. The other five are AI personas running on 0G, and the game can prove the AIs were genuine and that nobody rigged the result.

## Big picture

Two parts talk to each other over a small JSON API:

- a **frontend** the player sees (React, with Firebase sign in and a ZeroDev smart wallet)
- a **backend** that holds the 0G wallet and does everything that touches the network

The browser never sees the 0G private key. Anything that costs gas or needs to be signed by the operator happens on the server. In production the same backend also serves the built frontend, so the whole app runs from one origin.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND  ·  React + Vite                   │
│   Firebase sign in   ·   ZeroDev smart wallet                  │
│   Login → Lobby → Waiting → Table → Reveal → History          │
└──────────────────────────────┬──────────────────────────────┘
                               │   JSON over /api/*
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND  ·  Node + Express                   │
│   holds the 0G wallet   ·   round engine   ·   records         │
└─────────┬───────────────────┬───────────────────┬───────────┘
          │                   │                   │
          ▼                   ▼                   ▼
 ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
 │   0G COMPUTE    │ │   0G STORAGE    │ │    0G CHAIN     │
 │   verifiable    │ │  round records  │ │   attestation   │
 │   inference     │ │  (download to   │ │   of each       │
 │  (the answers)  │ │    replay)      │ │   record        │
 └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## The pieces

```
backend/
│
├─ src/
│   ├─ og.ts             build the 0G compute broker from the wallet
│   ├─ inference.ts      ask personas, verify on 0G, clean and de-dupe answers
│   ├─ personas.ts       the AI minds and the shared answer rules
│   ├─ prompts.ts        the prompt packs and seed human answers
│   ├─ arena.ts          round engine: build the table, score votes, anti-rig
│   ├─ records.ts        persist a finished round (storage + chain)
│   ├─ storage.ts        0G Storage upload and download
│   ├─ chain.ts          0G Chain attestation call
│   └─ types.ts          the shared domain shapes
│
├─ server/
│   ├─ server.ts         mount routes, serve the frontend build in prod
│   ├─ arena.routes.ts   game endpoints
│   └─ proof.routes.ts   proof and round-record download endpoints
│
├─ contracts/
│   └─ MindfeintLog.sol  anchor each round's storage root on chain
│
└─ scripts/              ledger, providers, deploy, live round, fetch a round

frontend/
│
├─ public/logo.png       app logo (served at /logo.png, also the favicon)
│
└─ src/
    ├─ App.tsx           shell, nav, mobile menu, view flow
    │
    ├─ auth/
    │   ├─ firebase.ts   Firebase init and Google sign in
    │   ├─ useAuth.ts    auth state, wires sign in to wallet provisioning
    │   └─ zerodev.ts    ERC 4337 Kernel smart wallet
    │
    ├─ components/       LoginScreen, WaitingScreen, table, Reveal, ProofModal,
    │                    VerdictCard, HistoryStats, HistoryPage (replay),
    │                    HowToPlay, About, Roadmap
    │
    ├─ types.ts          client mirror of the API shapes
    └─ index.css         the Tailwind theme
```

## How a round works, start to finish

Detector mode (spot the human):

1. The player picks a pack and starts. The frontend calls `POST /api/round` with the player's id.
2. `arena.ts` picks a prompt, never the same one this player just had.
3. It sources one human answer, in order of preference: a real answer queued by another player in hider mode, otherwise a hand written seed for that prompt, otherwise a freshly generated human style answer (so any prompt, even a brand new one, plays fair).
4. It draws five personas and asks each one, sequentially, on 0G. Each answer is produced by a real model and checked against the provider's TEE signature, so it carries a proof. Each persona also sees the answers already given so it picks a different angle.
5. The six answers are shuffled, secrets are stripped, and the anonymized table is returned.
6. The player votes for a seat. The frontend calls `POST /api/round/:id/vote`.
7. The backend scores the vote, uploads the full round to 0G Storage, anchors that record on 0G Chain, and returns the reveal: who was who, how many answers were verified, and the storage and chain transaction links.

Hider mode: the player gets a prompt, writes an answer (capped to keep lengths comparable), and it goes into the queue tagged with their anonymous id. Later detector rounds serve it to other players, never back to the writer, and it retires after a few uses.

Replay: from the history page, a finished round can be reopened. The frontend calls `GET /api/round-record/:root`, the backend downloads the record from 0G Storage by its root, and the saved game is shown again, fetched live from the storage network.

## The answer pipeline

Each AI answer goes through `inference.ts`:

1. **Generate.** A request is signed with the operator wallet and sent to the 0G chatbot provider (`qwen/qwen2.5-omni-7b`) with the persona's personality and the shared rules.
2. **Verify.** The response is checked with `processResponse` against the provider's TEE signature. A pass sets the `verified` flag (the `checkmark 0G` badge).
3. **Clean.** Answers are trimmed to one or two short sentences, dashes are removed, filler openers are dropped, and any answer that trails off mid thought is closed cleanly.
4. **Keep it English.** The model occasionally code switches into Chinese. Any answer containing CJK characters is rejected so the call retries, keeping everything English.
5. **Retry and fall back.** Failures retry a few times, then fall back to a short safe line. Each persona has a distinct fallback so a failure never shows as duplicate text.
6. **De-duplicate.** Personas run sequentially and each is told to avoid the prior answers; an exact duplicate that still slips through is swapped for a fallback.

## Auth and account abstraction

Sign in is handled by Firebase (Google). On sign in, `useAuth.ts` asks `zerodev.ts` to provision an ERC 4337 Kernel smart account for that user, deterministically derived from their Firebase id. The smart wallet is configured against 0G Galileo (chain id 16602) through ZeroDev's bundler.

Current status: login works. The smart wallet is an identity layer and does not yet sign the game's transactions (the operator wallet still pays for and signs all 0G work). Provisioning depends on the bundler supporting 0G Galileo, which is the piece being finished. See the roadmap.

## The three 0G primitives, and exactly how each is used

**0G Compute, verifiable inference.** The heart of the game. Every persona answer is produced by a real model on 0G and checked against the provider's TEE signature. That check is what lets us claim an answer was genuinely produced by a model and not faked. Without it there is no game, only a claim. Lives in `inference.ts`.

**0G Storage, the round record.** When a round ends, the whole thing (the prompt, every answer, who was the human, the votes, and the per answer proof flags) is uploaded to 0G Storage. The upload returns a content root and an on chain commit transaction, and the record can be downloaded again by its root to replay the round. Lives in `storage.ts` and `records.ts`.

**0G Chain, the attestation.** The storage root is anchored on chain through the `MindfeintLog` contract, which emits an event with the root and a timestamp. That is a second, independent on chain reference for the round. Lives in `chain.ts` and the contract.

So a finished round leaves three trails: a verified answer from Compute, an immutable and downloadable record on Storage, and an anchor on Chain.

## Data model

The shapes both sides build against live in `backend/src/types.ts`:

- **Persona:** an AI mind. An id, a name, and a plain language personality.
- **Answer:** one seat. The text, whether it is the human, the persona id, and whether it was verified on 0G.
- **Round:** the full record, including the human seat, who wrote the human answer, the votes, and the storage root, storage commit tx, and chain attestation tx once they exist.
- **PublicRound:** what the browser may see during play. The six seats with no secrets.
- **Reveal:** what comes back after a vote. The truth, the verified count, and the storage and chain references.
- **StoredRound:** the shape downloaded from 0G Storage for replay.

## Reliability choices

A few decisions came straight out of watching it break:

- **Inference runs one persona at a time.** Parallel signed requests from one wallet collided on nonces and several answers per round came back empty. Sequential is slower (a round takes roughly thirty to fifty seconds) but reliably returns five real, verified answers.
- **Answers are length capped and cleaned** so a tight human answer never stands out next to a rambling AI one, and trailing or non-English output never reaches the table.
- **No back-to-back prompts** for a player, and a generated human seat for prompts without a seed, so variety stays high.
- **Anti-rig.** You are never shown your own hider answer, and each hider answer retires after a few uses so it cannot be farmed.
- **Timeouts everywhere.** Inference, verification, storage upload, and attestation are all bounded, so a slow network never freezes the screen.
- **Graceful degradation.** If attestation is not configured, the round still stores to 0G Storage. If a step times out, the reveal still appears.

## Deployment

The app ships as a single Node service. In production `server.ts` serves the built frontend from `frontend/dist` alongside the API, so everything is one origin (no CORS, one domain to authorize in Firebase). Build with `npm run build`, run with `npm start`. The operator wallet pays for every player, so its compute ledger and native balance must stay funded.

## Roadmap

- **Points and a provable leaderboard,** computed and stored server side, with anti-rig safeguards.
- **Account abstraction fully on 0G,** so the smart wallet signs and pays for play and onboarding needs no seed phrase or gas.
- **Player owned personas** minted as iNFTs (ERC 7857 style).
- **Cross-device sync** of history and stats per account.
- **Live multiplayer:** public async tables and a community feed.
