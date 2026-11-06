# Observe by VitalOS

A separate, deliberately small VitalOS product concept. `Observe` is the free edition; `Operate` is the proposed premium continuation. It has its own entry point, visual language, PWA manifest, Firebase Hosting site, and deployment workflow while reusing VitalOS sign-in and journal storage.

## Product split

- **Observe (free):** private daily check-ins across Body, Being, Balance, and Business; energy and sleep ratings; mood; a short note; and a simple seven-day presence count. No streak pressure, coaching claims, AI upsell, or feature gate.
- **Operate (premium concept):** turn observations into chosen outcomes, weekly plans, concrete next actions, and review across the same four areas. The current banner is a product-direction placeholder; there is no checkout or paid entitlement yet.

## Local development

From this directory: `npm run dev` (port 9160) and `npm run build`. The Firebase project is `fitness-aos`; the intended Hosting site is `observe-vos` (`observe-vos.web.app`).

## Store direction

**Working title:** VitalOS Observe
**Short description:** A private daily check-in for your whole life.
**Long description:** Observe how you are doing across body, inner life, relationships, and work. Capture your mood, energy, sleep, and a thought in a quiet daily ritual. Review your own patterns without streaks, scores, or pressure. Your entries are private to your account.
**Positioning:** a wellbeing reflection journal, not a diagnostic or treatment tool.
**Monetization hypothesis:** keep Observe useful for free; offer Operate as an optional subscription for planning and follow-through. Test willingness to pay before implementing billing.

The current deliverable is a hosted PWA prototype. Native App Store / Play Store packaging, store screenshots, final privacy disclosures, authorized Firebase domain setup, billing, and a live Hosting deployment are release work, not claimed as complete here.
