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
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-10 mb-20">
        <button
          onClick={() => router.push("/journal")}
          className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl hover:scale-105 transition text-white text-3xl sm:text-4xl font-bold py-10 px-6 w-full border-2 border-black"
        >
          Журнал
        </button>
        <button
          onClick={() => router.push("/workouts")}
          className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl hover:scale-105 transition text-white text-3xl sm:text-4xl font-bold py-10 px-6 w-full border-2 border-black"
        >
          Мои тренировки
        </button>
      </div>
      <GlowCard
        className="cursor-pointer mb-20 w-56 h-56 sm:w-64 sm:h-64 text-3xl sm:text-4xl text-white font-bold border-2 border-black focus-visible:border-accent focus-visible:border-[5px] focus-visible:shadow-[0_0_0_6px_var(--color-accent,#00e0e0),0_2px_16px_0_rgba(6,182,212,0.15)] active:border-accent active:border-[5px] active:shadow-[0_0_0_6px_var(--color-accent,#00e0e0),0_2px_16px_0_rgba(6,182,212,0.15)]"
        tabIndex={0}
        onClick={() => router.push("/workouts")}
      >
        начать тренировку
      </GlowCard>
      {message && (
        <div className="mb-6 p-6 bg-white bg-opacity-90 rounded shadow-lg text-black max-w-xl text-center text-2xl">
          {message}
        </div>
      )}
      <div className="w-full max-w-xs">
        <button
          className="rounded-2xl bg-[#1aa3a0] shadow-xl hover:scale-105 transition text-white text-3xl sm:text-4xl font-bold py-10 px-6 w-full border-2 border-black mt-6"
          onClick={() => router.push("/exercises")}
        >
          База упражнений
        </button>
      </div>
    </main>
  );
}
