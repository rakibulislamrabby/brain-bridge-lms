import "./globals.css"
import type { Metadata } from "next"
import { Hubot_Sans } from "next/font/google"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ToastProvider } from "@/components/ui/toast"

const hubotSans = Hubot_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hubot-sans",
})

export const metadata: Metadata = {
  title: "Brain Bridge",
  description: "Learn and teach anything — personalized sessions powered by Brain Bridge.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${hubotSans.variable} bg-gray-900 text-white`} suppressHydrationWarning>
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
