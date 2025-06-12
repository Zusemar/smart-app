"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createAssistant, createSmartappDebugger } from "@salutejs/client";
import { GlowCard } from "@/components/GlowCard";

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [assistantReady, setAssistantReady] = useState(false);
  const assistantRef = useRef<any>(null);

  useEffect(() => {
    const state = {};
    const recoveryState = {};

    const initialize = (getState: any, getRecoveryState: any) => {
      if (process.env.NODE_ENV === "development") {
        return createSmartappDebugger({
          token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJiNmNkOTlhZC03ZTM0LTQxNTgtOTU1NS00OTQxOWM5MTQwOWEiLCJzdWIiOiJmZjAwMTYxNWFmOWVkMTExNDgyMGE3OGFkMzAzYzc1MGU5MTEwOTUyN2RhNTAwNTBmYzBiZDY2NWE2Y2JiMDQ4M2IxNTYiLCJpc3MiOiJLRVlNQVNURVIiLCJleHAiOjE3NDk4MjAyNzMsImF1ZCI6IlZQUyIsInVzciI6IjBhMjY2ZjI2LTJjZmEtNDA5ZC1iOGJjLWM0OWVjZjFjZjliNiIsImlhdCI6MTc0OTczMzg2Mywic2lkIjoiMmY0MjVhOGYtNGZjNy00MzcxLTllMjUtZjY0NjU0NTQ4MmFkIn0.jJv2PkroL_deh-6k96ynm2havERiZqd5t-Z3TKXr21xAgChrBVVIM4-HDdXpKrPA54udn8vg1HbsOdwkZgmbfLD3pMM_AqGzv104k1j6KBsmMprOPuFX3YMZ4wLf1vGq4uDBkhE4xg0lDYlhchrqwP6Nd_805O_aA0ZlL4j6LZCRh5KMfgHz2cVfeBnGApHVSpDbgKBISTxlfZUgavrplEuX7nwVagIVj1cz7H77lT7GSuhxZzPuUIBNlLRUfzrARSXnwZnQx8WO_VINFCH6qWSKiGM9TtOxqt0FpF1Fgm_exUI-bpLPId1bV9DnWq9Xl7dUeplhPPUUmqCa86WwSWxZWLrh-waXST7ywrpzM0hlIRXKBw2eDTyIyUe9luQVwwh-_Hgkam0Z2lavXzmbqlhZ7arR1SA1yzBx-0MoHmNNynIx_OjicToLMICg6vD8y3UJN9AJrosiKxYxIH1_XdENI044QWe8XpSGyfZW-EU7zFx7gzCaWkJkOESoxK_pX6SkDjT4u--TmjVa1boDQkperSHU0YAsTaH9HxrvsPhlgcj6X7vGuQUgZXYaeN38WPFLRnL3fAjwyaPFKDE-VobRAxU0QoPdmEDIgdyJTW-KIUcdoa6xoZkqiqdOJs4gEMchTsIKmoNtnGyxI-LpRi5jQSMFAVXGS4vj5TfmV4o",
          initPhrase: "Запусти smart-app",
          getState,
          getRecoveryState,
          nativePanel: {
            defaultText: "начать тренировку",
            screenshotMode: false,
            tabIndex: 0,
          },
        });
      }

      return createAssistant({ getState, getRecoveryState });
    };

    if (!assistantRef.current) {
      const assistantInstance = initialize(() => state, () => recoveryState);
      assistantRef.current = assistantInstance;
      setAssistantReady(true);

      assistantInstance.on("data", (command: any) => {
        // Обработка команд навигации "вверх/вниз"
        if (command.navigation) {
          switch(command.navigation.command) {
            case 'UP':
              window.scrollTo(0, 0);
              break;
            case 'DOWN':
              window.scrollTo(0, 1000);
              break;
          }
        }
        console.log("[Salute] received command:", command);
        const action = command?.action;
        console.log("[Salute] received action:", action);
        switch (action?.type) {
          case "open_journal":
            router.push("/journal");
            setMessage("Открываю журнал тренировок");
            break;
          case "open_workouts":
            router.push("/workouts");
            setMessage("Показываю список тренировок");
            break;
          case "open_exercises":
            router.push("/exercises");
            setMessage("Открываю базу упражнений");
            break;

          case "start_workout":
            router.push("/workouts");
            setMessage("Начинаем тренировку!");
            break;
          case "stop_workout":
            setMessage("Тренировка остановлена.");
            break;

          case "fallback":
            setMessage(
              "Скажи, например, 'начни тренировку', 'покажи тренировки' или 'открой базу упражнений'."
            );
            break;
        }
      });

      
      assistantInstance.sendData({
        action: { action_id: "init", parameters: {} },
      });
    }
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8 pb-[72px]">
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
      <GlowCard
        className="cursor-pointer mb-16 w-44 h-44 sm:w-56 sm:h-56 text-xl sm:text-2xl font-bold"
        onClick={() => router.push("/workouts")}
      >
        начать<br />тренировку
      </GlowCard>
      {message && (
        <div className="mb-4 p-4 bg-white bg-opacity-80 rounded shadow text-black max-w-xl text-center">
          {message}
        </div>
      )}
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
