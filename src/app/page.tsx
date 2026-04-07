"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import FilterBar from "@/components/FilterBar";
import { PostCardGrid, PostCardList } from "@/components/PostCard";
import { posts } from "@/data/posts";
import type { Platform, PostStatus } from "@/data/posts";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlatform, setActivePlatform] = useState<Platform | "all">("all");
  const [activeStatus, setActiveStatus] = useState<PostStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesPlatform = activePlatform === "all" || post.platform === activePlatform;
      const matchesStatus = activeStatus === "all" || post.status === activeStatus;
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [activePlatform, activeStatus, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats */}
        <StatsBar />

        {/* Section Title + Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Publicaciones Programadas
              <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                ({filteredPosts.length})
              </span>
            </h2>
          </div>

          <FilterBar
            activePlatform={activePlatform}
            onPlatformChange={setActivePlatform}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Posts Grid/List */}
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-[var(--text-secondary)] font-medium">No se encontraron publicaciones</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Intenta ajustar los filtros o busqueda</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPosts.map((post) => (
              <PostCardGrid key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <PostCardList key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] px-4 py-4 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          Viva Social Hub &mdash; Content Management System
        </p>
      </footer>
    </div>
  );
}
