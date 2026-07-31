"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask, uploadTaskPhoto } from "@/lib/actions";

export default function TaskWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setPhotoUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const photoInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    if (photoInput && photoInput.files && photoInput.files[0]) {
      const photoFormData = new FormData();
      photoFormData.append("file", photoInput.files[0]);
      const photoResult = await uploadTaskPhoto(photoFormData);
      if (photoResult.url) {
        setPhotoUrl(photoResult.url);
        formData.append("photo_url", photoResult.url);
      }
    }

    const result = await createTask(formData);

    if (result && 'error' in result && result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const taskData = (result as any)?.data as { id?: string } | undefined;
      if (taskData?.id) {
        router.push(`/tasks/${taskData.id}`);
      } else {
        router.push("/tasks");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">ახალი დავალების შექმნა</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">სათაური</label>
          <input
            type="text"
            name="title"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">აღწერა</label>
          <textarea
            name="description"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "იქმნება..." : "დავალების გამოქვეყნება"}
          </button>
        </div>
      </form>
    </div>
  );
}