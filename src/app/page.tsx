"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlowCard } from "@/components/GlowCard";
import { getAssistant } from "@/lib/assistant";

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Set up the router for navigation commands

    const workouts = [
      { id: 1, name: "Грудь и спина" },
      { id: 2, name: "Ноги" },
      // ...
    ];
    
    console.log('sendData');
    getAssistant().sendData({
      action: {
        action_id: "test",
        parameters: { workouts }
      }
    });

    getAssistant().setRouter(router);

    // Set up message handling
    const removeMessageCallback = getAssistant().addMessageCallback((message) => {
      setMessage(message);
    });

    // Cleanup when component unmounts
    return () => {
      removeMessageCallback();
    };
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 py-10 pb-[80px]">
      <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[96rem] grid grid-cols-1 sm:grid-cols-2 gap-10 mb-20">
        <button
          onClick={() => router.push("/journal")}
          className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all text-white text-2xl sm:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold py-8 sm:py-10 lg:py-14 xl:py-20 px-6 w-full border-2 border-[#1b378a]"
        >
          Журнал
        </button>
        <button
          onClick={() => router.push("/workouts")}
          className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all text-white text-2xl sm:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold py-8 sm:py-10 lg:py-14 xl:py-20 px-6 w-full border-2 border-[oklch(0.46_0.15_136.12)]"
        >
          Мои тренировки
        </button>
      </div>
      <GlowCard
        className="cursor-pointer mb-20 w-48 sm:w-56 lg:w-72 xl:w-96 2xl:w-[30rem] h-48 sm:h-56 lg:h-72 xl:h-96 2xl:h-[30rem] text-2xl sm:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-white font-bold border-4 border-[#13aaad] hover:scale-[1.02] hover:-translate-y-1 transition-all"
        onClick={() => router.push("/workouts")}
      >
        начать тренировку
      </GlowCard>
      {message && (
        <div className="mb-6 p-6 bg-white bg-opacity-90 rounded shadow-lg text-black max-w-xl text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-center">
          {message}
        </div>
      )}
      <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
        <button
          className="rounded-2xl bg-[#1aa3a0] shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all text-white text-2xl sm:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold py-8 sm:py-10 lg:py-14 xl:py-20 px-6 w-full border-2 border-[#007072]"
          onClick={() => router.push("/exercises")}
        >
          База упражнений
        </button>
      </div>
    </main>
  );
}
