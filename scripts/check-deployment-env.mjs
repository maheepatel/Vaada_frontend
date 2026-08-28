const isVercelBuild = process.env.VERCEL === "1";

if (isVercelBuild) {
  const missing = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  if (!process.env.VAADA_API_URL) missing.push("VAADA_API_URL");
  if (!process.env.NEXT_PUBLIC_VAADA_API_URL) missing.push("NEXT_PUBLIC_VAADA_API_URL");

  if (missing.length) {
    console.error(`Vercel deployment is missing required variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}
