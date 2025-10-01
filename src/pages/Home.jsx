import React from "react";
import HeroSection from "../components/Home/HeroSection";
import NewProducts from "../components/Home/NewProducts";
import FeaturedProducts from "../components/Home/FeaturedProducts";
import MainFeedVertical from "../components/Home/MainFeedVertical";
import ScrollNavigation from "../components/Home/ScrollNavigation";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <MainFeedVertical />
      <NewProducts />
      <FeaturedProducts />
      
      <ScrollNavigation />
    </div>
  );
};

export default Home;
