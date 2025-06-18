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
    <main className="min-h-screen flex flex-col items-center px-1 sm:px-2 py-2 pb-2 overflow-y-auto">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-6xl grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 xl:gap-6 2xl:gap-6 mb-3 md:mb-6 xl:mb-6 2xl:mb-6 mt-2">
        <button
          onClick={() => router.push("/journal")}
          className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all text-white text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-bold py-3 sm:py-4 md:py-5 lg:py-7 xl:py-10 2xl:py-10 px-2 xl:px-4 2xl:px-4 w-full border-2 !border-[#1b378a] min-h-0 flex-shrink-0"
        >
          Журнал
        </button>
        <button
          onClick={() => router.push("/workouts")}
          className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all text-white text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-bold py-3 sm:py-4 md:py-5 lg:py-7 xl:py-10 2xl:py-10 px-2 xl:px-4 2xl:px-4 w-full border-2 !border-[oklch(0.46_0.15_136.12)] min-h-0 flex-shrink-0"
        >
          Мои тренировки
        </button>
      </div>
      <GlowCard
        className="cursor-pointer mb-3 md:mb-6 xl:mb-6 2xl:mb-6 w-28 sm:w-36 md:w-44 lg:w-52 xl:w-60 2xl:w-96 h-28 sm:h-36 md:h-44 lg:h-52 xl:h-60 2xl:h-96 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-3xl text-white font-bold border-2 border-[#13aaad] hover:scale-[1.01] hover:-translate-y-0.5 transition-all min-h-0 flex-shrink-0"
        onClick={() => router.push("/workouts")}
      >
        Начать тренировку
      </GlowCard>
      {message && (
        <div className="mb-2 md:mb-3 xl:mb-3 2xl:mb-3 p-2 md:p-3 xl:p-3 2xl:p-3 bg-white bg-opacity-90 rounded shadow-lg text-black max-w-md 2xl:max-w-2xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl text-center">
          {message}
        </div>
      )}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl min-h-0 flex-shrink-0">
        <button
          className="rounded-2xl bg-[#1aa3a0] shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all text-white text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-bold py-3 sm:py-4 md:py-5 lg:py-7 xl:py-10 2xl:py-10 px-2 xl:px-4 2xl:px-4 w-full border-2 !border-[#007072] min-h-0 flex-shrink-0"
          onClick={() => router.push("/exercises")}
        >
          База упражнений
        </button>
      </div>
    </main>
  );
}
