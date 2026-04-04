"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/posts/PostCard";
import CreatePostForm from "@/components/posts/CreatePostForm";
import type { PostWithAuthor } from "@/types";

export default function FeedPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const res = await fetch(`/api/feed?page=${pageNum}&limit=10`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = await res.json();

        if (result.success) {
          if (append) {
            setPosts((prev) => [...prev, ...result.data.data]);
          } else {
            setPosts(result.data.data);
          }
          setHasMore(result.data.has_more);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoadingMore(true);
    fetchPosts(nextPage, true);
  };

  const handlePostCreated = (newPost: PostWithAuthor) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Your Feed</h1>

      <CreatePostForm onPostCreated={handlePostCreated} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center py-12">
            <p className="text-base-content/50 text-lg">No posts yet</p>
            <p className="text-base-content/40 text-sm">
              Be the first to share something!
            </p>
          </div>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
          ))}
          {hasMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="btn btn-outline btn-sm"
              >
                {isLoadingMore ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
