type BrandProps = { tagline?: string };
export function Brand({ tagline }: BrandProps) {
  return <div className="brand-original"><img alt="RECORDERYS" src="/brand/recorderys-color-logo-horizontal-bg.svg" />{tagline && <span>{tagline}</span>}</div>;
}
