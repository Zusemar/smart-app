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
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl min-h-0 flex-shrink-0 flex flex-col items-center gap-6 mt-2 mb-6">
        <button
          className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all text-white text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-bold py-3 sm:py-4 md:py-5 lg:py-7 xl:py-10 2xl:py-10 px-2 xl:px-4 2xl:px-4 w-full border-2 !border-[#1b378a] min-h-0 flex-shrink-0"
          onClick={() => router.push("/journal")}
        >
          Журнал
        </button>
        <GlowCard
          className="cursor-pointer w-40 h-40 sm:w-52 sm:h-52 rounded-full flex items-center justify-center text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl text-white font-bold border-2 border-[#13aaad] hover:scale-[1.03] hover:-translate-y-1 transition-all min-h-0 flex-shrink-0"
          onClick={() => router.push("/workouts")}
        >
          Начать тренировку
        </GlowCard>
        <button
          className="rounded-2xl bg-[#1aa3a0] shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all text-white text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-bold py-3 sm:py-4 md:py-5 lg:py-7 xl:py-10 2xl:py-10 px-2 xl:px-4 2xl:px-4 w-full border-2 !border-[#007072] min-h-0 flex-shrink-0"
          onClick={() => router.push("/exercises")}
        >
          База упражнений
        </button>
      </div>
      {message && (
        <div className="mb-2 md:mb-3 xl:mb-3 2xl:mb-3 p-2 md:p-3 xl:p-3 2xl:p-3 bg-white bg-opacity-90 rounded shadow-lg text-black max-w-md 2xl:max-w-2xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl text-center">
          {message}
        </div>
      )}
    </main>
  );
}
