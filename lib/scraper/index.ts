import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  //   curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_d7f89dc5-zone-unblocker:fdkrr8akwbiw -k https://lumtest.com/myip.json

  const username = String(process.env.Bright_Data_Username);
  const password = String(process.env.Bright_Data_Password);
  const port = 22225;
  const sessionId = (10000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${sessionId}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);
    // console.log(response.data);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const price = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base"),
      $(
        "#corePrice_desktop > div > table > tbody > tr > td.a-span12 > span.a-price.a-text-price.a-size-medium.apexPriceToPay > span:nth-child(2)"
      )
    );
    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price"),
      $(
        "#corePrice_desktop > div > table > tbody > tr:nth-child(1) > td.a-span12.a-color-secondary.a-size-base > span.a-price.a-text-price.a-size-base > span:nth-child(2)"
      )
    ).slice(0, 6);
    const stockSelector = $("#availability span:nth-child(4)>span")
      .text()
      .trim()
      .toLowerCase();
    let outOfStock =
      stockSelector === "currently unavailable" ||
      stockSelector === "temporarily out of stock.";

    const image =
      $("#imaBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage")
        // .attr("src")
        .attr("data-a-dynamic-image") ||
      "{}";
    const imageUrls = Object.keys(JSON.parse(image));

    const currency = extractCurrency($(".a-price-symbol"));

    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");
    const disRate = $(
      "#corePrice_desktop > div > table > tbody > tr:nth-child(3) > td.a-span12.a-color-price.a-size-base > span.a-color-price"
    )
      .text()
      .replace(/[-%]/g, "");
    const regex = /\((\d+)\)/;
    const result = disRate.match(regex) || [];

    const description = extractDescription($);

    const ratings = $("#acrPopover > span.a-declarative > a > span")
      .text()
      .slice(0, 4);

    const data = {
      url,
      currency: currency || "$",
      image: imageUrls[0],
      title,
      price,
      description,
      originalPrice,
      priceHistory: [],
      discountRate: discountRate || result[1] || 0,
      category: "Category",
      ratings: Number(ratings) || 0,
      isOutOfStock: outOfStock,
      lowestPrice: Number(price) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(price),
      averagePrice: Number(price) || Number(originalPrice),
    };
    // console.log(data);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}
