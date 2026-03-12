'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Users,
  FileText,
  Award,
  Target,
  TrendingUp,
  ChevronRight,
  Download,
  Linkedin,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react';

export default function Home() {
  const [activePdf, setActivePdf] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  const heroImages = [
    '/images/cbc-analyzer.jpg',
    '/images/chemistry-Analyzer.jpg',
    '/images/hba1c-analyzer1.jpg',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextHero = () => setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
  const prevHero = () => setHeroImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const pdfDocs = [
    { name: 'HbA1c Analyzer A1C EZ2.0', size: '13.9 MB', file: '/pdfs/A1C-EZ-Hand-Meter-final.pdf' },
    { name: 'HbA1c Analyzer A1C EZ2.0', size: '5.0 MB', file: '/pdfs/A1c-chek-pro-glycohemoglobin-analyzer-Brouchure.pdf' },
    { name: 'Hematology Analyzer AC310', size: '0.9 MB', file: '/pdfs/Brochure AC 310.pdf' },
    { name: 'Getein 1100 Immunofluorescence Quantitive Analyzer', size: '35.4 MB', file: '/pdfs/New-GP-Getien-1100-Brochure.pdf' },
    { name: 'Chemistry Analyzer RT-9700', size: '2.6 MB', file: '/pdfs/RT-9700.pdf' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden selection:bg-primary/30">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse-slow delay-700"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      {/* Navigation Layer */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo" className="h-20 w-15 rounded-lg" />
            <p className="text-base font-semibold text-primary tracking-tight">Unique HealthCare Solution</p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground mr-auto ml-12">
            <Link href="#story" className="hover:text-primary transition-colors">Our Story</Link>
            <Link href="#team" className="hover:text-primary transition-colors">The Team</Link>
            <Link href="#resources" className="hover:text-primary transition-colors">Resources</Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/register"
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-secondary/50 rounded-xl border border-border/50 text-foreground"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-background border-b border-border shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-4">
                <Link
                  href="#story"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold p-4 bg-secondary/30 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                  Our Story
                </Link>
                <Link
                  href="#team"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold p-4 bg-secondary/30 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                  The Team
                </Link>
                <Link
                  href="#resources"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold p-4 bg-secondary/30 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                  Resources
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                <Link
                  href="/login"
                  className="flex items-center justify-center p-4 bg-secondary/50 text-foreground rounded-2xl font-bold border border-border/50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center p-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-border/50">
          {/* Background Carousel */}
          <div className="absolute inset-0 z-0">
            {heroImages.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-4s00 ease-in-out ${i === heroImageIndex ? 'opacity-70' : 'opacity-0'}`}
              >
                <img
                  src={img}
                  alt={`Hero ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${[
                      '1504384308090-c894fdcc538d',
                      '1451187580459-43490279c0fa',
                      '1518770660439-4636190af475'
                    ][i]}?auto=format&fit=crop&q=80&w=2000`;
                  }}
                />
              </div>
            ))}
            {/* Refined gradient overlays for better atmosphere */}
            <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background/60 z-[1]"></div>
            <div className="absolute inset-0 bg-blue-900/10 z-[1]"></div>
          </div>

          {/* Carousel Controls - Moved out of the background layer and z-indexed higher */}
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-between px-6">
            <button
              onClick={prevHero}
              className="p-3 bg-background/20 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-primary/20 transition-all pointer-events-auto group"
            >
              <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={nextHero}
              className="p-3 bg-background/20 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-primary/20 transition-all pointer-events-auto group"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative z-10 w-full px-6 md:px-20 py-16 flex items-center justify-center md:justify-start">
            <div className="max-w-xl w-full p-6 md:p-10 bg-background/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl space-y-6 animate-in fade-in duration-1000">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary-800 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-primary/20 backdrop-blur-sm">
                  <Award className="w-3 h-3" />
                  Premium Laboratory Solutions
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
                  Reliable <span className="text-primary">Laboratory</span> Analyzers & Diagnostic Reagents.
                </h1>
                <p className="text-sm md:text-base text-foreground/70 max-w-lg leading-relaxed font-normal">
                  Innovative solutions enhancing the quality and efficiency of your laboratory operations through precision.
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                  <Link href="#story" className="group px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/10">
                    Discover Our Story
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-14">
          {/* Numbers Section - Centered and Tightened */}
          <section className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-80 py-8 border-y border-border/40">
            {[
              { label: 'Active Users', value: '250K+' },
              { label: 'Enterprises', value: '450+' },
              { label: 'Global Offices', value: '12' },
              { label: 'Success Rate', value: '99.9%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-semibold text-primary mb-1">{stat.value}</div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </section>

          {/* Company Story Section */}
          <section id="story" className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Our Mission & Story</h2>
              <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-6">
              <p className="text-xl text-foreground font-medium leading-normal italic">
                "We don't just supply laboratory products. We support discovery, research, and better healthcare."
              </p>
              <p>
                Founded in 2024, our journey began with a simple goal: to make reliable laboratory supplies and pharmaceutical products easily accessible to professionals, researchers, and healthcare providers. Our team is passionate about supporting scientific progress by providing high-quality reagents, laboratory materials, and trusted pharmacy products.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                <div className="p-6 bg-secondary/20 rounded-xl border border-border/50 shadow-sm space-y-3">
                  <Target className="w-8 h-8 text-primary/80" />
                  <h4 className="text-xl font-semibold text-foreground">The Vision</h4>
                  <p className="text-md leading-relaxed text-muted-foreground">To become a trusted supplier of laboratory reagents, pharmaceutical products, and scientific materials that empower laboratories, students, researchers, and healthcare professionals.</p>
                </div>
                <div className="p-6 bg-secondary/20 rounded-xl border border-border/50 shadow-sm space-y-3">
                  <TrendingUp className="w-8 h-8 text-blue-500/80" />
                  <h4 className="text-xl font-semibold text-foreground">The Growth</h4>
                  <p className="text-md leading-relaxed text-muted-foreground">From a small local operation, we are steadily expanding our range of laboratory reagents, chemicals, and pharmaceutical products to serve research labs, educational institutions, and healthcare providers.</p>
                </div>
              </div>
              <p>
                Today, we continue to focus on quality, reliability, and scientific integrity. Our mission remains simple: provide dependable laboratory reagents, pharmaceutical supplies, and professional service that support research, diagnostics, and innovation.
              </p>
            </div>
          </section>

          {/* Team Section */}
          <section id="team" className="space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">The Minds Behind</h2>
              <p className="text-muted-foreground text-lg">A multidisciplinary team of innovators, dreamers, and builders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: 'Ahmad Hassan',
                  role: 'Founder & CEO',
                  img: '/images/ceo.jpg',
                  contact: '0304 7025098'
                },
                {
                  name: 'Faizan Zahid',
                  role: 'Managing Director',
                  img: '/images/managing-director.jpg',
                  contact: '0305 6131924'
                },
                {
                  name: 'Naeem Anjum',
                  role: 'Product Specialist',
                  img: '/images/product-specialist.jpg',
                  contact: '0300 6530048'
                },
              ].map((member, i) => (
                <div key={i} className="relative aspect-3/5 rounded-2xl bg-secondary/30 border border-border/50 overflow-hidden group">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                    onError={(e) => {
                      const fallbacks = [
                        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800'
                      ];
                      (e.target as HTMLImageElement).src = fallbacks[i];
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-background/40 backdrop-blur-md border border-white/5 rounded-xl">
                    <h3 className="text-lg font-semibold leading-tight">{member.name}</h3>
                    <div className="space-y-0.5">
                      <p className="text-primary font-bold text-[16px] uppercase tracking-wider">{member.role}</p>
                      <p className="text-foreground/80 font-bold text-[16px] uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-primary/40 rounded-full"></span>
                        {member.contact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Resources Section */}
          <section id="resources" className="py-16 px-2 bg-secondary/10 rounded-2xl border border-border/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-10">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Corporate Resources</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Access official documentation, brand guidelines, and product catalogues.
                </p>
              </div>

              <div className="space-y-4">
                {pdfDocs.map((doc, i) => (
                  <div
                    key={i}
                    className={`border border-border/40 rounded-2xl overflow-hidden transition-all duration-300 ${activePdf === i ? 'bg-background shadow-lg' : 'bg-background/40 hover:bg-background/60'}`}
                  >
                    <button
                      onClick={() => setActivePdf(activePdf === i ? null : i)}
                      className="w-full p-5 flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${activePdf === i ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="text-base font-semibold tracking-tight">{doc.name}</h5>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{doc.size} • PDF</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <a
                          href={doc.file}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-3 bg-secondary/50 hover:bg-primary hover:text-primary-foreground rounded-xl transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        {activePdf === i ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-muted-foreground" />}
                      </div>
                    </button>

                    {activePdf === i && (
                      <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="h-[600px] w-full bg-secondary/30 rounded-2xl border border-border overflow-hidden relative group shadow-inner">
                          <iframe
                            src={`${doc.file}#toolbar=0&view=FitH`}
                            className="w-full h-full border-none"
                            title={doc.name}
                          />
                          <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-2xl"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex items-center gap-3 border border-primary/30 rounded-2xl p-4">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-[12px] uppercase font-bold tracking-widest text-muted-foreground/60">Company Gmail</p>
                    <p className="font-semibold text-lg">uniquehealthcaresolution.swl@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Logo" className="h-25 w-15" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Leading the next generation of data-driven business intelligence with elegance and precision.
            </p>
          </div>
          <div>
            <h6 className="font-bold uppercase text-[10px] tracking-widest mb-6">Company</h6>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li><Link href="#story" className="hover:text-primary transition-colors">About Us</Link></li>
              <li>Careers</li>
              <li>Press</li>
              <li>Privacy</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold uppercase text-[10px] tracking-widest mb-6">Support</h6>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li>Documentation</li>
              <li>Help Center</li>
              <li>Status</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold uppercase text-[10px] tracking-widest mb-6">Stay Updated</h6>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Work email"
                className="bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm w-full outline-none focus:border-primary transition-colors"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm">Join</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
