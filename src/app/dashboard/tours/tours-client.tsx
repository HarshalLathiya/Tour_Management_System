"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tour, Organization } from "@/types";
import { formatDate } from "@/lib/utils";

interface ToursClientProps {
  tours: (Tour & { organizations: Pick<Organization, "name"> | null })[];
}

const statusColors = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  planned: "bg-blue-100 text-blue-700 border-blue-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-purple-100 text-purple-700 border-purple-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export function ToursClient({ tours }: ToursClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
                <Button className="text-sm">
                  Dashboard
                </Button>
              </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-semibold text-foreground">Tours</h1>
          </div>
          <Link href="/dashboard/tours/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Tour
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tours..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTours.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MapPin className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No tours found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first tour to get started"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link href="/dashboard/tours/new" className="mt-4">
                    <Button>Create Tour</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/dashboard/tours/${tour.id}`}>
                    <Card className="group h-full transition-all hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="gradient-primary rounded-lg p-2">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                                statusColors[tour.status]
                              }`}
                            >
                              {tour.status.charAt(0).toUpperCase() +
                                tour.status.slice(1)}
                            </span>
                            <button className="rounded p-1 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </button>
                          </div>
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900 line-clamp-1">
                          {tour.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                          {tour.destination}
                        </p>

                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(tour.start_date)}</span>
                          </div>
                          {tour.max_participants && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              <span>{tour.max_participants} max</span>
                            </div>
                          )}
                        </div>

                        {tour.organizations && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            {tour.organizations.name}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                          <span className="text-sm font-medium text-blue-600">
                            ${Number(tour.per_person_fee).toFixed(2)}/person
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
