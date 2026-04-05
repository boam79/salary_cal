import { createApp } from './app.js';

const PORT = process.env.PORT || 8080;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Lotto backend listening on :${PORT}`);
});
