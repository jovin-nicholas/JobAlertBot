import { db } from "@/lib/db"
import { checkJobAlerts } from "@/lib/job-checker"
import { scheduleJob } from "node-schedule"

// Store active jobs by alert ID
const scheduledJobs = new Map()

export async function scheduleJobAlertCheck(alertId: string) {
  try {
    // Cancel existing job if it exists
    if (scheduledJobs.has(alertId)) {
      scheduledJobs.get(alertId).cancel()
    }

    // Get the job alert
    const alert = await db.jobAlert.findUnique({
      where: { id: alertId },
    })

    if (!alert || !alert.active) {
      return
    }

    // Define schedule based on frequency
    let schedule

    switch (alert.frequency) {
      case "hourly":
        schedule = "0 * * * *" // Every hour at minute 0
        break
      case "daily":
        schedule = "0 9 * * *" // Every day at 9:00 AM
        break
      case "weekly":
        schedule = "0 9 * * 1" // Every Monday at 9:00 AM
        break
      default:
        schedule = "0 9 * * *" // Default to daily
    }

    // Schedule the job
    const job = scheduleJob(schedule, async () => {
      await checkJobAlerts(alertId)
    })

    // Store the job
    scheduledJobs.set(alertId, job)

    console.log(`Scheduled job alert check for alert ${alertId} with schedule ${schedule}`)

    // Also run immediately for the first time
    await checkJobAlerts(alertId)
  } catch (error) {
    console.error(`Error scheduling job alert check for alert ${alertId}:`, error)
  }
}

export async function initializeScheduler() {
  try {
    // Get all active job alerts
    const alerts = await db.jobAlert.findMany({
      where: { active: true },
    })

    // Schedule each alert
    for (const alert of alerts) {
      await scheduleJobAlertCheck(alert.id)
    }

    console.log(`Initialized scheduler with ${alerts.length} active job alerts`)
  } catch (error) {
    console.error("Error initializing scheduler:", error)
  }
}

