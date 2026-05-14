"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { AppData } from "@/lib/types";

type Props = {
  data: AppData;
};

export default function ExportPDF({ data }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ============================================================
      // PAGE 1 — COVER + SUMMARY
      // ============================================================

      // Header band
      pdf.setFillColor(234, 88, 12); // orange-600
      pdf.rect(0, 0, pageW, 45, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("HeatWatch", margin, 20);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text("Urban Heat Island Prediction Report", margin, 29);
      pdf.text(`Generated: ${new Date(data.fetchedAt).toLocaleString("en-IN")}`, margin, 37);

      y = 58;

      // Location title
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${data.location.city}, ${data.location.country}`, margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Coordinates: ${data.location.lat.toFixed(4)}°N, ${data.location.lng.toFixed(4)}°E`, margin, y);
      y += 12;

      // Risk score box
      const riskColors: Record<string, [number, number, number]> = {
        High: [239, 68, 68],
        Medium: [245, 158, 11],
        Low: [34, 197, 94],
      };
      const [r, g, b] = riskColors[data.mlScore.riskLevel];

      pdf.setFillColor(r, g, b);
      pdf.roundedRect(margin, y, contentW, 28, 4, 4, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${data.mlScore.riskScore}`, margin + 10, y + 18);

      pdf.setFontSize(11);
      pdf.text(`/ 100  —  ${data.mlScore.riskLevel} Risk`, margin + 28, y + 18);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `UHI Intensity: +${data.mlScore.uhi_intensity}°C warmer than surrounding rural areas`,
        pageW - margin - 5,
        y + 18,
        { align: "right" }
      );
      y += 38;

      // Current conditions grid
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Current Conditions", margin, y);
      y += 7;

      const conditions = [
        { label: "Temperature", value: `${data.weather.temp}°C` },
        { label: "Feels Like", value: `${data.weather.feelsLike}°C` },
        { label: "Humidity", value: `${data.weather.humidity}%` },
        { label: "Wind Speed", value: `${data.weather.windSpeed} m/s` },
      ];

      const cellW = contentW / 4;
      conditions.forEach((c, i) => {
        const x = margin + i * cellW;
        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(x, y, cellW - 3, 18, 2, 2, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(c.label, x + 4, y + 6);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 30, 30);
        pdf.text(c.value, x + 4, y + 14);
      });
      y += 26;

      // ML Factor breakdown
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("ML Model — Risk Factor Breakdown", margin, y);
      y += 7;

      const factors = [
        { label: "Thermal Anomaly", value: data.mlScore.factors.thermalFactor, desc: "Temperature deviation from 30-day mean" },
        { label: "Humidity Stress", value: data.mlScore.factors.humidityFactor, desc: "Heat amplification from atmospheric moisture" },
        { label: "Urban Density Proxy", value: data.mlScore.factors.urbanFactor, desc: "Estimated surface impermeability and density" },
      ];

      factors.forEach((f) => {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(60, 60, 60);
        pdf.text(`${f.label} — ${f.desc}`, margin, y + 4);

        // Bar background
        pdf.setFillColor(229, 231, 235);
        pdf.roundedRect(margin, y + 6, contentW - 20, 5, 2, 2, "F");

        // Bar fill
        const fillW = ((contentW - 20) * f.value) / 100;
        const barColor = f.value > 65 ? [239, 68, 68] : f.value > 35 ? [245, 158, 11] : [34, 197, 94];
        pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
        pdf.roundedRect(margin, y + 6, fillW, 5, 2, 2, "F");

        // Score label
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 30, 30);
        pdf.text(`${f.value}/100`, pageW - margin, y + 10, { align: "right" });

        y += 16;
      });
      y += 6;

      // ============================================================
      // PAGE 1 CONTINUED — Recommendations
      // ============================================================
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("Recommended Actions for City Planners", margin, y);
      y += 8;

      data.mlScore.recommendations.forEach((rec, i) => {
        // Check if we need a new page
        if (y > pageH - 30) {
          pdf.addPage();
          y = margin;
        }

        pdf.setFillColor(255, 247, 237);
        pdf.roundedRect(margin, y - 4, contentW, 12, 2, 2, "F");

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(60, 60, 60);
        pdf.text(`${i + 1}.  ${rec}`, margin + 4, y + 4, { maxWidth: contentW - 8 });
        y += 14;
      });

      y += 6;

      // ============================================================
      // PAGE 2 — Charts (screenshot the chart area)
      // ============================================================
      const chartEl = document.getElementById("charts-section");
      if (chartEl) {
        pdf.addPage();
        y = margin;

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 30, 30);
        pdf.text("Historical Data & Forecast Analysis", margin, y);
        y += 8;

        const canvas = await html2canvas(chartEl, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const imgH = (canvas.height / canvas.width) * contentW;
        pdf.addImage(imgData, "PNG", margin, y, contentW, Math.min(imgH, pageH - y - 20));
      }

      // ============================================================
      // FOOTER on all pages
      // ============================================================
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFillColor(249, 250, 251);
        pdf.rect(0, pageH - 12, pageW, 12, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(150, 150, 150);
        pdf.text("HeatWatch — Urban Heat Island Prediction Platform", margin, pageH - 5);
        pdf.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: "right" });
      }

      // Save
      const filename = `HeatWatch_${data.location.city}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="font-bold text-lg text-black">📄 Export Full Report</h3>
        <p className="text-sm text-gray-500 mt-1">
          Download a professional PDF report for {data.location.city} — includes risk score, ML analysis, charts, and recommendations.
        </p>
      </div>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {exporting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating PDF...
          </>
        ) : (
          "⬇️ Download Report"
        )}
      </button>
    </div>
  );
}
