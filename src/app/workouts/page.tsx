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
    <div className="min-h-screen text-slate-900 flex flex-col items-center pt-24 pb-[80px]">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl 2xl:max-w-5xl px-2">
        <BackButton className="w-fit mb-8 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 hover:scale-[1.02] hover:-translate-y-0.5 transition-all font-semibold px-6 py-3 text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl" />
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl 2xl:text-9xl font-extrabold mb-8 text-cyan-800 drop-shadow-md">Мои тренировки</h1>
        {assistantMessage && (
          <Card className="mb-6 p-4 bg-cyan-100 border-black text-cyan-800 text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
            {assistantMessage}
          </Card>
        )}
        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full max-h-[28rem] overflow-y-auto">
          {workouts.length === 0 && (
            <Card className="p-4 bg-white border-black text-cyan-800 text-center text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl shadow-lg">
              Пока не создано ни одной тренировки
            </Card>
          )}
          {workouts.map(w =>
            <Card key={w.id} className="bg-white border-black shadow-lg rounded-xl px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold text-cyan-900">{w.name}</span>
              <div className="flex gap-3 md:gap-4 justify-end">
                <Button
                  className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-emerald-500 shadow font-bold text-white hover:scale-[1.02] hover:-translate-y-0.5 transition-all border-black text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl px-4 md:px-6 py-2 md:py-3 !h-8 md:!h-10 lg:!h-12 xl:!h-16 2xl:!h-20"
                  onClick={() => router.push(`/workouts/${w.id}/session`)}
                >
                  Начать
                </Button>
                <Button 
                  variant="outline" 
                  className="border-black text-cyan-800 hover:bg-cyan-100 hover:scale-[1.02] hover:-translate-y-0.5 transition-all text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl px-4 md:px-6 py-2 md:py-3 !h-8 md:!h-10 lg:!h-12 xl:!h-16 2xl:!h-20" 
                  onClick={() => router.push(`/workouts/${w.id}/edit`)}
                >
                  Редактировать
                </Button>
              </div>
            </Card>
          )}
        </div>
        <Button 
          className="mt-10 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 font-bold shadow-xl rounded-lg w-full text-white border-black text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl !h-8 md:!h-10 lg:!h-12 xl:!h-16 2xl:!h-20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all" 
          onClick={() => router.push("/workouts/new/edit")}
        >
          Добавить тренировку
        </Button>
      </div>
    </div>
  );
}