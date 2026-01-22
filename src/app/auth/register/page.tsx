"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  Users,
  ChevronRight,
} from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("participant");
  const [organizationName, setOrganizationName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create profile record
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: role,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      // Create organization if role is org_admin
      if (role === "org_admin" && organizationName) {
        const { error: orgError } = await supabase.from("organizations").insert({
          name: organizationName,
          type: "organization",
          created_by: data.user.id,
        });

        if (orgError) {
          console.error("Organization creation error:", orgError);
        }
      }

      // Email confirmation is required - redirect to verify email page
      router.push("/auth/verify-email?email=" + encodeURIComponent(email));
    }
  };

  const getRoleIcon = (roleValue: string) => {
    switch (roleValue) {
      case "tour_leader":
        return <Users className="h-5 w-5" />;
      case "org_admin":
        return <Building className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (roleValue: string) => {
    switch (roleValue) {
      case "tour_leader":
        return "Manage tours, coordinate participants, and oversee logistics";
      case "org_admin":
        return "Administer organization, manage multiple tours and leaders";
      default:
        return "Join tours, track attendance, and receive updates";
    }
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
          {/* Registration Card */}
          <div className="relative">
            {/* Decorative Background Elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-3xl blur-xl opacity-50"></div>

            {/* Card Content */}
            <div className="relative rounded-3xl bg-white border-2 border-blue-100 p-8 shadow-xl shadow-blue-100/50">
              <div className="pt-8 text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Create Your Account
                </h2>
                <p className="text-slate-600">
                  Start managing tours in minutes
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              <form className="space-y-6" onSubmit={handleRegister}>
                <div className="space-y-5">
                  {/* Full Name Input */}
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

                  {/* Email Input */}
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

                  {/* Password Input */}
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

                    {/* Organization Name Input (Conditional) */}
                    {role === "org_admin" && (
                      <div>
                        <label
                          htmlFor="organizationName"
                          className="block text-sm font-medium text-slate-700 mb-2"
                        >
                          Organization Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            id="organizationName"
                            type="text"
                            required
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter Your Organization Name"
                          />
                        </div>
                      </div>
                    )}

                    {/* Role Selection */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-slate-700 mb-4"
                    >
                      I am a...
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: "participant",
                          label: "Participant",
                          icon: <User className="h-5 w-5" />,
                        },
                        {
                          value: "tour_leader",
                          label: "Tour Leader",
                          icon: <Users className="h-5 w-5" />,
                        },
                        {
                          value: "org_admin",
                          label: "Admin",
                          icon: <Building className="h-5 w-5" />,
                        },
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
                          <div className="font-medium text-slate-900">
                            {option.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-blue-50 p-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                            {getRoleIcon(role)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-800">
                            {getRoleDescription(role)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-slate-700"
                  >
                    I agree to the{" "}
                    <Link
                      href="#"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="#"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <div>
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
                        Create Account
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                    onClick={() => {
                      /* Add Google OAuth */
                    }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                    onClick={() => {
                      /* Add GitHub OAuth */
                    }}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </button>
                </div>
              </form>

              {/* Login Link */}
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

            <p className="text-sm text-slate-500">
              © 2026 TourSync Inc. All rights reserved.
            </p>

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
