"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// -------------------------------------------------------
// Separate the component that uses useSearchParams
// into its own component so we can wrap it in Suspense
// -------------------------------------------------------
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/feed";
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Login failed");
        return;
      }

      // Save to localStorage (for API calls)
      localStorage.setItem("auth-token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      // Also save to cookie (for middleware to read)
      // expires in 7 days, same as JWT expiry
      document.cookie = `auth-token=${result.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      toast.success("Welcome back!");

      // Use window.location instead of router.push
      // This does a full page reload which ensures middleware
      // picks up the new cookie properly
      window.location.href = redirectTo;
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Welcome back</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email or username</span>
            </label>
            <input
              {...register("identifier")}
              type="text"
              placeholder="johndoe or john@example.com"
              className={`input input-bordered w-full ${errors.identifier ? "input-error" : ""}`}
            />
            {errors.identifier && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.identifier.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Your password"
              className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.password.message}
                </span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full mt-2"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="divider">OR</div>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="link link-primary">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

// Wrap LoginForm in Suspense — as of Next.js 15 to avoid pre render

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
