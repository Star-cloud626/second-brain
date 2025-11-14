"use client";

import { create } from "zustand";

export interface SearchResult {
  id: string;
  text: string;
  episodeId: string;
  episodeTitle: string;
  chunkIndex: number;
  timestamp?: string;
  similarity?: number;
}

interface SearchStore {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",
  results: [],
  isLoading: false,
  error: null,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ query: "", results: [], isLoading: false, error: null }),
}));

