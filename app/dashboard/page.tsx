import { getJobAlerts } from "@/lib/job-alerts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Briefcase, Building } from "lucide-react"
import Link from "next/link"
import { EditJobAlertForm } from "@/components/edit-job-alert-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteJobAlert } from "@/components/delete-job-alert"

export default async function Dashboard() {
  const alerts = await getJobAlerts()

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Your Job Alerts</h1>
          <Button asChild>
            <Link href="/">Create New Alert</Link>
          </Button>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">No job alerts yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first job alert to start tracking new opportunities
            </p>
            <Button asChild>
              <Link href="/">Create Job Alert</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>Job Alert</span>
                    <Badge variant={alert.active ? "default" : "outline"}>{alert.active ? "Active" : "Paused"}</Badge>
                  </CardTitle>
                  <CardDescription>Created on {new Date(alert.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Companies:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alert.companies.map((company) => (
                        <Badge key={company.id} variant="secondary">
                          {company.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Keywords:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alert.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary">
                          {keyword.word}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Frequency:</span>
                    <span className="capitalize">{alert.frequency}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Job Alert</DialogTitle>
                      </DialogHeader>
                      <EditJobAlertForm jobAlert={alert}/>
                    </DialogContent>
                  </Dialog>
                  <DeleteJobAlert id={alert.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

