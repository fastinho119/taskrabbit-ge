import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DEFAULT_CATEGORIES, formatGEL, PLATFORM_COMMISSION_PERCENT } from "@/config/pricing";
import {
  ArrowRight,
  CheckCircle,
  MapPin,
  Shield,
  Star,
  Wrench,
  Clock,
  CreditCard,
} from "lucide-react";

const steps = [
  {
    icon: Wrench,
    title: "აირჩიეთ სერვისი",
    description: "აირჩიეთ კატეგორია — სანტექნიკა, კონდიციონერი, ტელევიზორი და სხვა.",
  },
  {
    icon: MapPin,
    title: "მიუთითეთ მისამართი",
    description: "შეიყვანეთ თბილისის რაიონი და ზუსტი მისამართი.",
  },
  {
    icon: CreditCard,
    title: "მიიღეთ შეფასება",
    description: "სისტემა ავტომატურად გამოთვლის სავარაუდო ფასს ლარში (₾).",
  },
  {
    icon: CheckCircle,
    title: "დასრულება და შეფასება",
    description: "ხელოსანი ასრულებს სამუშაოს, თქვენ აფასებთ მის მუშაობას.",
  },
];

const features = [
  { icon: Shield, title: "სანდო ხელოსნები", description: "ყველა ხელოსანი გადის შემოწმებას" },
  { icon: Star, title: "რეიტინგის სისტემა", description: "რეალური შეფასებები მომხმარებლებისგან" },
  { icon: Clock, title: "სწრაფი რეაგირება", description: "დავალება მიიღება წუთებში" },
  { icon: CreditCard, title: "გამჭვირვალე ფასები", description: "ფასი ცნობილია წინასწარ, ლარებში" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWlsbC1ydWxlPSJldmVub2RkIj48ZyBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiPjxwYXRoIGQ9Ik0zNiAzNGg0djJoLTR6bTAtNGg0djJoLTR6bTAtNGg0djJoLTR6bTAtNGg0djJoLTR6bTAtNGg0djJoLTR6bTAtNGg0djJoLTR6bTAtNGg0djJoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              იპოვეთ სანდო ხელოსანი{" "}
              <span className="text-accent-500">თბილისში</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
              TaskRabbit GE — ადგილობრივი სერვისების ბაზარი. გამოაცხადეთ
              დავალება, მიიღეთ შეთავაზებები და აირჩიეთ საუკეთესო ხელოსანი.
              ყველა ფასი ლარში (₾).
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register?role=customer">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  გამოაცხადე დავალება
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/register?role=handyman">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                >
                  გახდი ხელოსანი
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ჩვენი სერვისები</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              აირჩიეთ საჭირო კატეგორია. საწყისი ფასები ლარში (₾).
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DEFAULT_CATEGORIES.map((cat) => (
              <Card key={cat.slug} className="text-center hover:shadow-md transition-shadow cursor-pointer group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{cat.name_ka}</h3>
                <p className="text-xs text-gray-500">{cat.name_en}</p>
                <p className="text-primary-600 font-bold mt-2">{formatGEL(cat.base_price)}-დან</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">როგორ მუშაობს</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <step.icon className="h-7 w-7 text-primary-600" />
                </div>
                <div className="text-sm font-bold text-primary-600 mb-2">ნაბიჯი {i + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing info */}
      <section className="py-16 bg-primary-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">გამჭვირვალე ფასები</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            ყველა ფასი გამოთვლილია ლარში (₾). პლატფორმის საკომისიო შეადგენს{" "}
            {PLATFORM_COMMISSION_PERCENT}%-ს და ავტომატურად იკალიება დავალების
            დასრულებისას.
          </p>
          <Link href="/auth/register">
            <Button size="lg">
              დაიწყე ახლავე
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
