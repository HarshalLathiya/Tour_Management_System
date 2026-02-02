"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Mail, ArrowRight, ArrowLeft, CheckCircle2, Key, ShieldAlert } from "lucide-react";
import { adminResetPassword } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState<"standard" | "admin">("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "admin") {
      if (!newPassword) {
        setError("Please enter a new password.");
        setLoading(false);
        return;
      }
      const result = await adminResetPassword(email, newPassword);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
      return;
    }

    // Email-based password reset is not available with the current auth setup.
    // Prompt the user to use the Direct Reset option instead.
    setError("Email password reset is not available. Please use Direct Reset below.");
    setMode("admin");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-blue-50/30 to-white">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative rounded-3xl bg-white border-2 border-blue-100 p-8 shadow-xl shadow-blue-100/50">
              {!success ? (
                <>
                  <div className="pt-8 text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      {mode === "admin" ? "Direct Reset" : "Forgot Password?"}
                    </h2>
                    <p className="text-slate-600">
                      {mode === "admin"
                        ? "Temporary admin tool: Reset password immediately without email."
                        : "Enter your email and we'll send you a link to reset your password"}
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                      <div className="flex">
                        <ShieldAlert className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                      {error.includes("rate limit") && mode === "standard" && (
                        <button
                          onClick={() => setMode("admin")}
                          className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 underline flex items-center"
                        >
                          Try Direct Reset (No Email Needed)
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleReset}>
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
                          className="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {mode === "admin" && (
                      <div>
                        <label
                          htmlFor="pass"
                          className="block text-sm font-medium text-slate-700 mb-2"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            id="pass"
                            type="password"
                            required
                            className="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        mode === "admin" ? (
                          "Resetting..."
                        ) : (
                          "Sending link..."
                        )
                      ) : (
                        <>
                          {mode === "admin" ? "Reset Password Now" : "Send Reset Link"}
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    {mode === "standard" ? (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setMode("admin")}
                          className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          Having trouble with emails? Try Direct Reset
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setMode("standard")}
                          className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          Back to standard reset
                        </button>
                      </div>
                    )}
                  </form>
                </>
              ) : (
                <div className="pt-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    {mode === "admin" ? "Password Reset!" : "Check your email"}
                  </h2>
                  <p className="text-slate-600 mb-8">
                    {mode === "admin"
                      ? "Your password has been updated successfully. You can now log in with your new password."
                      : `We've sent a password reset link to ${email}.`}
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-500 transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              )}

              {!success && (
                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-slate-600 font-medium hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
