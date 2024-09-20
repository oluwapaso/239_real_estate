import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "./(main-layout)/GlobalRedux/provider";
import 'react-toastify/dist/ReactToastify.css';
import PageLoaderMain from "@/components/PageLoaderMain";

export const metadata: Metadata = {
  title: "239RE GROUP - MVP REALTY",
  description: `Welcome to 239 Real Estate, where our mission is clear: empowering the community, pursuing excellence, and 
  creating a lasting impact in the world of real estate.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-poppins font-medium">
        <Providers>
          {children}
          <PageLoaderMain />
        </Providers>
      </body>
    </html>
  );
}
