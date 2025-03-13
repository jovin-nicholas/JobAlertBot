import * as cheerio from "cheerio"
import { normalizeUrl, extractDomain } from "@/lib/utils"

// Define job scraping interfaces
interface ScrapeOptions {
  company: string
  isUrl: boolean
  keywords: string[]
}

interface ScrapedJob {
  title: string
  company: string
  description?: string
  url: string | URL
  location?: string
  postedAt?: Date
}

// Map of company domains to their specific scraping functions
const companyScraper: Record<string, (html: string, baseUrl: string) => ScrapedJob[]> = {
  "google.com": scrapeGoogle,
  "microsoft.com": scrapeMicrosoft,
  "apple.com": scrapeApple,
  // Add more company-specific scrapers as needed
}

// Generic scraper for career pages
function scrapeGeneric(html: string, baseUrl: string): ScrapedJob[] {
  const $ = cheerio.load(html)
  const jobs: ScrapedJob[] = []
  const domain = extractDomain(baseUrl)

  console.log(`Generic scraping jobs from ${domain}`)
  
  // Look for common job listing patterns
  // This is a simplified example - real implementation would be more robust
  $("a").each((_, element) => {
    const $el = $(element)
    const href = $el.attr("href")
    const text = $el.text().trim()

    // Skip if no href or text
    if (!href || !text) return

    // Check if this looks like a job link
    const jobIndicators = ["jobs", "careers", "position", "opening", "apply"]
    const isJobLink = jobIndicators.some(
      (indicator) => text.toLowerCase().includes(indicator) || href.toLowerCase().includes(indicator),
    )

    if (isJobLink) {
      console.log(`Found potential job link: ${text} (${href})`)
      const url = href.startsWith("http") ? href : new URL(href, baseUrl).toString()

      jobs.push({
        title: text,
        company: domain,
        url,
        // Other fields would be populated in a real implementation
      })
    }
  })

  return jobs
}

// Company-specific scrapers
function scrapeGoogle(html: string, baseUrl: string): ScrapedJob[] {
  const $ = cheerio.load(html)
  const jobs: ScrapedJob[] = []

  // Google-specific selectors would go here
  // This is a placeholder implementation

  return jobs
}

function scrapeMicrosoft(html: string, baseUrl: string): ScrapedJob[] {
  const $ = cheerio.load(html)
  const jobs: ScrapedJob[] = []

  // Microsoft-specific selectors would go here
  // This is a placeholder implementation

  return jobs
}

function scrapeApple(html: string, baseUrl: string): ScrapedJob[] {
  console.log("Scraping Apple jobs")
  const $ = cheerio.load(html)
  const jobs: ScrapedJob[] = []

  // Apple-specific selectors
  $("ul.jobs-list li").each((_, element) => {
    const $el = $(element)
    const title = $el.find("h2.job-title").text().trim()
    const location = $el.find("span.job-location").text().trim()
    const url = new URL($el.find("a.job-link").attr("href"), baseUrl).toString()
    const description = $el.find("div.job-description").text().trim()

    if (title && url) {
      jobs.push({
        title,
        company: "Apple",
        url,
        location,
        description,
      })
    }
  })

  return jobs
}

// Main scraping function
export async function scrapeJobs(options: ScrapeOptions): Promise<ScrapedJob[]> {
  try {
    const { company, isUrl, keywords } = options

    // Determine the URL to scrape
    let url: string

    if (isUrl) {
      url = company
    } else {
      // If company name is provided, try to find its career page
      url = `https://careers.${company.toLowerCase().replace(/\s+/g, "")}.com`
    }

    // Normalize URL
    url = normalizeUrl(url)

    // Fetch the page
    console.log(`Scraping jobs from ${url}`)
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // Determine which scraper to use
    const domain = extractDomain(url)
    const scraper = companyScraper[domain] || scrapeGeneric

    // Scrape jobs
    let jobs = scraper(html, url)

    // Filter by keywords if provided
    if (keywords && keywords.length > 0) {
      const keywordRegexes = keywords.map((keyword) => new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"))

      jobs = jobs.filter((job) =>
        keywordRegexes.some((regex) => regex.test(job.title) || (job.description && regex.test(job.description))),
      )
    }

    return jobs
  } catch (error) {
    console.error(`Error scraping jobs:`, error)
    return []
  }
}

// Function to scrape job details from a specific job page
export async function scrapeJobDetails(url: string): Promise<Partial<ScrapedJob>> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract job details
    // This is a simplified example - real implementation would be more robust
    const title = $("h1").first().text().trim()
    const description = $("div.job-description, div.description, section.description").text().trim()
    const location = $("div.location, span.location").text().trim()

    return {
      title,
      description,
      location,
    }
  } catch (error) {
    console.error(`Error scraping job details from ${url}:`, error)
    return {}
  }
}

