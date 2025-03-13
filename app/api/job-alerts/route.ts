import { NextResponse } from "next/server"
import { createJobAlert } from "@/lib/job-alerts"
import { scheduleJobAlertCheck } from "@/lib/scheduler"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body.companies || !Array.isArray(body.companies) || body.companies.length === 0) {
      return NextResponse.json({ error: "At least one company is required" }, { status: 400 })
    }

    if (!body.keywords || !Array.isArray(body.keywords) || body.keywords.length === 0) {
      return NextResponse.json({ error: "At least one keyword is required" }, { status: 400 })
    }

    if (!body.frequency || !["hourly", "daily", "weekly"].includes(body.frequency)) {
      return NextResponse.json({ error: "Valid frequency is required (hourly, daily, or weekly)" }, { status: 400 })
    }

    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Create job alert
    const jobAlert = await createJobAlert({
      companies: body.companies,
      keywords: body.keywords,
      frequency: body.frequency,
      email: body.email,
    })

    // Schedule the job alert check
    await scheduleJobAlertCheck(jobAlert.id)

    return NextResponse.json(jobAlert)
  } catch (error) {
    console.error("Error creating job alert:", error)
    return NextResponse.json({ error: "Failed to create job alert" }, { status: 500 })
  }
}

