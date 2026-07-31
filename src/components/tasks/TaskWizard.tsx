"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { createTask, uploadTaskPhoto } from "@/lib/actions";
import { calculatePriceEstimate, formatGEL, TBILISI_DISTRICTS } from "@/config/pricing";
import { TASK_WIZARD_STEPS } from "@/types";
import type { Category } from "@/types";
import type { ComplexityLevel } from "@/config/pricing";
import { ChevronLeft, ChevronRight, Upload, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskWizardProps {
  categories: Category[];
}

export function TaskWizard({ categories }: TaskWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [complexity, setComplexity] = useState<ComplexityLevel>("simple");
  const [estimatedHours, setEstimatedHours] = useState(1);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const estimate = selectedCategory
    ? calculatePriceEstimate({
        categorySlug: selectedCategory.slug,
        complexity,
        estimatedHours,
      })
    : null;

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadTaskPhoto(formData);

    if (result.url) {
      setPhotoUrl(result.url);
    } else {
      setError(result.error || "Upload failed");
    }
    setLoading(false);
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("category_id", categoryId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("district", district);
    formData.append("complexity", complexity);
    formData.append("estimated_hours", estimatedHours.toString());
    if (photoUrl) formData.append("photo_url", photoUrl);

    const result = await createTask(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/tasks/${result.data?.id}`);
    }
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return !!categoryId;
      case 1:
        return true; // photo optional
      case 2:
        return title.length >= 3 && description.length >= 10;
      case 3:
        return address.length >= 5 && !!district;
      case 4:
        return !!estimate;
      case 5:
        return true;
      default:
        return false;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ახალი დავალების შექმნა</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {TASK_WIZARD_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0",
                i < step
                  ? "bg-green-500 text-white"
                  : i === step
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-500"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "ml-1 text-xs hidden sm:inline",
                i === step ? "text-primary-600 font-medium" : "text-gray-500"
              )}
            >
              {s.label}
            </span>
            {i < TASK_WIZARD_STEPS.length - 1 && (
              <div className={cn("w-4 sm:w-8 h-0.5 mx-1", i < step ? "bg-green-500" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>

      <Card>
        {/* Step 0: Category */}
        {step === 0 && (
          <div>
            <CardHeader>
              <CardTitle>აირჩიეთ კატეგორია</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    categoryId === cat.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="font-medium text-sm">{cat.name_ka}</div>
                  <div className="text-xs text-gray-500">{formatGEL(cat.base_price)}-დან</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Photo */}
        {step === 1 && (
          <div>
            <CardHeader>
              <CardTitle>ატვირთეთ ფოტო (არასავალდებულო)</CardTitle>
            </CardHeader>
            <div className="flex flex-col items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">დააჭირეთ ფოტოს ასატვირთად</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
              {photoPreview && (
                <label className="cursor-pointer">
                  <span className="text-sm text-primary-600 hover:underline">სხვა ფოტოს ატვირთვა</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="space-y-4">
            <CardHeader>
              <CardTitle>აღწერეთ დავალება</CardTitle>
            </CardHeader>
            <Input
              id="title"
              label="სათაური"
              placeholder="მაგ: გაჟონვა სამზარეულოში"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              id="description"
              label="აღწერა"
              placeholder="დეტალურად აღწერეთ რა სამუშაოა საჭირო..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <div className="space-y-4">
            <CardHeader>
              <CardTitle>მისამართი</CardTitle>
            </CardHeader>
            <Select
              id="district"
              label="რაიონი"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              options={[
                { value: "", label: "აირჩიეთ რაიონი" },
                ...TBILISI_DISTRICTS.map((d) => ({ value: d, label: d })),
              ]}
            />
            <Input
              id="address"
              label="ზუსტი მისამართი"
              placeholder="მაგ: ვაკე, ჭავჭავაძის გამზ. 12"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        )}

        {/* Step 4: Estimate */}
        {step === 4 && estimate && (
          <div>
            <CardHeader>
              <CardTitle>სავარაუდო ფასი</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Select
                id="complexity"
                label="სირთულე"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as ComplexityLevel)}
                options={[
                  { value: "simple", label: "მარტივი" },
                  { value: "moderate", label: "საშუალო" },
                  { value: "complex", label: "რთული" },
                ]}
              />
              <Input
                id="hours"
                label="სავარაუდო საათები"
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
              />
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ბაზის ფასი</span>
                  <span>{formatGEL(estimate.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">სირთულის კოეფ.</span>
                  <span>×{estimate.complexityMultiplier}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">საათის ღირ.</span>
                  <span>{formatGEL(estimate.hoursCost)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                  <span>სულ</span>
                  <span className="text-primary-600">{formatGEL(estimate.estimatedTotal)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  პლატფორმის საკომისიო: {formatGEL(estimate.commission)} | ხელოსნის შემოსავალი:{" "}
                  {formatGEL(estimate.taskerPayout)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Submit */}
        {step === 5 && estimate && (
          <div>
            <CardHeader>
              <CardTitle>დადასტურება</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">კატეგორია</span>
                <span className="font-medium">
                  {selectedCategory?.icon} {selectedCategory?.name_ka}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">სათაური</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">მისამართი</span>
                <span className="font-medium">{district}, {address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">სავარაუდო ფასი</span>
                <span className="font-bold text-primary-600 text-lg">
                  {formatGEL(estimate.estimatedTotal)}
                </span>
              </div>
            </div>
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            უკან
          </Button>
          {step < TASK_WIZARD_STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              შემდეგი
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              გაგზავნა
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
