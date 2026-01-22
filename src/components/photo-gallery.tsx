"use client";

import { useState, useEffect } from "react";
import { Camera, Upload, Image as ImageIcon, X, Trash2, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import type { TourPhoto } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoGalleryProps {
  tourId: string;
}

export function PhotoGallery({ tourId }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<TourPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [caption, setCaption] = useState("");

  useEffect(() => {
    fetchPhotos();
  }, [tourId]);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("tour_photos")
      .select("*, profile:profiles(*)")
      .eq("tour_id", tourId)
      .order("created_at", { ascending: false });
    
    setPhotos(data || []);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) return;

    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("tour_photos").insert({
        tour_id: tourId,
        user_id: user.id,
        photo_url: uploadUrl,
        caption: caption,
      });

      if (!error) {
        setUploadUrl("");
        setCaption("");
        fetchPhotos();
      }
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-2 border-white shadow-xl shadow-slate-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Tour Gallery</CardTitle>
              <CardDescription className="text-purple-100">
                Share moments from the journey with everyone
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpload} className="mb-8 space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Input
                  placeholder="Photo URL (e.g., https://...)"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isUploading || !uploadUrl}
              className="w-full md:w-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isUploading ? "Uploading..." : "Share Photo"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {photos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
              <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No photos shared yet. Be the first!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative rounded-2xl overflow-hidden bg-slate-100 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <img 
                      src={photo.photo_url} 
                      alt={photo.caption || "Tour photo"}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      {photo.caption && (
                        <p className="text-white text-sm font-medium mb-1 line-clamp-2">{photo.caption}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                            {photo.profile?.full_name?.charAt(0) || "U"}
                          </div>
                          <span className="text-white/80 text-xs">{photo.profile?.full_name || "Member"}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors">
                            <Heart className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
