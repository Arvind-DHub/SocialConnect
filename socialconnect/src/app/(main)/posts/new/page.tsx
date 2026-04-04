"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charsRemaining = 280 - content.length;
  const isOverLimit = charsRemaining < 0;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("Only JPEG and PNG images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() || isOverLimit || !user) return;
    setIsSubmitting(true);

    try {
      let body: FormData | string;
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      if (selectedImage) {
        const formData = new FormData();
        formData.append("content", content.trim());
        formData.append("image", selectedImage);
        body = formData;
        // Don't set Content-Type for FormData
        // browser sets it automatically with correct boundary
      } else {
        body = JSON.stringify({ content: content.trim() });
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers,
        body,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Post shared!");
        // Redirect to feed after successful post
        router.push("/feed");
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/feed" className="btn btn-ghost btn-sm btn-circle">
          {/* Back arrow */}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">New Post</h1>
      </div>

      {/* Post form card */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 mb-4">
              {user.avatar_url ? (
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={user.avatar_url} alt={user.username} />
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                  {user.first_name[0]}
                  {user.last_name[0]}
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-base-content/60">@{user.username}</p>
              </div>
            </div>
          )}

          {/* Text area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className={`textarea textarea-ghost w-full resize-none text-lg p-0 focus:outline-none min-h-[160px] ${isOverLimit ? "text-error" : ""}`}
            autoFocus
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative inline-block mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 rounded-xl object-cover w-full"
              />
              <button
                onClick={removeImage}
                className="btn btn-circle btn-xs btn-error absolute top-2 right-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="divider my-2" />

          {/* Bottom bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Image upload button */}
              <label
                className="btn btn-ghost btn-sm btn-circle cursor-pointer"
                title="Add image"
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              {/* Character count */}
              <span
                className={`text-sm font-medium ${
                  isOverLimit
                    ? "text-error"
                    : charsRemaining < 20
                      ? "text-warning"
                      : "text-base-content/40"
                }`}
              >
                {charsRemaining}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Link href="/feed" className="btn btn-ghost btn-sm">
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit || isSubmitting}
                className="btn btn-primary btn-sm px-6"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
