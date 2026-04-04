"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/posts/PostCard";
import { getDisplayName } from "@/lib/utils";
import type { UserProfile, PostWithAuthor } from "@/types";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user_id } = useParams<{ user_id: string }>();
  const { user: currentUser, authHeaders, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(`/api/users/${user_id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch(`/api/posts?author_id=${user_id}`),
        ]);

        const profileData = await profileRes.json();
        const postsData = await postsRes.json();

        if (profileData.success) {
          setProfile(profileData.data);
          setIsFollowing(profileData.data.is_following || false);
        }
        if (postsData.success) setPosts(postsData.data.data);
      } finally {
        setIsLoading(false);
      }
    };

    if (user_id) fetchData();
  }, [user_id, token]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("Please log in to follow users");
      return;
    }

    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            followers_count: wasFollowing
              ? prev.followers_count - 1
              : prev.followers_count + 1,
          }
        : prev,
    );

    setIsFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${user_id}/follow`, {
        method: wasFollowing ? "DELETE" : "POST",
        headers: authHeaders,
      });
      if (!res.ok) {
        setIsFollowing(wasFollowing);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers_count: wasFollowing
                  ? prev.followers_count + 1
                  : prev.followers_count - 1,
              }
            : prev,
        );
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user_id;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <div className="avatar">
                  <div className="w-20 h-20 rounded-full">
                    <img src={profile.avatar_url} alt={profile.username} />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                  {profile.first_name[0]}
                  {profile.last_name[0]}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{getDisplayName(profile)}</h1>
                <p className="text-base-content/60">@{profile.username}</p>
                {profile.location && (
                  <p className="text-sm text-base-content/50 mt-1">
                    📍 {profile.location}
                  </p>
                )}
              </div>
            </div>

            {isOwnProfile ? (
              <button className="btn btn-outline btn-sm">Edit Profile</button>
            ) : currentUser ? (
              <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`btn btn-sm ${isFollowing ? "btn-outline" : "btn-primary"}`}
              >
                {isFollowLoading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : isFollowing ? (
                  "Unfollow"
                ) : (
                  "Follow"
                )}
              </button>
            ) : null}
          </div>

          {profile.bio && (
            <p className="mt-3 text-base leading-relaxed">{profile.bio}</p>
          )}

          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-sm"
            >
              🔗 {profile.website}
            </a>
          )}

          <div className="flex gap-6 mt-3 pt-3 border-t border-base-200">
            {[
              { label: "Posts", value: profile.posts_count },
              { label: "Followers", value: profile.followers_count },
              { label: "Following", value: profile.following_count },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-base-content/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold">Posts</h2>

      {posts.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center py-8">
            <p className="text-base-content/50">No posts yet</p>
          </div>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
