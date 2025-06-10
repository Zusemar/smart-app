"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllWorkouts, Workout, WorkoutExercise, getJournal, saveJournalEntry, JournalEntry, JournalExerciseResult } from "@/lib/storage";

function getVideoUrl(ex: WorkoutExercise) {
  // Заглушка: в реальном проекте тут может быть ссылка на видео
  return "https://www.w3schools.com/html/mov_bbb.mp4";
}

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = Number(params.id);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [reps, setReps] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedTime, setSelectedTime] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8000/api/workouts")
      .then(res => res.json())
      .then((workouts: Workout[]) => {
        const w = workouts.find(x => x.id === workoutId);
        setWorkout(w || null);
        setCurrentIdx(0);
        setIsStarted(false);
        setIsFinished(false);
        setTimer(0);
        setReps(0);
      });
  }, [workoutId]);

  useEffect(() => {
    if (!workout) return;
    const ex = workout.exercises[currentIdx];
    if (ex?.type === "Статика") {
      setSelectedTime(Number(ex.target) || 0);
      setTimer(Number(ex.target) || 0);
    }
    if (ex?.type === "Динамика") setReps(Number(ex.target) || 0);
    setIsStarted(false);
    if (intervalId) clearInterval(intervalId);
  }, [currentIdx, workout]);

  if (!workout) {
    return <div className="flex items-center justify-center min-h-screen">Тренировка не найдена</div>;
  }
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <Card className="p-10 text-center max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-emerald-600">Тренировка завершена!</h2>
          <p className="mb-6 text-lg">Отличная работа! Так держать 💪</p>
          <Button onClick={() => router.push("/")}>На главный экран</Button>
        </Card>
      </div>
    );
  }

  const ex = workout.exercises[currentIdx];
  const isLast = currentIdx === workout.exercises.length - 1;

  // --- Статика ---
  function handleStartStatic() {
    setIsStarted(true);
    setTimer(selectedTime);
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    setIntervalId(id);
  }
  function handleChangeTime(delta: number) {
    if (!isStarted) setSelectedTime(t => Math.max(0, t + delta));
  }
  function handleFinish() {
    if (intervalId) clearInterval(intervalId);
    setIsStarted(false);
    if (workout) {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const results: JournalExerciseResult[] = workout.exercises.map((ex, idx) => {
        if (idx === currentIdx) {
          if (ex.type === "Статика") {
            let done = selectedTime - timer;
            if (!isStarted) done = selectedTime;
            const min = Math.floor(done / 60);
            const sec = (done % 60).toString().padStart(2, "0");
            return { name: ex.name, type: ex.type, result: `${min}:${sec}` };
          } else {
            return { name: ex.name, type: ex.type, result: `${reps > 0 ? reps : ex.target}` };
          }
        } else {
          return { name: ex.name, type: ex.type, result: ex.target };
        }
      });
      // Сохраняем результат тренировки в журнал через API
      fetch("http://localhost:8000/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, workout: workout.name, exercises: results })
      });
    }
    setIsFinished(true);
  }
  function handleNext() {
    if (intervalId) clearInterval(intervalId);
    setIsStarted(false);
    if (!isLast) setCurrentIdx(i => i + 1);
    else setIsFinished(true);
  }

  // --- Динамика ---
  function handleStartDynamic() {
    setIsStarted(true);
  }
  function handleChangeReps(delta: number) {
    setReps(r => Math.max(0, r + delta));
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-slate-100 to-cyan-50">
      <Card className="w-[90vw] max-w-3xl min-h-[500px] min-w-[320px] flex flex-col justify-between p-0 overflow-hidden">
        {/* Верхняя часть */}
        <div className="flex items-center justify-between px-8 py-4 border-b bg-cyan-50">
          <div className="text-2xl font-bold text-cyan-700">{ex.name}</div>
          {ex.type === "Статика" && isStarted && (
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,"0")}</span>
            </div>
          )}
        </div>
        {/* Центральная часть */}
        <div className="flex flex-1 items-center justify-between px-8 py-6 gap-8">
          {/* Видео */}
          <div className="flex-1 flex items-center justify-center">
            <div className="aspect-square w-40 sm:w-56 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
              <video src={getVideoUrl(ex)} controls className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Итоговое значение */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            {ex.type === "Статика" ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="text-3xl font-bold text-cyan-700 text-center w-full">Итоговое время</div>
                <div className="flex items-center gap-3 justify-center w-full">
                  <Button variant="outline" onClick={() => handleChangeTime(-10)} disabled={isStarted}>-10 сек</Button>
                  <span className="text-4xl font-mono">{Math.floor(selectedTime/60)}:{(selectedTime%60).toString().padStart(2,"0")}</span>
                  <Button variant="outline" onClick={() => handleChangeTime(10)} disabled={isStarted}>+10 сек</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="text-3xl font-bold text-cyan-700">Повторения</div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => handleChangeReps(-1)}>-1</Button>
                  <span className="text-4xl font-mono">{reps}</span>
                  <Button variant="outline" onClick={() => handleChangeReps(1)}>+1</Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Нижняя часть */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-6 sm:py-8 border-t bg-cyan-50 gap-2 sm:gap-6">
          {/* Если последнее упражнение */}
          {isLast ? (
            <>
              {ex.type === "Статика" ? (
                <Button size="lg" onClick={handleStartStatic} className="font-bold min-w-[140px] sm:min-w-[200px] text-base sm:text-lg py-3 sm:py-4" disabled={isStarted}>Начать упражнение</Button>
              ) : <div />}
              <Button variant="outline" size="lg" onClick={handleFinish} className="text-red-500 border-red-300 min-w-[120px] sm:min-w-[160px] text-base sm:text-lg py-3 sm:py-4">Закончить тренировку</Button>
            </>
          ) : (
            <>
              {ex.type === "Статика" ? (
                <Button size="lg" onClick={handleStartStatic} className="font-bold min-w-[140px] sm:min-w-[200px] text-base sm:text-lg py-3 sm:py-4" disabled={isStarted}>Начать упражнение</Button>
              ) : <div />}
              <Button variant="outline" size="lg" onClick={handleNext} className="min-w-[120px] sm:min-w-[160px] text-base sm:text-lg py-3 sm:py-4">Следующее упражнение</Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
} 