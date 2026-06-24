import Link from "next/link";
import { Brand } from "@/components/brand";
import { hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";

type BrandHomeLinkProps = {
  className?: string;
  tagline?: string;
};

async function getBrandHref() {
  if (!hasSupabaseEnv()) {
    return "/dashboard";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? "/dashboard" : "/";
}

export async function BrandHomeLink({ className, tagline }: BrandHomeLinkProps) {
  const href = await getBrandHref();

  return (
    <Link
      aria-label="Volver a Recorderys"
      className={className}
      href={href}
    >
      <Brand tagline={tagline} />
    </Link>
  );
}
