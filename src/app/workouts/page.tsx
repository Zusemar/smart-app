"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllWorkouts, Workout } from "@/lib/storage";
import { BackButton } from "@/components/BackButton";

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    setWorkouts(getAllWorkouts());
  }, []);

  return (
    <div className="min-h-screen bg-[#10151a] text-slate-100 flex flex-col items-center pt-12">
      <div className="w-full max-w-xl">
        <BackButton />
        <h1 className="text-3xl font-extrabold mb-10 text-cyan-300 drop-shadow-md">Мои тренировки</h1>
        <div className="flex flex-col gap-5 w-full">
          {workouts.length === 0 && (
            <Card className="p-5 bg-[#16212e] border-[#234468] text-cyan-400/70 text-center text-lg">
              Пока не создано ни одной тренировки
            </Card>
          )}
          {workouts.map(w =>
            <Card key={w.id} className="bg-[#16212e] border-[#234468] shadow-lg rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-lg font-semibold text-white">{w.name}</span>
              <div className="flex gap-2 justify-end">
                <Button
                  className="bg-gradient-to-br from-cyan-400 via-cyan-500 to-emerald-400 shadow-[0_0_24px_0_#22d3ee] font-bold text-white hover:scale-105 transition"
                  onClick={() => alert("Тренировка началась!")}
                >
                  Начать
                </Button>
                <Button variant="outline" className="border-cyan-400 text-cyan-300 hover:bg-cyan-400/10" onClick={() => router.push(`/workouts/${w.id}/edit`)}>Редактировать</Button>
              </div>
            </Card>
          )}
        </div>
        <Button className="mt-10 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold shadow-lg rounded-lg w-full" onClick={() => router.push("/workouts/new/edit")}>
          Добавить тренировку
        </Button>
      </div>
    </div>
  );
}