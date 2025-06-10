"use client";

import { useState } from "react";
import { z } from "zod";

import { db } from "@/lib/database";

const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(50, "Name must be 50 characters or less"),
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .optional(),
});

interface CreateFolderModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateFolderModal({
  userId,
  open,
  onOpenChange,
  onSuccess,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    const result = createFolderSchema.safeParse({ name, description });
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid input");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.createFolder({
        user_id: userId,
        name: name.trim(),
        description: description.trim() || "",
      });

      // Reset form
      setName("");
      setDescription("");
      setError("");
      onSuccess?.();
      alert("Folder created successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      setError("Failed to create folder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setError("");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "420px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e5e7eb",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "8px",
              color: "#111827",
            }}
          >
            Create New Folder
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Create a folder to organize your boards and content.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Marketing Campaigns"
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                color: "#111827",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this folder..."
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                color: "#111827",
                outline: "none",
                resize: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              paddingTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                color: "#374151",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.5 : 1,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => {
                if (!isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#f9fafb";
                }
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.backgroundColor = "white";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: "#3b82f6",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.5 : 1,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => {
                if (!isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#2563eb";
                }
              }}
              onMouseLeave={e => {
                if (!isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#3b82f6";
                }
              }}
            >
              {isSubmitting ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
