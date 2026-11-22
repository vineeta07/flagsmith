import flagsmith from '/vendor/flagsmith/index.mjs';

const FLAG = 'checkout_button';
const CONVERSION_EVENT = 'purchase_completed'; // must match the metric's event name exactly
const COPY = { control: 'Buy now', get_it_today: 'Get it today' };

const config = window.FLAGSMITH_CONFIG;
const button = document.getElementById('checkout');
const status = document.getElementById('status');

// The demo has no login, so each visitor gets a stable random identifier.
// Exposures and conversions are joined per identity, so both use this one ID.
function getUserId() {
  let id;
  try { id = localStorage.getItem('demo_user_id'); } catch {}
  if (!id) {
    id = `user_${crypto.randomUUID()}`;
    try { localStorage.setItem('demo_user_id', id); } catch {}
  }
  return id;
}

async function main() {
  if (!config?.environmentID) {
    status.textContent = 'Missing public/config.js; copy public/config.example.js and fill it in.';
    return;
  }

  await flagsmith.init({
    environmentID: config.environmentID,
    enableEvents: true,
    // Self-hosted: the API, plus the events URL (the local instance receives events itself at /api/).
    api: config.apiUrl,
    eventProcessorConfig: { eventsApiUrl: config.eventsApiUrl },
  });

  const userId = getUserId();
  await flagsmith.identify(userId);
  document.getElementById('user').textContent = userId;

  // Evaluated right where the button is rendered, so this records the exposure.
  const flag = flagsmith.getExperimentFlag(FLAG);
  const variant = flag?.value ?? 'control';
  button.textContent = COPY[variant] ?? COPY.control;
  button.dataset.variant = variant;
  button.disabled = false;

  button.addEventListener('click', async () => {
    button.disabled = true;
    // Success: the order is confirmed.
    flagsmith.trackEvent(CONVERSION_EVENT, { value: 49 });
    await flagsmith.flushEvents();
    status.textContent = 'Order confirmed. Thanks for your purchase!';
  });
}

// Send anything still buffered before the page goes away.
window.addEventListener('pagehide', () => { flagsmith.flushEvents(); });

main().catch((err) => {
  console.error(err);
  status.textContent = `Could not load the shop: ${err.message}`;
});
