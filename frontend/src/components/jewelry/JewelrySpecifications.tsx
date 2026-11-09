import type { JewelryProduct } from "@/lib/jewelry-api";

function formatValue(value: string | null | undefined): string {
  return value?.trim() || "Not specified";
}

export default function JewelrySpecifications({
  product,
}: {
  product: JewelryProduct;
}) {
  const specification = product.jewelry_specification;
  const rows = [
    ["Material", formatValue(specification?.metal_type)],
    ["Purity", formatValue(specification?.purity)],
    [
      "Weight",
      specification?.weight_grams
        ? `${specification.weight_grams} g`
        : "Not specified",
    ],
    ["Gemstone", formatValue(specification?.gemstone)],
    [
      "Gemstone weight",
      specification?.gemstone_weight_carat
        ? `${specification.gemstone_weight_carat} ct`
        : "Not specified",
    ],
    [
      "Certificate",
      specification?.has_certificate
        ? formatValue(specification.certificate_issuer || "Available")
        : "Not listed",
    ],
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-[#10141b] p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">Specifications</h2>
      {specification?.craftsmanship_details && (
        <p className="mt-3 text-xs leading-6 text-slate-400">
          {specification.craftsmanship_details}
        </p>
      )}
      <dl className="mt-5 divide-y divide-white/[0.08]">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 py-3 text-xs"
          >
            <dt className="text-slate-400">{label}</dt>
            <dd className="text-right font-medium text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
