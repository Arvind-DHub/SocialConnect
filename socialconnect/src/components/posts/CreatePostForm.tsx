"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { PostWithAuthor } from "@/types";
import toast from "react-hot-toast";

interface Props {
  onPostCreated: (post: PostWithAuthor) => void;
}

export default function CreatePostForm({ onPostCreated }: Props) {
  const { user, token } = useAuth();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        // Don't set Content-Type for FormData — browser sets it automatically
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
        onPostCreated(result.data);
        setContent("");
        removeImage();
        toast.success("Post shared!");
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm flex-shrink-0">
            {user.first_name[0]}
            {user.last_name[0]}
          </div>

          <div className="flex-1 space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className={`textarea textarea-ghost w-full resize-none text-base p-0 focus:outline-none min-h-[80px] ${isOverLimit ? "text-error" : ""}`}
            />

            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-xl object-cover"
                />
                <button
                  onClick={removeImage}
                  className="btn btn-circle btn-xs btn-error absolute top-2 right-2"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-base-200 pt-3">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-ghost btn-sm btn-circle"
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
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-sm ${charsRemaining < 20 ? (isOverLimit ? "text-error font-bold" : "text-warning") : "text-base-content/40"}`}
                >
                  {charsRemaining}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isOverLimit || isSubmitting}
                  className="btn btn-primary btn-sm rounded-full px-5"
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
    </div>
  );
}
