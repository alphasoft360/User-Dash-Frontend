'use client';

import { useState, useEffect, use, useRef } from 'react';
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
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AlphasoftBanner from '@/components/AlphasoftBanner';
import api from '@/lib/api';

interface CompanyInfo {
  name: string;
  slug: string;
}

export default function Home({ params }: { params: Promise<{ companySlug: string }> }) {
  const { companySlug } = use(params);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [activePdf, setActivePdf] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [pdfDocs, setPdfDocs] = useState<any[]>([]);
  const [logoPath, setLogoPath] = useState('/images/logo.png');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const [showBanner, setShowBanner] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCardVisible(true);
        } else {
          setIsCardVisible(false);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyResponse = await api.get(`/public/company/${companySlug}`);
        const settings = companyResponse.data.settings || {};

        setCompanyInfo({
          name: companyResponse.data.name,
          slug: companyResponse.data.slug
        });

        // Setup Hero Images
        if (settings.hero_images && Array.isArray(settings.hero_images)) {
          setHeroImages(settings.hero_images.map((img: string) => `/tenants/${companySlug}/images/${img}`));
        } else {
          setHeroImages([
            '/images/cbc-analyzer.jpg',
            '/images/chemistry-Analyzer.jpg',
            '/images/hba1c-analyzer1.jpg',
          ]);
        }

        // Setup PDF Docs
        if (settings.resources && Array.isArray(settings.resources)) {
          setPdfDocs(settings.resources.map((doc: any) => ({
            ...doc,
            file: `/tenants/${companySlug}/pdfs/${doc.file}`
          })));
        } else {
          setPdfDocs([]);
        }

        // Setup Logo
        if (settings.logo) {
          setLogoPath(`/tenants/${companySlug}/images/${settings.logo}`);
        }

        setShowBanner(settings.show_alphasoft_banner === '1');
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchCompanyData();
  }, [companySlug]);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  const nextHero = () => setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
  const prevHero = () => setHeroImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/30">
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
            <img src={logoPath} alt="Logo" className="h-10 w-10 rounded-lg" />
            <p className="text-base font-semibold text-primary tracking-tight">
              {companyInfo?.name || 'Unique HealthCare Solution'}
            </p>
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
              {!isAuthenticated ? (
                <Link
                  href={`/${companySlug}/register`}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                >
                  Get Started
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 bg-secondary/50 hover:bg-secondary rounded-full border border-border transition-all active:scale-95"
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-3 w-64 bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-border bg-secondary/20">
                          <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors group"
                          >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <div className="sm:hidden">
                <ThemeToggle />
              </div>
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

              <div className="pt-6 border-t border-border">
                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href={`/${companySlug}/login`}
                      className="flex items-center justify-center p-4 bg-secondary/50 text-foreground rounded-2xl font-bold border border-border/50"
                    >
                      Sign In
                    </Link>
                    <Link
                      href={`/${companySlug}/register`}
                      className="flex items-center justify-center p-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{user?.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-3 p-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </nav>

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative w-full min-h-[85vh] bg-background border-b border-border/20 overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-0 left-[-100px] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 h-full min-h-[85vh] max-w-screen-2xl mx-auto">

            {/* Left Column - Content */}
            <div className="flex flex-col justify-center px-8 py-16 lg:py-24 lg:pl-20 xl:pl-32 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 mt-8 lg:mt-0">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/80 backdrop-blur-md border border-border/50 rounded-full text-xs font-bold uppercase tracking-widest text-foreground w-fit shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {companyInfo?.name || 'Unique Healthcare Solutions'}
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Modernize Your <br />
                <span className="text-primary font-bold relative inline-block mt-2">
                  Laboratory
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                  </svg>
                </span> <br />
                Operations.
              </h1>

              {/* Subtext */}
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg font-medium">
                Equip your facility with innovative diagnostic analyzers and high-precision chemical reagents. Speed, accuracy, and continuous excellence built right in.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link href="#story" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 group">
                  Discover Our Story
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#resources" className="w-full sm:w-auto px-8 py-4 bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-1 group">
                  View Resources
                  <Download className="w-4 h-4 text-muted-foreground group-hover:translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Minimal Stats */}
              <div className="flex items-center gap-6 pt-8 md:pt-12 border-t border-border/40 max-w-md w-full">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-foreground">100<span className="text-primary">+</span></p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Partners</p>
                </div>
                <div className="w-px h-10 bg-border/50"></div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-foreground">99.9<span className="text-primary">%</span></p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accuracy</p>
                </div>
                <div className="w-px h-10 bg-border/50"></div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-foreground">24<span className="text-primary">/</span>7</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Support</p>
                </div>
              </div>
            </div>

            {/* Right Column - Image Carousel */}
            <div className="relative flex items-center justify-center p-6 lg:p-12 min-h-[50vh] lg:h-auto animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative w-full h-full max-h-[600px] xl:max-h-[700px] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border border-border bg-secondary/20">
                {/* Carousel Images */}
                <div className="absolute inset-0">
                  {heroImages.map((img, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${i === heroImageIndex ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-[2px]'}`}
                    >
                      <img
                        src={img}
                        alt={`Hero Carousel ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const customFallbacks = [
                            'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200',
                            'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200',
                            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200'
                          ];
                          (e.target as HTMLImageElement).src = customFallbacks[i] || customFallbacks[0];
                        }}
                      />
                      {/* Gentle inner shadow to frame the image nicely */}
                      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)] pointer-events-none"></div>
                    </div>
                  ))}
                </div>

                {/* Floating Carousel Controls */}
                <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 flex items-center gap-3 z-30">
                  <button
                    onClick={prevHero}
                    className="p-3 bg-background/60 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-background hover:scale-105 transition-all text-foreground shadow-xl group border-border"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={nextHero}
                    className="p-3 bg-background/60 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-background hover:scale-105 transition-all text-foreground shadow-xl group border-border"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Glassmorphic floating card decoration - Moved outside overflow-hidden */}
              <div
                ref={cardRef}
                className={`absolute top-14 md:top-24 left-4 md:left-2 bg-background/80 backdrop-blur-2xl border border-border p-4 rounded-2xl shadow-2xl hidden sm:flex items-center gap-4 z-40 ${isCardVisible ? 'animate-slide-in-left' : 'opacity-0'}`}
              >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Target className="w-6 h-6" />
                </div>
                <div className="pr-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Precision</p>
                  <p className="text-sm font-black text-foreground">Highest Guarantee</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {showBanner && (
          <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AlphasoftBanner />
          </div>
        )}

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
                &quot;We don&apos;t just supply laboratory products. We support discovery, research, and better healthcare.&quot;
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
                  img: `/tenants/${companySlug}/images/ceo.jpg`,
                  contact: '0304 7025098'
                },
                {
                  name: 'Faizan Zahid',
                  role: 'Managing Director',
                  img: `/tenants/${companySlug}/images/managing-director.jpg`,
                  contact: '0305 6131924'
                },
                {
                  name: 'Naeem Anjum',
                  role: 'Product Specialist',
                  img: `/tenants/${companySlug}/images/product-specialist.jpg`,
                  contact: '0300 6530048'
                },
              ].map((member, i) => (
                <div key={i} className="relative aspect-3/5 rounded-2xl bg-secondary/30 border border-border/50 overflow-hidden group transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 cursor-pointer">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    onError={(e) => {
                      const fallbacks = [
                        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800'
                      ];
                      (e.target as HTMLImageElement).src = fallbacks[i];
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 dark:via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-5 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-500 group-hover:bg-background/80 group-hover:-translate-y-1">
                    <h3 className="text-xl font-black tracking-tight mb-1">{member.name}</h3>
                    <div className="space-y-1.5">
                      <p className="text-[15px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
                        {member.role}
                      </p>
                      <p className="text-[15px] font-bold text-muted-foreground/60 uppercase tracking-[0.25em] flex items-center gap-2">
                        <span className="w-1.5 h-px bg-primary/30"></span>
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
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=uniquehealthcaresolution.swl@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-primary/30 rounded-2xl p-4 w-full md:w-auto overflow-hidden hover:bg-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md hover:border-primary/60"
                >
                  <Users className="w-8 h-8 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[12px] uppercase font-bold tracking-widest text-muted-foreground/60 group-hover:text-primary/80 transition-colors">Company Gmail</p>
                    <p className="font-semibold text-base md:text-lg break-all group-hover:text-primary transition-colors">uniquehealthcaresolution.swl@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>      {/* Brands Footer Section */}
      <footer className="relative bg-background pt-16 border-t border-border/60 mt-10 overflow-hidden">

        {/* Concentric Circles Pattern Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.2] dark:opacity-[0.1]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="concentric-circles" width="120" height="120" patternUnits="userSpaceOnUse">
                <circle cx="60" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="60" cy="60" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#concentric-circles)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
          {/* Section Heading */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground uppercase">
              Partner Associate Brands
            </h2>
            <div className="h-1 w-12 bg-primary mx-auto rounded-full mt-3"></div>
          </div>

          {/* Logo Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            {[
              { name: 'DiaSys', path: '/partner-logos/diasys.png' },
              { name: 'Human', path: '/partner-logos/human.png' },
              { name: 'Erba Mannheim', path: '/partner-logos/erba.png' },
              { name: 'Martin Dow', path: '/partner-logos/martindow.png' },
              { name: 'Sysmex', path: '/partner-logos/sysmex.png' },
              { name: 'Mindray', path: '/partner-logos/mindray.png' },
              { name: 'MERCK', path: '/partner-logos/merck.png' },
              { name: 'Rayto', path: '/partner-logos/rayto.png' },
              { name: 'BioMed', path: '/partner-logos/biomed.png' },
              { name: 'BioHermes', path: '/partner-logos/biohermes.png' },
              { name: 'Getein Biotech', path: '/partner-logos/getein.png' },
              { name: 'DIAGAST', path: '/partner-logos/diagast.png' }
            ].map((p, i) => (
              <div key={i} className="group relative flex items-center justify-center p-4 h-28 bg-linear-to-b from-secondary/40 to-background/40 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all overflow-hidden">
                {/* Elegant subtle shine effect on hover */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                <img
                  src={p.path}
                  alt={p.name}
                  className="relative z-10 max-h-[5.5rem] max-w-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden font-black text-foreground text-lg md:text-xl uppercase tracking-wider text-center relative z-10">{p.name}</span>
              </div>
            ))}
          </div>

          {/* Footer Text */}
          <p className="text-center font-bold text-primary uppercase md:text-lg lg:text-xl tracking-wide leading-relaxed max-w-5xl mx-auto">
            WHOLESALE DISTRIBUTOR OF LAB DISPOSABLE ITEMS & DIAGNOSTIC REAGENTS LABORATORY, RADIOLOGY & HOSPITAL EQUIPMENT, BIOMEDICAL SERVICES & GENERAL ORDER SUPPLIER
          </p>
        </div>
      </footer>
    </div>
  );
}
