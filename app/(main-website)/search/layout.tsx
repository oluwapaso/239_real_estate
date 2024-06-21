import type { Metadata } from "next";
//import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Search: 239 Real Estate",
  description: "Welcome to 239 Real Estate, where our mission is clear: empowering the community, pursuing excellence, and creating a lasting impact in the world of real estate.",
};

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      {children}
    </>
  );
}
