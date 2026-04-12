export default {
  testDir: './tests-e2e-app',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:5180',
    headless: true,
  },
  webServer: {
    command: 'npm run build:app && npm run preview -w salary-cal-frontend-app',
    url: 'http://127.0.0.1:5180/app/',
    reuseExistingServer: true,
    timeout: 180000,
  },
};
