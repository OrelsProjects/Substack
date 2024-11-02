import puppeteer, { Browser, Page } from "puppeteer";

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
): Promise<any[]> {
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

  // Navigate to the LinkedIn recent activity page
  await page.goto(
    "https://www.linkedin.com/in/ali-abdaal/recent-activity/all/",
  );
  await waitForPage(3000); // Wait for 3 seconds

  // Scrape LinkedIn posts data
  const postsData = await scrapeLinkedInPosts(page);

  console.log(postsData);

  // Optionally, close the browser after the operations are complete
  await browser.close();
  return postsData;
}

// Function to wait for a specified time (in milliseconds)
async function waitForPage(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Updated function to scrape LinkedIn posts based on the new logic
async function scrapeLinkedInPosts(page: Page): Promise<any[]> {
  const postsData: any[] = [];
  let lastPostIndex = 0;
  const scrollOffset = 800; // Adjust scroll offset as needed
  const maxTimesFoundEmptyText = 3;
  let timesFoundEmptyText = 0;

  while (true) {
    // Scrape posts starting from lastPostIndex until text == "" is found
    const { posts, foundEmptyText } = await scrapePostsUntilEmptyText(
      page,
      lastPostIndex,
    );
    postsData.push(...posts);
    lastPostIndex += posts.length;

    if (foundEmptyText) {
      timesFoundEmptyText++; // Increment the counter
      if (timesFoundEmptyText >= maxTimesFoundEmptyText) {
        // If we've found empty text the maximum number of times, break
        break;
      }

      // Check if we are at the bottom of the page
      const isAtBottom = await page.evaluate(() => {
        return (
          window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
        );
      });

      if (isAtBottom) {
        // Try clicking the "Load more" button
        const loadMoreButtonExists = await page.evaluate(() => {
          const loadMoreButton = document.querySelector(
            "button.scaffold-finite-scroll__load-button",
          ) as HTMLElement;
          if (loadMoreButton) {
            loadMoreButton.click();
            return true;
          } else {
            return false;
          }
        });

        if (!loadMoreButtonExists) {
          // No more posts to load, finish
          break;
        } else {
          timesFoundEmptyText = 0; // Reset the counter after loading more posts
          // Wait for new posts to load
          await waitForPage(2000);
        }
      } else {
        // Scroll down by offset amount, wait 2 seconds, and continue
        await scrollByAmount(page, scrollOffset);
        await waitForPage(2000);
      }
    } else {
      // No empty text found, continue scraping
      timesFoundEmptyText = 0; // Reset the counter
    }
  }

  return postsData;
}

// Function to scrape posts until an empty text post is found
async function scrapePostsUntilEmptyText(
  page: Page,
  startIndex: number,
): Promise<{ posts: any[]; foundEmptyText: boolean }> {
  // Wait for posts to be present
  await page.waitForSelector(
    "li.profile-creator-shared-feed-update__container",
    { visible: true },
  );

  // Evaluate the posts on the page
  return page.evaluate(startIndex => {
    const posts = Array.from(
      document.querySelectorAll(
        "li.profile-creator-shared-feed-update__container",
      ),
    ).slice(startIndex);
    const scrapedPosts: any[] = [];
    let foundEmptyText = false;

    for (const post of posts) {
      // Ignore reposted content
      const isRepost = post
        .querySelector(
          ".update-components-header__text-wrapper span.update-components-header__text-view",
        )
        ?.textContent?.includes("reposted this");
      if (isRepost) continue;

      // Extract text content
      const textElement = post.querySelector(
        ".update-components-text .break-words",
      );
      const text = textElement ? textElement.textContent?.trim() : "";

      // If text is empty, set flag and break
      if (text === "") {
        foundEmptyText = true;
        break;
      }

      // Extract likes count
      const likesElement = post.querySelector(
        "span.social-details-social-counts__reactions-count",
      );
      const likes = likesElement
        ? parseInt(likesElement.textContent?.trim() || "0", 10)
        : 0;

      // Extract comments count
      const commentsElement = post.querySelector(
        'li.social-details-social-counts__comments button span[aria-hidden="true"]',
      );
      const comments = commentsElement
        ? parseInt(
            commentsElement.textContent?.replace(" comments", "").trim() || "0",
            10,
          )
        : 0;

      // Extract repost count
      const repostsElement = post.querySelector(
        'li.social-details-social-counts__item.social-details-social-counts__item--right-aligned button span[aria-hidden="true"]',
      );
      const reposts = repostsElement
        ? parseInt(
            repostsElement.textContent?.replace(" reposts", "").trim() || "0",
            10,
          )
        : 0;

      // Extract image URL if present
      let imageUrl: string | null = null;
      const imageElement = post.querySelector(
        ".lazy-image img",
      ) as any;
      if (imageElement) {
        imageUrl = imageElement.src;
      }

      // Check if the post has a video
      const hasVideo = !!post.querySelector(
        ".update-components-linkedin-video",
      );

      // Check if the post has a carousel
      const hasCarousel = !!post.querySelector(".carousel-track");

      scrapedPosts.push({
        text,
        likes,
        comments,
        reposts,
        image: imageUrl,
        hasVideo,
        hasCarousel,
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
