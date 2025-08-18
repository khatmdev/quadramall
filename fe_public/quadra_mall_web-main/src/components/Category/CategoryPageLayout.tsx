import React, { useState } from "react";
import Breadcrumb from "./Breadcrumb";
import TitleSortBar from "./TitleSortBar";
import FilterSidebar from "./FilterSidebar";
import ProductList from "../ShopDetail/ProductList";
import Pagination from "../../model/Pagination";

const CategoryPageLayout = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("Relevant Products");
  const totalPages = 9;

  return (
    <div className="w-full max-w-[1200px] mx-auto pt-4 pb-8 px-2 md:px-4">
      <div className="mb-2">
        <Breadcrumb />
        <TitleSortBar sort={sort} setSort={setSort} />
      </div>

      <div className="flex gap-4 relative">
        {/* Sidebar sticky wrapper */}
        <div className="hidden md:block w-[260px] shrink-0">
          <div>
            <FilterSidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ProductList sort={sort} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryPageLayout;
