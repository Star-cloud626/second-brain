"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface SearchResult {
  id: string;
  text: string;
  episodeId: string;
  episodeTitle: string;
  chunkIndex: number;
  timestamp?: string;
  similarity?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No results found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try a different search query
        </p>
      </div>
    );
  }

  // Highlight query terms in text
  const highlightText = (text: string, query: string) => {
    const words = query.toLowerCase().split(/\s+/);
    let highlighted = text;
    
    words.forEach((word) => {
      const regex = new RegExp(`(${word})`, "gi");
      highlighted = highlighted.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">$1</mark>'
      );
    });
    
    return highlighted;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Search Results ({results.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    <Link
                      href={`/episode/${result.episodeId}`}
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {result.episodeTitle}
                    </Link>
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Episode {result.episodeId}</Badge>
                    {result.timestamp && (
                      <Badge variant="outline">{result.timestamp}</Badge>
                    )}
                    {result.similarity !== undefined && (
                      <Badge variant="secondary">
                        {Math.round(result.similarity * 100)}% match
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: highlightText(result.text, query),
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

