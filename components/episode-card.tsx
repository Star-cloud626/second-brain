"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText } from "lucide-react";

export interface Episode {
  episodeId: string;
  title: string;
  chunkCount?: number;
}

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Link href={`/episode/${episode.episodeId}`}>
      <Card className="hover:shadow-lg transition-all duration-200 hover:border-blue-500 cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{episode.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Episode {episode.episodeId}</Badge>
                {episode.chunkCount !== undefined && (
                  <Badge variant="secondary">
                    {episode.chunkCount} chunks
                  </Badge>
                )}
              </div>
            </div>
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click to view full transcript and search within this episode
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

