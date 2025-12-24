# Unscroll: Path to Production & Feature Roadmap

This document outlines the strategic roadmap for evolving Unscroll from a prototype to a fully-featured, production-ready application.

## 1. UI Revamp (Aesthetics & UX)
**Goal:** Create a world-class, "Zen" interface that rivals top tier apps like Headspace or Opal.
- [ ] **Design System**: Define a strict color palette (Deep Midnight Blue, Calm Teal, Warm Sand) and typography (Inter/Outfit).
- [ ] **Glassmorphism**: Implement subtle blurred backgrounds for cards to give a premium feel.
- [ ] **Micro-interactions**: diverse animations for pressing buttons, completing sessions, and navigating.
- [ ] **Dashboard Layout**: Redesign the "Weekly Insights" to be more graphical (Pie charts, Heatmaps).
- [ ] **Dark Mode Optimization**: Ensure true-black support for OLED screens to save battery during long sessions.

## 2. Audio Experience Review
**Goal:** A seamless, high-fidelity audio environment.
- [ ] **Background Audio**: Ensure audio keeps playing when the screen locks (partially implemented, needs robust testing).
- [ ] **Offline Support**: Cache tracks locally so users can disconnect from Wi-Fi/Data and still listen.
- [ ] **Player UI**: Polish the "Compact Player" and "Full Screen Player" transitions.
- [ ] **Content**: Expand the library significantly or integrate a podcast feed.

## 3. Breathing Exercise & UI
**Goal:** A tactile, immersive breathing utility.
- [ ] **Haptic Breathing**: Sync vibration pulses with the Inhale/Exhale phases (impossible in web/mock, possible in Native).
- [ ] **Visual Overhaul**: Replace simple circles with fluid, organic shapes (using Skia or Reanimated).
- [ ] **Custom Patterns**: Allow users to define "4-7-8" or "Box Breathing" patterns.

## 4. Migration to Native (TestFlight/GitHub)
**Goal:** Remove "Expo Go" limitations to access deep system APIs.
- [ ] **Prebuild**: Run `npx expo prebuild` to generate native `ios` and `android` directories.
- [ ] **CI/CD Pipeline**: Set up GitHub Actions to automatically build and upload to TestFlight/Play Console on push.
- [ ] **signing**: Manage provisioning profiles and certificates.
- [ ] **Remove Mock Code**: Delete the `AppState` simulation code once real blocking is ready.

## 5. True App Blocking Mechanism
**Goal:** Implement actual, un-bypassable blocking using Native APIs.
- [ ] **iOS**: Implement `FamilyControls` and `ManagedSettings` frameworks.
  - Requires requesting the "Screen Time" entitlement from Apple.
- [ ] **Android**: Implement `UsageStatsManager` and Overlay permissions.
- [ ] **"Shield" View**: Create a custom native UI that appears when a blocked app is opened.
- [ ] **Strict Mode Pro**: "Deep Focus" mode that prevents uninstalling or force-quitting (advanced).

## 6. Feature Gap Analysis
**Comparables:** Opal, Be Present, Forest.
- [ ] **Social Accountability**: "Buddy" system to share streaks (Gap: High).
- [ ] **Hardcore Mode**: Penalties for leaving sessions (partially implemented).
- [ ] **Whitelist/Blacklist**: Allow users to select *specific* apps to block (Native only).
- [ ] **Stats History**: Long-term data retention (30+ days).

---

## Immediate Next Steps (The "Transition" Phase)
1.  **Review UI**: Audit current styles alongside a designer/reference.
2.  **Prebuild**: Run the prebuild command to see if the current codebase compiles natively.
3.  **Native Modules**: Identify exactly which native modules (`expo-dev-client`, `expo-build-properties`) are needed.
