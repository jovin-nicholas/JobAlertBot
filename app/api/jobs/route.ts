import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get("alertId")

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 })
    }

    const jobs = await db.job.findMany({
      where: {
        jobAlertId: alertId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

