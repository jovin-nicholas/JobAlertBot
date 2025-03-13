import { db } from "@/lib/db"

export async function getJobAlerts() {
  try {
    const alerts = await db.jobAlert.findMany({
      include: {
        companies: true,
        keywords: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return alerts
  } catch (error) {
    console.error("Error fetching job alerts:", error)
    return []
  }
}

export async function createJobAlert(data: {
  companies: string[]
  keywords: string[]
  frequency: string
  email: string
}) {
  try {
    const alert = await db.jobAlert.create({
      data: {
        frequency: data.frequency,
        email: data.email,
        active: true,
        companies: {
          create: data.companies.map(company => ({ name: company }))
        },
        keywords: {
          create: data.keywords.map(keyword => ({ word: keyword }))
        },
      },
      include: {
        companies: true,
        keywords: true,
      },
    })

    return alert
  } catch (error) {
    console.error("Error creating job alert:", error)
    throw new Error("Failed to create job alert")
  }
}


export async function updateJobAlert(id: string, data: {
  companies: string[]
  keywords: string[]
  frequency: string
  email: string
  active: boolean
}) {
  try {
    const alert = await db.jobAlert.update({
      where: { id },
      data: {
        frequency: data.frequency,
        email: data.email,
        active: data.active,
        companies: {
          deleteMany: {}, // Delete existing companies
          create: data.companies.map(company => ({ name: company })) // Create new companies
        },
        keywords: {
          deleteMany: {}, // Delete existing keywords
          create: data.keywords.map(keyword => ({ word: keyword })) // Create new keywords
        },
      },
      include: {
        companies: true,
        keywords: true,
      },
    })

    return alert
  } catch (error) {
    console.error("Error updating job alert:", error)
    throw new Error("Failed to update job alert")
  }
}

export async function deleteJobAlert(alertId: string) {
  try {
    await db.jobAlert.delete({
      where: { id: alertId },
    })
  } catch (error) {
    console.error("Error deleting job alert:", error)
    throw new Error("Failed to delete job alert")
  }
}
