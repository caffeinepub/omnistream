# Specification

## Summary
**Goal:** Prompt for camera + microphone permissions when an authenticated user opens the Go Live start form, and show clear messaging if permission is denied.

**Planned changes:**
- Trigger a combined Camera + Microphone permission request immediately when the Go Live start form/preview mounts on `/live` (including `/live?startLive=1`) for authenticated users.
- Ensure any media tracks created for the local preview are stopped when the start form is closed or the user navigates away.
- Add an explicit preview error state/message when camera and/or microphone permission is denied, while still allowing the user to proceed to create a live session without the preview.

**User-visible outcome:** When starting a live session, the browser immediately asks for camera and microphone access for the preview; if access is denied, the preview area explains that camera/mic permission was denied and the user can still create a live session without the preview.
