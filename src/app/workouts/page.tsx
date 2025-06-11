"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";

type Workout = {
  id: number;
  name: string;
  exercises: any[];
};

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/workouts")
      .then(res => res.json())
      .then(setWorkouts);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-cyan-50 text-slate-900 flex flex-col items-center pt-12">
      <div className="w-full max-w-xl">
      <BackButton className="w-fit mb-6 bg-white border-cyan-300 text-cyan-700 shadow hover:bg-cyan-50 transition font-semibold px-6 py-2" />

        <h1 className="text-3xl font-extrabold mb-10 text-cyan-700 drop-shadow-md">Мои тренировки</h1>
        <div className="flex flex-col gap-5 w-full">
          {workouts.length === 0 && (
            <Card className="p-5 bg-white border-cyan-200 text-cyan-700 text-center text-lg shadow-md">
              Пока не создано ни одной тренировки
            </Card>
          )}
          {workouts.map(w =>
            <Card key={w.id} className="bg-white border-cyan-200 shadow-md rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-lg font-semibold text-cyan-900">{w.name}</span>
              <div className="flex gap-2 justify-end">
                <Button
                  className="bg-gradient-to-br from-cyan-400 via-cyan-500 to-emerald-400 shadow font-bold text-white hover:scale-105 transition"
                  onClick={() => router.push(`/workouts/${w.id}/session`)}
                >
                  Начать
                </Button>
                <Button variant="outline" className="border-cyan-400 text-cyan-700 hover:bg-cyan-100" onClick={() => router.push(`/workouts/${w.id}/edit`)}>Редактировать</Button>
              </div>
            </Card>
          )}
        </div>
        <Button className="mt-10 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold shadow-lg rounded-lg w-full text-white" onClick={() => router.push("/workouts/new/edit")}>Добавить тренировку</Button>
      </div>
    </div>
  );
}