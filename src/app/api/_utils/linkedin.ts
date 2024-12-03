import { LinkedInPosts } from "@prisma/client";
import puppeteer, { Browser, Page } from "puppeteer";

type ScrapedPosts = Omit<LinkedInPosts, "id" | "url">;
export type PostsNoId = Omit<LinkedInPosts, "id">;

// Reuse the login function from the previous code
async function login(
  page: Page,
  username: string,
  password: string,
): Promise<void> {
  const emailSelector = 'input#username[name="session_key"]';
  const passwordSelector = 'input#password[name="session_password"]';

  await page.waitForSelector(emailSelector, { visible: true });
  await page.type(emailSelector, username, { delay: 100 });

  await page.waitForSelector(passwordSelector, { visible: true });
  await page.type(passwordSelector, password, { delay: 100 });

  const submitButtonSelector = 'button[type="submit"]';
  await page.waitForSelector(submitButtonSelector, { visible: true });
  await page.click(submitButtonSelector);
}

// Function to initialize LinkedIn login
export async function initLinkedInLogin(
  username: string,
  password: string,
  name: string,
): Promise<PostsNoId[]> {
  const browser: Browser = await puppeteer.launch({
    headless: false, // Set to false for debugging purposes
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page: Page = await browser.newPage();
  await page.goto("https://www.linkedin.com/login", {
    waitUntil: "networkidle2",
  });

  // Perform login
  await login(page, username, password);

  const url = `https://www.linkedin.com/in/${name}/recent-activity/all/`;

  // Navigate to the LinkedIn recent activity page
  await page.goto(url);
  await waitForPage(3000); // Wait for 3 seconds

  // Scrape LinkedIn posts data
  const postsData: ScrapedPosts[] = await scrapeLinkedInPosts(page);

  console.log(postsData);

  // Optionally, close the browser after the operations are complete
  await browser.close();
  return postsData.map(post => ({
    ...post,
    url,
  }));
}

// Function to wait for a specified time (in milliseconds)
async function waitForPage(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Updated function to scrape LinkedIn posts based on the new logic
async function scrapeLinkedInPosts(page: Page): Promise<any[]> {
  const postsData: any[] = [];
  const minScrollOffset = 100;
  const maxPosts = 300;
  let scrollOffset = 100; // Adjust scroll offset as needed
  const maxTimesFoundEmptyText = 6;
  let whileLoopFlag = true;
  let lastPostIndex = 0;
  let timesFoundEmptyText = 0;
  let scrollBackCount = 0;
  const maxScrollBacks = 10;

  try {
    while (whileLoopFlag) {
      if (postsData.length >= maxPosts) {
        break;
      }
      console.log("Current postsData length: ", postsData.length);

      // Scrape posts starting from lastPostIndex until text == "" is found
      const { posts, needScrollBack } = await scrapePostsUntilEmptyText(
        page,
        lastPostIndex,
      );

      if (needScrollBack) {
        if (scrollBackCount < maxScrollBacks) {
          await scrollByAmount(page, -500);
          await waitForPage(2000);
          scrollBackCount++;
          continue;
        } else {
          scrollBackCount = 0;
          // Reached max scrollbacks, proceed without further scroll back
          console.log("Reached max scroll back attempts, proceeding...");
        }
      }

      postsData.push(...posts);
      scrollOffset = posts.length * minScrollOffset;
      scrollOffset =
        scrollOffset < minScrollOffset ? minScrollOffset : scrollOffset;
      lastPostIndex += posts.length;

      if (posts.length === 0) {
        timesFoundEmptyText++; // Increment the counter
        if (timesFoundEmptyText >= maxTimesFoundEmptyText) {
          whileLoopFlag = false;
        }
        if (timesFoundEmptyText >= 3) {
          // Try clicking the "Show more results" button
          const showMoreButtonClicked = await page.evaluate(() => {
            const showMoreButton = document.querySelector(
              "button.scaffold-finite-scroll__load-button",
            ) as HTMLElement;
            if (showMoreButton) {
              showMoreButton.click();
              return true;
            } else {
              return false;
            }
          });

          if (showMoreButtonClicked) {
            timesFoundEmptyText = 0; // Reset the counter after clicking the button
            await waitForPage(3000); // Wait for new posts to load
            await scrollByAmount(page, 600); // Scroll down
            continue;
          }
        }
        await scrollByAmount(page, scrollOffset);
        await waitForPage(2000);
      } else {
        // Reset the counter
        timesFoundEmptyText = 0;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    return postsData;
  }
}
async function scrapePostsUntilEmptyText(
  page: Page,
  startIndex: number,
): Promise<{
  posts: ScrapedPosts[];
  foundEmptyText: boolean;
  needScrollBack?: boolean;
}> {
  await page.waitForSelector('div.feed-shared-update-v2[role="region"][data-urn]', { visible: true });

  return page.evaluate(startIndex => {
    const posts = Array.from(
      document.querySelectorAll('div.feed-shared-update-v2[role="region"][data-urn]')
    ).slice(startIndex);
    let foundEmptyText = false;

    const scrapedPosts: ScrapedPosts[] = [];

    for (const post of posts) {
      // Check if the post is a repost
      let isRepost = post.querySelector(".update-components-mini-update-v2") !== null;

      // Extract text content
      const textElement = post.querySelector(".update-components-text .break-words");
      const text = textElement ? textElement.textContent?.trim() : "";

      if (!text) {
        foundEmptyText = true;
        break;
      }

      // Extract date
      const dateElement = post.querySelector(
        "a.update-components-actor__sub-description-link > span.update-components-actor__sub-description"
      );
      let date = "";
      if (dateElement) {
        const dateText = dateElement.textContent?.trim() || "";
        date = dateText.split("•")[0].trim();
      }

      // Extract likes count
      const likesElement = post.querySelector("span.social-details-social-counts__reactions-count");
      const likes = likesElement
        ? parseInt(likesElement.textContent?.trim().replace(/,/g, "") || "0", 10)
        : 0;

      // Extract comments count
      const commentsButton = post.querySelector("li.social-details-social-counts__comments button");
      const commentsText = commentsButton ? commentsButton.textContent?.trim() || "" : "";
      const commentsMatch = commentsText.match(/\d+/);
      const comments = commentsMatch ? parseInt(commentsMatch[0], 10) : 0;

      // Extract repost count
      let reposts = 0;
      const countItems = post.querySelectorAll("li.social-details-social-counts__item");
      for (const item of countItems) {
        const button = item.querySelector("button");
        const span = button?.querySelector("span");
        const text = span?.textContent?.trim().toLowerCase() || "";
        if (text.includes("repost")) {
          const match = text.match(/(\d+)/);
          if (match) {
            reposts = parseInt(match[1], 10);
          }
          break;
        }
      }

      // Extract image URL
      let imageUrl: string | null = null;
      const imageElement = post.querySelector("img.update-components-image__image") as HTMLImageElement | null;
      if (imageElement) {
        imageUrl = imageElement.getAttribute("data-delayed-url") || imageElement.src;
      }

      // Check for video and carousel
      const hasVideo = !!post.querySelector(".update-components-linkedin-video");
      const hasCarousel = !!post.querySelector(".carousel-track");

      scrapedPosts.push({
        content: text || "",
        date,
        likes,
        comments,
        reposts,
        image: imageUrl || null,
        hasVideo,
        hasCarousel,
        isRepost,
      });
    }

    return { posts: scrapedPosts, foundEmptyText };
  }, startIndex);
}


// Function to scroll down by a specific amount
async function scrollByAmount(page: Page, amount: number): Promise<void> {
  await page.evaluate(amount => {
    window.scrollBy(0, amount);
  }, amount);
}
