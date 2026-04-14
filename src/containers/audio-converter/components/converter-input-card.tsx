import { RefObject } from "react";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { Spinner } from "@/libs/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/libs/components/ui/tabs";
import { Link2, Upload, Music, FileAudio, Loader2 } from "lucide-react";

interface ConverterInputCardProps {
  url: string;
  setUrl: (url: string) => void;
  isSubmitting: boolean;
  submitUrl: () => void;
  submitFile: (file: File) => void;
  dragActive: boolean;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function ConverterInputCard({
  url,
  setUrl,
  isSubmitting,
  submitUrl,
  submitFile,
  dragActive,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  fileInputRef,
}: ConverterInputCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">New Conversion</CardTitle>
        <CardDescription>
          Provide an M3U8 link or upload a media file to convert it to MP3
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="url" className="flex-1 gap-2">
              <Link2 className="size-4" />
              Paste URL
            </TabsTrigger>
            <TabsTrigger value="file" className="flex-1 gap-2">
              <Upload className="size-4" />
              Upload File
            </TabsTrigger>
          </TabsList>

          {/* URL tab */}
          <TabsContent value="url">
            <div className="space-y-3">
              <Label htmlFor="m3u8-url">M3U8 Stream URL</Label>
              <div className="flex gap-2">
                <Input
                  id="m3u8-url"
                  placeholder="https://example.com/stream/playlist.m3u8"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitUrl()}
                  disabled={isSubmitting}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={submitUrl}
                  disabled={isSubmitting || !url.trim()}
                  className="shrink-0"
                >
                  {isSubmitting ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Music className="size-4" />
                  )}
                  Convert
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supports HLS (.m3u8), direct audio/video URLs
              </p>
            </div>
          </TabsContent>

          {/* File tab */}
          <TabsContent value="file">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-10 transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <FileAudio className="size-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {dragActive
                    ? "Drop your file here"
                    : "Click or drag file to upload"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  .m3u8, .ts, .mp4, .avi, .mkv supported
                </p>
              </div>
              {isSubmitting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Uploading…
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".m3u8,.ts,.mp4,.avi,.mkv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) submitFile(file);
                e.target.value = "";
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
