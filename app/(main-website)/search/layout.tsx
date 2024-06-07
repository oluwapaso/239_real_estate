import type { Metadata } from "next";
//import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Search: Take Action Realty Group",
  description: "Welcome to Take Action Realty Group, where our mission is clear: empowering the community, pursuing excellence, and creating a lasting impact in the world of real estate.",
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
