import React from "react";
import Banner from "@/components/Home/Banner";
import IntroOverlay from "@/components/Home/IntroOverlay";
import { CategoryList } from "@/components/Home/CategoryList";
import { FlashSaleSection } from "@/components/Home/FlashSaleSection";
import { TodaysProducts } from "@/components/Home/TodaysProducts";
import { FavoriteShops } from "@/components/Home/FavoriteShop";

const Index: React.FC = () => {
  return (
    <>
      <IntroOverlay />
      <Banner />
      <div className="max-w-7xl mx-auto px-4">
        <CategoryList />
         <FlashSaleSection />
        <FavoriteShops />
        <TodaysProducts />
      </div>
    </>
  );
};

export default Index;
