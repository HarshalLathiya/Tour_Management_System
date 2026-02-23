"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Upload, Image as ImageIcon, Trash2, Download, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { photoApi, PhotoData } from "@/lib/api";

interface PhotoGalleryProps {
  tourId: string;
}

export function PhotoGallery({ tourId }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, [tourId]);

  const fetchPhotos = async () => {
    try {
      const result = await photoApi.getByTourId(parseInt(tourId));
      if (result.success && result.data) {
        setPhotos(result.data);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      setPhotos([]);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Clear selected file
  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    setIsUploading(true);
    try {
      const photoUrl = await fileToBase64(selectedFile);

      const result = await photoApi.upload(parseInt(tourId), {
        photo_url: photoUrl,
        caption: caption || undefined,
      });

      if (result.success && result.data) {
        setPhotos((prev) => [result.data!, ...prev]);
        clearSelection();
        setCaption("");
        alert("Photo uploaded successfully!");
      } else {
        alert(`Failed to upload photo: ${result.error}`);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (photoId: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const result = await photoApi.delete(photoId);
      if (result.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        alert("Photo deleted successfully!");
      } else {
        alert(`Failed to delete photo: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  // Handle download
  const handleDownload = (photo: PhotoData) => {
    const link = document.createElement("a");
    link.href = photo.photo_url;
    link.download = `tour-photo-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <form
            onSubmit={handleUpload}
            className="mb-8 space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
          >
            {/* File Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Upload from Device</label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <Upload className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Choose Image</span>
                </label>
                {selectedFile && (
                  <span className="text-sm text-slate-500">{selectedFile.name}</span>
                )}
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-32 w-auto rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Caption */}
            <div className="space-y-2">
              <Input
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
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
                        <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                            {photo.user_name?.charAt(0) || "U"}
                          </div>
                          <span className="text-white/80 text-xs">
                            {photo.user_name || "Member"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {/* Download Button */}
                          <button
                            onClick={() => handleDownload(photo)}
                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(photo.id)}
                            className="p-1.5 rounded-full bg-white/20 hover:bg-red-500 text-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
