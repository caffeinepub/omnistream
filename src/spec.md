# Specification

## Summary
**Goal:** Add a Polls feature where users can create polls, vote (one vote per user per poll, changeable), and view percentage results.

**Planned changes:**
- Add backend poll storage and data model (question, 2+ options, vote counts, createdAt, creator principal) plus per-user vote tracking to enforce one vote per principal with vote changes supported.
- Add backend APIs: createPoll, getPoll, getAllPolls (newest first), and votePoll; restrict create/vote to authenticated users while allowing all users to read.
- Add safe backend upgrade migration to initialize poll state without losing existing canister data.
- Add React Query hooks for listing polls, fetching a poll, creating a poll, and voting; ensure cache invalidation/refetch after create/vote with clear English error messages.
- Add a Polls page/route linked from main navigation: polls list (newest first), creation form for signed-in users (question + dynamic 2+ options), and voting UI that displays per-option percentage results; guests can browse but are prompted to sign in to create/vote.

**User-visible outcome:** Users can browse polls and results; signed-in users can create new polls and vote (or change their vote) and immediately see updated percentage results.
