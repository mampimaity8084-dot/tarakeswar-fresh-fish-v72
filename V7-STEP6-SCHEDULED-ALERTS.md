# Scheduled AI Alerts — Architecture

Recommended alerts:
- Morning: today's priority summary
- Low stock: products crossing admin-defined threshold
- Pending orders: orders waiting beyond admin-defined time
- Evening: delivered/pending summary
- Festival: configured greeting/theme reminder

The scheduler should call a server-side function. It must not expose secrets in the browser.

Each alert should have:
- enabled/disabled
- schedule
- audience
- message template
- last run
- last result
- manual test button

Keep human approval for actions that change price, stock, orders, payments or customer-visible critical settings.
