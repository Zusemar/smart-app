// TODO: если завершать голосом, то не сохраняется результат упражнений на время
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAssistant, getApiUrl } from "@/lib/assistant";

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
  // Теперь возвращаем иконку DomFit вместо видео
  return "/domfit.jpg";
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
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const assistant = getAssistant();
    setUserId(assistant.getUserId());
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${userId}/${workoutId}`)
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
  }, [workoutId, userId]);

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
          console.log('Переходим к следующему упражнению');
          setAssistantMessage("Переходим к следующему упражнению");
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
          saveCurrentResult();
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <span className="text-3xl">Тренировка не найдена</span>
      </div>
    );
  }
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-10 bg-gray-100">
        <Card className="p-12 text-center max-w-lg mx-auto border-black">
          <h2 className="text-6xl font-bold mb-6 text-emerald-700">Тренировка завершена!</h2>
          <p className="mb-8 text-3xl">Отличная работа! Так держать 💪</p>
          <p className="mb-8 text-2xl text-gray-700">Скажи "вернуться" чтобы вернуться на главный экран</p>
          <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:scale-105 transition border-black text-2xl">На главный экран</Button>
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
      let done;
      if (isStarted) {
        // If exercise is in progress, calculate actual time done
        done = selectedTime - timer;
      } else {
        // If exercise is not started or finished, use selected time
        done = selectedTime;
      }
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
    if (workout && userId) {
      const ex = workout.exercises[currentIdx];
      let lastResult: string;
      if (ex.type === "Статика") {
        let done;
        if (isStarted) {
          done = selectedTime - timer;
        } else {
          done = selectedTime;
        }
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date: dateStr, 
          workout: workout.name, 
          exercises: fullResults,
          user_id: userId 
        })
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
      <Card className="w-[90vw] max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl min-h-[500px] min-w-[320px] flex flex-col justify-between p-0 overflow-hidden">
        {/* Top Section */}
        <div className="flex items-center justify-between px-8 py-4 lg:py-6 xl:py-8 border-b bg-cyan-50">
          <div className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-cyan-700">{ex.name}</div>
          {ex.type === "Статика" && isStarted && (
            <div className="flex items-center gap-2">
              <span className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-mono">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,"0")}</span>
            </div>
          )}
        </div>
        {/* Assistant message */}
        {assistantMessage && (
          <div className="mx-8 my-2 p-3 lg:p-4 xl:p-5 bg-white bg-opacity-80 rounded shadow text-slate-900 text-center text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
            {assistantMessage}
          </div>
        )}

        {/* Center Section */}
        <div className="flex flex-1 items-center justify-between px-8 py-6 lg:py-8 xl:py-10 gap-8">
          {/* Video */}
          <div className="flex-1 flex items-center justify-center">
            <div className="aspect-square w-40 sm:w-56 lg:w-64 xl:w-72 2xl:w-80 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
              <img src={getVideoUrl(ex)} alt="DomFit Icon" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 lg:gap-8">
            {ex.type === "Статика" ? (
              <div className="flex flex-col items-center gap-4 lg:gap-6 w-full">
                <div className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-cyan-700 text-center w-full">Итоговое время</div>
                <div className="flex items-center gap-3 lg:gap-4 justify-center w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => handleChangeTime(-10)} 
                    disabled={isStarted}
                    className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl py-3 lg:py-4 xl:py-6 2xl:py-8 px-6 lg:px-8 xl:px-10 2xl:px-12 hover:scale-[1.02] hover:-translate-y-0.5 transition-all min-w-[120px] lg:min-w-[160px] xl:min-w-[200px] 2xl:min-w-[240px]"
                  >
                    -10 сек
                  </Button>
                  <span className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-mono">{Math.floor(selectedTime/60)}:{(selectedTime%60).toString().padStart(2,"0")}</span>
                  <Button 
                    variant="outline" 
                    onClick={() => handleChangeTime(10)} 
                    disabled={isStarted}
                    className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl py-3 lg:py-4 xl:py-6 2xl:py-8 px-6 lg:px-8 xl:px-10 2xl:px-12 hover:scale-[1.02] hover:-translate-y-0.5 transition-all min-w-[120px] lg:min-w-[160px] xl:min-w-[200px] 2xl:min-w-[240px]"
                  >
                    +10 сек
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 lg:gap-6">
                <div className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-cyan-700">Повторения</div>
                <div className="flex items-center gap-3 lg:gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleChangeReps(-1)}
                    className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl py-3 lg:py-4 xl:py-6 2xl:py-8 px-6 lg:px-8 xl:px-10 2xl:px-12 hover:scale-[1.02] hover:-translate-y-0.5 transition-all min-w-[120px] lg:min-w-[160px] xl:min-w-[200px] 2xl:min-w-[240px]"
                  >
                    -1
                  </Button>
                  <span className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-mono">{reps}</span>
                  <Button 
                    variant="outline" 
                    onClick={() => handleChangeReps(1)}
                    className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl py-3 lg:py-4 xl:py-6 2xl:py-8 px-6 lg:px-8 xl:px-10 2xl:px-12 hover:scale-[1.02] hover:-translate-y-0.5 transition-all min-w-[120px] lg:min-w-[160px] xl:min-w-[200px] 2xl:min-w-[240px]"
                  >
                    +1
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-6 sm:py-8 lg:py-10 xl:py-12 border-t bg-cyan-50 gap-4 sm:gap-8">
          {isLast ? (
            <>
              {ex.type === "Статика" ? (
                <Button 
                  size="lg" 
                  onClick={handleStartStatic} 
                  className="font-bold min-w-[140px] sm:min-w-[180px] lg:min-w-[220px] xl:min-w-[260px] text-lg sm:text-xl lg:text-2xl xl:text-3xl py-3 sm:py-4 lg:py-5 xl:py-6 px-4 sm:px-6 lg:px-8 xl:px-10 hover:scale-[1.02] hover:-translate-y-0.5 transition-all" 
                  disabled={isStarted}
                >
                  Начать упражнение
                </Button>
              ) : <div />}
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleFinish} 
                className="text-red-500 border-red-300 min-w-[140px] sm:min-w-[200px] lg:min-w-[240px] xl:min-w-[280px] 2xl:min-w-[320px] text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl py-4 sm:py-5 lg:py-6 xl:py-8 2xl:py-10 px-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-14 hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
              >
                Закончить тренировку
              </Button>
            </>
          ) : (
            <>
              {ex.type === "Статика" ? (
                <Button 
                  size="lg" 
                  onClick={handleStartStatic} 
                  className="font-bold min-w-[140px] sm:min-w-[180px] lg:min-w-[220px] xl:min-w-[260px] text-lg sm:text-xl lg:text-2xl xl:text-3xl py-3 sm:py-4 lg:py-5 xl:py-6 px-4 sm:px-6 lg:px-8 xl:px-10 hover:scale-[1.02] hover:-translate-y-0.5 transition-all" 
                  disabled={isStarted}
                >
                  Начать упражнение
                </Button>
              ) : <div />}
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleNext} 
                className="min-w-[140px] sm:min-w-[180px] lg:min-w-[220px] xl:min-w-[260px] text-lg sm:text-xl lg:text-2xl xl:text-3xl py-3 sm:py-4 lg:py-5 xl:py-6 px-4 sm:px-6 lg:px-8 xl:px-10 hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
              >
                Следующее упражнение
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
} 