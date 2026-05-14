"use client";
import React, { useState } from "react";

export default function LocationSearch() {
  const [q, setQ] = useState("");
  return (
    <div>
      <label style={{ display: "block", marginBottom: 8 }}>
        Search location:
      </label>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Enter city or coordinates"
        style={{ padding: 8, width: "100%", maxWidth: 480 }}
      />
    </div>
  );
}
