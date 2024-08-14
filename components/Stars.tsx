"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
type Props = {
  stars: number;
};

export default function Stars({ stars }: Props) {
  const [star, setStar] = useState<string[] | undefined>([]);
  useEffect(() => {
    const rating = Math.floor(stars);
    let arr = new Array(5).fill(undefined);
    function populateArray() {
      let i = 0;
      while (i < rating) {
        arr[i] = "/assets/icons/star-filled.svg";
        i++;
      }
      while (i < 5) {
        arr[i] = "/assets/icons/star-empty.svg";
        i++;
      }
      setStar(arr);
    }
    populateArray();
  }, []);

  return (
    <>
      {star &&
        star.map((st, idx) => {
          return <Image key={idx} src={st} alt="star" width={18} height={18} />;
        })}
    </>
  );
}
