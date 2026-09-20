import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export const runtime = "nodejs";

/** Drops the cached combo list so the storefront reflects admin edits at once. */
export async function POST() {
  revalidateTag("combo-offers", "max");
  revalidatePath("/");
  return NextResponse.json({ revalidated: true });
}
