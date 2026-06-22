# Mindfeint

**One of them is a real person. The rest are AIs pretending to be them. Can you tell?**
And because it runs on 0G, the game can prove the AIs were genuine and that nobody rigged
the result.

A *feint* is a move meant to mislead. Mindfeint is a feint of the mind.

Built for The Zero Cup on 0G.

---

## What it is

Mindfeint is a social deduction game. Each round shows six short answers to one spicy
prompt. Five are written by AI personas; one is written by a real person. You either try
to spot the human, or you become the human and try to blend in.

Every other "spot the bot" game asks you to take the house at its word. Was that really an
AI, or a human plant? A real model, or a cheap script? Is the leaderboard honest? You have
no way to know. Mindfeint removes the guesswork. It is built on 0G, the one stack that lets
a game prove its AI players are genuine and that the outcome was not tampered with.

## How it works

A round is a table of six answers. Two ways to play:

- **Spot the human (detector).** Read the six answers, pick the seat you think is the real
  person, lock it in. The reveal shows who was who, how many answers were verified on 0G,
  and links to the on chain record.
- **Be the human (hider).** You get a prompt, write your own answer, and it gets shuffled
  into other players' rounds for them to puzzle over.

Each finished round leaves a trail you can actually open: a verified answer from 0G
Compute, an immutable record on 0G Storage, and an anchor on 0G Chain.

## Why 0G

You cannot run a fair AI game if you cannot prove the AIs are real.

- **0G Compute** gives verifiable inference. Every AI answer is produced by a real model
  and signed inside a trusted execution environment, so it carries a proof.
- **0G Storage** keeps the full round record, immutable and public.
- **0G Chain** anchors that record, so results cannot be quietly changed.

Take 0G out and the whole promise collapses into "trust me." That is the difference.

## Run it locally

You need Node 20 or newer and a wallet with 0G Galileo testnet tokens.

```bash
# 1. install (root orchestrator, then both workspaces)
npm install
npm run install:all

# 2. configure the backend
cp backend/.env.example backend/.env
#    then open backend/.env and set PRIVATE_KEY

# 3. (optional) deploy the attestation contract for the on chain step
npm run deploy:attest
#    paste the printed address into backend/.env as ATTEST_ADDRESS

# 4. run the backend and frontend together
npm run dev
```

The API serves on `http://localhost:8787` and the app on `http://localhost:5173`.

## Handy commands

Run these from the project root:

| Command | What it does |
|---|---|
| `npm run dev` | runs the backend and frontend together |
| `npm run ledger` | shows your 0G balances (add `-- --deposit 0.5` to top up) |
| `npm run providers` | lists the live 0G inference providers |
| `npm run deploy:attest` | compiles and deploys the attestation contract |
| `npm run test:round` | plays one full round end to end against live 0G |

## Project layout

```
mindfeint/
  backend/    Node and Express. Holds the 0G wallet. Compute, Storage, Chain,
              the round engine, the API, and the attestation contract.
  frontend/   React and Vite. The lobby, the table, the reveal, and the pages.
```

The deeper tour, including the request flow and the reliability decisions, lives in
[ARCHITECTURE.md](./ARCHITECTURE.md).

## Tech stack

React, Vite, TypeScript, Tailwind and Framer Motion on the front. Node, Express and ethers
on the back. 0G Compute for verifiable inference (`qwen/qwen2.5-omni-7b`), 0G Storage for
the records, and a small Solidity contract on 0G Chain (Galileo testnet, chain id 16602).

## Status and roadmap

The first version is playable now: real verified answers, both modes, the full proof trail,
and a history you can browse and open on chain.

Next up:

- wallet connect so players sign in
- write your own AI persona and mint it as an iNFT you own
- a provable leaderboard kept on chain
- public async tables and a live community feed

## A note on fairness

The AIs are good. They will fool you. That is the fun, and it is also the point: the only
honest way to play a game like this is to be able to prove the players on the other side
were real. That proof is what Mindfeint is built around.
