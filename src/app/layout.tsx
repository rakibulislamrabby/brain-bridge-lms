import "./globals.css"
import type { Metadata } from "next"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ToastProvider } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Brain Bridge",
  description: "Learn and teach anything — personalized sessions powered by Brain Bridge.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Hubot+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-gray-900 text-white">
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
