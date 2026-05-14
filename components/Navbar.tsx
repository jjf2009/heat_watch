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
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-[#1A1A2E]/80 border-b border-[#F97316]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                Heat<span className="text-[#F97316]">Watch</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-[#F97316] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-[#F97316] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
              
              <div className="relative">
                <button
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                  className="flex items-center text-white hover:text-[#F97316] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Services
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseEnter={() => setIsServicesOpen(true)}
                      onMouseLeave={() => setIsServicesOpen(false)}
                      className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#1A1A2E] ring-1 ring-black ring-opacity-5 overflow-hidden border border-[#F97316]/20"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => router.push("/login")}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors"
                        >
                          Simulation
                        </button>
                        <button
                          onClick={() => router.push("/login")}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors"
                        >
                          Planning
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#F97316] focus:outline-none"
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
            className="md:hidden bg-[#1A1A2E] border-b border-[#F97316]/20 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="text-[#F97316] block px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-[#F97316] block px-3 py-2 rounded-md text-base font-medium">
                About
              </Link>
              <div className="space-y-1 pl-4">
                <div className="text-gray-400 px-3 py-2 text-sm uppercase tracking-wider">Services</div>
                <button
                  onClick={() => router.push("/login")}
                  className="text-white hover:text-[#F97316] block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Simulation
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="text-white hover:text-[#F97316] block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Planning
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
