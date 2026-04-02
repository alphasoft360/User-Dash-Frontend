'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import MagneticButton from '@/components/MagneticButton';
import AnimatedCounter from '@/components/AnimatedCounter';
import SpotlightCard from '@/components/SpotlightCard';
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Zap,
  Layers,
  Users,
  BarChart3,
  Cpu,
  LayoutDashboard,
  Package,
  FlaskConical
} from 'lucide-react';

export default function PromotionPage() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: false,
      mirror: true,
      easing: 'ease-in-out-cubic',
      offset: 50,
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full glass-morphism transition-all duration-500">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MagneticButton>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                A
              </div>
            </MagneticButton>
            <span className="font-bold text-xl tracking-tight">AlphaSoft360</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <MagneticButton><a href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors">Features</a></MagneticButton>
            <MagneticButton><a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors">Solutions</a></MagneticButton>
            <MagneticButton><a href="#about" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors">About</a></MagneticButton>
          </div>
          <div className="flex items-center gap-4">
            <MagneticButton>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-500/30 block"
              >
                Sign In
              </Link>
            </MagneticButton>
          </div>
        </div>
      </nav>

      <main className="grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] opacity-10 dark:opacity-20 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-8 animate-fade-in" data-aos="fade-down">
              <Zap size={14} className="fill-current" />
              <span>THE FUTURE OF ENTERPRISE MANAGEMENT</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6" data-aos="fade-up">
              Elevate Your Business with <br />
              <span className="animate-gradient-text">AlphaSoft360</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed" data-aos="fade-up" data-aos-delay="100">
              Experience a unified digital ecosystem designed to scale your operations,
              streamline workflows, and drive unprecedented growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4" data-aos="fade-up" data-aos-delay="200">
              <MagneticButton className="w-full sm:w-auto">
                <Link
                  href="/login"
                  className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 block"
                >
                  <div className="flex items-center justify-center gap-2">
                    Get Started Now
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </MagneticButton>
              <MagneticButton className="w-full sm:w-auto">
                <a
                  href="#features"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold text-lg border border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all block"
                >
                  Learn More
                </a>
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Solutions</h2>
              <p className="text-gray-600 dark:text-gray-400">Built for scale, designed for simplicity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: LayoutDashboard,
                  title: 'Core Engine 360',
                  description: 'A centralized dashboard giving you a bird’s eye view of your entire laboratory logistics.'
                },
                {
                  icon: Package,
                  title: 'Smart Inventory',
                  description: 'Real-time tracking of reagents and supplies with predictive restock alerts.'
                },
                {
                  icon: FlaskConical,
                  title: 'Diagnostic Hub',
                  description: 'Seamless integration with diagnostic analyzers for rapid and accurate results.'
                },
                {
                  icon: ShieldCheck,
                  title: 'Enterprise Security',
                  description: 'Bank-grade encryption ensuring your research and patient data remains private.'
                }
              ].map((feature, i) => (
                <SpotlightCard key={i} className="px-8 py-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl hover:border-indigo-500/30 transition-all text-center" data-aos="fade-up" data-aos-delay={i * 100}>
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-6">
                    <feature.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* About / Stats */}
        <section id="solutions" className="py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2" data-aos="fade-right">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                  Driving Innovation for <br />
                  <span className="text-indigo-600">Modern Businesses</span>
                </h2>
                <div className="space-y-6">
                  {[
                    "Unified dashboard for all your operations",
                    "Advanced user management and role-based access",
                    "Responsive design for mobile and desktop access",
                    "Dedicated support team and comprehensive documentation"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3" data-aos="fade-up" data-aos-delay={i * 100}>
                      <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={20} />
                      <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 relative" data-aos="zoom-in" data-aos-delay="200">
                <div className="absolute -inset-4 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-10 dark:opacity-20 animate-pulse" />
                <div className="relative aspect-video rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-2xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Users size={64} className="text-indigo-600" />
                    <div className="text-4xl font-bold">
                      <AnimatedCounter value={10000} />+
                    </div>
                    <div className="text-gray-500 uppercase tracking-widest text-sm font-bold">Active Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24" data-aos="zoom-up" data-aos-delay="200">
          <div className="container mx-auto px-4">
            <div className="relative p-8 md:p-16 rounded-3xl bg-indigo-600 text-white overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px]" />

              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Business?</h2>
                <p className="text-xl text-indigo-100 mb-10">
                  Join hundreds of forward-thinking companies already using AlphaSoft360 to scale their operations.
                </p>
                <MagneticButton className="mx-auto">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-white text-indigo-600 font-bold text-xl hover:bg-gray-100 transition-all shadow-xl block"
                  >
                    Start Your Journey
                    <ArrowRight size={22} />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <span className="font-bold text-lg">AlphaSoft360</span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} AlphaSoft360. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
