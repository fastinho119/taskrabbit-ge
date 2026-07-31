"use client";

import { useState } from "react";
import { submitReview } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Star } from "lucide-react";

interface ReviewFormProps {
  taskId: string;
  handymanId: string;
}

export function ReviewForm({ taskId, handymanId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("handyman_id", handymanId);
    formData.append("rating", rating.toString());
    formData.append("comment", comment);

    const result = await submitReview(formData);
    if (result.success) setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <Card className="text-center py-6">
        <div className="text-3xl mb-2">⭐</div>
        <p className="font-medium text-gray-900">გმადლობთ შეფასებისთვის!</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>შეაფასეთ ხელოსანი</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    value <= (hover || rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <Textarea
          id="comment"
          label="კომენტარი (არასავალდებულო)"
          placeholder="აღწერეთ თქვენი გამოცდილება..."
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button type="submit" disabled={rating === 0} loading={loading}>
          შეფასების გაგზავნა
        </Button>
      </form>
    </Card>
  );
}
