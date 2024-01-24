"use server";
import { revalidatePath } from "next/cache";
import { Product } from "../models/product.model";
import { connectToDb } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeProduct(productUrl: string) {
  if (!productUrl) return;
  try {
    connectToDb();
    const scrappedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrappedProduct) return;

    let product = scrappedProduct;
    const existingProduct = await Product.findOne({ url: scrappedProduct.url });
    if (existingProduct) {
      // console.log("string", scrappedProduct.price);
      // console.log(Number(scrappedProduct.price));

      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: Number(scrappedProduct.currentPrice) },
      ];
      product = {
        ...scrappedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrappedProduct.url },
      product,
      { upsert: true, new: true }
    );
    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product:${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDb();
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return null;
    }
    return product;
  } catch (error) {
    console.log(error);
  }
}

export const getAllProducts = async () => {
  try {
    connectToDb();
    const products = await Product.find();
    if (!products) {
      return null;
    }
    return products;
  } catch (error) {
    console.log(error);
  }
};

export const getSimilarProducts = async (productId: string) => {
  try {
    connectToDb();
    const product = await Product.findById(productId);
    if (!product) {
      return null;
    }
    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
};

export const addUserEmailToProduct = async (
  productId: string,
  userEmail: string
) => {
  // console.log("Adding in DB");
  try {
    const product = await Product.findById(productId);
    if (!product) return;
    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );
    if (!userExists) {
      product.users.push({ email: userEmail });
      await product.save();
      const emailContent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {}
};
