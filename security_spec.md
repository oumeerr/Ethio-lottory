# Security Specification for ETHIOLOTTORY BINGO

## Data Invariants
1. A transaction cannot be created unless the `user_id` matches the authenticated user (or a system process).
2. Users can only read their own profile data (unless they are an admin).
3. `balance` and `bonus_balance` should only be modifiable by system-level logic (simulated in rules for now, but ideally via backend). *Note: In this specific app, the client seems to handle some updates, so the rules must be balanced.*
4. `current_stakes` should only be modifiable by the owner of the stake.
5. AI logs are append-only for the system.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a transaction for another user's ` telegram_id`.
2. **Balance Theft**: Attempt to update another user's `balance`.
3. **Self-Promotion**: Attempt to set `isAdmin` to true in your own profile.
4. **Stake Hijacking**: Attempt to delete or modify another user's stake in `current_stakes`.
5. **PII Leak**: Attempt to read the entire `users` collection without filtering by `uid`.
6. **Negative Deposit**: Attempt to create a transaction with a negative `amount`.
7. **Future Dating**: Attempt to set `created_at` to a future date instead of `request.time`.
8. **Shadow Field Injection**: Attempt to add an unauthorized field `isVerifiedUser` to the user profile.
9. **Referral Fraud**: Attempt to set your own `referrer_id` to yourself.
10. **Game State Bypass**: Attempt to update `games_won` without a corresponding `game_reward` transaction in the same batch (hard to enforce strictly without `existsAfter` but we can try).
11. **Resource Poisoning**: Attempt to set a 1MB string as a `card_id`.
12. **Unauthorized Log Deletion**: Attempt to delete entries from `ai_logs`.

## Test Runner (Draft)
A comprehensive `firestore.rules.test.ts` would involve using the `@firebase/rules-unit-testing` library. In this environment, we will focus on generating the `firestore.rules` that block these.

## Red Team Table

| Threat | Collection | Defense | Status |
|---|---|---|---|
| Identity Spoofing | transactions | `isValidTransaction` checks `incoming().user_id == get_user_telegram_id()` | Pending |
| State Shortcutting | users | `affectedKeys().hasOnly(['games_played', ...])` strictly limited | Pending |
| PII Leak | users | `allow get: if isOwner(userId)` | Pending |
| Resource Poisoning | all | `.size() <= MAX` and `isValidId()` | Pending |
