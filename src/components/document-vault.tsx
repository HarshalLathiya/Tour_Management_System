"use client";

import { useState } from "react";
import { Shield, Lock, FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types";

interface DocumentVaultProps {
  profile: Profile;
  onUpdate: (data: Partial<Profile>) => Promise<void>;
}

export function DocumentVault({ profile, onUpdate }: DocumentVaultProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      passport_url: formData.get("passport_url") as string,
      medical_info_url: formData.get("medical_info_url") as string,
      dietary_requirements: formData.get("dietary_requirements") as string,
    };

    try {
      await onUpdate(data);
      setMessage({ type: "success", text: "Documents updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update documents." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="rounded-3xl border-2 border-blue-100 overflow-hidden shadow-lg shadow-blue-50">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Secure Document Vault</CardTitle>
            <CardDescription className="text-blue-100">
              Encrypted storage for your essential travel documents
            </CardDescription>
          </div>
          <Lock className="ml-auto h-5 w-5 text-blue-200" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="passport_url"
                className="text-slate-700 font-semibold flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-blue-500" />
                Passport Copy (Link)
              </Label>
              <Input
                id="passport_url"
                name="passport_url"
                defaultValue={profile.passport_url}
                placeholder="https://..."
                className="rounded-xl border-slate-200 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500">Provide a secure link to your passport scan</p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="medical_info_url"
                className="text-slate-700 font-semibold flex items-center gap-2"
              >
                <Shield className="h-4 w-4 text-emerald-500" />
                Medical Records (Link)
              </Label>
              <Input
                id="medical_info_url"
                name="medical_info_url"
                defaultValue={profile.medical_info_url}
                placeholder="https://..."
                className="rounded-xl border-slate-200 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500">Emergency medical info and insurance docs</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary_requirements" className="text-slate-700 font-semibold">
              Dietary Requirements & Allergies
            </Label>
            <Input
              id="dietary_requirements"
              name="dietary_requirements"
              defaultValue={profile.dietary_requirements}
              placeholder="e.g., Vegan, Peanut Allergy, Gluten Free"
              className="rounded-xl border-slate-200 focus:ring-blue-500"
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {isUpdating ? "Updating Vault..." : "Update Document Vault"}
            {!isUpdating && <Upload className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
