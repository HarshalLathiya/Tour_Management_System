"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Shield, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentVault } from "@/components/document-vault";
import type { Profile } from "@/types";
import { updateProfile } from "./actions";

interface ProfileClientProps {
  profile: Profile;
}

export function ProfileClient({ profile: initialProfile }: ProfileClientProps) {
  const handleUpdate = async (data: Partial<Profile>) => {
    const result = await updateProfile(data);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors mb-4 group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600">Manage your personal information and documents</p>
          </div>
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <User className="h-10 w-10" />
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1 space-y-6"
          >
            <Card className="rounded-3xl border-2 border-white shadow-xl shadow-slate-100">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-slate-500">Email Address</p>
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {initialProfile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Role</p>
                      <p className="text-sm font-medium text-slate-900 capitalize">
                        {initialProfile.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Member Since</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(initialProfile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2 border-amber-50 bg-amber-50/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  Safety Tip
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Keep your document vault updated. This information is only accessible to tour
                  leaders in case of an emergency.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Info & Vault */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 space-y-6"
          >
            <DocumentVault profile={initialProfile} onUpdate={handleUpdate} />

            <Card className="rounded-3xl border-2 border-white shadow-xl shadow-slate-100">
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Who should we contact in case of an emergency?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Contact Name</p>
                    <p className="font-medium text-slate-900">
                      {initialProfile.emergency_contact_name || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Contact Phone</p>
                    <p className="font-medium text-slate-900">
                      {initialProfile.emergency_contact_phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
