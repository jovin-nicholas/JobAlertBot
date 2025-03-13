import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { checkJobAlerts } from "@/lib/job-checker"

// This endpoint can be called by a cron job service like Vercel Cron
export async function GET(request: Request) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get frequency from query params
    const { searchParams } = new URL(request.url)
    const frequency = searchParams.get("frequency")

    if (!frequency || !["hourly", "daily", "weekly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Valid frequency parameter is required (hourly, daily, or weekly)" },
        { status: 400 },
      )
    }

    // Get all active job alerts with the specified frequency
    const alerts = await db.jobAlert.findMany({
      where: {
        active: true,
        frequency,
      },
    })

    console.log(`Found ${alerts.length} active job alerts with frequency ${frequency}`)

    // Check each alert
    const results = await Promise.allSettled(alerts.map((alert) => checkJobAlerts(alert.id)))

    // Count successes and failures
    const successes = results.filter((result) => result.status === "fulfilled").length
    const failures = results.filter((result) => result.status === "rejected").length

    return NextResponse.json({
      message: `Processed ${alerts.length} job alerts`,
      details: {
        total: alerts.length,
        successes,
        failures,
      },
    })
  } catch (error) {
    console.error("Error running cron job:", error)
    return NextResponse.json({ error: "Failed to run cron job" }, { status: 500 })
  }
}

