# Mindfeint architecture

A short tour of how the game is put together, and where 0G does the real work.

## The idea in one line

One of six answers is a real person. The other five are AI personas running on 0G,
and the game can prove the AIs were genuine and that nobody rigged the result.

## Big picture

There are two parts that talk to each other over a small JSON API:

- a **frontend** the player sees (React)
- a **backend** that holds the 0G wallet and does everything that touches the network

The browser never sees a private key. Anything that costs gas or needs to be signed
happens on the server.

```
                         Browser (React + Vite)
        lobby  ->  waiting  ->  table  ->  reveal        hider mode
                              |  fetch /api/...  |
                              v                  v
                       Backend (Node + Express)
                         holds the 0G wallet
          ┌───────────────────┼────────────────────┐
          v                   v                     v
     0G Compute          0G Storage             0G Chain
   verifiable            round record         attestation of
   inference             (immutable)          the record
   (the answers)
```

## The pieces

```
backend/
  src/
    og.ts          connects the 0G compute broker from the wallet
    inference.ts   asks a persona to answer, then verifies it on 0G
    personas.ts    the AI minds (each a distinct kind of person)
    prompts.ts     the prompt packs and the seed human answers
    arena.ts       the round engine: builds the table, scores the vote
    records.ts     writes a finished round to 0G Storage and 0G Chain
    storage.ts     the 0G Storage upload itself
    chain.ts       the 0G Chain attestation call
    types.ts       the shared shapes both sides agree on
  server/
    server.ts          mounts the routes
    arena.routes.ts    the game endpoints
    proof.routes.ts    the proof endpoints
  contracts/
    MindfeintLog.sol   a tiny contract that anchors each round on chain
  scripts/             ops and test helpers (ledger, providers, deploy, live round)

frontend/
  src/
    App.tsx            the shell, the nav, and the flow between screens
    components/        WaitingScreen, the table, Reveal, ProofModal,
                       VerdictCard, HistoryStats, HistoryPage, HowToPlay, About
    types.ts           the client side mirror of the API shapes
    index.css          the Tailwind theme
```

## How a round works, start to finish

Detector mode (spot the human):

1. The player picks a pack and hits start. The frontend calls `POST /api/round`.
2. `arena.ts` picks a prompt, then sources one human answer. It uses a real answer
   from the queue (left by another player in hider mode) if there is one, otherwise it
   falls back to a hand written seed so the game is playable from the very first visit.
3. It draws five personas and asks each of them, one at a time, on 0G. Each answer is
   produced by a real model and then checked against the provider signature, so it
   carries a proof.
4. The six answers (five AI plus one human) are shuffled, the secrets are stripped out,
   and the table is sent back to the browser.
5. The player reads the six answers and votes for the seat they think is the human.
   The frontend calls `POST /api/round/:id/vote`.
6. The backend scores the vote, writes the full round to 0G Storage, anchors that record
   on 0G Chain, and returns the reveal: who was who, how many answers were verified, and
   the two explorer links.

Hider mode (be the human) is simpler: the player gets a prompt, writes an answer, and it
goes into the queue tagged with their anonymous id. Later detector rounds serve it to
other players (never back to the person who wrote it).

## The three 0G primitives, and exactly how each is used

**0G Compute, verifiable inference.** This is the heart of the game. Every persona answer
comes from a real model on 0G, and each one is checked against the provider signature
from a trusted execution environment. That check is what lets us say an answer was
genuinely produced by a model and not faked. Without it there is no game, only a claim.
Lives in `inference.ts`.

**0G Storage, the round record.** When a round ends, the whole thing (the prompt, every
answer, who was the human, the votes, and the per answer proof flags) is uploaded to 0G
Storage. The upload returns a content id and an on chain commit transaction. Lives in
`storage.ts` and `records.ts`.

**0G Chain, the attestation.** The storage content id is then anchored on chain through a
tiny contract, `MindfeintLog`, which emits an event with the id and a timestamp. That
gives a second, independent on chain reference for the round. Lives in `chain.ts` and the
contract.

So a finished round leaves three trails: a verified answer from Compute, an immutable
record on Storage, and an anchor on Chain. The reveal links straight to the explorer for
the storage commit and the attestation.

## Data model

The shapes both sides build against live in `backend/src/types.ts`:

- **Persona**: an AI mind. An id, a name, and a plain language personality.
- **Answer**: one seat. The text, whether it is the human, and (for AI seats) whether it
  was verified on 0G.
- **Round**: the full record, including the human seat, the votes, and the storage and
  chain references once they exist.
- **PublicRound**: what the browser is allowed to see during play. The six seats with no
  secrets attached.
- **Reveal**: what comes back after a vote. The truth, the verified count, and the proof
  links.

## Reliability choices, the honest part

A few decisions came straight out of watching it break:

- **Inference runs one persona at a time, not all at once.** Firing five signed requests
  in parallel from one wallet made them collide on nonces, and several answers per round
  would come back empty. Sequential is slower (a round takes roughly thirty to fifty
  seconds) but it reliably returns five real, verified answers.
- **Each answer retries a few times before giving up.** If the provider blips, we try
  again. Only after that do we use a short fallback line, and each persona has a different
  fallback so a failure never shows up as duplicate text.
- **Timeouts everywhere.** The inference call, the verification, the storage upload, and
  the attestation are all bounded, so a slow network never freezes the screen.
- **Seed human answers.** Until real players have contributed through hider mode, the
  human seat is filled by a hand written answer so the game never feels empty.
- **You cannot be served your own answer.** Hider answers are tagged with the writer, and
  detector rounds skip your own, so you cannot recognise and rig your own round.
- **Attestation is optional at runtime.** If the contract address is not set, the round
  still stores to 0G Storage and simply skips the chain step.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind, Framer Motion, lucide icons |
| Backend | Node, Express, TypeScript, ethers |
| Inference | 0G Compute, model `qwen/qwen2.5-omni-7b`, verified |
| Storage | 0G Storage SDK |
| Chain | 0G Chain (Galileo testnet, chain id 16602) and a Solidity contract |

## What is not built yet (v2)

These are deliberately out of scope for the first version and are the planned next step:

- points for spotting the human, and for fooling detectors in hider mode, feeding the leaderboard (exact values still to be decided)
- wallet connect with account abstraction, so players join without a seed phrase and play without paying gas themselves
- personas minted as iNFTs (ERC 7857) that players own
- a provable leaderboard with persona win rates kept on chain
- public async tables and a live community feed
