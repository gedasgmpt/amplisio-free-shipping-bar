
# Free Shipping Progress Bar by Amplisio (Theme App Extension)

This package contains a **Shopify Theme App Extension** that renders a lightweight free‑shipping progress bar on storefront pages. It fetches the cart via `/cart.js`, updates progress in real time, and supports sticky top/bottom placement, custom messages, and multiple design templates.

> ✅ Start fast: you can push this extension to a dev store even **without a backend** to validate UX and design.
> 🔜 When you're ready, add a backend (Shopify Remix) for billing (Starter/Growth), deep analytics, A/B testing, and upsell recommendations.

---

## Features

- Configurable **threshold** (store currency).
- Messages:
  - Before: `Spend {{amountRemaining}} more to get Free Shipping.`
  - After: `🎉 You’ve unlocked Free Shipping!`
- Positions: **Top**, **Bottom**, or **Cart-only**. Optional **Sticky**.
- Styling: background, fill, text colors, height, radius; templates `minimal | pill | glass | banner | compact`.
- Mobile friendly and **lightweight** (async, no jQuery).
- Basic segmentation fields (Growth preview): limit by **countries** (ISO codes) and **collections** (handles).
- Basic analytics hooks (in-memory array on `window.__fspb_events`).

---

## Quick Start (Dev)

1. Install **Shopify CLI** and log in.
2. Create (or reuse) a Partner app to attach this extension.
3. In this folder, run:
   ```bash
   shopify app connect
   shopify app dev
   ```
4. In your theme editor, enable the **App Embed**: *Free Shipping Progress Bar*.
5. Configure threshold/colors/messages and save.

> If `shopify.app.toml` is missing client_id or dev store URL, run `shopify app connect` and follow prompts.

---

## Plans & Growth Roadmap

- **MVP (Free)**: 1 bar, base styling, top/bottom/cart, basic messages.
- **Starter ($4.99/mo)**: unlimited bars/campaigns via multiple theme presets (to be gated by backend billing).
- **Growth ($9.99/mo)**:
  - Segmentation/rules (countries, collections, page types).
  - Template library.
  - Upsell recommendations (requires backend endpoints).
  - Analytics+ and A/B testing (backend).

This package ships the **Theme Extension** for MVP/Growth UI. To enforce plans and advanced features, add a backend and gate features based on the merchant's active plan.

---

## Add a Backend Later (Shopify Remix)

- Scaffold: `npm create @shopify/app@latest` → choose **Remix**.
- Add Billing (Subscriptions) and expose a small `/api/plan` endpoint.
- From the extension script, you can **read plan flags** via a lightweight fetch to your app domain and toggle pro features (A/B, upsell).
- Add event ingestion endpoints for analytics.

---

## Files

- `shopify.app.toml` – app manifest (fill your values).
- `extensions/free-shipping-progress-bar/extension.toml` – extension manifest.
- `extensions/.../blocks/free-shipping-progress-bar.liquid` – App Embed block + settings schema.
- `extensions/.../assets/progress-bar.js` – the storefront script.

---

## Notes

- Collections filtering is a best‑effort without a backend (uses product handle when available).
- Country filtering requires backend or proxy to detect visitor geo precisely; this field is provided to prepare your rules UI now.
- For **performance**, the script polls `/cart.js` every ~2.5s and listens for common cart events (`cart:updated`). Adjust as needed for your theme.
