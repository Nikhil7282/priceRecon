import React from "react";
import { Product } from "@/types";
import Link from "next/link";
import Image from "next/image";

type Props = {
  product: Product;
};

function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product._id}`} className="product-card">
      <div className="product-card_img-container">
        <Image
          //   src={"https://m.media-amazon.com/images/I/61xgXGaP2-L._AC_SY450_.jpg"}
          src={product.image}
          alt={product.title}
          width={200}
          height={100}
          className="product-card_img"
        />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="product-title">{product.title}</h3>
        <div className="flex justify-between">
          <p>{product.category}</p>
          <p className="text-black text-lg font-semibold">
            <span>{product?.currency}</span>
            <span>{product?.currentPrice}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
