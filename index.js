// @ts-check
const fs = require("fs");
const puppeteer = require("puppeteer");

function inDocker() {
  return new Promise(resolve =>
    fs.access("/.dockerenv", error => resolve(!error))
  );
}

/**
 * @param {import("puppeteer").Page} page
 * @param {URL} url
 */
async function initializeSandbox(page, url) {
  const loadingTitle = "Sandbox - CodeSandbox";
  const loadingText = "Initializing Sandbox Container";
  await page.goto(url.href);
  await page.waitForFunction(
    `document.title !== "${loadingTitle}" && !document.body.textContent.includes("${loadingText}")`
  );
}

/**
 * @param {string} repo GitHub owner and repository names in the form of "owner/repo".
 * @param {URL} url The URL in the browser pane of CodeSandbox.
 */
async function main(repo, url) {
  const options = (await inDocker()) ? { args: ["--no-sandbox"] } : {};
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  if (url) await initializeSandbox(page, url);

  const response = await page.goto(`https://codesandbox.io/s/github/${repo}`);
  await browser.close();

  if (response.status() !== 200) {
    throw new Error(
      `Fail to sync your GitHub repository changes to CodeSandbox (${response.status()})`
    );
  }

  console.log("Success to sync your GitHub repository changes to CodeSandbox");
}

module.exports = main;
