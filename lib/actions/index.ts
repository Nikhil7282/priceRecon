"use server";

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeProduct(productUrl: string) {
  if (!productUrl) return;
  try {
    const scrappedProduct = await scrapeAmazonProduct(productUrl);
  } catch (error: any) {
    throw new Error(`Failed to create/update product:${error.message}`);
  }
}
