"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Store token in cookie for middleware auth guard
      document.cookie = `token=${data.token}; path=/; max-age=86400`;
      // Also store in localStorage for API calls
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-blue-50/30 to-white">
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
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-all duration-200"
              href="/"
            >
              Home
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300"
              href="/auth/register"
            >
              Register <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative rounded-3xl bg-white border-2 border-blue-100 p-8 shadow-xl shadow-blue-100/50">
              <div className="pt-8 text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-600">Sign in to manage your tours and participants</p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Password
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        className="block w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In{" "}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-slate-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/register"
                      className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                    >
                      Create one now
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
            <p className="text-sm text-slate-500">&copy; 2026 TourSync Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
