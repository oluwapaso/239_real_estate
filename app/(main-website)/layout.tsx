import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "./(main-layout)/GlobalRedux/provider";
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: "Tic Toc Group",
  description: `Welcome to Tic Toc Group, where our mission is clear: empowering the community, pursuing excellence, and 
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
        </Providers>
      </body>
    </html>
  );
}
