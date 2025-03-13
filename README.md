## How the Job Alert Bot Works

This application monitors company career pages for new job listings matching your criteria and sends notifications when matches are found. Here's how it works:

### Core Components

**User Interface**

1. A form to input target companies, job titles/keywords, and check frequency
2. A dashboard to view and manage your job alerts



**Web Scraping Engine**

1. Fetches job listings from company career pages
2. Supports both direct URLs and company names
3. Has specialized scrapers for major companies and a generic scraper for others



**Job Matching System**

1. Compares newly fetched listings against previously stored data
2. Filters jobs based on your specified keywords



**Database Storage**

1. Stores job alerts and job listings
2. Tracks which jobs have been notified



**Notification System**

1. Sends email notifications when new matching jobs are found



**Scheduling System**

1. Runs checks at your specified frequency (hourly, daily, or weekly)





### Key Features

- **Flexible Input**: Accept company names or direct career page URLs
- **Keyword Filtering**: Match jobs based on titles and descriptions
- **Customizable Frequency**: Choose how often to check for new listings
- **Email Notifications**: Get alerts when new matching jobs are found
- **Duplicate Prevention**: Only notify about new job listings
- **Error Handling**: Robust error handling and logging


### Deployment Options

1. **Vercel Deployment**

1. Deploy the application to Vercel
2. Use Vercel Cron for scheduled job checks


2. **Self-Hosted**

1. Run on your own server
2. Use node-schedule for in-process scheduling



### Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables for email notifications
4. Run database migrations with `npx prisma migrate dev`
5. Start the application with `npm run dev`


The application is designed to be lightweight, efficient, and scalable for future enhancements.

