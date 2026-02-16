# Specification

## Summary
**Goal:** Configure OmniStream to be reachable via the Internet Computer custom domain **ommistream.net** and document the required deployment + DNS setup for IC mainnet.

**Planned changes:**
- Add the IC custom-domain allowlist file at `frontend/public/.well-known/ic-domains` containing `ommistream.net` and `www.ommistream.net` (one per line).
- Update `frontend/docs/ic-mainnet-deployment.md` with a dedicated **custom domain (ommistream.net)** section covering: DNS record guidance, deploying the frontend assets canister, finding the frontend assets canister ID, forming the `icp0.io` canister URL, and correct hash-routing URL examples.
- Update `frontend/.env.example` to include/document `II_DERIVATION_ORIGIN=https://ommistream.net` for consistent Internet Identity principals when using the custom domain.
- Update `frontend/src/components/BackendUnavailableBanner.tsx` text to mention both valid access paths (the `icp0.io` canister URL format and `https://ommistream.net`) and hint that custom-domain misconfiguration can cause access failures, with fallback guidance.

**User-visible outcome:** After deployment, the frontend assets canister serves a `.well-known/ic-domains` allowlist for **ommistream.net**, users have clear instructions to configure DNS + verify access, and the app provides clearer guidance when the backend is unreachable (including `icp0.io` and the custom domain as access options).
