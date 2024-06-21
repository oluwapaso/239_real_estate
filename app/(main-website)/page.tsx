"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FeaturedListings from "@/components/Home/FeaturedListings";
import Neighbourhood from "@/components/Home/Neighbourhood";
import OurServices from "@/components/Home/OurServices";
import AllTestimonials from "@/components/Home/Testimonials";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useModal } from "../contexts/ModalContext";

/* https://www.honestagentsd.com/ */
export default function Home() {

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { closeModal: close_auth_modal } = useModal();

  //Close modal if it's opened, this usually happen after returning from property details page without signing in
  useEffect(() => {
    if (close_auth_modal) {
      close_auth_modal();
    }
  }, [])

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
