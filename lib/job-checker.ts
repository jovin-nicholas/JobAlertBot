import { db } from "@/lib/db"
import { scrapeJobs } from "@/lib/scraper"
import { sendJobAlertEmail } from "@/lib/mailer"

export async function checkJobAlerts(alertId: string) {
  try {
    console.log(`Checking job alert ${alertId}`)

    // Get the job alert
    const alert = await db.jobAlert.findUnique({
      where: { id: alertId },
      include: { companies: true, keywords: true },
    })

    if (!alert || !alert.active) {
      console.log(`Job alert ${alertId} is not active, skipping check`)
      return
    }

    // Get existing jobs for this alert
    const existingJobs = await db.job.findMany({
      where: { jobAlertId: alertId },
      select: { url: true },
    })

    const existingJobUrls = new Set(existingJobs.map((job) => job.url))

    // Scrape jobs for each company
    let newJobs = []

    for (const company of alert.companies) {
      try {
        // Determine if the company is a URL or a name
        const isUrl = company.name.startsWith("http")

        // Scrape jobs
        const scrapedJobs = await scrapeJobs({
          company: company.name,
          isUrl,
          keywords: alert.keywords.map((keyword) => keyword.word),
        })

        console.log(`Scraped ${scrapedJobs.length} jobs for company ${company.name}`)

        // Filter out existing jobs
        const filteredJobs = scrapedJobs.filter((job) => !existingJobUrls.has(job.url))

        // Add to new jobs
        newJobs = [...newJobs, ...filteredJobs]
      } catch (error) {
        console.error(`Error scraping jobs for company ${company}:`, error)
      }
    }

    if (newJobs.length === 0) {
      console.log(`No new jobs found for alert ${alertId}`)
      return
    }

    console.log(`Found ${newJobs.length} new jobs for alert ${alertId}`)

    // Save new jobs to database
    const savedJobs = await Promise.all(
      newJobs.map((job) =>
        db.job.create({
          data: {
            title: job.title,
            company: job.company,
            description: job.description,
            url: job.url,
            location: job.location,
            postedAt: job.postedAt,
            jobAlertId: alertId,
          },
        }),
      ),
    )

    // Send notification email
    await sendJobAlertEmail({
      email: alert.email,
      jobs: savedJobs,
      alert,
    })

    // Mark jobs as notified
    await db.job.updateMany({
      where: {
        id: {
          in: savedJobs.map((job) => job.id),
        },
      },
      data: {
        notified: true,
      },
    })

    console.log(`Sent notification for ${savedJobs.length} new jobs for alert ${alertId}`)
  } catch (error) {
    console.error(`Error checking job alert ${alertId}:`, error)
  }
}

