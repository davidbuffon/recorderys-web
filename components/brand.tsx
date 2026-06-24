type BrandProps = {
  tagline?: string;
};

export function Brand({ tagline }: BrandProps) {
  return (
    <div className="brand-mark" aria-label="RECORDERYS">
      <img
        alt="RECORDERYS"
        className="brand-mark__icon"
        src="/brand-icons/android.png"
      />
      <span className="brand-mark__copy">
        <span className="brand-mark__word">RECORDERYS</span>
        {tagline ? <span className="brand-mark__tagline">{tagline}</span> : null}
      </span>
    </div>
  );
}
