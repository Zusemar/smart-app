"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { GlowCard } from "@/components/GlowCard";

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8">
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
        <button
          onClick={() => router.push("/journal")}
          className="rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg hover:scale-105 transition text-white text-lg sm:text-xl font-bold py-8 px-4 w-full border-4 border-blue-200"
        >
          Журнал
        </button>
        <button
          onClick={() => router.push("/workouts")}
          className="rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg hover:scale-105 transition text-white text-lg sm:text-xl font-bold py-8 px-4 w-full border-4 border-green-200"
        >
          Мои тренировки
        </button>
      </div>
      <GlowCard className="cursor-pointer mb-16 w-44 h-44 sm:w-56 sm:h-56 text-xl sm:text-2xl font-bold" onClick={()=>router.push("/workouts")}>начать<br />тренировку</GlowCard>
      <div className="w-full max-w-xs">
        <button
          className="rounded-2xl bg-[#27dbce] shadow-lg hover:scale-105 transition text-white text-lg sm:text-xl font-bold py-8 px-4 w-full border-4 border-[#acd4b4] mt-4"
          onClick={() => router.push("/exercises")}
        >
          База упражнений
        </button>
      </div>
    </main>
  );
}