"use client";
import { useRouter } from "next/navigation";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className={
        "flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500 text-cyan-300 bg-[#234468]/30 hover:bg-[#234468]/50 transition font-semibold shadow-sm mb-6 " +
        className
      }
    >
      <svg width={20} height={20} fill="none" className="text-cyan-400" viewBox="0 0 20 20">
        <path d="M12 16l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Назад
    </button>
  );
}