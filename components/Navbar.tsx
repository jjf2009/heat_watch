"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="nm-nav sticky top-0 z-50 w-full border-b border-orange-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo (Left) */}
          <div className="flex items-center flex-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]">
                Heat<span className="text-orange-500">Watch</span>
              </span>
            </Link>
          </div>

          {/* Nav Links (Center) */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-2">
            <Link href="/" className="text-orange-500 hover:text-white px-4 py-2 rounded-xl text-lg font-medium transition-colors hover:bg-white/5">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-orange-500 px-4 py-2 rounded-xl text-lg font-medium transition-colors hover:bg-white/5">
              About
            </Link>
            <Link href="/report-heat" className="text-white hover:text-orange-500 px-4 py-2 rounded-xl text-lg font-medium transition-colors hover:bg-white/5 flex items-center gap-1.5">
              <span className="text-sm">📍</span> Community
            </Link>

            <div className="relative">
              <button
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
                className="flex items-center text-white hover:text-orange-500 px-4 py-2 rounded-xl text-lg font-medium transition-colors hover:bg-white/5"
              >
                Services
                <ChevronDown className={`ml-1 w-5 h-5 transition-transform duration-200 ${isServicesOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                    className="nm-dropdown absolute left-1/2 -translate-x-1/2 mt-2 w-48 overflow-hidden"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => router.push("/login")}
                        className="block w-full text-left px-4 py-3 text-base text-white hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                      >
                        Simulation
                      </button>
                      <button
                        onClick={() => router.push("/login")}
                        className="block w-full text-left px-4 py-3 text-base text-white hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                      >
                        Planning
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons (Right) */}
          <div className="hidden md:flex flex-1 justify-end items-center space-x-3">
            <button
              onClick={() => router.push("/login")}
              className="nm-btn-orange text-white px-6 py-2.5 rounded-full text-lg font-medium"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="nm-btn-white text-[#1A1A2E] px-6 py-2.5 rounded-full text-lg font-bold"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="-mr-2 flex md:hidden items-center justify-end flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl nm-card text-white hover:text-orange-500 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#14142A] border-t border-orange-500/10 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-5 space-y-1">
              <Link href="/" className="text-orange-500 block px-3 py-2.5 rounded-xl text-lg font-medium hover:bg-white/5">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-orange-500 block px-3 py-2.5 rounded-xl text-lg font-medium hover:bg-white/5">
                About
              </Link>
              <Link href="/report-heat" className="text-white hover:text-orange-500 block px-3 py-2.5 rounded-xl text-lg font-medium hover:bg-white/5">
                📍 Community
              </Link>
              <div className="space-y-1 pl-2">
                <div className="text-gray-400 px-3 py-2 text-sm uppercase tracking-wider">Services</div>
                <button
                  onClick={() => router.push("/login")}
                  className="text-white hover:text-orange-500 block px-3 py-2.5 rounded-xl text-lg font-medium w-full text-left hover:bg-white/5"
                >
                  Simulation
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="text-white hover:text-orange-500 block px-3 py-2.5 rounded-xl text-lg font-medium w-full text-left hover:bg-white/5"
                >
                  Planning
                </button>
              </div>
              <div className="pt-4 flex flex-col gap-3 px-3">
                <button
                  onClick={() => router.push("/login")}
                  className="nm-btn-orange text-white w-full py-3 rounded-full text-lg font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/pricing")}
                  className="nm-btn-white text-[#1A1A2E] w-full py-3 rounded-full text-lg font-bold"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
