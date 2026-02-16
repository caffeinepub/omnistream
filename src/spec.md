# Specification

## Summary
**Goal:** Restore a working OmniStream mainnet deployment URL path and improve the Watch page so the Viewer Timer is clearly visible/usable (including via deep links), with clear user-facing error handling when the backend is unreachable.

**Planned changes:**
- Adjust the Watch page layout so the Viewer Timer card is visible and discoverable on common desktop and mobile viewports, including when landing via hash-route deep links.
- Ensure the Viewer Timer remains fully functional (start/stop, countdown) and preserves the existing behavior of pausing video when the timer reaches zero.
- Fix and harden the mainnet deployment/access path so the app reliably loads at `https://<canister-id>.icp0.io/` and deep links like `/#/watch/...` open correctly without blank screens.
- Add a frontend user-facing error state for backend actor/connectivity failures with a clear English message and minimal next-step guidance (e.g., reload, verify correct deployed icp0.io URL).
- Update repo-local mainnet deployment documentation to explain how to obtain and use the correct frontend assets canister URL, include correct root + hash-route examples, and add troubleshooting for “Canister ID Not Resolved”.

**User-visible outcome:** Users can open the deployed OmniStream app via the correct `icp0.io` URL (including deep links), clearly see and use the Viewer Timer on the Watch page across devices, and receive an understandable on-screen error message if the backend is temporarily unreachable.
