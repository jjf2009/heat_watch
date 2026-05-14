"use client";
import React from "react";

export default function ExportPDF() {
  const handleExport = () => {
    // simple fallback: print to PDF
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div>
      <button onClick={handleExport} style={{ padding: "8px 12px" }}>
        Export as PDF
      </button>
    </div>
  );
}
