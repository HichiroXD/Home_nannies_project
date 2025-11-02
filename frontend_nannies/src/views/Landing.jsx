import React from "react";
import { HeaderLanding, HeroLanding, Footer } from "../../components/Layout";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-100 to-white text-gray-800">
      <HeaderLanding />
      <HeroLanding />
      <Footer />
    </div>
  );
}
