"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Mail, ArrowLeft, CheckCircle2, Key, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { adminResetPassword } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !newPassword) {
      setError("Email and new password are required.");
      setLoading(false);
      return;
    }

    const result = await adminResetPassword(email, newPassword);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-blue-50/30 to-white">
      <header className="sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center border-b border-blue-100/80 bg-white/95 backdrop-blur-sm">
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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative rounded-3xl bg-white border-2 border-blue-100 p-8 shadow-xl shadow-blue-100/50">
              {!success ? (
                <>
                  <div className="pt-8 text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
                    <p className="text-slate-600">Enter your email and set a new password</p>
                  </div>

                  {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                      <div className="flex">
                        <ShieldAlert className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleReset}>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute inset-y-0 left-1 pl-3 h-7 w-7 text-slate-400 my-auto" />
                        <input
                          type="email"
                          required
                          className="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Key className="absolute inset-y-0 left-1 pl-3 h-7 w-7 text-slate-400 my-auto" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          className="block w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="pt-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Password Reset!</h2>
                  <p className="text-slate-600 mb-8">
                    Your password has been updated successfully.
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-500"
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
                    className="inline-flex items-center text-slate-600 hover:text-blue-600"
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
