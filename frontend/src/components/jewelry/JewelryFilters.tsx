export interface JewelryFilterValues {
  query: string;
  sort: "newest" | "price-low" | "price-high";
  metalType: string;
  purity: string;
  minPrice: string;
  maxPrice: string;
}

export default function JewelryFilters({
  values,
  onChange,
}: {
  values: JewelryFilterValues;
  onChange: (values: JewelryFilterValues) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#10141b] p-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-[9px] tracking-[0.16em] text-slate-400">
          SEARCH JEWELRY
        </span>
        <input
          value={values.query}
          onChange={(event) => onChange({ ...values, query: event.target.value })}
          placeholder="Search by name, material or stone..."
          className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-amber-200/50 sm:min-w-[280px]"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[9px] tracking-[0.16em] text-slate-400">
          MATERIAL
        </span>
        <select
          value={values.metalType}
          onChange={(event) =>
            onChange({ ...values, metalType: event.target.value })
          }
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e14] px-3 text-xs text-white outline-none focus:border-amber-200/50"
        >
          <option value="">All materials</option>
          <option value="GOLD">Gold</option>
          <option value="WHITE_GOLD">White gold</option>
          <option value="ROSE_GOLD">Rose gold</option>
          <option value="SILVER">Silver</option>
          <option value="PLATINUM">Platinum</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-[9px] tracking-[0.16em] text-slate-400">
          PURITY
        </span>
        <select
          value={values.purity}
          onChange={(event) => onChange({ ...values, purity: event.target.value })}
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e14] px-3 text-xs text-white outline-none focus:border-amber-200/50"
        >
          <option value="">Any purity</option>
          <option value="24K">24K</option>
          <option value="22K">22K</option>
          <option value="18K">18K</option>
          <option value="14K">14K</option>
          <option value="925">925 Silver</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-[9px] tracking-[0.16em] text-slate-400">
          MIN PRICE
        </span>
        <input
          type="number"
          min="0"
          value={values.minPrice}
          onChange={(event) => onChange({ ...values, minPrice: event.target.value })}
          placeholder="Any"
          className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-amber-200/50"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[9px] tracking-[0.16em] text-slate-400">
          MAX PRICE
        </span>
        <input
          type="number"
          min="0"
          value={values.maxPrice}
          onChange={(event) => onChange({ ...values, maxPrice: event.target.value })}
          placeholder="Any"
          className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-amber-200/50"
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-[9px] tracking-[0.16em] text-slate-400">
          SORT BY
        </span>
        <select
          value={values.sort}
          onChange={(event) => {
            const sort = event.target.value;
            if (sort === "newest" || sort === "price-low" || sort === "price-high") {
              onChange({ ...values, sort });
            }
          }}
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e14] px-3 text-xs text-white outline-none focus:border-amber-200/50"
        >
          <option value="newest">Newest first</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </label>
    </div>
  );
}
