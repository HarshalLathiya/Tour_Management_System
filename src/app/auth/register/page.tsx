"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, User, Mail, Lock, Eye, EyeOff, Building, Users, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("tourist");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getRoleDescription = (roleValue: string) => {
    switch (roleValue) {
      case "guide":
        return "Manage tours, coordinate participants, and oversee logistics";
      case "admin":
        return "Administer organization, manage multiple tours and guides";
      default:
        return "Join tours, track attendance, and receive updates";
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: fullName, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Store token
      document.cookie = `token=${data.token}; path=/; max-age=86400`;
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
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-all duration-200"
              href="/auth/login"
            >
              Login
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
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Your Account</h2>
                <p className="text-slate-600">Start managing tours in minutes</p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleRegister}>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter Your Name"
                      />
                    </div>
                  </div>

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
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Create a strong password"
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
                    <p className="mt-2 text-xs text-slate-500">
                      Use 8+ characters with a mix of letters, numbers & symbols
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                      I am a...
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: "tourist",
                          label: "Participant",
                          icon: <User className="h-5 w-5" />,
                        },
                        {
                          value: "guide",
                          label: "Tour Leader",
                          icon: <Users className="h-5 w-5" />,
                        },
                        { value: "admin", label: "Admin", icon: <Building className="h-5 w-5" /> },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                            role === option.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                          onClick={() => setRole(option.value)}
                        >
                          <div
                            className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                              role === option.value
                                ? "bg-blue-100 text-blue-600"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {option.icon}
                          </div>
                          <div className="font-medium text-slate-900">{option.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">{getRoleDescription(role)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
                    I agree to the{" "}
                    <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account{" "}
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-slate-600">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                    >
                      Sign in here
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
