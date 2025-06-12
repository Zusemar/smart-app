"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAssistant } from "@/lib/assistant";

// Types
interface WorkoutExercise {
  name: string;
  type: string;
  target: string;
  sets?: string;
}

interface Workout {
  id: number;
  name: string;
  exercises: WorkoutExercise[];
}

interface JournalExerciseResult {
  name: string;
  type: string;
  result: string;
}

function getVideoUrl(ex: WorkoutExercise) {
  // Placeholder: in a real project this would be a video link
  return "https://www.w3schools.com/html/mov_bbb.mp4";
}

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = Number(params.id);

  // Все хуки только здесь!
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [reps, setReps] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedTime, setSelectedTime] = useState(0);
  const [results, setResults] = useState<JournalExerciseResult[]>([]);
  const [assistantMessage, setAssistantMessage] = useState<string>("");

  useEffect(() => {
    fetch(`http://localhost:8000/api/workouts/${workoutId}`)
      .then(res => res.json())
      .then((workout: Workout) => {
        setWorkout(workout);
        setCurrentIdx(0);
        setIsStarted(false);
        setIsFinished(false);
        setTimer(0);
        setReps(0);
        setResults([]);
      })
      .catch(error => {
        console.error("Error fetching workout:", error);
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

  useEffect(() => {
    if (!workout) return;
    const ex = workout.exercises[currentIdx];
    const assistant = getAssistant();
    assistant.setRouter(router);
    const removeHandler = assistant.addCommandHandler((command) => {
      if (!command.action) return;
      console.log('Assistant command:', command.action.type, command);
      switch (command.action.type) {
        case "start_exercise":
          if (ex.type === "Статика") handleStartStatic();
          if (ex.type === "Динамика") handleStartDynamic();
          setAssistantMessage("Начинаем упражнение");
          console.log('Начинаем упражнение');
          break;
        case "stop_exercise":
          if (intervalId) clearInterval(intervalId);
          setIsStarted(false);
          setAssistantMessage("Останавливаю упражнение");
          console.log('Останавливаю упражнение');
          break;
        case "next_exercise":
          setCurrentIdx(i => {
            const nextIdx = i + 1;
            if (nextIdx < workout.exercises.length) {
              console.log('Переходим к следующему упражнению', nextIdx);
              setAssistantMessage("Переходим к следующему упражнению");
            } else {
              console.log('Тренировка завершена');
              setAssistantMessage("Тренировка завершена");
            }
            return nextIdx;
          });
          handleNext();
          break;
        case "prev_exercise":
          if (currentIdx > 0) {
            setCurrentIdx(i => {
              const prevIdx = i - 1;
              console.log('Возвращаюсь к предыдущему упражнению', prevIdx);
              setAssistantMessage("Возвращаюсь к предыдущему упражнению");
              return prevIdx;
            });
          }
          break;
        case "repeat_exercise":
          if (ex.type === "Статика") {
            setTimer(selectedTime);
            setIsStarted(false);
            if (intervalId) clearInterval(intervalId);
          } else if (ex.type === "Динамика") {
            setReps(Number(ex.target) || 0);
            setIsStarted(false);
          }
          setAssistantMessage("Повторяю упражнение сначала");
          console.log('Повторяю упражнение сначала');
          break;
        case "finish_workout":
          handleFinish();
          setAssistantMessage("Завершаю тренировку");
          console.log('Завершаю тренировку');
          break;
        case "increase_reps":
          handleChangeReps(1);
          setAssistantMessage("Добавляю повторение");
          console.log('Добавляю повторение');
          break;
        case "decrease_reps":
          handleChangeReps(-1);
          setAssistantMessage("Убираю повторение");
          console.log('Убираю повторение');
          break;
        case "increase_time":
          handleChangeTime(10);
          setAssistantMessage("Добавляю 10 секунд");
          console.log('Добавляю 10 секунд');
          break;
        case "decrease_time":
          handleChangeTime(-10);
          setAssistantMessage("Убираю 10 секунд");
          console.log('Убираю 10 секунд');
          break;
        case "fallback":
          setAssistantMessage(
            "Скажи, например, 'начать упражнение', 'следующее упражнение', 'добавить повторение', 'закончить тренировку'..."
          );
          console.log('Fallback');
          break;
        default:
          console.log('Unknown command:', command.action.type);
          break;
      }
    });
    const removeMsg = assistant.addMessageCallback((msg) => setAssistantMessage(msg));
    return () => {
      removeHandler();
      removeMsg();
    };
  }, [router, workout, currentIdx, intervalId, selectedTime, reps, isStarted]);

  // --- Только после всех хуков идут любые return! ---
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

  // --- Static Exercise Functions ---
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

  function saveCurrentResult() {
    if (!workout) return;
    const ex = workout.exercises[currentIdx];
    let result: string;
    if (ex.type === "Статика") {
      let done = selectedTime - timer;
      if (!isStarted) done = selectedTime;
      const min = Math.floor(done / 60);
      const sec = (done % 60).toString().padStart(2, "0");
      result = `${min}:${sec}`;
    } else {
      result = `${reps > 0 ? reps : ex.target}`;
    }
    setResults(prev => {
      const updated = [...prev];
      updated[currentIdx] = { name: ex.name, type: ex.type, result };
      return updated;
    });
  }

  function handleFinish() {
    if (intervalId) clearInterval(intervalId);
    setIsStarted(false);
    if (workout) {
      const ex = workout.exercises[currentIdx];
      let lastResult: string;
      if (ex.type === "Статика") {
        let done = selectedTime - timer;
        if (!isStarted) done = selectedTime;
        const min = Math.floor(done / 60);
        const sec = (done % 60).toString().padStart(2, "0");
        lastResult = `${min}:${sec}`;
      } else {
        lastResult = `${reps > 0 ? reps : ex.target}`;
      }
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const fullResults: JournalExerciseResult[] = workout.exercises.map((ex, idx) => {
        if (idx === currentIdx) {
          return { name: ex.name, type: ex.type, result: lastResult };
        } else if (results[idx]) {
          return results[idx];
        } else {
          return { name: ex.name, type: ex.type, result: `${ex.target}` };
        }
      });
      fetch("http://localhost:8000/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, workout: workout.name, exercises: fullResults })
      })
        .then(() => setIsFinished(true))
        .catch(error => {
          console.error("Error saving journal entry:", error);
        });
    }
  }

  function handleNext() {
    if (intervalId) clearInterval(intervalId);
    setIsStarted(false);
    saveCurrentResult();
    if (!isLast) setCurrentIdx(i => i + 1);
    else setIsFinished(true);
  }

  // --- Dynamic Exercise Functions ---
  function handleStartDynamic() {
    setIsStarted(true);
  }

  function handleChangeReps(delta: number) {
    setReps(r => Math.max(0, r + delta));
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-slate-100 to-cyan-50 pb-[72px]">
      <Card className="w-[90vw] max-w-3xl min-h-[500px] min-w-[320px] flex flex-col justify-between p-0 overflow-hidden">
        {/* Top Section */}
        <div className="flex items-center justify-between px-8 py-4 border-b bg-cyan-50">
          <div className="text-2xl font-bold text-cyan-700">{ex.name}</div>
          {ex.type === "Статика" && isStarted && (
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,"0")}</span>
            </div>
          )}
        </div>
        {/* Assistant message */}
        {assistantMessage && (
          <div className="mx-8 my-2 p-3 bg-white bg-opacity-80 rounded shadow text-black text-center">
            {assistantMessage}
          </div>
        )}

        {/* Center Section */}
        <div className="flex flex-1 items-center justify-between px-8 py-6 gap-8">
          {/* Video */}
          <div className="flex-1 flex items-center justify-center">
            <div className="aspect-square w-40 sm:w-56 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
              <video src={getVideoUrl(ex)} controls className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Results */}
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

        {/* Bottom Section */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-6 sm:py-8 border-t bg-cyan-50 gap-2 sm:gap-6">
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