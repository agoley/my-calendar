# My Calendar

A PWA that shows Google, Outlook and HEY in one calendar that stays current when meetings are moved or cancelled.

The merging happens on the server (`modules/calendar-sync` in the email campaign server, mounted at `/cal`). It re-reads every calendar feed every few minutes and applies invite updates and cancellations from email as they arrive, so this app never waits on Google's or Outlook's slow subscription refresh.

- First open: Settings → server URL + the `CAL_TOKEN` value.
- Settings also shows a `webcal://` link for subscribing in Apple Calendar (set it to refresh every 5 minutes).
- `sw.js` caches the app shell for offline; the last calendar copy is kept on the device.

Install on iPhone from Safari with Share → Add to Home Screen, or on Android from Chrome with ⋮ → Install app.
