import Link from "next/link"
import JobAlertForm from "@/components/job-alert-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Job Alert Bot</h1>
          <p className="text-muted-foreground">Get notified when your dream companies post new job openings</p>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Create Job Alert</CardTitle>
            <CardDescription>Set up alerts for specific companies and job titles</CardDescription>
            </CardHeader>
          <CardContent>
            <JobAlertForm />
          </CardContent>
        </Card>

        <div className="flex justify-center">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <Link href="/dashboard">Dashboard</Link>
            </button>
        </div>
      </div>
    </main>
  )
}

