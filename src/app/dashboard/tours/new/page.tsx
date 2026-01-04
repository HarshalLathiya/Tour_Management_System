"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function NewTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    description: "",
    start_date: "",
    end_date: "",
    per_person_fee: "",
    buffer_amount: "",
    max_participants: "",
    status: "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to create a tour");
        return;
      }

      const { data: organizations } = await supabase
        .from("organizations")
        .select("id")
        .eq("created_by", user.id)
        .limit(1);

      let organizationId = organizations?.[0]?.id;

      if (!organizationId) {
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: "My Organization",
            type: "organization",
            created_by: user.id,
          })
          .select()
          .single();

        if (orgError) {
          toast.error("Failed to create organization");
          return;
        }
        organizationId = newOrg.id;
      }

      const { error } = await supabase.from("tours").insert({
        organization_id: organizationId,
        name: formData.name,
        destination: formData.destination,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        per_person_fee: parseFloat(formData.per_person_fee) || 0,
        buffer_amount: parseFloat(formData.buffer_amount) || 0,
        max_participants: parseInt(formData.max_participants) || null,
        status: formData.status,
        created_by: user.id,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Tour created successfully!");
      router.push("/dashboard/tours");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-6">
            <BackButton className="mb-0" />
            <div className="ml-2 border-l pl-4">
              <h1 className="text-xl font-semibold text-slate-900">Create New Tour</h1>
              <p className="text-sm text-slate-500">Plan and organize your tour details</p>
            </div>
          </div>
        </header>


      <main className="mx-auto max-w-4xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>Enter the essential tour details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tour Name *</Label>
                    <Input
                      id="name"
                      placeholder="Summer Adventure 2026"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      placeholder="Paris, France"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Describe your tour..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Schedule
                </CardTitle>
                <CardDescription>Set tour dates and timing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Budget
                </CardTitle>
                <CardDescription>Set pricing and budget details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="per_person_fee">Per Person Fee ($)</Label>
                    <Input
                      id="per_person_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="500.00"
                      value={formData.per_person_fee}
                      onChange={(e) => setFormData({ ...formData, per_person_fee: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer_amount">Buffer Amount ($)</Label>
                    <Input
                      id="buffer_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="200.00"
                      value={formData.buffer_amount}
                      onChange={(e) => setFormData({ ...formData, buffer_amount: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Participants
                </CardTitle>
                <CardDescription>Set participant limits and tour status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      min="1"
                      placeholder="50"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/tours">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Tour"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
