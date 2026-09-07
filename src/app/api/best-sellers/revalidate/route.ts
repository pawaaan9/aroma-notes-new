import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export const runtime = "nodejs";

/**
 * Drops the cached best-seller list so the home page picks up an admin change
 * immediately instead of waiting out the 2-minute revalidate window.
 */
export async function POST() {
  revalidateTag("best-sellers", "max");
  revalidatePath("/");
  return NextResponse.json({ revalidated: true });
}
