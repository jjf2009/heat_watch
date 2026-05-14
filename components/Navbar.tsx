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
          {/* Logo (Left) */}
          <div className="flex items-center flex-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                Heat<span className="text-orange-500">Watch</span>
              </span>
            </Link>
          </div>
          
          {/* Nav Links (Center) */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
            <Link href="/" className="text-orange-500 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-orange-500 px-3 py-2 rounded-md text-lg font-medium transition-colors">
              About
            </Link>
            
            <div className="relative">
              <button
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
                className="flex items-center text-white hover:text-orange-500 px-3 py-2 rounded-md text-lg font-medium transition-colors"
              >
                Services
                <ChevronDown className={`ml-1 w-5 h-5 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-md shadow-lg bg-[#1A1A2E] ring-1 ring-black ring-opacity-5 overflow-hidden border border-orange-500/20"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => router.push("/login")}
                        className="block w-full text-left px-4 py-2 text-base text-white hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                      >
                        Simulation
                      </button>
                      <button
                        onClick={() => router.push("/login")}
                        className="block w-full text-left px-4 py-2 text-base text-white hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
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
          <div className="hidden md:flex flex-1 justify-end items-center space-x-4">
            <button 
              onClick={() => router.push("/login")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full text-lg font-medium transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => router.push("/pricing")}
              className="bg-white hover:bg-gray-200 text-[#1A1A2E] px-6 py-2 rounded-full text-lg font-bold transition-colors shadow-lg"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="-mr-2 flex md:hidden items-center justify-end flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-orange-500 focus:outline-none"
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
            className="md:hidden bg-[#1A1A2E] border-b border-orange-500/20 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="text-orange-500 block px-3 py-2 rounded-md text-lg font-medium">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-orange-500 block px-3 py-2 rounded-md text-lg font-medium">
                About
              </Link>
              <div className="space-y-1 pl-4">
                <div className="text-gray-400 px-3 py-2 text-base uppercase tracking-wider">Services</div>
                <button
                  onClick={() => router.push("/login")}
                  className="text-white hover:text-orange-500 block px-3 py-2 rounded-md text-lg font-medium w-full text-left"
                >
                  Simulation
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="text-white hover:text-orange-500 block px-3 py-2 rounded-md text-lg font-medium w-full text-left"
                >
                  Planning
                </button>
              </div>
              <div className="pt-4 flex flex-col gap-3 px-3">
                <button 
                  onClick={() => router.push("/login")}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full py-3 rounded-full text-lg font-medium transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => router.push("/pricing")}
                  className="bg-white hover:bg-gray-200 text-[#1A1A2E] w-full py-3 rounded-full text-lg font-bold transition-colors"
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
