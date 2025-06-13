"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { getAssistant } from "@/lib/assistant";

type Workout = {
  id: number;
  name: string;
  exercises: any[];
};

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [assistantMessage, setAssistantMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const initializeAssistant = async () => {
      try {
        // Fetch workouts
        const response = await fetch("http://localhost:8000/api/workouts");
        const workoutsData = await response.json();
        
        if (!isMounted) return;
        
        setWorkouts(workoutsData);

        // Set up the assistant
        const assistant = getAssistant();
        assistant.setRouter(router);

        // Send workouts data to the voice assistant
        try {
          assistant.sendData({
            action: {
              action_id: "update_workouts",
              parameters: { workouts: workoutsData }
            }
          });
        } catch (error) {
          console.error('Error sending data to assistant:', error);
        }

        // Handle voice commands
        const removeHandler = assistant.addCommandHandler((command) => {
          try {
            if (!command?.action?.type) return;
            
            switch (command.action.type) {
              case "select_workout":
                const workoutName = command.action.parameters?.name?.toLowerCase();
                if (workoutName) {
                  const workout = workoutsData.find((w: Workout) => 
                    w.name.toLowerCase().includes(workoutName)
                  );
                  if (workout) {
                    router.push(`/workouts/${workout.id}/session`);
                    setAssistantMessage(`Начинаем тренировку "${workout.name}"`);
                  } else {
                    setAssistantMessage(`Тренировка "${workoutName}" не найдена`);
                  }
                }
                break;
              case "start_workout":
                if (workoutsData.length > 0) {
                  router.push(`/workouts/${workoutsData[0].id}/session`);
                  setAssistantMessage(`Начинаем тренировку "${workoutsData[0].name}"`);
                } else {
                  setAssistantMessage("Нет доступных тренировок");
                }
                break;
              default:
                console.log('Неизвестная команда:', command.action.type);
            }
          } catch (error) {
            console.error('Error handling assistant command:', error);
            setAssistantMessage("Произошла ошибка при обработке голосовой команды");
          }
        });

        // Handle assistant messages
        const removeMsg = assistant.addMessageCallback((msg) => {
          try {
            if (isMounted) {
              setAssistantMessage(msg);
            }
          } catch (error) {
            console.error('Error handling assistant message:', error);
          }
        });

        return () => {
          isMounted = false;
          try {
            removeHandler();
            removeMsg();
          } catch (error) {
            console.error('Error cleaning up assistant:', error);
          }
        };
      } catch (error) {
        console.error('Error initializing workouts page:', error);
        if (isMounted) {
          setAssistantMessage("Произошла ошибка при загрузке тренировок");
        }
      }
    };

    initializeAssistant();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-cyan-50 text-slate-900 flex flex-col items-center pt-12 pb-[72px]">
      <div className="w-full max-w-xl">
        <BackButton className="w-fit mb-6 bg-white border-cyan-300 text-cyan-700 shadow hover:bg-cyan-50 transition font-semibold px-6 py-2" />

        <h1 className="text-3xl font-extrabold mb-10 text-cyan-700 drop-shadow-md">Мои тренировки</h1>
        
        {assistantMessage && (
          <Card className="mb-6 p-4 bg-cyan-50 border-cyan-200 text-cyan-700">
            {assistantMessage}
          </Card>
        )}

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