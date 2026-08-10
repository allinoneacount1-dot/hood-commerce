import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3311";
const OUT = "/tmp/shots";
fs.mkdirSync(OUT, { recursive: true });

const consoleErrors = [];

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1366, height: 850 } });
page.setDefaultTimeout(90_000);

page.on("console", (msg) => {
  if (msg.type() === "error") {
    const t = msg.text();
    // network failures to blocked-in-sandbox APIs are expected here
    if (/Failed to load resource|ERR_|fetch|NetworkError|net::/i.test(t)) return;
    consoleErrors.push(t);
  }
});
page.on("pageerror", (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));

// ——— landing at several scroll depths ———
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(9000); // preloader + hero entrance + scene boot
await page.screenshot({ path: `${OUT}/01-hero.png` });

const H = await page.evaluate(() => document.body.scrollHeight - innerHeight);
const stops = [0.09, 0.2, 0.3, 0.38, 0.47, 0.56, 0.66, 0.76, 0.86, 1.0];
for (let i = 0; i < stops.length; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * stops[i]));
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `${OUT}/02-scroll-${String(i).padStart(2, "0")}.png` });
}

// ——— desk pages ———
const deskPages = ["", "/snipe", "/scanner", "/routes", "/quiver", "/ledger"];
for (const p of deskPages) {
  await page.goto(`${BASE}/desk${p}`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(1800);
  await page.screenshot({
    path: `${OUT}/10-desk${p.replace("/", "-") || "-command"}.png`,
    fullPage: true,
  });
}

// ——— command interaction: type an intent, watch the parser ———
await page.goto(`${BASE}/desk`, { waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(1500);
const input = page.locator("input[placeholder*='Speak an intent']");
await input.fill("Snipe Pudgy Penguins if the floor drops below 8 ETH, scan for rugs first");
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/20-command-parsed.png`, fullPage: true });

// quiver signing
await page.goto(`${BASE}/desk/quiver`, { waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(1200);
const signBtn = page.getByText("Sign with session key");
await signBtn.click().catch(() => {});
await page.waitForTimeout(700);
const verifyBtn = page.getByText("Recover & verify");
await verifyBtn.click().catch(() => {});
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/21-quiver-signed.png`, fullPage: true });

// mobile hero
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(2600);
await page.screenshot({ path: `${OUT}/30-mobile-hero.png` });
await page.goto(`${BASE}/desk`, { waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/31-mobile-desk.png`, fullPage: true });

console.log("CONSOLE ERRORS (non-network):", consoleErrors.length);
consoleErrors.slice(0, 12).forEach((e) => console.log(" -", e.slice(0, 220)));

await browser.close();
