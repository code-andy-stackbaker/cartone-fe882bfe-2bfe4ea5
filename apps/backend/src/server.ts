import { createApp } from "./app";

/** Dev fallback only — the platform injects PORT at deploy. */
const DEV_FALLBACK_PORT = 6000;
const port = Number(process.env.PORT) || DEV_FALLBACK_PORT;

createApp().listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`CartOne API listening on port ${port}`);
});
