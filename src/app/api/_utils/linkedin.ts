import { LinkedInPosts } from "@prisma/client";
import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";

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
  names: string[],
): Promise<PostsNoId[]> {
  const browser: Browser = await puppeteer.launch({
    headless: false, // Set to false for debugging purposes
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page: Page = await browser.newPage();
  await page.goto("https://www.linkedin.com/login", {
    waitUntil: "networkidle2",
  });

  const allPostsData: PostsNoId[] = [];

  // Perform login
  await login(page, username, password);
  for (const name of names) {
    try {
      const url = `https://www.linkedin.com/in/${name}/recent-activity/all/`;

      // Navigate to the LinkedIn recent activity page
      await page.goto(url);
      await waitForPage(3000); // Wait for 3 seconds

      // Scrape LinkedIn posts data
      const postsData: ScrapedPosts[] = await scrapeLinkedInPosts(page);
      const postsNoId = postsData.map(post => ({
        ...post,
        url,
      }));
      allPostsData.push(...postsNoId);
    } catch (error) {
      console.error(`Error processing ${name}: ${error}`);
    }
  }

  // Optionally, close the browser after the operations are complete
  await browser.close();
  return allPostsData;
}

// Function to wait for a specified time (in milliseconds)
async function waitForPage(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Updated function to scrape LinkedIn posts based on the new logic
// Function to scrape posts with the new functionality
async function scrapeLinkedInPosts(page: Page): Promise<ScrapedPosts[]> {
  const maxPosts = 5000; // Adjust as needed
  const scrollOffset = 500; // Adjust as needed
  const maxBatch = 20; // Adjust as needed
  let totalPostsCollected = 0;
  let previousItemCount = 0;
  let sameCountTimes = 0;
  const maxSameCountTimes = 15;
  const maxAttemptsBeforeClick = 5;

  try {
    while (
      totalPostsCollected < maxPosts &&
      sameCountTimes < maxSameCountTimes
    ) {
      // Scroll down by a fixed amount
      await page.evaluate(offset => window.scrollBy(0, offset), scrollOffset);
      await waitForPage(1000); // Wait for 2 seconds

      // Collect the HTML of all posts loaded so far
      const postsHTML = await page.evaluate(() => {
        const posts = Array.from(
          document.querySelectorAll(
            'div.feed-shared-update-v2[role="region"][data-urn]',
          ),
        );
        return posts.map(post => post.outerHTML);
      });

      const currentItemCount = postsHTML.length;

      if (currentItemCount === previousItemCount) {
        sameCountTimes++;
        if (sameCountTimes >= maxAttemptsBeforeClick) {
          // Look for the "Load More" button
          const loadMoreButtonClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const loadMoreButton = buttons.find(button =>
              button.textContent?.trim().includes("Show more"),
            ) as HTMLElement;

            if (loadMoreButton) {
              loadMoreButton.click();
              return true;
            } else {
              return false;
            }
          });

          if (loadMoreButtonClicked) {
            console.log("Clicked the 'Load More' button.");
            // await page.waitForTimeout(3000); // Wait for new content to load
            await waitForPage(1500); // Wait for new content to load
            sameCountTimes = 0; // Reset the counter after clicking the button
            continue;
          }
        }
      } else {
        sameCountTimes = 0; // Reset counter if new items are found
      }

      previousItemCount = currentItemCount;

      // Update total posts collected
      totalPostsCollected = currentItemCount;
      console.log(`Total posts collected: ${totalPostsCollected}`);

      // Break if we've reached the maxPosts limit
      if (totalPostsCollected >= maxPosts) {
        break;
      }
    }
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    const postsData = await processPostsHTML(page);
    return postsData;
  }
}

// Function to process posts HTML
async function processPostsHTML(page: Page): Promise<ScrapedPosts[]> {
  // Evaluate the posts on the page
  const postsData = await page.evaluate(() => {
    const posts = Array.from(
      document.querySelectorAll(
        'div.feed-shared-update-v2[role="region"][data-urn]',
      ),
    );

    const scrapedPosts: ScrapedPosts[] = [];

    for (const post of posts) {
      // Check if the post is a repost
      const isRepost =
        post.querySelector(".update-components-mini-update-v2") !== null;

      // Extract text content
      const textElement = post.querySelector(
        ".update-components-text .break-words",
      );
      const text = textElement ? textElement.textContent?.trim() : "";

      // Skip if text is empty
      if (!text) {
        continue;
      }

      // Extract date
      const dateElement = post.querySelector(
        "a.update-components-actor__sub-description-link > span.update-components-actor__sub-description",
      );
      let date = "";
      if (dateElement) {
        const dateText = dateElement.textContent?.trim() || "";
        date = dateText.split("•")[0].trim();
      }

      // Extract likes count
      const likesElement = post.querySelector(
        "span.social-details-social-counts__reactions-count",
      );
      const likes = likesElement
        ? parseInt(
            likesElement.textContent?.trim().replace(/,/g, "") || "0",
            10,
          )
        : 0;

      // Extract comments count
      const commentsButton = post.querySelector(
        "li.social-details-social-counts__comments button",
      );
      const commentsText = commentsButton
        ? commentsButton.textContent?.trim() || ""
        : "";
      const commentsMatch = commentsText.match(/\d+/);
      const comments = commentsMatch ? parseInt(commentsMatch[0], 10) : 0;

      // Extract repost count
      let reposts = 0;
      const countItems = Array.from(
        post.querySelectorAll("li.social-details-social-counts__item"),
      );
      for (const item of countItems) {
        const button = item.querySelector("button");
        const span = button?.querySelector("span");
        const text = span?.textContent?.trim().toLowerCase() || "";
        if (text.includes("repost")) {
          const match = text.match(/(\d+)/);
          if (match) {
            reposts = parseInt(match[1], 10);
          }
          break; // Repost count found, exit the loop
        }
      }

      // Extract image URL
      let imageUrl: string | null = null;
      const imageElement = post.querySelector(
        "img.update-components-image__image",
      );
      if (imageElement) {
        imageUrl =
          imageElement.getAttribute("data-delayed-url") ||
          (imageElement as HTMLImageElement).src;
      }

      // Check for video and carousel
      const hasVideo = !!post.querySelector(
        ".update-components-linkedin-video",
      );

      // Extract video URL
      let videoUrl: string | null = null;
      const videoElement = post.querySelector("video.vjs-tech");
      if (videoElement) {
        videoUrl = videoElement.getAttribute("src");
      }
      const hasCarousel = !!post.querySelector(".carousel-track");

      scrapedPosts.push({
        content: text,
        date,
        likes,
        comments,
        reposts,
        image: imageUrl,
        hasVideo,
        videoUrl,
        hasCarousel,
        isRepost,
      });
    }

    return scrapedPosts;
  });

  return postsData;
}
