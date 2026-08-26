# AI Production Safety Policy

1. Never place an AI API key in client-side source.
2. Product price, stock, availability, order state and payment state must come from trusted application data.
3. AI cannot invent prices, discounts, stock, delivery promises or payment confirmation.
4. Sensitive actions require application-level authorization; AI chat alone is not authorization.
5. AI may suggest an action, but the application must execute the actual action after validation.
6. Uploaded images must be size/type limited and safely processed.
7. Log important AI actions without storing unnecessary personal data.
8. Rate-limit AI requests to control abuse and cost.
