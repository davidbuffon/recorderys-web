const brandLogoMap: Record<string, string> = {
  delonghi: "/demo/brands/delonghi.svg",
  nordikas: "/demo/brands/nordikas.svg",
  sony: "/demo/brands/sony.svg",
  dyson: "/demo/brands/dyson.svg",
};

function normalizeBrand(brand: string) {
  return brand.trim().toLowerCase();
}

export function BrandLogo({
  brand,
  className = "",
}: {
  brand: string | null | undefined;
  className?: string;
}) {
  if (!brand) return null;

  const src = brandLogoMap[normalizeBrand(brand)];

  if (src) {
    return (
      <span className={`brand-logo ${className}`.trim()} aria-label={brand}>
        <img alt={brand} src={src} />
      </span>
    );
  }

  return (
    <span className={`brand-logo brand-logo--fallback ${className}`.trim()}>
      {brand}
    </span>
  );
}
