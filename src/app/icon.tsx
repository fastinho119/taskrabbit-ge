import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskRabbit GE",
};

export default function Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#2563eb" />
      <path
        d="M10 22V10h3.5l4.5 7.5V10H21v12h-3.5L13 14.5V22H10z"
        fill="white"
      />
    </svg>
  );
}
