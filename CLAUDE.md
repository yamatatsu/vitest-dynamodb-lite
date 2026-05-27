# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspace monorepo. `packages/vitest-dynamodb-lite/` is the published npm package; every other `packages/test-*` directory is a consumer-style integration test that depends on the library via `workspace:../vitest-dynamodb-lite`.

- `test-config-{cjs,esm,js,json,ts}` — each exercises one of the supported config file formats. The supported config filenames (in resolution order) are defined in `lib/config.ts`: `vitest-dynamodb-lite-config.{ts,js,cjs,mjs,json}`.
- `test-concurrency` — 16 parallel test files used to verify that worker isolation actually works.
- `test-performance` — same 16 files but invoked via `pnpm check-performance` with `--maxWorkers=16` for benchmarking.
- `test-with-tsconfig` — verifies behavior when the consumer project has its own `tsconfig.json`.

The root `pnpm test` runs `pnpm run -r --sequential test` — tests **must** run sequentially across packages because each package binds dynalite to ports starting from `basePort` (default 8000), and concurrent packages would collide.

## Common commands

```bash
pnpm install              # install all workspace deps
pnpm test                 # run every package's tests sequentially (root)
pnpm --filter test-concurrency test    # run a single integration package
pnpm --filter test-performance check-performance   # 16-worker perf check
pnpm jsgl --local ./packages/vitest-dynamodb-lite/  # license check
```

To run a single test file inside an integration package: `cd packages/<pkg> && pnpm vitest run path/to/file.test.ts`.

## Architecture

The library is a **vitest setup file**, not a runtime import. Consumers add `setupFiles: ["vitest-dynamodb-lite"]` to `vitest.config.ts`, and `lib/index.ts` runs top-level `await setEnvironmentVariables()` followed by `beforeAll`/`afterEach`/`afterAll` hooks. Understanding the lifecycle requires reading these together:

1. **Top-level await** in `lib/index.ts` calls `setEnvironmentVariables()` *before* any test code (including the consumer's own imports that read `process.env.MOCK_DYNAMODB_ENDPOINT`) executes. This is why the env var is reliably set by the time the consumer constructs their `DynamoDBClient`.
2. **Per-worker port isolation**: `getDynalitePort()` in `lib/config.ts` returns `basePort + VITEST_WORKER_ID`. Each vitest worker gets a distinct port; `MOCK_DYNAMODB_PORT` and `MOCK_DYNAMODB_ENDPOINT` are exported so consumer code points at the right server. This is the mechanism that makes concurrent test files safe.
3. **One dynalite per worker, tables recreated per test**: `beforeAll` starts dynalite and creates tables; `afterEach` deletes and recreates them (cheaper than restarting the server); `afterAll` stops. The dynalite instance is module-scoped in `lib/db.ts` (`dynaliteInstance`), so all hook invocations in a worker share it.
4. **Real-timers wrapper**: `runWithRealTimers` in `lib/utils.ts` temporarily disables `vi.useFakeTimers()` during table create/delete because polling `describeTable` would otherwise hang under fake timers. Any new code that polls dynalite must go through this wrapper.
5. **Tables config can be a function** (sync or async) — see `getTables()` in `lib/config.ts`. The result is cached in `tablesCache` after first read.

## Constraints worth knowing

- `package.json` `main` points to `./lib/index.ts` directly (no build step). The package ships TypeScript source; consumers' test runners (vite/vitest) transpile it. Do not add a build step without coordinating with `files` in `package.json`.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 10080` (7 days) as a supply-chain safeguard — new dependency versions won't be picked up immediately.
- `allowBuilds` in `pnpm-workspace.yaml` permits `esbuild` (needed for vite) and explicitly forbids `classic-level` (dynalite uses `MemoryLevel` in this project, so the native build is never required).
- Release is manual via the `release.yml` workflow_dispatch — do not bump versions in PRs.
