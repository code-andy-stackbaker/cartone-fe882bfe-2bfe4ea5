import { createApp } from "./app";

const DEV_FALLBACK_PORT = 8080;
const port = Number(process.env.PORT) || DEV_FALLBACK_PORT;

createApp().listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`CartOne API listening on port ${port}`);
});
