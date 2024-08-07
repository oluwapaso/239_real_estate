import type { Metadata } from "next";
//import "../../globals.css";
// import { Providers } from "../GlobalRedux/provider";

export const metadata: Metadata = {
  title: "239RE GROUP - MVP REALTY",
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
      <body className="font-poppins font-medium">
        {children}
      </body>
    </html>
  )
  // return (<body>{children}</body>)
}
