"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, User, Mail, Lock, Eye, EyeOff, Building, Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ErrorMessage } from "@/components/features";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "tourist",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const result = await register(formData);

    if (!result.success) {
      setError(result.error || "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-primary-50/30 to-background">
      <header className="sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center border-b border-primary-100/80 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between">
          <Link className="flex items-center justify-center group" href="/">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 shadow-md shadow-primary-200">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 font-bold text-2xl bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              TourSync
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200"
              href="/"
            >
              Home
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200"
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
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary-600/10 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative rounded-3xl bg-card border-2 border-primary-100 p-8 shadow-xl shadow-primary-100/50">
              <div className="pt-8 text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h2>
                <p className="text-muted-foreground">Start managing tours in minutes</p>
              </div>

              {error && <ErrorMessage message={error} className="mb-6" />}

              <form className="space-y-6" onSubmit={handleRegister}>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Full Name<span className="text-destructive ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className="input pl-10"
                        placeholder="Enter Your Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email Address<span className="text-destructive ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="input pl-10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Password<span className="text-destructive ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        className="input pl-10 pr-12"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Use 8+ characters with a mix of letters, numbers & symbols
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">
                      I am a...<span className="text-destructive ml-1">*</span>
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
                            formData.role === option.value
                              ? "border-primary bg-primary-50"
                              : "border-border hover:border-primary/30 hover:bg-muted"
                          }`}
                          onClick={() => setFormData((prev) => ({ ...prev, role: option.value }))}
                        >
                          <div
                            className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                              formData.role === option.value
                                ? "bg-primary-100 text-primary-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {option.icon}
                          </div>
                          <div className="font-medium text-foreground">{option.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-primary-50 p-3">
                      <p className="text-sm text-primary-800">
                        {getRoleDescription(formData.role)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-foreground">
                    I agree to the{" "}
                    <Link href="#" className="font-medium text-primary hover:text-primary-600">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="font-medium text-primary hover:text-primary-600">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base group rounded-full hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-3"></div>
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

              <div className="mt-8 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 w-full border-t border-primary-100 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 font-bold text-xl bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                TourSync
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 TourSync Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
