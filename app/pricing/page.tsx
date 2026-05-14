"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePayment = (plan: string) => {
    setSelectedPlan(plan);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push("/");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#1A1A2E] text-white py-20 px-4 relative overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold"
          >
            <Check className="w-5 h-5" />
            Payment Successful! Redirecting...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute w-[600px] h-[600px] bg-[#F97316] rounded-full mix-blend-screen filter blur-[200px] opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400">Unlock the full potential of HeatWatch analytics.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-[#1A1A2E]/80 backdrop-blur-xl border border-gray-700 hover:border-[#F97316]/50 rounded-3xl p-8 flex flex-col transition-all duration-300 shadow-xl"
          >
            <h3 className="text-2xl font-semibold mb-2">Monthly</h3>
            <div className="text-4xl font-bold mb-6">₹2000 <span className="text-lg text-gray-400 font-normal">/ mo</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3"><Check className="text-[#F97316] w-5 h-5" /> Real-time UHI monitoring</li>
              <li className="flex items-center gap-3"><Check className="text-[#F97316] w-5 h-5" /> Basic PDF Reports</li>
              <li className="flex items-center gap-3"><Check className="text-[#F97316] w-5 h-5" /> Standard API access</li>
            </ul>
            <button
              onClick={() => handlePayment("monthly")}
              className="w-full py-4 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Confirm Payment
            </button>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-[#1A1A2E]/80 backdrop-blur-xl border-2 border-[#F97316] rounded-3xl p-8 flex flex-col transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.15)] relative"
          >
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#F97316] text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
              BEST VALUE
            </div>
            <h3 className="text-2xl font-semibold mb-2">Yearly</h3>
            <div className="text-4xl font-bold mb-6 text-[#F97316]">₹20000 <span className="text-lg text-gray-400 font-normal">/ yr</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3"><Check className="text-[#F97316] w-5 h-5" /> All Monthly features</li>
              <li className="flex items-center gap-3"><Check className="text-[#F97316] w-5 h-5" /> Advanced Predictive Modeling</li>
              <li className="flex items-center gap-3"><Check className="text-[#F97316] w-5 h-5" /> Unlimited Export & Integrations</li>
              <li className="flex items-center gap-3"><Check className="text-[#F97316] w-5 h-5" /> Priority 24/7 Support</li>
            </ul>
            <button
              onClick={() => handlePayment("yearly")}
              className="w-full py-4 rounded-xl font-bold text-white bg-[#F97316] hover:bg-[#EA580C] shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
            >
              Confirm Payment
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
