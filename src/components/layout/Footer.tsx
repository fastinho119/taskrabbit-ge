import Link from "next/link";
import { DEFAULT_PLATFORM_SETTINGS } from "@/config/pricing";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-primary-700 text-lg mb-2">
              {DEFAULT_PLATFORM_SETTINGS.platform_name}
            </h3>
            <p className="text-sm text-gray-600">
              თბილისის უსაფრთხო და სანდო სერვისების ბაზარი. იპოვეთ ხელოსანი ან
              გამოაცხადეთ დავალება.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">სერვისები</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>🔧 სანტექნიკა</li>
              <li>❄️ კონდიციონერის დაყენება</li>
              <li>📺 ტელევიზორის მონტაჟი</li>
              <li>⚡ ელექტრიკა</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">კონტაქტი</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>{DEFAULT_PLATFORM_SETTINGS.support_email}</li>
              <li>{DEFAULT_PLATFORM_SETTINGS.support_phone}</li>
              <li>თბილისი, საქართველო</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TaskRabbit GE. ყველა უფლება დაცულია.
        </div>
      </div>
    </footer>
  );
}
