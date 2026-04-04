"use client";

import { useState } from "react";
import Link from "next/link";
import { timeAgo, getDisplayName } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { PostWithAuthor } from "@/types";
import toast from "react-hot-toast";

interface PostCardProps {
  post: PostWithAuthor;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user, authHeaders } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count);

  const isOwner = user?.id === post.author_id;

  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts");
      return;
    }

    const wasLiked = isLiked;
    // Optimistic update — update UI immediately, confirm with server after
    setIsLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: wasLiked ? "DELETE" : "POST",
        headers: authHeaders,
      });
      if (!response.ok) {
        // Revert if server failed
        setIsLiked(wasLiked);
        setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      }
    } catch {
      setIsLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`);
        const data = await res.json();
        if (data.success) setComments(data.data.data);
      } finally {
        setIsLoadingComments(false);
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.data]);
        setCommentCount((prev) => prev + 1);
        setNewComment("");
        toast.success("Comment added!");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        toast.success("Post deleted");

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.posts_count = Math.max(0, (parsed.posts_count || 1) - 1);
          localStorage.setItem("user", JSON.stringify(parsed));
        }

        onDelete?.(post.id);
      } else {
        toast.error("Failed to delete post");
      }
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/posts/${post.id}/comments/${commentId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        // Remove the comment from local state instantly
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentCount((prev) => prev - 1);
        toast.success("Comment deleted");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* Author header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${post.author.id}`}
            className="flex items-center gap-3 group"
          >
            {post.author.avatar_url ? (
              <div className="avatar">
                <div className="w-10 h-10 rounded-full">
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.username}
                  />
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                {post.author.first_name[0]}
                {post.author.last_name[0]}
              </div>
            )}
            <div>
              <p className="font-semibold group-hover:text-primary transition-colors">
                {getDisplayName(post.author)}
              </p>
              <p className="text-sm text-base-content/60">
                @{post.author.username} · {timeAgo(post.created_at)}
              </p>
            </div>
          </Link>

          {isOwner && (
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box shadow-xl w-32 p-2 border border-base-300"
              >
                <li>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-error"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Post content */}
        <p className="mt-3 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Post image */}
        {post.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-base-200">
          <button
            onClick={handleLike}
            className={`btn btn-ghost btn-sm gap-2 ${isLiked ? "text-error" : "text-base-content/60"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill={isLiked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likeCount}</span>
          </button>

          <button
            onClick={handleToggleComments}
            className="btn btn-ghost btn-sm gap-2 text-base-content/60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{commentCount}</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 space-y-3 border-t border-base-200 pt-3">
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm" />
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {comment.author?.first_name[0]}
                      {comment.author?.last_name[0]}
                    </div>
                    <div className="bg-base-200 rounded-2xl px-3 py-2 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">
                          @{comment.author?.username}
                        </p>
                        {/* Only show delete if current user wrote this comment */}
                        {user?.id === comment.author_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-error hover:underline"
                          >
                            delete
                          </button>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {user && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                      placeholder="Write a comment..."
                      className="input input-bordered input-sm flex-1"
                      maxLength={280}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      {isSubmittingComment ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
