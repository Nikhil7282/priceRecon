"use client";

import { scrapeProduct } from "@/lib/actions";
import { FormEvent, MouseEventHandler, useState } from "react";

export default function SearchBar() {
  const [searchUrl, setSearchUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isValidAmazonUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      if (
        hostname.includes("amazon.com") ||
        hostname.includes("amazon.") ||
        hostname.includes("amazon")
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validUrl = isValidAmazonUrl(searchUrl);
    if (!validUrl) {
      alert("Provide Valid Link");
    }
    try {
      setIsLoading(true);
      const product = await scrapeProduct(searchUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter product link"
        className="searchbar-input"
        value={searchUrl}
        onChange={(e) => setSearchUrl(e.target.value)}
      />
      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchUrl === ""}
      >
        {isLoading ? "Searching" : "Search"}
      </button>
    </form>
  );
}
