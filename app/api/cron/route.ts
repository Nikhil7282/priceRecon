import { NextResponse } from "next/server";

import {
  getLowestPrice,
  getHighestPrice,
  getAveragePrice,
  getEmailNotifyType,
} from "@/lib/utils";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { Product } from "@/lib/models/product.model";
import { connectToDb } from "@/lib/mongoose";

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    connectToDb();

    const products = await Product.find({});

    if (!products) throw new Error("No product fetched");

    // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) return;

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct.currentPrice,
          },
        ];
        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update Products in DB
        const updatedProduct = await Product.findOneAndUpdate(
          {
            url: product.url,
          },
          product
        );

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifyType = getEmailNotifyType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifyType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
            image: updatedProduct.image,
          };
          // Construct emailContent
          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifyType
          );
          // Get array of user emails
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );
          // Send email notification
          await sendEmail(emailContent, userEmails);
        }
        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error: any) {
    throw new Error(`Failed to get all products: ${error.message}`);
  }
}
