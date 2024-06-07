import type { Metadata } from "next";
import "../../../globals.css";
import { Providers } from "../GlobalRedux/provider";
import SideBars from "../_components/SideBars";
import MainContent from "../_components/MainContent";
import PageLoader from "../_components/PageLoader";

export const metadata: Metadata = {
  title: 'CRM Dashboard',
  description: 'Generated by Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-poppins overflow-x-hidden">
        <Providers>
          <div className="w-full flex relative">
            {/** <Header /> */}
            <SideBars />
            <MainContent>
              {children}
            </MainContent>
            <PageLoader />
          </div>
        </Providers>
      </body>
    </html>
  )
}
