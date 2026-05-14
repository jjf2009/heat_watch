"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import { AppData } from "@/lib/types";

type Props = {
  data: AppData;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sectionHeader(pdf: jsPDF, text: string, y: number, pageW: number, margin: number) {
  const contentW = pageW - margin * 2;
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y + 1, margin + contentW, y + 1);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 30, 30);
  pdf.text(text.toUpperCase(), margin, y - 1);
  return y + 8;
}

function checkPage(pdf: jsPDF, y: number, pageH: number, margin: number, needed = 20): number {
  if (y + needed > pageH - 18) {
    pdf.addPage();
    return margin + 5;
  }
  return y;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportPDF({ data }: Props) {
  const [exporting, setExporting] = useState(false);

  if (!data.mlScore) return null;

  // ─── PDF EXPORT ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!data.mlScore) return;
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = margin;

      const docRef = `HW-${Date.now().toString(36).toUpperCase()}`;
      const docDate = new Date(data.fetchedAt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      });

      // ═══════════════════════════════════════════════════════════════════════
      // PAGE 1 — TITLE PAGE
      // ═══════════════════════════════════════════════════════════════════════

      // Top rule
      pdf.setDrawColor(30, 30, 30);
      pdf.setLineWidth(1.2);
      pdf.line(margin, 18, pageW - margin, 18);

      // Pre-title label
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text("GOVERNMENT OF INDIA — CLIMATE & URBAN PLANNING DIVISION", margin, 15);
      pdf.text("CONFIDENTIAL — FOR OFFICIAL USE ONLY", pageW - margin, 15, { align: "right" });

      y = 40;

      // Main title
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(10, 10, 10);
      pdf.text("URBAN HEAT ISLAND", margin, y);
      y += 10;
      pdf.text("ASSESSMENT REPORT", margin, y);
      y += 8;

      pdf.setLineWidth(0.4);
      pdf.setDrawColor(80, 80, 80);
      pdf.line(margin, y, margin + 80, y);
      y += 8;

      pdf.setFontSize(13);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(50, 50, 50);
      pdf.text(`Subject City: ${data.location.city}, ${data.location.country}`, margin, y);
      y += 7;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Coordinates: ${data.location.lat.toFixed(4)}°N, ${data.location.lng.toFixed(4)}°E`, margin, y);
      y += 6;
      pdf.text(`Report Date: ${docDate}`, margin, y);
      y += 6;
      pdf.text(`Document Reference: ${docRef}`, margin, y);
      y += 25;

      // Risk Summary Box (simple bordered box, no fill colour)
      pdf.setDrawColor(30, 30, 30);
      pdf.setLineWidth(0.6);
      pdf.rect(margin, y, contentW, 36);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(80, 80, 80);
      pdf.text("OVERALL UHI RISK ASSESSMENT", margin + 5, y + 7);

      pdf.setFontSize(30);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(10, 10, 10);
      pdf.text(`${data.mlScore.riskScore}`, margin + 5, y + 26);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(50, 50, 50);
      pdf.text(`/ 100   —   ${data.mlScore.riskLevel.toUpperCase()} RISK`, margin + 26, y + 26);

      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text(
        `UHI Intensity: +${data.mlScore.uhi_intensity}°C above rural baseline`,
        pageW - margin - 5, y + 26, { align: "right" }
      );
      y += 46;

      // ─── Atmospheric Conditions ─────────────────────────────────────────
      y = sectionHeader(pdf, "1. Current Atmospheric Conditions", y, pageW, margin);

      const condRows = [
        ["Air Temperature", `${data.weather.temp} °C`],
        ["Perceived Temperature (Feels Like)", `${data.weather.feelsLike} °C`],
        ["Relative Humidity", `${data.weather.humidity} %`],
        ["Wind Speed", `${data.weather.windSpeed} m/s`],
        ["Sky Condition", data.weather.description],
      ];
      condRows.forEach(([label, value], idx) => {
        pdf.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 248 : 255);
        pdf.rect(margin, y, contentW, 7, "F");
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(60, 60, 60);
        pdf.text(label, margin + 3, y + 5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(20, 20, 20);
        pdf.text(value, pageW - margin - 3, y + 5, { align: "right" });
        y += 7;
      });
      y += 8;

      // ─── ML Risk Factor Breakdown ───────────────────────────────────────
      y = checkPage(pdf, y, pageH, margin, 60);
      y = sectionHeader(pdf, "2. Risk Factor Analysis (ML Model)", y, pageW, margin);

      const factors = [
        { label: "Thermal Anomaly Factor", desc: "Temperature deviation from 30-day climatological mean", value: data.mlScore.factors.thermalFactor },
        { label: "Humidity Stress Factor", desc: "Heat amplification due to atmospheric moisture content", value: data.mlScore.factors.humidityFactor },
        { label: "Urban Density Proxy Factor", desc: "Estimated surface impermeability and built-up area density", value: data.mlScore.factors.urbanFactor },
      ];
      factors.forEach((f) => {
        y = checkPage(pdf, y, pageH, margin, 18);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 30, 30);
        pdf.text(f.label, margin, y + 4);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(f.desc, margin, y + 9);

        // Bar track
        pdf.setFillColor(220, 220, 220);
        pdf.rect(margin, y + 11, contentW - 18, 4, "F");
        // Bar fill (always dark grey, professional)
        const barW = ((contentW - 18) * Math.min(f.value, 100)) / 100;
        pdf.setFillColor(50, 50, 50);
        pdf.rect(margin, y + 11, barW, 4, "F");

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(20, 20, 20);
        pdf.text(`${f.value}/100`, pageW - margin, y + 14, { align: "right" });
        y += 20;
      });
      y += 5;

      // ─── AI Recommendations ────────────────────────────────────────────
      y = checkPage(pdf, y, pageH, margin, 40);
      y = sectionHeader(pdf, "3. AI-Generated Mitigation Recommendations", y, pageW, margin);

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(120, 120, 120);
      pdf.text("Generated by Groq LLM (llama-3.3-70b-versatile) based on real-time UHI metrics.", margin, y);
      y += 7;

      const aiRecs = data.uhiEngine?.recommendations ?? [];
      if (aiRecs.length === 0) {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(120, 120, 120);
        pdf.text("No AI recommendations available. Run the UHI analysis first.", margin, y);
        y += 10;
      } else {
        aiRecs.forEach((rec, i) => {
          y = checkPage(pdf, y, pageH, margin, 28);
          // Border-left indicator for priority
          pdf.setFillColor(30, 30, 30);
          pdf.rect(margin, y, 1.5, 22, "F");

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(20, 20, 20);
          pdf.text(`${i + 1}. ${rec.action}`, margin + 5, y + 6);

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(60, 60, 60);
          const detailLines = pdf.splitTextToSize(rec.detail, contentW - 10);
          pdf.text(detailLines, margin + 5, y + 11);
          const detailH = detailLines.length * 4.5;

          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Impact: ${rec.impact}   |   Priority: ${rec.priority}`, margin + 5, y + 11 + detailH);
          y += 14 + detailH;
        });
      }
      y += 5;

      // ─── Charts page ───────────────────────────────────────────────────
      const chartCanvases = Array.from(
        document.querySelectorAll("#charts-section canvas")
      ) as HTMLCanvasElement[];

      if (chartCanvases.length > 0) {
        pdf.addPage();
        y = margin + 5;
        y = sectionHeader(pdf, "4. Historical Data & Forecast Charts", y, pageW, margin);
        y += 4;

        const gap = 8;
        const chartW = (contentW - gap) / 2;
        const maxChartH = 85;

        chartCanvases.slice(0, 4).forEach((canvas, index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = margin + col * (chartW + gap);
          const chartY = y + row * (maxChartH + 12);
          if (chartY + maxChartH > pageH - 25) return;

          const imgData = canvas.toDataURL("image/png", 1.0);
          const imgH = Math.min((canvas.height / canvas.width) * chartW, maxChartH);

          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.2);
          pdf.rect(x, chartY, chartW, maxChartH);
          pdf.addImage(imgData, "PNG", x + 1, chartY + 1, chartW - 2, imgH);
        });
      }

      // ─── Sign-off page ─────────────────────────────────────────────────
      pdf.addPage();
      y = margin + 10;
      y = sectionHeader(pdf, "5. Report Certification & Sign-off", y, pageW, margin);
      y += 5;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      const disclaimer = `This report has been generated using HeatWatch Urban Climate Intelligence Platform. Data sources include OpenWeatherMap real-time API, NASA POWER climatological dataset, and AI-based risk modelling powered by Groq (llama-3.3-70b-versatile). All recommendations are algorithmically derived and should be reviewed by qualified urban planners before policy implementation.`;
      const disclaimerLines = pdf.splitTextToSize(disclaimer, contentW);
      pdf.text(disclaimerLines, margin, y);
      y += disclaimerLines.length * 5 + 15;

      // Signature table
      const sigW = 70;
      const sigY = y;

      pdf.setDrawColor(30, 30, 30);
      pdf.setLineWidth(0.4);

      // Sig 1
      pdf.line(margin, sigY, margin + sigW, sigY);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("Prepared By", margin, sigY + 6);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text("HeatWatch AI System", margin, sigY + 11);
      pdf.text(`Date: ${docDate}`, margin, sigY + 16);

      // Sig 2 (center)
      const sig2x = margin + contentW / 2 - sigW / 2;
      pdf.line(sig2x, sigY, sig2x + sigW, sigY);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("Verified By", sig2x, sigY + 6);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text("Urban Planning Officer", sig2x, sigY + 11);
      pdf.text("Designation / Stamp", sig2x, sigY + 16);

      // Sig 3 (right)
      const sig3x = pageW - margin - sigW;
      pdf.line(sig3x, sigY, pageW - margin, sigY);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("Approved By", sig3x, sigY + 6);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text("Municipal Commissioner", sig3x, sigY + 11);
      pdf.text("Official Seal", sig3x, sigY + 16);

      // ─── Footer on every page ───────────────────────────────────────────
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setDrawColor(150, 150, 150);
        pdf.setLineWidth(0.2);
        pdf.line(margin, pageH - 14, pageW - margin, pageH - 14);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(130, 130, 130);
        pdf.text(`HeatWatch Urban Heat Island Platform  |  Ref: ${docRef}  |  ${docDate}`, margin, pageH - 8);
        pdf.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 8, { align: "right" });
      }

      const filename = `HeatWatch_Report_${data.location.city}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // ─── CSV EXPORT ──────────────────────────────────────────────────────────────
  const handleCSVExport = () => {
    if (!data.mlScore || !data.uhiEngine) return;

    // Build a merged map: date → { hist_temp, hist_humidity, forecast_temp, uhi_delta }
    type Row = { hist_temp?: number; hist_humidity?: number; forecast_temp?: number; uhi_delta?: number };
    const merged: Record<string, Row> = {};

    data.historical.forEach((h) => {
      if (!merged[h.date]) merged[h.date] = {};
      merged[h.date].hist_temp = h.temp;
      merged[h.date].hist_humidity = h.humidity;
    });

    data.uhiEngine.forecast.forEach((f) => {
      if (!merged[f.date]) merged[f.date] = {};
      merged[f.date].forecast_temp = f.temp;
      merged[f.date].uhi_delta = f.uhiDelta;
    });

    const sortedDates = Object.keys(merged).sort();
    const header = "Date,Historical_Temp_C,Historical_Humidity_%,Forecast_Temp_C,Predicted_UHI_Delta_C";
    const rows = sortedDates.map((date) => {
      const r = merged[date];
      return [
        date,
        r.hist_temp ?? "",
        r.hist_humidity ?? "",
        r.forecast_temp ?? "",
        r.uhi_delta ?? "",
      ].join(",");
    });

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `HeatWatch_Data_${data.location.city}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="font-bold text-lg text-black">📄 Export Data & Reports</h3>
        <p className="text-sm text-gray-500 mt-1">
          Download an official PDF report or export raw data to CSV (GIS-ready for ArcGIS / QGIS).
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleCSVExport}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 border border-gray-300"
        >
          📊 Export CSV
        </button>
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
            "⬇️ Download PDF"
          )}
        </button>
      </div>
    </div>
  );
}
