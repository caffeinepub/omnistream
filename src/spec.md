# Specification

## Summary
**Goal:** Add a Watch-page comments feature (read for everyone, post for signed-in users) and completely remove the Viewer Timer from the Watch page.

**Planned changes:**
- Remove the Viewer Timer UI and any timer-related logic/wiring from the Watch page on both mobile and desktop.
- Add backend storage and APIs to create and fetch comments per media item (keyed by Watch-page media title), storing text, author principal, and createdAt, and returning newest-first.
- Add React Query hooks to fetch/post comments via the backend actor, keyed by media title, with cache invalidation/refetch after posting and clear error messaging if the actor is unavailable.
- Add a Watch-page “Comments” section under the media that lists comments (with empty state), shows a posting form for signed-in users, and shows a sign-in prompt / disables posting for guests.

**User-visible outcome:** The Watch page no longer shows any Viewer Timer elements, and users can read comments under each media item; signed-in users can post a comment and see it appear immediately, while guests are prompted to sign in to post.
