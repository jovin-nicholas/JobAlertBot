import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}

export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(normalizeUrl(url))
    const hostname = parsedUrl.hostname

    // Extract domain without subdomains
    const domainParts = hostname.split(".")
    const domain =
      domainParts.length >= 2
        ? `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`
        : hostname

    return domain
  } catch (error) {
    console.error(`Error extracting domain from ${url}:`, error)
    return url
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

