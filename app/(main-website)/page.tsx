"use client"

import { useLastSeen } from "@/_hooks/useActivities";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FeaturedListings from "@/components/Home/FeaturedListings";
import Neighbourhood from "@/components/Home/Neighbourhood";
import OurServices from "@/components/Home/OurServices";
import AllTestimonials from "@/components/Home/Testimonials";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

/* https://www.honestagentsd.com/ */
export default function Home() {

  const { data: session } = useSession();
  const searchParams = useSearchParams();

  console.log("searchParams?.keys:", searchParams?.toString());

  return (
    <>
      <Header page="Home" />
      <Neighbourhood />
      <FeaturedListings />
      <OurServices />
      <AllTestimonials />
      <Footer />
    </>
  );
}
