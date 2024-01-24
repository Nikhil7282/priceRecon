import { Product } from "@/lib/models/product.model";
import { connectToDb } from "@/lib/mongoose";
import { scrapeAmazonProduct } from "@/lib/scraper";
import {
  getAveragePrice,
  getEmailNotifyType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/utils";

export const GET = async () => {
  try {
    connectToDb();
    const products = await Product.find({});
    if (!products) throw new Error("No Products found");

    const updatedProducts = await Promise.all(
      products.map(async (currProduct) => {
        const scrappedProduct = await scrapeAmazonProduct(currProduct.url);
        if (!scrappedProduct) throw new Error("No Product Found");

        const updatedPriceHistory = [
          ...currProduct.priceHistory,
          { price: Number(scrappedProduct.currentPrice) },
        ];

        const product = {
          ...scrappedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: scrappedProduct.url },
          product
        );
        const emailNotifyType = getEmailNotifyType(
          scrappedProduct,
          currProduct
        );
      })
    );
  } catch (error) {}
};
