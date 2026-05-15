"use client";

import { Check, Zap, Crown, Sparkles } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string | number;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
  ctaLink: string;
  tier?: "free" | "professional" | "enterprise";
  /** If provided, clicks the button via this handler instead of following the link */
  onCtaClick?: () => void;
}

const tierConfig = {
  free: {
    icon: <Zap size={20} className="text-blue-400" />,
    glowColor: "rgba(96,165,250,0.15)",
    borderGlow: "rgba(96,165,250,0.6)",
    accentColor: "#60a5fa",
    badgeBg: "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
    shine: "from-blue-500/20 via-blue-300/5 to-transparent",
  },
  professional: {
    icon: <Sparkles size={20} className="text-orange-400" />,
    glowColor: "rgba(249,115,22,0.2)",
    borderGlow: "rgba(249,115,22,0.8)",
    accentColor: "#f97316",
    badgeBg: "linear-gradient(135deg, #7c2d12, #c2410c)",
    shine: "from-orange-500/30 via-orange-300/10 to-transparent",
  },
  enterprise: {
    icon: <Crown size={20} className="text-purple-400" />,
    glowColor: "rgba(168,85,247,0.15)",
    borderGlow: "rgba(168,85,247,0.6)",
    accentColor: "#a855f7",
    badgeBg: "linear-gradient(135deg, #3b0764, #6b21a8)",
    shine: "from-purple-500/20 via-purple-300/5 to-transparent",
  },
};

export default function PricingCard({
  name,
  price,
  period = "/month",
  description,
  features,
  highlighted = false,
  badge,
  cta,
  ctaLink,
  tier = "free",
  onCtaClick,
}: PricingCardProps) {
  const config = tierConfig[tier] || tierConfig.free;

  const handleClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      window.location.href = ctaLink;
    }
  };

  return (
    <div
      className="relative group"
      style={{ transform: highlighted ? "scale(1.04)" : "scale(1)", transition: "transform 0.3s ease" }}
    >
      {/* Outer glow ring — animated on hover */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: `0 0 40px 8px ${config.glowColor}, 0 0 80px 16px ${config.glowColor}`,
          borderRadius: "16px",
        }}
      />

      {/* Animated shiny border */}
      <div
        className="absolute inset-0 rounded-2xl p-[1.5px] transition-all duration-500"
        style={{
          background: highlighted
            ? `conic-gradient(from var(--angle, 0deg), transparent 20%, ${config.borderGlow} 40%, ${config.accentColor} 50%, ${config.borderGlow} 60%, transparent 80%)`
            : `linear-gradient(135deg, ${config.borderGlow}40, transparent 50%, ${config.borderGlow}40)`,
          animation: highlighted ? "spin-border 3s linear infinite" : "none",
        }}
      >
        <div className="w-full h-full rounded-2xl bg-[var(--surface)]" />
      </div>

      {/* Card Body */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: highlighted
            ? `linear-gradient(145deg, #1a1410 0%, #0f0d0b 60%, #1a120a 100%)`
            : `linear-gradient(145deg, #141414 0%, #0f0f0f 100%)`,
          border: `1px solid ${config.borderGlow}30`,
          boxShadow: highlighted
            ? `0 20px 60px -10px ${config.glowColor}, 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 ${config.accentColor}20`
            : `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Shine sweep overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.shine} opacity-50 pointer-events-none`}
        />

        {/* Top-left corner accent */}
        <div
          className="absolute top-0 left-0 w-32 h-32 rounded-br-full opacity-10"
          style={{ background: `radial-gradient(circle, ${config.accentColor}, transparent)` }}
        />

        {/* MOST POPULAR Badge */}
        {highlighted && badge && (
          <div className="absolute -top-px left-1/2 -translate-x-1/2">
            <div
              className="px-4 py-1 text-xs font-bold tracking-widest text-white uppercase rounded-b-lg shadow-lg"
              style={{ background: config.badgeBg, boxShadow: `0 4px 16px ${config.glowColor}` }}
            >
              ⭐ {badge}
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`${highlighted ? "mt-5" : "mt-1"} mb-5`}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${config.accentColor}20`, border: `1px solid ${config.accentColor}40` }}
            >
              {config.icon}
            </div>
            <h3 className="text-2xl font-bold text-white">{name}</h3>
          </div>
          <p className="text-sm" style={{ color: `${config.accentColor}99` }}>{description}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span
              className="text-5xl font-black tracking-tight"
              style={{ color: config.accentColor, textShadow: `0 0 20px ${config.accentColor}60` }}
            >
              {price}
            </span>
            {period && (
              <span className="text-sm text-gray-500 ml-1">{period}</span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        {highlighted ? (
          <button
            onClick={handleClick}
            className="w-full py-3 px-6 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}cc)`,
              boxShadow: `0 4px 24px ${config.accentColor}50, 0 1px 0 rgba(255,255,255,0.2) inset`,
            }}
          >
            <span className="relative z-10">{cta}</span>
            {/* Button shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </button>
        ) : (
          <button
            onClick={handleClick}
            className="w-full py-3 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "transparent",
              border: `1.5px solid ${config.accentColor}60`,
              color: config.accentColor,
              boxShadow: `0 0 0 0 ${config.accentColor}30`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${config.accentColor}15`;
              (e.currentTarget as HTMLButtonElement).style.borderColor = config.accentColor;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${config.accentColor}30`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${config.accentColor}60`;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 0 ${config.accentColor}30`;
            }}
          >
            {cta}
          </button>
        )}

        {/* Divider */}
        <div
          className="my-6 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${config.accentColor}40, transparent)` }}
        />

        {/* Features */}
        <div className="space-y-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${config.accentColor}20`, border: `1px solid ${config.accentColor}50` }}
              >
                <Check size={11} style={{ color: config.accentColor }} strokeWidth={3} />
              </div>
              <span
                className={`text-sm leading-relaxed ${
                  idx === 0 && feature.includes("plus")
                    ? "font-semibold text-white"
                    : "text-gray-300"
                }`}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
