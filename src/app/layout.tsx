import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Brain Bridge",
  description: "Learn and teach anything — personalized sessions powered by Brain Bridge.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
