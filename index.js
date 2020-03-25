// @ts-check
const fs = require("fs");
const arg = require("arg");
const puppeteer = require("puppeteer");
const { GITHUB_REPOSITORY } = process.env;

function inDocker() {
  return new Promise(resolve =>
    fs.access("/.dockerenv", error => resolve(!error))
  );
}

async function main() {
  const args = arg({
    "-h": "--help",
    "--help": Boolean
  });

  if (args["--help"]) {
    console.log(
      [
        `Usage: ${process.argv0} [options] repo`,
        "Options:",
        " -h, --help  print command line options"
      ].join("\n")
    );
    return;
  }

  const repo = args._[0] || GITHUB_REPOSITORY;
  if (repo == null) {
    throw new Error(
      "sync-codesandbox requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
    );
  }

  const options = (await inDocker()) ? { args: ["--no-sandbox"] } : {};
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
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
