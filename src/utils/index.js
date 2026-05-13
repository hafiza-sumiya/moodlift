/**
 * src/utils/index.js — Barrel export file
 *
 * All utilities re-exported from one place so consumers can do:
 *   import { storage, helpers, storyService } from '../utils';
 *
 * Intended folder organisation (for future migration):
 *  ┌── utils/
 *  │   ├── Pure utilities   → helpers.js, storage.js
 *  │   ├── API services     → api.js, authService.js, storyService.js
 *  │   └── React contexts   → AuthContext.js
 *  └── constants/           → colors.js  ✅ done
 */

// ── Pure utilities ────────────────────────────────────────────────────────────
export * from "./helpers";
export { storage } from "./storage";

// ── API layer ─────────────────────────────────────────────────────────────────
export { default as api } from "./api";
export { authService } from "./authService";
export { storyService, commentService } from "./storyService";

// ── React context ─────────────────────────────────────────────────────────────
export { AuthProvider, useAuth } from "./AuthContext";
