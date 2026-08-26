# Automatic App Update — Final Launch
Customer App updates are silent: no "New App Update available", Update Now,
Install, Share, or manual update prompt is shown. The page registers the
service worker with updateViaCache=none, checks for a new deployment on load
and every 5 minutes while open, and reloads once after the new worker takes
control. Existing application features are preserved.
