"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useSearchStore } from "@/store/search-store";

interface EpisodeChunk {
  text: string;
  chunkIndex: number;
  timestamp?: string;
}

interface Episode {
  episodeId: string;
  title: string;
  chunks: EpisodeChunk[];
  chunkCount: number;
}

export default function EpisodePage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;
  
  const { results, isLoading, setResults, setLoading, setError } = useSearchStore();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loadingEpisode, setLoadingEpisode] = useState(true);

  useEffect(() => {
    if (episodeId) {
      fetchEpisode();
    }
  }, [episodeId]);

  const fetchEpisode = async () => {
    setLoadingEpisode(true);
    try {
      const response = await fetch(`/api/episode/${episodeId}`);
      if (!response.ok) {
        throw new Error("Episode not found");
      }
      const data = await response.json();
      setEpisode(data);
    } catch (error: any) {
      setError(error.message || "Failed to fetch episode");
    } finally {
      setLoadingEpisode(false);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10&episodeId=${episodeId}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error: any) {
      setError(error.message || "Failed to perform search");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (loadingEpisode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Episode not found</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold">{episode.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">Episode {episode.episodeId}</Badge>
                <Badge variant="secondary">{episode.chunkCount} chunks</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Search within Episode */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Search within this episode</h2>
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Search within this episode..."
          />
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mb-12">
            <SearchResults results={results} query={useSearchStore.getState().query} />
          </div>
        )}

        {/* Full Transcript */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Full Transcript</h2>
          <div className="space-y-4">
            {episode.chunks.map((chunk, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Chunk {chunk.chunkIndex + 1}</CardTitle>
                    {chunk.timestamp && (
                      <Badge variant="outline">{chunk.timestamp}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {chunk.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

