import puppeteer, { Page } from "puppeteer";
import SubstackNote from "@/models/substackNote";

export type MaxNotes = number | "all";

// Use a more general selector for the "See more..." buttons
const SEE_MORE_BUTTON_SELECTOR = 'a[href="#see-more"]';

function parseDateString(dateString: string): Date | null {
  try {
    // Regex to extract month, day, year, time, and period (AM/PM)
    const datePattern =
      /(\w+)\s+(\d{1,2}),\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)/;
    const match = dateString.match(datePattern);

    if (!match) {
      return null;
    }

    const [, monthStr, day, year, hour, minute, period] = match;

    // Convert month string to month index (0-11)
    const month = new Date(`${monthStr} 1, 2020`).getMonth();

    // Convert to 24-hour format if needed
    let hours = parseInt(hour, 10);
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    // Create a new Date object using extracted parts
    const date = new Date(
      parseInt(year, 10),
      month,
      parseInt(day, 10),
      hours,
      parseInt(minute, 10),
    );

    return date;
  } catch (error) {
    return null;
  }
}

async function countNotes(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll('div[class*="_feedItem_"]'),
    );
    return elements.length;
  });
}

async function extractData(page: Page) {
  const data = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('div[class*="_feedItem_"]'),
    ) as HTMLElement[];

    return items.map((item, index) => {
      const isRestack = item.innerText.toLowerCase().includes("restacked");

      const publishDateElement = item.querySelector("a[title]");
      const publishDateString = publishDateElement
        ? publishDateElement.getAttribute("title")
        : null;

      // Try to get the image within the post attachment, if any
      const imageElement =
        item.querySelector('a[href*="substack.com"] picture img') ||
        item.querySelector("picture img");
      const image = imageElement ? imageElement.getAttribute("src") : null;

      // Check if there's an Open Graph image (in the post attachment)
      const hasOpenGraphImage = !!item.querySelector(
        'a[href*="substack.com"] picture img',
      );

      const textElement = item.querySelector('div[class*="_feedCommentBody_"]');
      const text = textElement?.textContent
        ? textElement.textContent.trim()
        : "";

      const likesElement = item.querySelector(
        'button[class*="_like_"] ._digit_',
      );
      const likes = likesElement?.textContent
        ? parseInt(likesElement.textContent.trim() || "0", 10)
        : 0;

      const commentsElement = item.querySelector(
        'button[class*="_reply_"] ._digit_',
      );
      const comments = commentsElement?.textContent
        ? parseInt(commentsElement.textContent.trim() || "0", 10)
        : 0;

      const restacksElement = item.querySelector(
        'button[class*="_restack_"] ._digit_',
      );
      const restacks = restacksElement?.textContent
        ? parseInt(restacksElement.textContent.trim() || "0", 10)
        : 0;

      return {
        text,
        isRestack,
        publishDate: publishDateString,
        image,
        hasOpenGraphImage,
        likes,
        comments,
        restacks,
        id: index.toString(),
      };
    });
  });

  return data;
}

async function scrapeSubstackData(
  userHandler: string,
  maxNotes: MaxNotes,
): Promise<SubstackNote[]> {
  const baseUrl = process.env.SUBSTACK_BASE_URL as string;
  const handler = userHandler.includes("@") ? userHandler : `@${userHandler}`;
  const url = `${baseUrl}/${handler}`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Necessary for most cloud environments
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Check if there are at least maxNotes notes; if not, keep scrolling and fetching
  await checkAndFetchMoreNotes(page, maxNotes);

  // Click all "See more..." buttons
  await expandSeeMoreButtons(page);

  // Scrape data
  const data = await extractData(page);

  await browser.close();

  // Parse publishDate strings to Date objects
  const notes = data
    .filter(note => note.text !== "")
    .map(note => ({
      ...note,
      publishDate: note.publishDate ? parseDateString(note.publishDate) : null,
    }));

  return notes;
}

async function expandSeeMoreButtons(page: Page) {
  const selector = 'a[href="#see-more"]';
  let seeMoreExists = (await page.$(selector)) !== null;
  while (seeMoreExists) {
    await page.$$eval(selector, links =>
      links.forEach(link => (link as HTMLElement).click()),
    );
    await waitForPage(500); // wait for content to load
    seeMoreExists = (await page.$(selector)) !== null;
  }
}

async function checkAndFetchMoreNotes(page: Page, maxNotes: MaxNotes) {
  let noteCountNotEmpty = 0;
  const maxNotesCount = maxNotes === "all" ? 10 : maxNotes;

  let previousNoteCount = 0;
  let attemptsWithoutNewNotes = 0;
  const maxAttempts = 3;

  while (
    noteCountNotEmpty < maxNotesCount &&
    attemptsWithoutNewNotes < maxAttempts
  ) {
    if (noteCountNotEmpty === previousNoteCount) {
      attemptsWithoutNewNotes++;
    } else {
      attemptsWithoutNewNotes = 0; // Reset if new notes are loaded
    }

    previousNoteCount = noteCountNotEmpty;
    const data = await extractData(page);
    const dataNoEmpty = data.filter(note => note.text !== "");
    noteCountNotEmpty = dataNoEmpty.length;

    await scrollToEnd(page);
    await waitForPage(3000); // wait for content to load
    await expandSeeMoreButtons(page); // expand any new "See more..." buttons
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
