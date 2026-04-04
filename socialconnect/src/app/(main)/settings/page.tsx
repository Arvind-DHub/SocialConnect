"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SettingsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    location: "",
    website: "",
  });

  // Fill form with current user data once loaded
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // -------------------------------------------------------
  // Handle avatar image selection and upload
  // -------------------------------------------------------
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage immediately
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Update localStorage with new avatar
        const updatedUser = { ...user, avatar_url: data.data.avatar_url };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile picture updated!");
      } else {
        toast.error(data.error || "Failed to upload image");
        setAvatarPreview(null);
      }
    } catch {
      toast.error("Failed to upload image");
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // -------------------------------------------------------
  // Save profile changes
  // -------------------------------------------------------
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          bio: form.bio || null,
          location: form.location || null,
          website: form.website || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update localStorage with new user data
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile updated!");
        router.push(`/profile/${user?.id}`);
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAvatar = avatarPreview || user?.avatar_url;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/profile/${user?.id}`}
          className="btn btn-ghost btn-sm btn-circle"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body space-y-5">
          {/* ---- Avatar upload ---- */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {currentAvatar ? (
                <div className="avatar">
                  <div className="w-20 h-20 rounded-full">
                    <img src={currentAvatar} alt="Avatar" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                  {user?.first_name[0]}
                  {user?.last_name[0]}
                </div>
              )}

              {/* Loading spinner over avatar while uploading */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <span className="loading loading-spinner loading-sm text-white" />
                </div>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="btn btn-outline btn-sm"
              >
                {isUploadingAvatar ? "Uploading..." : "Change photo"}
              </button>
              <p className="text-xs text-base-content/50 mt-1">
                JPEG or PNG, max 2MB
              </p>
            </div>
          </div>

          <div className="divider my-0" />

          {/* ---- Name fields ---- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">First name</span>
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="John"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Last name</span>
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* ---- Bio ---- */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Bio</span>
              <span className="label-text-alt text-base-content/50">
                {form.bio.length}/160
              </span>
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              maxLength={160}
              placeholder="Tell people about yourself"
              className="textarea textarea-bordered w-full resize-none"
              rows={3}
            />
          </div>

          {/* ---- Location ---- */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Location</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Bengaluru, India"
              className="input input-bordered w-full"
            />
          </div>

          {/* ---- Website ---- */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Website</span>
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
              className="input input-bordered w-full"
            />
          </div>

          {/* ---- Action buttons ---- */}
          <div className="flex justify-end gap-2 pt-2">
            <Link href={`/profile/${user?.id}`} className="btn btn-ghost">
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
