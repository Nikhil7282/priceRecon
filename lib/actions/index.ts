"use server";

import { Product } from "../models/product.model";
import { connectToDb } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";

export async function scrapeProduct(productUrl: string) {
  if (!productUrl) return;
  try {
    connectToDb();
    const scrappedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrappedProduct) return;

    let product = scrappedProduct;
    const existingProduct = await Product.findOne({ url: scrappedProduct.url });
  } catch (error: any) {
    throw new Error(`Failed to create/update product:${error.message}`);
  }
}
