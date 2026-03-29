import { NextResponse } from "next/server";
import { newsArticles } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ articles: newsArticles });
}
