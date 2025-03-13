import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { scheduleJobAlertCheck } from "@/lib/scheduler"
import { updateJobAlert } from "@/lib/job-alerts"

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params
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

    // Update job alert
    const updatedAlert = await updateJobAlert(id, {
        companies: body.companies,
        keywords: body.keywords,
        frequency: body.frequency,
        email: body.email,
        active: body.active,
      })

    // Reschedule the job alert check
    await scheduleJobAlertCheck(updatedAlert.id)

    return NextResponse.json(updatedAlert)
  } catch (error) {
    console.error("Error updating job alert:", error)
    return NextResponse.json({ error: "Failed to update job alert" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Delete job alert
    await db.jobAlert.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Job alert deleted successfully" })
  } catch (error) {
    console.error("Error deleting job alert:", error)
    return NextResponse.json({ error: "Failed to delete job alert" }, { status: 500 })
  }
}

