import Link from "next/link";
import {
  MapPin,
  Shield,
  Users,
  BarChart3,
  ChevronRight,
  ArrowRight,
  Globe,
  Lock,
  Cpu,
  Clock,
  Award,
} from "lucide-react";

// ==============================================
// Component: Header
// ==============================================
const Header = () => (
  <header className="sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center border-b border-blue-100/80 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
    <div className="container mx-auto flex items-center justify-between">
      <Link className="flex items-center justify-center group" href="/">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-200">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <span className="ml-3 font-bold text-2xl bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
          TourSync
        </span>
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-all duration-200 hover:scale-105"
          href="/auth/login"
        >
          Login
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-300"
          href="/auth/register"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </nav>
    </div>
  </header>
);

// ==============================================
// Component: Hero
// ==============================================
const Hero = () => (
  <section className="w-full py-16 md:py-28 lg:py-36 overflow-hidden">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="flex flex-col items-center space-y-8 text-center">
        <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 mb-2 animate-fade-in">
          <Award className="mr-2 h-4 w-4" />
          Voted #1 Tour Management Software of 2025
        </div>

        <div className="space-y-6 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Enterprise‑Grade Tour Management{" "}
            <span className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Platform
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl leading-relaxed">
            A full‑stack solution for educational and organizational tours.
            <br />
            Real‑time coordination, automated attendance, and advanced safety features – all built
            with modern web technologies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/auth/register"
            className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-300"
          >
            Get Started
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="#features"
            className="group inline-flex items-center justify-center rounded-full border-2 border-blue-200 bg-white px-8 py-4 text-base font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:scale-105 transition-all duration-300"
          >
            Explore Features
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// ==============================================
// Component: ProductPreview
// ==============================================
const ProductPreview = () => (
  <section className="w-full py-20 md:py-28 bg-gradient-to-b from-white to-blue-50/30">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl mb-4">
          Professional{" "}
          <span className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
            Dashboard Preview
          </span>
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-slate-600">
          A glimpse into the real‑time command center used by tour coordinators.
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Mockup card */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-blue-200 bg-white">
          {/* Top bar */}
          <div className="bg-slate-100 px-6 py-3 flex items-center border-b border-blue-100">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 text-center text-sm font-medium text-slate-500">
              toursync.app/dashboard
            </div>
          </div>
          {/* Content */}
          <div className="p-6 grid md:grid-cols-3 gap-4 bg-white">
            <div className="col-span-2 space-y-4">
              <div className="h-8 bg-blue-100 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-blue-50 rounded-lg border border-blue-100 p-3 flex flex-col justify-between">
                  <span className="text-xs text-blue-600">Active Tours</span>
                  <span className="text-2xl font-bold text-slate-800">12</span>
                </div>
                <div className="h-24 bg-blue-50 rounded-lg border border-blue-100 p-3 flex flex-col justify-between">
                  <span className="text-xs text-blue-600">Participants</span>
                  <span className="text-2xl font-bold text-slate-800">342</span>
                </div>
              </div>
              <div className="h-40 bg-blue-50 rounded-lg border border-blue-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Live Locations</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-blue-200 rounded-full w-full"></div>
                  <div className="h-2 bg-blue-200 rounded-full w-5/6"></div>
                  <div className="h-2 bg-blue-200 rounded-full w-4/6"></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-blue-50 rounded-lg border border-blue-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Upcoming</span>
                </div>
                <div className="text-xs text-slate-600">• City Museum – 2h</div>
                <div className="text-xs text-slate-600">• Central Park – 4h</div>
              </div>
              <div className="h-32 bg-blue-50 rounded-lg border border-blue-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Safety Status</span>
                </div>
                <div className="text-xs text-green-600">✓ All clear</div>
                <div className="text-xs text-slate-600 mt-2">No active alerts</div>
              </div>
            </div>
          </div>
        </div>
        {/* Optional overlay label */}
        <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
          Live Demo Available
        </div>
      </div>
    </div>
  </section>
);

// ==============================================
// Component: HowItWorks
// ==============================================
const HowItWorks = () => {
  const steps = [
    {
      icon: MapPin,
      title: "Plan & Configure",
      description:
        "Create tour itineraries, set geofences, assign coordinators, and define safety protocols.",
    },
    {
      icon: Users,
      title: "Execute in Real Time",
      description:
        "Track attendance with QR codes, receive location updates, and communicate instantly.",
    },
    {
      icon: Shield,
      title: "Monitor Safety",
      description:
        "Automated SOS alerts, incident reporting, and live safety dashboard for coordinators.",
    },
    {
      icon: BarChart3,
      title: "Analyze & Report",
      description:
        "Post-tour analytics, expense summaries, and compliance reports for stakeholders.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 md:py-28 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl mb-4">
            System{" "}
            <span className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Lifecycle
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            From planning to post‑tour analysis <br />A complete workflow designed for reliability
            and scale.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center p-6 text-center group">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold border-4 border-white shadow-md">
                {idx + 1}
              </div>
              <div className="mt-8 mb-4 p-4 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                <step.icon className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==============================================
// Component: Features (refined)
// ==============================================
const Features = () => (
  <section
    id="features"
    className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-b from-blue-50/30 to-white"
  >
    <div className="container px-4 md:px-6 mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl mb-4">
          Core Capabilities{" "}
          <span className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
            for Modern Tours
          </span>
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-slate-600">
          Built with enterprise patterns and real‑world educational needs.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Feature 1 */}
        <div className="group relative flex flex-col items-center p-8 rounded-3xl bg-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-2">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="pt-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Geofenced Attendance</h3>
            <p className="text-slate-600 leading-relaxed">
              QR code check‑ins with offline support. Automatic roll calls based on location
              boundaries.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="group relative flex flex-col items-center p-8 rounded-3xl bg-white border-2 border-green-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-500 hover:-translate-y-2">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="pt-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Safety & SOS</h3>
            <p className="text-slate-600 leading-relaxed">
              One‑tap emergency alerts with real‑time location sharing. Incident logging and
              coordinator notifications.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="group relative flex flex-col items-center p-8 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 hover:-translate-y-2">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="pt-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Budget Intelligence</h3>
            <p className="text-slate-600 leading-relaxed">
              Real‑time expense tracking, fund allocation, and automated receipt OCR. Audit‑ready
              reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ==============================================
// Component: Security & Architecture
// ==============================================
const SecurityTrust = () => {
  const items = [
    {
      icon: Lock,
      title: "Secure Authentication",
      description: "Modern authentication system with encrypted credentials and protected access.",
    },
    {
      icon: Users,
      title: "Role‑Based Access Control",
      description: "Clear permission levels for Admins, Leaders, and Participants.",
    },
    {
      icon: Globe,
      title: "Reliable Data Architecture",
      description: "Designed to ensure consistent, accurate, and traceable information.",
    },
    {
      icon: Cpu,
      title: "Performance Optimized",
      description: "Fast and responsive interface built using modern web frameworks.",
    },
  ];

  return (
    <section className="w-full py-20 md:py-28 bg-white border-y border-blue-100">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl mb-4">
            Security &{" "}
            <span className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Architecture
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            Built with modern best practices to ensure data safety, scalability, and
            maintainability.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-700 mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==============================================
// Component: CTA Section
// ==============================================
const CTA = () => (
  <section className="w-full py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700">
    <div className="container px-4 md:px-6 mx-auto text-center">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Ready to streamline your tour operations?
      </h3>
      <p className="text-blue-100 mb-6 max-w-xl mx-auto">
        Join institutions that rely on TourSync for secure, scalable tour management.
      </p>
      <Link
        href="/auth/register"
        className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg"
      >
        Start Your Free Trial
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </div>
  </section>
);

// ==============================================
// Component: Footer
// ==============================================
const Footer = () => (
  <footer className="py-8 w-full border-t border-blue-100 bg-white">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="ml-2 font-bold text-xl bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
            TourSync
          </span>
        </div>

        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} TourSync. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

// ==============================================
// Main Landing Page
// ==============================================
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductPreview />
        <HowItWorks />
        <Features />
        <SecurityTrust />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
