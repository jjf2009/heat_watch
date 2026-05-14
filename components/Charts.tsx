import React from "react";
import { AppData } from "@/lib/types";

type Props = {
  data?: AppData;
};

export default function Charts({ data }: Props) {
  return (
    <div
      style={{
        height: 300,
        background: "#fff7ed",
        color: "#171717",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>Charts placeholder {data ? "with data" : ""}</div>
    </div>
  );
}
