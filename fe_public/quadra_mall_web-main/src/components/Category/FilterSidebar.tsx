const FilterSidebar = () => (
  <div className="w-full bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
    {/* Best Filter */}
    <div className="mb-8">
      <h3 className="font-semibold mb-3 text-sm text-gray-700">Best Filter</h3>
      <div className="flex flex-col gap-3 text-xs">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> 4 stars or upper
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> Same-day delivery
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> COD
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> Discount
        </label>
      </div>
    </div>

    {/* Location */}
    <div className="mb-8">
      <h3 className="font-semibold mb-3 text-sm text-gray-700">Location</h3>
      <div className="flex flex-col gap-3 text-xs">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> Branding
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> North Purwokerto
        </label>
      </div>
    </div>

    {/* Category */}
    <div className="mb-8">
      <h3 className="font-semibold mb-3 text-sm text-gray-700">Category</h3>
      <div className="flex flex-col gap-3 text-xs">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> Electronic
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> Fashion
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> Action Figure
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-green-600" /> Gaming Gear
        </label>
      </div>
      <button className="text-green-600 text-xs mt-2 hover:underline">
        Show All Categories
      </button>
    </div>

    {/* Price Range */}
    <div>
      <h3 className="font-semibold mb-3 text-sm text-gray-700">Price Range</h3>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs">USD</span>
        <input
          className="border rounded px-2 py-1 w-20 text-xs focus:outline-green-500"
          placeholder="Minimum price"
        />
        <span>-</span>
        <input
          className="border rounded px-2 py-1 w-20 text-xs focus:outline-green-500"
          placeholder="Maximum price"
        />
      </div>
      <div className="flex flex-col gap-2 text-xs">
        <label className="flex items-center gap-2">
          <input type="radio" name="price" className="accent-green-600" /> 0 - $200
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="price" className="accent-green-600" /> $200 - $500
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="price" className="accent-green-600" /> $500 - $800
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="price" className="accent-green-600" /> $800 - $1500
        </label>
      </div>
    </div>
  </div>
);

export default FilterSidebar;
