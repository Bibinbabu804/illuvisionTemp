import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const ALLOWED_TAGS = [
  "marketplace-products",
  "marketplace-products-featured",
  "marketplace-product-categories",
  "marketplace-screens",
];

export async function POST(request) {
  const secretHeader = request.headers.get("x-revalidate-secret");
  const url = new URL(request.url);
  const secretQuery = url.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATION_SECRET || "illuvision_isr_secret";

  if ((secretHeader || secretQuery) !== expectedSecret) {
    return NextResponse.json({ message: "Invalid revalidation secret token" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const tagList = Array.isArray(body.tags)
      ? body.tags
      : body.tag
      ? [body.tag]
      : [];
    const targetPath = body.path || (url.searchParams.get("path") ?? null);

    const revalidatedTags = [];
    for (const tag of tagList) {
      if (ALLOWED_TAGS.includes(tag)) {
        revalidateTag(tag);
        revalidatedTags.push(tag);
      }
    }

    if (targetPath) {
      revalidatePath(targetPath);
    }

    return NextResponse.json({
      revalidated: true,
      tags: revalidatedTags,
      path: targetPath,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({ message: "Error revalidating", error: error.message }, { status: 500 });
  }
}
