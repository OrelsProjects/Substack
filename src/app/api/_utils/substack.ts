import puppeteer, { Page } from "puppeteer";
import SubstackNote from "@/models/substackNote";

const SEE_MORE_BUTTON_SELECTOR = ".pencraft._seeMoreText_1c7tu_178 a";

export type MaxNotes = number | "all";

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
  return await page.evaluate(
    () => document.querySelectorAll(".pencraft._feedItem_1c7tu_110").length,
  );
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

  await waitForPage(2000);

  // Check if there are at least maxNotes notes; if not, keep scrolling and fetching
  await checkAndFetchMoreNotes(page, maxNotes);

  // Click all "See more..." buttons
  await expandSeeMoreButtons(page);

  // Scrape data
  const data = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll(".pencraft._feedItem_1c7tu_110"),
    );
    return items.map(item => {
      const isRestack = !!item
        .querySelector("svg._contextIcon_1c7tu_598")
        ?.nextElementSibling?.textContent?.toLocaleLowerCase()
        ?.includes("restacked");

      const publishDateString = item
        .querySelector(
          ".pencraft.pc-reset._color-secondary_3axfk_186._decoration-hover-underline_3axfk_298._reset_3axfk_1 > a._link_1ixw5_1",
        )
        ?.getAttribute("title");

      // if has <picture> tag and inside it an image with class="_img_16u6n_1 pencraft pc-reset"
      const image =
        item
          .querySelector(
            "._image_1dmry_1 picture img._img_16u6n_1.pencraft.pc-reset",
          )
          ?.getAttribute("src") || null; // Fetch img src or return null if not found

      const hasOpenGraphImage = !!item.querySelector(
        "a._post_1c7tu_608 picture img._img_16u6n_1._postImage_1c7tu_619.pencraft.pc-reset",
      );

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

      return {
        text,
        isRestack,
        publishDate: publishDateString,
        image,
        hasOpenGraphImage,
        likes,
        comments,
        restacks,
        id: "0",
      };
    });
  });

  await browser.close();

  // loop over data with for i (number) and set id
  const notes = data.map((note, i) => ({
    ...note,
    id: `${i}`,
    publishDate: note.publishDate ? parseDateString(note.publishDate) : null,
  }));

  return notes;
}

async function expandSeeMoreButtons(page: Page) {
  const selector = SEE_MORE_BUTTON_SELECTOR;
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
  let noteCount = await countNotes(page);
  const maxNotesCount = maxNotes === "all" ? 100 : maxNotes;

  let previousNoteCount = 0;
  let attemptsWithoutNewNotes = 0;
  const maxAttempts = 3;

  while (noteCount < maxNotesCount && attemptsWithoutNewNotes < maxAttempts) {
    if (noteCount === previousNoteCount) {
      attemptsWithoutNewNotes++;
    } else {
      attemptsWithoutNewNotes = 0; // Reset if new notes are loaded
    }

    previousNoteCount = noteCount;

    await scrollToEnd(page);
    await waitForPage(3000); // wait for content to load
    await expandSeeMoreButtons(page); // expand any new "See more..." buttons

    // Recalculate note count
    noteCount = await countNotes(page);
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
