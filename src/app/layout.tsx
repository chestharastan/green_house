import type { Metadata } from "next"
import "./globals.css"
import { MainLayout } from "@/components/layout/main-layout"

export const metadata: Metadata = {
  title: "HydroFarm - Hydroponic Farm Management",
  description: "Hydroponic farm management system",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
