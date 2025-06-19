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
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">Тренировка не найдена</span>
      </div>
    );
  }
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 md:gap-8 lg:gap-10 px-2 md:px-4">
        <Card className="p-4 md:p-8 lg:p-12 xl:p-20 2xl:p-24 text-center max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-3xl 2xl:max-w-5xl mx-auto border-black">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-bold mb-4 md:mb-6 lg:mb-8 text-emerald-700 break-words">Тренировка завершена!</h2>
          <p className="mb-4 md:mb-6 lg:mb-8 text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl break-words">Отличная работа! Так держать 💪</p>
          <p className="mb-4 md:mb-6 lg:mb-8 text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-700 break-words">Скажи "вернуться" чтобы вернуться на главный экран</p>
          <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 md:py-4 lg:py-6 px-4 md:px-6 lg:px-8 rounded-lg shadow-lg hover:scale-105 transition border-black text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto 2xl:h-20">На главный экран</Button>
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
    <div className="flex items-center justify-center min-h-screen pb-[72px] mt-0 pt-0">
      <Card className="w-full max-w-[120rem] min-h-[600px] min-w-[320px] flex flex-col justify-between p-0 overflow-hidden mt-0">
        {/* Top Section */}
        <div className="flex items-center justify-between px-4 py-4 lg:py-6 xl:py-8 border-b bg-cyan-50">
          <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold text-cyan-700">{ex.name}</div>
          {ex.type === "Статика" && isStarted && (
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-mono">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,"0")}</span>
            </div>
          )}
        </div>
        {/* Assistant message */}
        {assistantMessage && (
          <div className="mx-4 my-2 p-3 lg:p-4 xl:p-5 bg-white bg-opacity-80 rounded shadow text-slate-900 text-center text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
            {assistantMessage}
          </div>
        )}

        {/* Center Section */}
        <div className="flex-1 flex flex-col md:flex-col xl:flex-row items-center justify-between px-2 py-2 md:py-2 lg:py-3 xl:py-4 gap-2 md:gap-4 lg:gap-6 xl:gap-8">
          {/* Video */}
          <div className="flex-1 flex items-center justify-center w-full xl:w-auto mb-4 md:mb-6 xl:mb-0">
            <div className="aspect-square w-32 h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 xl:w-[20rem] xl:h-[20rem] 2xl:w-[24rem] 2xl:h-[24rem] bg-slate-200 rounded-2xl overflow-hidden flex items-center justify-center">
              <img src={getVideoUrl(ex)} alt="DomFit Icon" className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Results */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-8 w-full">
            {ex.type === "Статика" ? (
              <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-6 w-full">
                <div className="font-bold text-cyan-700 text-center w-full text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">Итоговое время</div>
                <div className="flex items-center gap-2 md:gap-4 lg:gap-6 justify-center w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => handleChangeTime(-10)} 
                    disabled={isStarted}
                    className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 !h-8 md:!h-10 lg:!h-12 xl:!h-14 2xl:!h-16 min-w-[60px] md:min-w-[80px] lg:min-w-[120px] xl:min-w-[180px] 2xl:min-w-[220px] hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
                  >
                    -10 сек
                  </Button>
                  <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-mono">{Math.floor(selectedTime/60)}:{(selectedTime%60).toString().padStart(2,"0")}</span>
                  <Button 
                    variant="outline" 
                    onClick={() => handleChangeTime(10)} 
                    disabled={isStarted}
                    className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 !h-8 md:!h-10 lg:!h-12 xl:!h-14 2xl:!h-16 min-w-[60px] md:min-w-[80px] lg:min-w-[120px] xl:min-w-[180px] 2xl:min-w-[220px] hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
                  >
                    +10 сек
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-6">
                <div className="font-bold text-cyan-700 text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">Повторения</div>
                <div className="flex items-center justify-center gap-2 md:gap-4 lg:gap-6 w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => handleChangeReps(-1)}
                    className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 !h-8 md:!h-10 lg:!h-12 xl:!h-14 2xl:!h-16 min-w-[60px] md:min-w-[80px] lg:min-w-[120px] xl:min-w-[180px] 2xl:min-w-[220px] hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
                  >
                    -1
                  </Button>
                  <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-mono min-w-[40px] md:min-w-[60px] lg:min-w-[80px] xl:min-w-[120px] text-center">{reps}</span>
                  <Button 
                    variant="outline" 
                    onClick={() => handleChangeReps(1)}
                    className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 !h-8 md:!h-10 lg:!h-12 xl:!h-14 2xl:!h-16 min-w-[60px] md:min-w-[80px] lg:min-w-[120px] xl:min-w-[180px] 2xl:min-w-[220px] hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
                  >
                    +1
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col xl:flex-row items-center justify-between px-4 xl:px-10 py-6 xl:py-10 border-t bg-cyan-50 gap-4 xl:gap-8">
          {isLast ? (
            <>
              {ex.type === "Статика" ? (
                <Button 
                  size="lg" 
                  onClick={handleStartStatic} 
                  className="font-bold min-w-[180px] xl:min-w-[220px] text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl px-6 py-4 !h-14 md:!h-16 lg:!h-20 xl:!h-24 2xl:!h-20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all mb-4 xl:mb-0" 
                  disabled={isStarted}
                >
                  Начать упражнение
                </Button>
              ) : <div />}
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleFinish} 
                className="text-red-500 border-red-300 min-w-[220px] xl:min-w-[280px] text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl px-6 py-4 !h-14 md:!h-16 lg:!h-20 xl:!h-24 2xl:!h-20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
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
                  className="font-bold min-w-[180px] xl:min-w-[220px] text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl px-6 py-4 !h-14 md:!h-16 lg:!h-20 xl:!h-24 2xl:!h-20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all mb-4 xl:mb-0" 
                  disabled={isStarted}
                >
                  Начать упражнение
                </Button>
              ) : <div />}
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleNext} 
                className="min-w-[180px] xl:min-w-[220px] text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl px-6 py-4 !h-14 md:!h-16 lg:!h-20 xl:!h-24 2xl:!h-20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
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