// Simulates traffic for the checkout_button experiment.
// Each simulated user gets its own identifier and SDK instance: it is identified,
// gets the experiment flag (recording the exposure) and sometimes completes a purchase.
//
//   FLAGSMITH_ENVIRONMENT_KEY=<client-side key> npm run simulate
//
// Optional: USERS (default 300), FLAGSMITH_API_URL, FLAGSMITH_EVENTS_URL.
// The purchase rates below are made up so a difference shows up in the results.
import { createFlagsmithInstance } from '@flagsmith/flagsmith/isomorphic';

const environmentID = process.env.FLAGSMITH_ENVIRONMENT_KEY;
const api = process.env.FLAGSMITH_API_URL || 'http://localhost:8000/api/v1/';
const eventsApiUrl = process.env.FLAGSMITH_EVENTS_URL || 'http://localhost:8000/api/';
const USERS = Number(process.env.USERS) || 300;
const PURCHASE_RATE = { control: 0.2, get_it_today: 0.3 };
const BATCH = 20;

if (!environmentID) {
  console.error('Set FLAGSMITH_ENVIRONMENT_KEY to the client-side environment key.');
  process.exit(1);
}

const runId = Date.now().toString(36);
const counts = {};

async function simulateUser(i) {
  const flagsmith = createFlagsmithInstance();
  await flagsmith.init({ environmentID, api, enableEvents: true, eventProcessorConfig: { eventsApiUrl } });
  await flagsmith.identify(`user_sim_${runId}_${i}`);

  const flag = flagsmith.getExperimentFlag('checkout_button');
  const variant = flag?.value ?? 'missing';
  const c = (counts[variant] ??= { users: 0, purchases: 0 });
  c.users++;

  if (Math.random() < (PURCHASE_RATE[variant] ?? 0)) {
    flagsmith.trackEvent('purchase_completed', { value: 49 });
    c.purchases++;
  }
  await flagsmith.flushEvents();
}

for (let start = 0; start < USERS; start += BATCH) {
  const ids = Array.from({ length: Math.min(BATCH, USERS - start) }, (_, k) => start + k);
  await Promise.all(ids.map(simulateUser));
  process.stdout.write(`\r${Math.min(start + BATCH, USERS)}/${USERS} users`);
}
console.log('\n', counts);
process.exit(0);
