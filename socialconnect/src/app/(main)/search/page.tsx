"use client";

import { useState } from "react";
import Link from "next/link";
import { getDisplayName } from "@/lib/utils";
import type { UserProfile } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/users?search=${encodeURIComponent(query.trim())}&limit=20`,
      );
      const data = await res.json();
      if (data.success) setResults(data.data.data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Search Users</h1>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by username or name..."
          className="input input-bordered flex-1"
          autoFocus
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="btn btn-primary"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Search"
          )}
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center py-8">
            <p className="text-base-content/50 text-lg">No users found</p>
            <p className="text-base-content/40 text-sm">
              Try a different username or name
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow block"
            >
              <div className="card-body p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {user.avatar_url ? (
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full">
                        <img src={user.avatar_url} alt={user.username} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                      {user.first_name[0]}
                      {user.last_name[0]}
                    </div>
                  )}

                  {/* User info */}
                  <div className="flex-1">
                    <p className="font-semibold">{getDisplayName(user)}</p>
                    <p className="text-sm text-base-content/60">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-base-content/70 mt-1 line-clamp-1">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="text-right text-sm text-base-content/60">
                    <p>{user.posts_count} posts</p>
                    <p>{user.followers_count} followers</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
