"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
  Eye,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function NewTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Basic Tour Information",
    "Itinerary & Schedule",
    "Budget & Fees",
    "Assign Leaders & Participants",
    "Review & Publish",
  ];

  const [formData, setFormData] = useState({
    // Step 1: Basic Tour Information
    name: "",
    tourCode: "",
    tourType: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: 0,
    maxParticipants: "",
    minParticipants: "",
    categoryTags: [] as string[],
    tourRules: "",
    medicalRequirements: {
      medicalCertificate: false,
      insuranceMandatory: false,
      vaccinationRequirements: false,
    },
    // Step 2: Itinerary & Schedule
    startingPoint: "",
    destination: "",
    intermediateStops: [] as string[],
    itinerary: [] as {
      date: string;
      morning: {
        time: string;
        place: string;
        activity: string;
        notes: string;
      }[];
      afternoon: {
        time: string;
        place: string;
        activity: string;
        notes: string;
      }[];
      evening: {
        time: string;
        place: string;
        activity: string;
        notes: string;
      }[];
    }[],
    accommodation: {
      name: "",
      address: "",
      checkIn: "",
      checkOut: "",
      contact: "",
      notes: "",
    },
    transportation: {
      mode: "",
      departureTime: "",
      arrivalTime: "",
      carrier: "",
      bookingRef: "",
    },
    // Step 3: Budget & Fees
    totalBudget: "",
    budgetBreakdown: {
      accommodation: 0,
      transportation: 0,
      food: 0,
      activities: 0,
      miscellaneous: 0,
    },
    participantFee: "",
    additionalCharges: {
      insurance: "",
      equipment: "",
      activityFees: "",
    },
    paymentOptions: {
      installmentPlans: false,
      deadlines: "",
      cancellationPolicy: "",
      refundRules: "",
    },
    // Step 4: Assign Leaders & Participants
    primaryLeader: "",
    assistantLeaders: [] as string[],
    participants: [] as string[],
    // Step 5: Review & Publish
    status: "draft",
    publishDate: "",
    registrationCloseDate: "",
  });

  // Calculate duration when startDate or endDate changes
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
      setFormData((prev) => ({ ...prev, duration: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  // Generate tour code when startDate changes
  useEffect(() => {
    if (formData.startDate) {
      const date = new Date(formData.startDate);
      const yy = date.getFullYear().toString().slice(-2);
      const mm = (date.getMonth() + 1).toString().padStart(2, "0");
      const code = `GTMS-${yy}${mm}-001`; // For now, using 001; in future, fetch from DB
      setFormData((prev) => ({ ...prev, tourCode: code }));
    }
  }, [formData.startDate]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          tour_code: formData.tourCode,
          tour_type: formData.tourType,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.endDate,
          duration: formData.duration,
          max_participants: parseInt(formData.maxParticipants) || 0,
          min_participants: parseInt(formData.minParticipants) || 0,
          category_tags: formData.categoryTags,
          tour_rules: formData.tourRules,
          medical_requirements: formData.medicalRequirements,
          starting_point: formData.startingPoint,
          destination: formData.destination,
          intermediate_stops: formData.intermediateStops,
          itinerary: formData.itinerary,
          accommodation: formData.accommodation,
          transportation: formData.transportation,
          total_budget: parseFloat(formData.totalBudget) || 0,
          budget_breakdown: formData.budgetBreakdown,
          participant_fee: parseFloat(formData.participantFee) || 0,
          additional_charges: formData.additionalCharges,
          payment_options: formData.paymentOptions,
          primary_leader: formData.primaryLeader,
          assistant_leaders: formData.assistantLeaders,
          participants: formData.participants,
          status: formData.status,
          publish_date: formData.publishDate,
          registration_close_date: formData.registrationCloseDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create tour");
        return;
      }

      toast.success("Tour created successfully!");
      router.push("/dashboard/tours");
      router.refresh();
    } catch (error) {
      console.error("Error creating tour:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-6">
          <Link
            href="/dashboard/tours"
            className="flex items-center text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tours
          </Link>
          <div className="ml-2 border-l pl-4">
            <h1 className="text-xl font-semibold text-slate-900">
              Create New Tour
            </h1>
            <p className="text-sm text-slate-500">
              Plan and organize your tour details
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    index <= currentStep
                      ? "text-slate-900 font-medium"
                      : "text-slate-500"
                  }`}
                >
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`ml-4 h-0.5 w-16 ${
                      index < currentStep ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Basic Tour Information */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Basic Tour Information
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Enter the essential tour details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tour Name *</Label>
                    <Input
                      id="name"
                      placeholder="Summer Adventure 2026"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tourCode">Tour Code</Label>
                    <Input
                      id="tourCode"
                      value={formData.tourCode}
                      readOnly
                      placeholder="Auto-generated"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tourType">Tour Type</Label>
                    <Select
                      value={formData.tourType}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, tourType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tour type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="religious">Religious</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      placeholder="Paris, France"
                      value={formData.destination}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destination: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Days)</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      readOnly
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      placeholder="50"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minParticipants">Min Participants</Label>
                    <Input
                      id="minParticipants"
                      type="number"
                      min="1"
                      placeholder="10"
                      value={formData.minParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minParticipants: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Domestic",
                      "International",
                      "Day Trip",
                      "Overnight",
                      "Budget",
                      "Luxury",
                    ].map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant={
                          formData.categoryTags.includes(tag)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          const newTags = formData.categoryTags.includes(tag)
                            ? formData.categoryTags.filter((t) => t !== tag)
                            : [...formData.categoryTags, tag];
                          setFormData({ ...formData, categoryTags: newTags });
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your tour..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tourRules">Tour Rules</Label>
                  <Textarea
                    id="tourRules"
                    placeholder="Enter tour rules and regulations..."
                    value={formData.tourRules}
                    onChange={(e) =>
                      setFormData({ ...formData, tourRules: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medical Requirements</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="medicalCertificate"
                        checked={
                          formData.medicalRequirements.medicalCertificate
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            medicalRequirements: {
                              ...formData.medicalRequirements,
                              medicalCertificate: e.target.checked,
                            },
                          })
                        }
                      />
                      <Label htmlFor="medicalCertificate">
                        Medical certificate required
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="insuranceMandatory"
                        checked={
                          formData.medicalRequirements.insuranceMandatory
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            medicalRequirements: {
                              ...formData.medicalRequirements,
                              insuranceMandatory: e.target.checked,
                            },
                          })
                        }
                      />
                      <Label htmlFor="insuranceMandatory">
                        Insurance mandatory
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="vaccinationRequirements"
                        checked={
                          formData.medicalRequirements.vaccinationRequirements
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            medicalRequirements: {
                              ...formData.medicalRequirements,
                              vaccinationRequirements: e.target.checked,
                            },
                          })
                        }
                      />
                      <Label htmlFor="vaccinationRequirements">
                        Vaccination requirements
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Itinerary & Schedule */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Itinerary & Schedule
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Plan the day-by-day schedule and logistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startingPoint">Starting Point</Label>
                    <Input
                      id="startingPoint"
                      placeholder="City/State"
                      value={formData.startingPoint}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startingPoint: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="City/State"
                      value={formData.destination}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destination: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Intermediate Stops</Label>
                  {formData.intermediateStops.map((stop, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="City/State"
                        value={stop}
                        onChange={(e) => {
                          const newStops = [...formData.intermediateStops];
                          newStops[index] = e.target.value;
                          setFormData({
                            ...formData,
                            intermediateStops: newStops,
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newStops = formData.intermediateStops.filter(
                            (_, i) => i !== index,
                          );
                          setFormData({
                            ...formData,
                            intermediateStops: newStops,
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        intermediateStops: [...formData.intermediateStops, ""],
                      })
                    }
                  >
                    Add Stop
                  </Button>
                </div>
                <div className="space-y-4">
                  <Label>Day-by-Day Itinerary</Label>
                  {formData.itinerary.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center gap-4">
                        <Input
                          type="date"
                          value={day.date}
                          onChange={(e) => {
                            const newItinerary = [...formData.itinerary];
                            newItinerary[dayIndex].date = e.target.value;
                            setFormData({
                              ...formData,
                              itinerary: newItinerary,
                            });
                          }}
                        />
                        <span className="font-medium">Day {dayIndex + 1}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItinerary = formData.itinerary.filter(
                              (_, i) => i !== dayIndex,
                            );
                            setFormData({
                              ...formData,
                              itinerary: newItinerary,
                            });
                          }}
                        >
                          Remove Day
                        </Button>
                      </div>
                      {/* Morning Activities */}
                      <div className="space-y-2">
                        <Label>Morning</Label>
                        {day.morning.map((activity, actIndex) => (
                          <div key={actIndex} className="flex gap-2">
                            <Input
                              placeholder="Time"
                              value={activity.time}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].morning[actIndex].time =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Place"
                              value={activity.place}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].morning[actIndex].place =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Activity"
                              value={activity.activity}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].morning[
                                  actIndex
                                ].activity = e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Notes"
                              value={activity.notes}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].morning[actIndex].notes =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].morning.splice(
                                  actIndex,
                                  1,
                                );
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItinerary = [...formData.itinerary];
                            newItinerary[dayIndex].morning.push({
                              time: "",
                              place: "",
                              activity: "",
                              notes: "",
                            });
                            setFormData({
                              ...formData,
                              itinerary: newItinerary,
                            });
                          }}
                        >
                          Add Morning Activity
                        </Button>
                      </div>
                      {/* Afternoon Activities */}
                      <div className="space-y-2">
                        <Label>Afternoon</Label>
                        {day.afternoon.map((activity, actIndex) => (
                          <div key={actIndex} className="flex gap-2">
                            <Input
                              placeholder="Time"
                              value={activity.time}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].afternoon[
                                  actIndex
                                ].time = e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Place"
                              value={activity.place}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].afternoon[
                                  actIndex
                                ].place = e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Activity"
                              value={activity.activity}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].afternoon[
                                  actIndex
                                ].activity = e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Notes"
                              value={activity.notes}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].afternoon[
                                  actIndex
                                ].notes = e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].afternoon.splice(
                                  actIndex,
                                  1,
                                );
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItinerary = [...formData.itinerary];
                            newItinerary[dayIndex].afternoon.push({
                              time: "",
                              place: "",
                              activity: "",
                              notes: "",
                            });
                            setFormData({
                              ...formData,
                              itinerary: newItinerary,
                            });
                          }}
                        >
                          Add Afternoon Activity
                        </Button>
                      </div>
                      {/* Evening Activities */}
                      <div className="space-y-2">
                        <Label>Evening</Label>
                        {day.evening.map((activity, actIndex) => (
                          <div key={actIndex} className="flex gap-2">
                            <Input
                              placeholder="Time"
                              value={activity.time}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].evening[actIndex].time =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Place"
                              value={activity.place}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].evening[actIndex].place =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Activity"
                              value={activity.activity}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].evening[
                                  actIndex
                                ].activity = e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Input
                              placeholder="Notes"
                              value={activity.notes}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].evening[actIndex].notes =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[dayIndex].evening.splice(
                                  actIndex,
                                  1,
                                );
                                setFormData({
                                  ...formData,
                                  itinerary: newItinerary,
                                });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItinerary = [...formData.itinerary];
                            newItinerary[dayIndex].evening.push({
                              time: "",
                              place: "",
                              activity: "",
                              notes: "",
                            });
                            setFormData({
                              ...formData,
                              itinerary: newItinerary,
                            });
                          }}
                        >
                          Add Evening Activity
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        itinerary: [
                          ...formData.itinerary,
                          {
                            date: "",
                            morning: [
                              { time: "", place: "", activity: "", notes: "" },
                            ],
                            afternoon: [
                              { time: "", place: "", activity: "", notes: "" },
                            ],
                            evening: [
                              { time: "", place: "", activity: "", notes: "" },
                            ],
                          },
                        ],
                      })
                    }
                  >
                    Add Day
                  </Button>
                </div>
                <div className="space-y-4">
                  <Label>Accommodation Details</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      placeholder="Hotel/Stay name"
                      value={formData.accommodation.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accommodation: {
                            ...formData.accommodation,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Address"
                      value={formData.accommodation.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accommodation: {
                            ...formData.accommodation,
                            address: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      placeholder="Check-in time"
                      value={formData.accommodation.checkIn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accommodation: {
                            ...formData.accommodation,
                            checkIn: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Check-out time"
                      value={formData.accommodation.checkOut}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accommodation: {
                            ...formData.accommodation,
                            checkOut: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Contact information"
                      value={formData.accommodation.contact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accommodation: {
                            ...formData.accommodation,
                            contact: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <Textarea
                    placeholder="Room allocation notes"
                    value={formData.accommodation.notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accommodation: {
                          ...formData.accommodation,
                          notes: e.target.value,
                        },
                      })
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-4">
                  <Label>Transportation</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      value={formData.transportation.mode}
                      onValueChange={(value: string) =>
                        setFormData({
                          ...formData,
                          transportation: {
                            ...formData.transportation,
                            mode: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="train">Train</SelectItem>
                        <SelectItem value="flight">Flight</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Carrier details"
                      value={formData.transportation.carrier}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transportation: {
                            ...formData.transportation,
                            carrier: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      placeholder="Departure time"
                      value={formData.transportation.departureTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transportation: {
                            ...formData.transportation,
                            departureTime: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Arrival time"
                      value={formData.transportation.arrivalTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transportation: {
                            ...formData.transportation,
                            arrivalTime: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Booking reference"
                      value={formData.transportation.bookingRef}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transportation: {
                            ...formData.transportation,
                            bookingRef: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Budget & Fees */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Budget & Fees
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Set budget allocation and participant fees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBudget">Total Budget ($)</Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="10000.00"
                    value={formData.totalBudget}
                    onChange={(e) =>
                      setFormData({ ...formData, totalBudget: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-4">
                  <Label>Budget Breakdown (%)</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="accommodation">Accommodation</Label>
                      <Input
                        id="accommodation"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="40"
                        value={formData.budgetBreakdown.accommodation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            budgetBreakdown: {
                              ...formData.budgetBreakdown,
                              accommodation: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transportation">Transportation</Label>
                      <Input
                        id="transportation"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="30"
                        value={formData.budgetBreakdown.transportation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            budgetBreakdown: {
                              ...formData.budgetBreakdown,
                              transportation: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="food">Food</Label>
                      <Input
                        id="food"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="20"
                        value={formData.budgetBreakdown.food}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            budgetBreakdown: {
                              ...formData.budgetBreakdown,
                              food: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activities">Activities</Label>
                      <Input
                        id="activities"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="10"
                        value={formData.budgetBreakdown.activities}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            budgetBreakdown: {
                              ...formData.budgetBreakdown,
                              activities: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="miscellaneous">Miscellaneous</Label>
                      <Input
                        id="miscellaneous"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="5"
                        value={formData.budgetBreakdown.miscellaneous}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            budgetBreakdown: {
                              ...formData.budgetBreakdown,
                              miscellaneous: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participantFee">Participant Fee ($)</Label>
                  <Input
                    id="participantFee"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="500.00"
                    value={formData.participantFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        participantFee: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-4">
                  <Label>Additional Charges</Label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      placeholder="Insurance ($)"
                      value={formData.additionalCharges.insurance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          additionalCharges: {
                            ...formData.additionalCharges,
                            insurance: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Equipment rental ($)"
                      value={formData.additionalCharges.equipment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          additionalCharges: {
                            ...formData.additionalCharges,
                            equipment: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Activity fees ($)"
                      value={formData.additionalCharges.activityFees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          additionalCharges: {
                            ...formData.additionalCharges,
                            activityFees: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Payment Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="installmentPlans"
                        checked={formData.paymentOptions.installmentPlans}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentOptions: {
                              ...formData.paymentOptions,
                              installmentPlans: e.target.checked,
                            },
                          })
                        }
                      />
                      <Label htmlFor="installmentPlans">
                        Installment plans available
                      </Label>
                    </div>
                    <Input
                      placeholder="Payment deadlines"
                      value={formData.paymentOptions.deadlines}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentOptions: {
                            ...formData.paymentOptions,
                            deadlines: e.target.value,
                          },
                        })
                      }
                    />
                    <Textarea
                      placeholder="Cancellation policy"
                      value={formData.paymentOptions.cancellationPolicy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentOptions: {
                            ...formData.paymentOptions,
                            cancellationPolicy: e.target.value,
                          },
                        })
                      }
                      rows={2}
                    />
                    <Textarea
                      placeholder="Refund rules"
                      value={formData.paymentOptions.refundRules}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentOptions: {
                            ...formData.paymentOptions,
                            refundRules: e.target.value,
                          },
                        })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Assign Leaders & Participants */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  Assign Leaders & Participants
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Select tour leaders and manage participant assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Select Tour Leaders</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="leader1"
                        checked={formData.primaryLeader === "John Doe"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryLeader: e.target.checked ? "John Doe" : "",
                          })
                        }
                      />
                      <Label htmlFor="leader1">John Doe (Primary Leader)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="leader2"
                        checked={formData.assistantLeaders.includes(
                          "Jane Smith",
                        )}
                        onChange={(e) => {
                          const newLeaders = e.target.checked
                            ? [...formData.assistantLeaders, "Jane Smith"]
                            : formData.assistantLeaders.filter(
                                (l) => l !== "Jane Smith",
                              );
                          setFormData({
                            ...formData,
                            assistantLeaders: newLeaders,
                          });
                        }}
                      />
                      <Label htmlFor="leader2">Jane Smith (Assistant)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="leader3"
                        checked={formData.assistantLeaders.includes(
                          "Mike Johnson",
                        )}
                        onChange={(e) => {
                          const newLeaders = e.target.checked
                            ? [...formData.assistantLeaders, "Mike Johnson"]
                            : formData.assistantLeaders.filter(
                                (l) => l !== "Mike Johnson",
                              );
                          setFormData({
                            ...formData,
                            assistantLeaders: newLeaders,
                          });
                        }}
                      />
                      <Label htmlFor="leader3">Mike Johnson (Backup)</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Add Participants</Label>
                  <div className="space-y-2">
                    <Button type="button" variant="outline">
                      Manual Add
                    </Button>
                    <Button type="button" variant="outline">
                      Search existing users
                    </Button>
                    <Button type="button" variant="outline">
                      Bulk Upload CSV
                    </Button>
                    <Button type="button" variant="outline">
                      Open Registration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review & Publish */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Review & Publish
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Review all details and publish your tour
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tour Summary</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Tour: {formData.name || "Not set"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Duration: {formData.duration} days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Budget: ${formData.totalBudget || "0"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>
                          Leaders: {formData.primaryLeader ? 1 : 0} assigned
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Publish Options</h3>
                    <div className="space-y-2">
                      <Select
                        value={formData.status}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="datetime-local"
                        placeholder="Publish date"
                        value={formData.publishDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publishDate: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="date"
                        placeholder="Registration close date"
                        value={formData.registrationCloseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registrationCloseDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
