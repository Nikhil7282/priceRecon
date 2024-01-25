"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
type Props = {
  stars: number;
};

export default function Stars({ stars }: Props) {
  const [star, setStar] = useState<string[] | undefined>([]);
  useEffect(() => {
    console.log("prop", stars);
    const rating = Math.floor(stars);
    console.log(rating);

    const remaining = 5 - rating;
    let arr = new Array(5).fill(undefined);
    function populateArray() {
      for (let i = 0; i < rating; i++) {
        arr[i] = "/assets/icons/star-filled.svg";
      }
      for (let i = 0; i < remaining; i++) {
        arr[i] = "/assets/icons/star-empty.svg";
      }
      setStar(arr);
    }
    populateArray();
  }, []);

  return (
    <>
      {console.log(star)}
      {star &&
        star.map((st, idx) => {
          console.log(st);
          return <Image key={idx} src={st} alt="star" width={18} height={18} />;
        })}
    </>
  );
}
