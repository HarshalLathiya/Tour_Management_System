"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Mail, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!email) return;

    setResendLoading(true);
    setResendMessage(null);
    setResendMessage("Email verification is not configured. Please contact support.");
    setResendLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header - Consistent with Landing Page */}
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
              href="/"
            >
              Home
            </Link>
            <Link
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-all duration-200 hover:scale-105"
              href="/auth/login"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Verification Card */}
          <div className="relative">
            {/* Decorative Background Elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-3xl blur-xl opacity-50"></div>

            {/* Card Content */}
            <div className="relative rounded-3xl bg-white border-2 border-green-100 p-8 shadow-xl shadow-green-100/50">
              <div className="pt-8 text-center mb-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-200">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Check Your Email</h2>
                <p className="text-slate-600">
                  We've sent a verification link to your email address
                </p>
              </div>

              {/* Email Display */}
              {email && (
                <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">
                        Verification email sent to:
                      </p>
                      <p className="text-sm text-blue-700 font-mono">{email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-4 mb-8">
                <div className="text-center">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Click the verification link in your email to activate your account. You can then
                    sign in to start using TourSync.
                  </p>
                </div>

                {/* Resend Email */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-center text-sm text-slate-600 mb-4">
                    Didn't receive the email?
                  </p>
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading || !email}
                    className="w-full inline-flex items-center justify-center rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </button>

                  {resendMessage && (
                    <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
                      <p className="text-sm text-green-800 text-center">{resendMessage}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="group w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-300"
                >
                  Go to Login
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                >
                  Back to Home
                </Link>
              </div>

              {/* Help Text */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    Need help?{" "}
                    <Link
                      href="#"
                      className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                    >
                      Contact Support
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Consistent with Landing Page */}
      <footer className="py-6 w-full border-t border-blue-100 bg-white">
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
                Help
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
