"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"

export default function JobAlertForm() {
  const router = useRouter()
  const [companies, setCompanies] = useState<string[]>([])
  const [companyInput, setCompanyInput] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addCompany = () => {
    if (companyInput.trim() && !companies.includes(companyInput.trim())) {
      setCompanies([...companies, companyInput.trim()])
      setCompanyInput("")
    }
  }

  const removeCompany = (index: number) => {
    setCompanies(companies.filter((_, i) => i !== index))
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput("")
    }
  }

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (companies.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one company",
        variant: "destructive",
      })
      return
    }

    if (keywords.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one job title or keyword",
        variant: "destructive",
      })
      return
    }

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/job-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companies,
          keywords,
          frequency,
          email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create job alert")
      }

      toast({
        title: "Success",
        description: "Job alert created successfully",
      })

      // Reset form
      setCompanies([])
      setKeywords([])
      setFrequency("daily")
      setEmail("")

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="companies">Target Companies</Label>
        <div className="flex gap-2">
          <Input
            id="companies"
            placeholder="Company name or career page URL"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addCompany()
              }
            }}
          />
          <Button type="button" onClick={addCompany} variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        {companies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <span className="text-sm">{company}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeCompany(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label htmlFor="keywords">Job Titles or Keywords</Label>
        <div className="flex gap-2">
          <Input
            id="keywords"
            placeholder="e.g., Software Engineer, Product Manager"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addKeyword()
              }
            }}
          />
          <Button type="button" onClick={addKeyword} variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword, index) => (
              <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <span className="text-sm">{keyword}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeKeyword(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label>Check Frequency</Label>
        <RadioGroup
          defaultValue="daily"
          value={frequency}
          onValueChange={setFrequency}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hourly" id="hourly" />
            <Label htmlFor="hourly" className="font-normal">
              Hourly
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily" className="font-normal">
              Daily
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly" className="font-normal">
              Weekly
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label htmlFor="email">Email for Notifications</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Alert..." : "Create Job Alert"}
      </Button>
    </form>
  )
}

