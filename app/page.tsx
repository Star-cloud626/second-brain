"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { EpisodeCard } from "@/components/episode-card";
import { useSearchStore } from "@/store/search-store";
import { Brain, FileText } from "lucide-react";

interface Episode {
  episodeId: string;
  title: string;
  chunkCount?: number;
}

export default function Home() {
  const { query, results, isLoading, setQuery, setResults, setLoading, setError } = useSearchStore();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showEpisodes, setShowEpisodes] = useState(true);

  // Fetch episodes on mount
  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const response = await fetch("/api/episodes");
      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setShowEpisodes(false);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Second Brain
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
            Search through YouTube episode transcripts with semantic understanding
          </p>
          <a
            href="/ingest"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <FileText className="h-4 w-4" />
            Upload Transcripts
          </a>
        </header>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {useSearchStore.getState().error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {useSearchStore.getState().error}
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mb-12">
            <SearchResults results={results} query={query} />
          </div>
        )}

        {/* Episodes List */}
        {showEpisodes && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-gray-600" />
              <h2 className="text-3xl font-semibold">All Episodes</h2>
              <span className="text-gray-500">({episodes.length})</span>
            </div>

            {episodes.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No episodes found</p>
                <p className="text-gray-400 text-sm">
                  Upload transcript files to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {episodes.map((episode) => (
                  <EpisodeCard key={episode.episodeId} episode={episode} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!showEpisodes && results.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Start searching to find relevant content</p>
          </div>
        )}
      </div>
    </div>
  );
}
