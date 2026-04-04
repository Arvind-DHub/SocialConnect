"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Registration failed");
        return;
      }

      localStorage.setItem("auth-token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      toast.success("Welcome to SocialConnect!");
      router.push("/feed");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Create your account</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">First name</span>
              </label>
              <input
                {...register("first_name")}
                type="text"
                placeholder="John"
                className={`input input-bordered w-full ${errors.first_name ? "input-error" : ""}`}
              />
              {errors.first_name && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.first_name.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Last name</span>
              </label>
              <input
                {...register("last_name")}
                type="text"
                placeholder="Doe"
                className={`input input-bordered w-full ${errors.last_name ? "input-error" : ""}`}
              />
              {errors.last_name && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.last_name.message}
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder="johndoe_123"
              className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`}
            />
            {errors.username && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.username.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="john@example.com"
              className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.email.message}
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
              placeholder="Min 8 chars, 1 uppercase, 1 number"
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
              "Create Account"
            )}
          </button>
        </form>

        <div className="divider">OR</div>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="link link-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
