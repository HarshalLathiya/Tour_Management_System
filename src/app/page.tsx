import Link from "next/link";
import {
  MapPin,
  Shield,
  Users,
  BarChart3,
  ChevronRight,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center border-b border-blue-100/80 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto flex items-center justify-between">
          <Link className="flex items-center justify-center group" href="/">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-200">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              TourSync
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-all duration-200 hover:scale-105"
              href="/auth/login"
            >
              Login
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-300"
              href="/auth/register"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-2 animate-fade-in">
                <CheckCircle className="mr-2 h-4 w-4" />
                Trusted by 500+ organizations worldwide
              </div>

              <div className="space-y-6 max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                  Global Tour Management{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Made Simple
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl leading-relaxed">
                  Streamline on-ground execution, enhance safety coordination, and automate
                  attendance tracking for educational and organizational tours worldwide.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-300"
                >
                  Start Free Trial
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="#features"
                  className="group inline-flex items-center justify-center rounded-full border-2 border-blue-200 bg-white px-8 py-4 text-base font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:scale-105 transition-all duration-300"
                >
                  See Features
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 w-full max-w-3xl">
                {[
                  { value: "10K+", label: "Tours Managed" },
                  { value: "500+", label: "Organizations" },
                  { value: "50+", label: "Countries" },
                  { value: "99.9%", label: "Safety Rate" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="text-center p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="text-2xl font-bold text-blue-900">{stat.value}</div>
                    <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white to-blue-50/50"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl mb-4">
                Everything You Need for{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Successful Tours
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-600">
                Comprehensive tools designed specifically for educational and organizational tour
                management
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative flex flex-col items-center p-8 rounded-3xl bg-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="pt-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Smart Attendance Tracking
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Real-time geofenced attendance with offline capability. QR code check-ins and
                    automated roll calls.
                  </p>
                </div>
                <div className="mt-6 text-blue-600 font-medium flex items-center">
                  Learn more
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative flex flex-col items-center p-8 rounded-3xl bg-white border-2 border-green-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="pt-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Safety & SOS</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Instant SOS alerts with location sharing. Incident reporting and emergency
                    contact management.
                  </p>
                </div>
                <div className="mt-6 text-green-600 font-medium flex items-center">
                  Learn more
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative flex flex-col items-center p-8 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="pt-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Intelligent Budget Control
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Real-time expense tracking, fund allocation, and automated receipt management
                    with AI insights.
                  </p>
                </div>
                <div className="mt-6 text-purple-600 font-medium flex items-center">
                  Learn more
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-20 text-center">
              <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-xl shadow-blue-200">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Transform Your Tour Management?
                </h3>
                <p className="text-blue-100 mb-6">
                  Join thousands of organizations that trust TourSync for their global tours.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 w-full border-t border-blue-100 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                TourSync
              </span>
            </div>

            <p className="text-sm text-slate-500">© 2026 TourSync Inc. All rights reserved.</p>

            <nav className="flex gap-6 mt-4 sm:mt-0">
              <Link
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200"
                href="#"
              >
                Terms
              </Link>
              <Link
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200"
                href="#"
              >
                Privacy
              </Link>
              <Link
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200"
                href="#"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
