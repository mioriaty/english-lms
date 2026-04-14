"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/libs/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/libs/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/libs/components/ui/alert-dialog";
import { Button } from "@/libs/components/ui/button";
import { Loader2, Music, ImageIcon, Upload, Trash2, Check } from "lucide-react";
import { cn } from "@/libs/utils/string";

export type MediaType = "image" | "audio";

interface MediaFile {
  url: string;
  name: string;
  type: MediaType;
}

interface MediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: MediaType;
  onSelect: (url: string) => void;
  selectedUrl?: string | null;
}

export function MediaModal({
  open,
  onOpenChange,
  defaultTab = "image",
  onSelect,
  selectedUrl,
}: MediaModalProps) {
  const [tab, setTab] = useState<MediaType>(defaultTab);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      fetchFiles(defaultTab);
    }
  }, [open, defaultTab]);

  const fetchFiles = async (type: MediaType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/upload?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching files");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (val: string) => {
    const newTab = val as MediaType;
    setTab(newTab);
    fetchFiles(newTab);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (inputRef.current) inputRef.current.value = "";

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      // Re-fetch files after upload
      await fetchFiles(tab);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fileToDelete }),
      });
      if (!res.ok) throw new Error("Failed to delete file");
      setFiles((prev) => prev.filter((f) => f.url !== fileToDelete));
      if (selectedUrl === fileToDelete) {
        onSelect(""); // Pass empty to clear if needed, or handle in parent
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setFileToDelete(null);
    }
  };

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-zinc-500">
              {tab === "image"
                ? "Select an image or upload a new one."
                : "Select an audio file or upload a new one."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? "Uploading..." : "Upload New"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={
                tab === "image"
                  ? "image/jpeg,image/png,image/webp,image/gif"
                  : ".mp3,audio/mpeg"
              }
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

          <div className="flex-1 overflow-y-auto mt-4 min-h-75">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
              </div>
            ) : files.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                {tab === "image" ? (
                  <ImageIcon className="h-12 w-12 mb-2" />
                ) : (
                  <Music className="h-12 w-12 mb-2" />
                )}
                <p>No {tab === "image" ? "images" : "audio files"} found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pb-4">
                {files.map((file) => {
                  const isSelected = selectedUrl === file.url;
                  return (
                    <div
                      key={file.url}
                      className={cn(
                        "group relative aspect-square rounded-md border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors bg-zinc-50 dark:bg-zinc-900/50 flex flex-col",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-zinc-200 dark:border-zinc-800",
                      )}
                      onClick={() => {
                        onSelect(file.url);
                        onOpenChange(false);
                      }}
                    >
                      {tab === "image" ? (
                        <div className="flex-1 overflow-hidden relative">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-2 gap-2 text-zinc-500">
                          <Music className="h-8 w-8" />
                          <span className="text-[10px] text-center w-full truncate px-1">
                            {file.name}
                          </span>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      <button
                        type="button"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileToDelete(file.url);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>

      <AlertDialog open={!!fileToDelete} onOpenChange={(isOpen) => !isOpen && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white border-0">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
