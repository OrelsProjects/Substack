import puppeteer, { Page } from "puppeteer";
import SubstackNote from "@/models/subtackNote";

async function scrapeSubstackData(
  userHandler: string,
): Promise<SubstackNote[]> {
  const baseUrl = process.env.SUBSTACK_BASE_URL as string;
  const handler = userHandler.includes("@") ? userHandler : `@${userHandler}`;
  const url = `${baseUrl}/${handler}`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Necessary for most cloud environments
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Click the "Notes" tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const notesButton = buttons.find(button =>
      button.innerText.includes("Notes"),
    );
    if (notesButton) {
      notesButton.click();
    }
  });

  // Wait for the content to load
  await page.waitForSelector(".pencraft._feedItem_1c7tu_110", {
    visible: true,
  });

  // Click all "See more..." buttons
  await expandSeeMoreButtons(page);

  // Check if there are at least 20 notes; if not, keep scrolling and fetching
  await checkAndFetchMoreNotes(page);

  // Scrape data
  const data = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll(".pencraft._feedItem_1c7tu_110"),
    );

    return items
      .filter(
        item =>
          !item
            .querySelector("svg._contextIcon_1c7tu_598")
            ?.nextElementSibling?.textContent?.includes("You restacked"),
      ) // Skip "You restacked" notes
      .map(item => {
        const text =
          item.querySelector(".pencraft._feedCommentBody_1c7tu_300")
            ?.textContent || "";
        const likes = parseInt(
          item.querySelector(".pencraft._digit_1c7tu_687")?.textContent || "0",
          10,
        );
        const comments = parseInt(
          item.querySelector(".pencraft._reply_1c7tu_264 ._digit_1c7tu_687")
            ?.textContent || "0",
          10,
        );
        const restacks = parseInt(
          item.querySelector(".pencraft._restack_1c7tu_777 ._digit_1c7tu_687")
            ?.textContent || "0",
          10,
        );

        return { text, likes, comments, restacks, id: 0 };
      });
  });

  await browser.close();

  // loop over data with for i (number) and set id
  data.forEach((note, i) => {
    note.id = i;
  });

  return data;
}

async function expandSeeMoreButtons(page: Page) {
  const selector = ".pencraft._seeMoreText_1c7tu_178 a";
  let seeMoreExists = (await page.$(selector)) !== null;
  while (seeMoreExists) {
    await page.$$eval(selector, links =>
      links.forEach(link => (link as HTMLElement).click()),
    );
    await waitForPage(500); // wait for content to load
    seeMoreExists = (await page.$(selector)) !== null;
  }
}

async function checkAndFetchMoreNotes(page: Page) {
  let noteCount = await page.evaluate(
    () => document.querySelectorAll(".pencraft._feedItem_1c7tu_110").length,
  );

  while (noteCount < 20) {
    await scrollToEnd(page);
    await waitForPage(3000); // wait for content to load
    await expandSeeMoreButtons(page); // expand any new "See more..." buttons

    // Recalculate note count
    noteCount = await page.evaluate(
      () => document.querySelectorAll(".pencraft._feedItem_1c7tu_110").length,
    );
  }
}

async function scrollToEnd(page: Page) {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
}

async function waitForPage(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export default scrapeSubstackData;
