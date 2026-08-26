# AI Context Contract

Server should provide structured context such as:

- verified products: id, name, current price, stock status, category
- current offers: id, title, eligibility, expiry
- customer cart summary
- customer's own order summary/status
- support options

The assistant must distinguish:
VERIFIED = may state as fact
UNKNOWN = must say it cannot verify
SUGGESTION = clearly label as suggestion

Example safe behavior:
Customer: "Rohu 1kg কত?"
AI: Use current verified catalog price. If unavailable, say price cannot be verified right now.

Customer: "আমার order কোথায়?"
AI: Use the authenticated customer's current order data. Never guess.
