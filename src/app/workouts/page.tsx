"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { getAssistant, getApiUrl } from "@/lib/assistant";

type Workout = {
  id: number;
  name: string;
  exercises: any[];
};

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [assistantMessage, setAssistantMessage] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const assistant = getAssistant();
    setUserId(assistant.getUserId());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAssistant = async () => {
      if (!userId) return;

      try {
        // Fetch workouts
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${userId}`);
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
  }, [router, userId]);

  return (
    <div className="min-h-screen bg-gray-100 text-slate-900 flex flex-col items-center pt-16 pb-[80px]">
      <div className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl px-4">
        <BackButton className="w-fit mb-8 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 hover:scale-[1.02] hover:-translate-y-0.5 transition-all font-semibold px-8 py-3 text-xl sm:text-2xl lg:text-3xl" />

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold mb-12 text-cyan-800 drop-shadow-md">Мои тренировки</h1>
        
        {assistantMessage && (
          <Card className="mb-8 p-5 bg-cyan-100 border-black text-cyan-800 text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
            {assistantMessage}
          </Card>
        )}

        <div className="flex flex-col gap-6 w-full">
          {workouts.length === 0 && (
            <Card className="p-6 bg-white border-black text-cyan-800 text-center text-xl sm:text-2xl lg:text-3xl xl:text-4xl shadow-lg">
              Пока не создано ни одной тренировки
            </Card>
          )}
          {workouts.map(w =>
            <Card key={w.id} className="bg-white border-black shadow-lg rounded-xl px-6 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-cyan-900">{w.name}</span>
              <div className="flex gap-3 justify-end">
                <Button
                  className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-emerald-500 shadow font-bold text-white hover:scale-[1.02] hover:-translate-y-0.5 transition-all border-black text-lg sm:text-xl lg:text-2xl xl:text-3xl px-4 sm:px-6 py-2 sm:py-3"
                  onClick={() => router.push(`/workouts/${w.id}/session`)}
                >
                  Начать
                </Button>
                <Button 
                  variant="outline" 
                  className="border-black text-cyan-800 hover:bg-cyan-100 hover:scale-[1.02] hover:-translate-y-0.5 transition-all text-lg sm:text-xl lg:text-2xl xl:text-3xl px-4 sm:px-6 py-2 sm:py-3" 
                  onClick={() => router.push(`/workouts/${w.id}/edit`)}
                >
                  Редактировать
                </Button>
              </div>
            </Card>
          )}
        </div>
        <Button 
          className="mt-12 px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 font-bold shadow-xl rounded-lg w-full text-white border-black text-xl sm:text-2xl lg:text-3xl xl:text-4xl h-16 sm:h-20 lg:h-24 hover:scale-[1.02] hover:-translate-y-0.5 transition-all" 
          onClick={() => router.push("/workouts/new/edit")}
        >
          Добавить тренировку
        </Button>
      </div>
    </div>
  );
}