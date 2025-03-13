import nodemailer from "nodemailer"
import type { Job, JobAlert } from "@prisma/client"

interface SendJobAlertEmailOptions {
  email: string
  jobs: Job[]
  alert: JobAlert
}

export async function sendJobAlertEmail({ email, jobs, alert }: SendJobAlertEmailOptions) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "user@example.com",
        pass: process.env.SMTP_PASSWORD || "password",
      },
    })

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .job { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
          .job-title { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
          .job-company { color: #666; margin-bottom: 5px; }
          .job-location { color: #666; margin-bottom: 10px; }
          .job-link { display: inline-block; background-color: #4a7aff; color: white; padding: 8px 15px; text-decoration: none; border-radius: 3px; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Job Matches Found!</h1>
            <p>We found ${jobs.length} new job${jobs.length > 1 ? "s" : ""} matching your criteria.</p>
          </div>
          
          ${jobs
            .map(
              (job) => `
            <div class="job">
              <div class="job-title">${job.title}</div>
              <div class="job-company">${job.company}</div>
              ${job.location ? `<div class="job-location">📍 ${job.location}</div>` : ""}
              <p>${job.description ? job.description.substring(0, 150) + "..." : "Click to view job details"}</p>
              <a href="${job.url}" class="job-link">View Job</a>
            </div>
          `,
            )
            .join("")}
          
          <div class="footer">
            <p>You're receiving this email because you set up a job alert for ${alert.companies.join(", ")} with keywords ${alert.keywords.join(", ")}.</p>
            <p>To manage your alerts, <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard">visit your dashboard</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Job Alert Bot" <alerts@jobalertbot.com>',
      to: email,
      subject: `${jobs.length} New Job${jobs.length > 1 ? "s" : ""} Found - Job Alert Bot`,
      html: htmlContent,
    })

    console.log(`Sent job alert email to ${email} with ${jobs.length} jobs`)
  } catch (error) {
    console.error("Error sending job alert email:", error)
    throw new Error("Failed to send job alert email")
  }
}

