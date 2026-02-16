# Specification

## Summary
**Goal:** Make guest-mode limitations explicit, display OmniStream Discord community info, and add a metadata-only “Go Live” MVP for authenticated users.

**Planned changes:**
- Add always-visible Discord community text in the UI showing server name “ommistream” and contact “scottiscool”, without adding Discord integration or implying an official link when no URL is provided.
- Add guest-mode messaging when unauthenticated (e.g., “Browsing as a guest”) and clarify on upload/post surfaces that signing in is required to upload/post.
- Add a new Live/Go Live navigation entry and pages to browse live sessions (public), view live session details (public), start a live session (authenticated), and end a live session (authenticated, creator-only).
- Add backend canister methods to create, end, list, and fetch live-session metadata with access control enforcing that only authenticated creators can create/end their own sessions.

**User-visible outcome:** Guests can clearly see they are browsing as a guest and can browse a public list of live sessions and view details; signed-in users can start a “Live” session with a title and later end it, and the app displays the OmniStream Discord server/contact info in English.
