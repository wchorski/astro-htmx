import htmx from "htmx.org";
import "htmx-ext-response-targets";

if (import.meta.env.DEV === true && Boolean(import.meta.env.HTMX_LOGS)) {
  // Enable logging in development mode
  htmx.logAll();
}

// Enable global view transitions
htmx.config.globalViewTransitions = true;

// Support for Astro view transitions
document.addEventListener("astro:after-swap", () => {
  htmx.process(document.body);
});
