# Specification

## Summary
**Goal:** Improve key browsing/creation UX by adding a signed-in-only floating action menu, a clock-style viewer timer on Watch, clearer Shorts branding, and faster Live list updates.

**Planned changes:**
- Add a signed-in-only floating “+” button fixed bottom-right across main routes that opens a 3-item menu: Upload Video, Upload Short, Go Live; each item navigates into the existing corresponding flow with the correct pre-selection/focus.
- Replace the Watch-page viewer timer inputs with two clock-style time selectors (From/To), compute countdown duration from the selected range, validate invalid ranges in English, and keep the existing auto-pause behavior when the timer ends.
- Add a prominent text-based Shorts branding element in the Shorts page header that says “Shorts” and indicates users can watch Shorts.
- Poll/refetch the Live sessions list while the Live page is open at an interval of 5 seconds or less using existing APIs (no websockets).

**User-visible outcome:** Signed-in users can quickly upload a video/short or start going live from a floating “+” menu, set a Watch timer using From/To clock-style times that still pauses playback at zero, see clearer “Shorts” branding on the Shorts page, and observe Live sessions appear/disappear within ~5 seconds while on the Live page.
