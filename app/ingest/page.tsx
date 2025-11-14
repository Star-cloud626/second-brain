"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function IngestPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [episodeId, setEpisodeId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-extract episode ID from filename if not provided
      if (!episodeId) {
        const name = selectedFile.name.replace(/\.(txt|json)$/i, "");
        setEpisodeId(name);
      }
      setStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setStatus({ type: "error", message: "Please select a file" });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (episodeId) {
        formData.append("episodeId", episodeId);
      }

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setStatus({
        type: "success",
        message: `Successfully ingested ${data.chunksProcessed} chunks from ${data.title}`,
      });

      // Reset form
      setFile(null);
      setEpisodeId("");
      (document.getElementById("file-input") as HTMLInputElement).value = "";

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to upload transcript",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Ingest Transcripts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload transcript files to add them to the searchable database
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Transcript File</CardTitle>
            <CardDescription>
              Upload a .txt file containing episode transcript. The filename will be used as the episode ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="file-input" className="block text-sm font-medium mb-2">
                  Transcript File
                </label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="file-input"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      {file ? (
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-blue-600" />
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-12 w-12 text-gray-400" />
                          <p className="text-gray-600 dark:text-gray-400">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-gray-500">
                            TXT files only
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="file-input"
                      type="file"
                      accept=".txt"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="episode-id" className="block text-sm font-medium mb-2">
                  Episode ID (optional)
                </label>
                <Input
                  id="episode-id"
                  type="text"
                  value={episodeId}
                  onChange={(e) => setEpisodeId(e.target.value)}
                  placeholder="e.g., 125"
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If not provided, the filename will be used as the episode ID
                </p>
              </div>

              {status && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-2 ${
                    status.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <p>{status.message}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!file || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Process
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>1. Prepare your transcript file in .txt format</p>
              <p>2. The file should contain the episode transcript with timestamps</p>
              <p>3. Upload the file using the form above</p>
              <p>4. The system will automatically chunk, embed, and store the content</p>
              <p>5. Once processed, the episode will be searchable on the home page</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

