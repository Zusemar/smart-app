"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/BackButton";
import { getAssistant, getApiUrl } from "@/lib/assistant";

type BaseExercise = {
  id: number;
  name: string;
  type: string;
  description: string;
};

type WorkoutExercise = {
  id: number;
  name: string;
  type: string;
  description: string;
  sets: string;
  target: string;
};

export default function NewWorkoutPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");

  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [baseExercises, setBaseExercises] = useState<BaseExercise[]>([]);
  const [chooseExerciseOpen, setChooseExerciseOpen] = useState(false);
  const [addNewExerciseOpen, setAddNewExerciseOpen] = useState(false);
  const [newExercise, setNewExercise] = useState<BaseExercise>({
    id: -1,
    name: "",
    description: "",
    type: "Динамика"
  });
  const [selectedExercise, setSelectedExercise] = useState<BaseExercise | null>(null);
  const [sets, setSets] = useState("");
  const [target, setTarget] = useState("");

  useEffect(() => {
    const assistant = getAssistant();
    setUserId(assistant.getUserId());
  }, []);

  useEffect(() => {
    if (!userId) return;
    // Получаем базу упражнений с сервера
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises/${userId}`)
      .then(res => res.json())
      .then(setBaseExercises);
  }, [userId]);

  function handleAddExerciseToWorkout(ex: BaseExercise) {
    setExercises([...exercises, { ...ex, sets, target }]);
    setChooseExerciseOpen(false); setSelectedExercise(null); setSets(""); setTarget("");
  }

  function handleAddNewExerciseToWorkoutAndBase() {
    if (!userId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newExercise, user_id: userId })
    })
      .then(res => res.json())
      .then(toAdd => {
        setExercises([...exercises, { ...toAdd, sets, target }]);
        setBaseExercises([...baseExercises, toAdd]);
        setAddNewExerciseOpen(false); setChooseExerciseOpen(false); setNewExercise({ id: -1, name: "", description: "", type: "Динамика" }); setSets(""); setTarget("");
      });
  }

  function handleRemoveExercise(idx: number) {
    const updatedExercises = exercises.filter((_, i) => i !== idx);
    setExercises(updatedExercises);
  }
  
  function handleSave() {
    if (!userId) return;

    const wrk = {
      id: Date.now(),
      name: workoutName,
      exercises,
      user_id: userId
    };
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wrk)
    }).then(() => router.push("/workouts"));
  }

  return (
    <div className="min-h-screen text-slate-900 flex flex-col items-center pt-24 pb-[80px]">
      <Card className="p-4 md:p-6 lg:p-8 w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl 2xl:max-w-5xl bg-white border-black shadow-lg rounded-xl">
        <BackButton className="w-fit mb-6 md:mb-8 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 transition font-semibold px-4 md:px-6 py-2 md:py-3 text-xl md:text-2xl lg:text-3xl h-8 md:h-10 lg:h-12" />
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-extrabold mb-6 md:mb-8 text-cyan-800 drop-shadow-md">Новая тренировка</h2>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center mb-6 md:mb-8 w-full max-w-full md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto">
          <Input
            className="flex-[3] min-w-0 w-full bg-cyan-100 border-black text-cyan-900 font-bold text-lg md:text-xl !h-8 md:!h-10 px-2 md:px-4"
            placeholder="Название тренировки"
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
          />
          <Dialog open={chooseExerciseOpen} onOpenChange={setChooseExerciseOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="flex-[2] font-bold text-cyan-800 border-black hover:bg-cyan-100 rounded-lg text-lg md:text-xl !h-8 md:!h-10 px-2 md:px-4 whitespace-nowrap flex items-center justify-center">добавить упражнение</Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-black max-w-md md:max-w-lg lg:max-w-xl w-full text-slate-900 p-2 md:p-4 max-h-[95vh] overflow-y-auto pb-24 md:pb-32 lg:pb-36 xl:pb-40 2xl:pb-44">
              <DialogHeader>
                <DialogTitle className="text-cyan-800 font-bold text-base md:text-lg mb-2 md:mb-4">Добавить упражнение</DialogTitle>
              </DialogHeader>
              <div className="mb-2 md:mb-4 font-bold text-cyan-800 text-sm md:text-base">База упражнений:</div>
              <div className="grid grid-cols-1 gap-2 md:gap-4 max-h-[400px] md:max-h-[600px] overflow-y-auto mb-2 md:mb-4">
                {baseExercises.map((ex: BaseExercise) => (
                  <Card
                    key={ex.id}
                    className={`cursor-pointer border transition border-black hover:border-blue-500 bg-cyan-100 p-2 md:p-4 ${selectedExercise?.id === ex.id ? "border-blue-500" : ""}`}
                    onClick={() => setSelectedExercise(ex)}
                  >
                    <div className="font-bold text-cyan-900 text-sm md:text-base mb-1 md:mb-2">{ex.name}</div>
                    <div className="text-xs md:text-sm text-cyan-600">{ex.type}</div>
                    <div className="text-xs md:text-sm text-cyan-800 mt-1 md:mt-2">{ex.description}</div>
                  </Card>
                ))}
              </div>
              <Button onClick={() => setAddNewExerciseOpen(true)} variant="secondary" className="mb-2 md:mb-4 w-full bg-cyan-300 text-cyan-900 hover:bg-cyan-400 font-bold rounded-lg border-black text-sm md:text-base h-8 md:h-10">+ Новое упражнение</Button>
              {selectedExercise && (
                <div className="mt-2 md:mt-4 border-t border-black pt-2 md:pt-4 space-y-2 md:space-y-4">
                  <div className="font-bold text-cyan-800 mb-2 md:mb-4 text-sm md:text-base">{selectedExercise.name}</div>
                  <div className="flex flex-col gap-2 md:gap-4 mb-2 md:mb-4">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="w-20 md:w-24 bg-cyan-100 border-black text-cyan-900 font-bold text-xs md:text-sm !h-8 md:!h-10 px-2 md:px-4"
                      type="number"
                      min={1}
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-24 md:w-28 bg-cyan-100 border-black text-cyan-900 font-bold text-xs md:text-sm !h-8 md:!h-10 px-2 md:px-4"
                    />
                  </div>
                  <Button
                    onClick={() => handleAddExerciseToWorkout(selectedExercise)}
                    variant="default"
                    className="bg-gradient-to-r from-cyan-600 to-emerald-700 font-bold rounded-lg border-black text-xs md:text-sm !h-8 md:!h-10 w-full py-2 md:py-3 px-2 md:px-4 mt-2 md:mt-4"
                    disabled={!selectedExercise?.name.trim()}
                  >
                    Добавить в тренировку
                  </Button>
                </div>
              )}
              <Dialog open={addNewExerciseOpen} onOpenChange={setAddNewExerciseOpen}>
                <DialogContent className="bg-white border-black max-w-md md:max-w-lg lg:max-w-xl w-full rounded-xl text-slate-900 p-2 md:p-4 max-h-[98vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-cyan-800 text-sm md:text-base mb-2 md:mb-4">Новое упражнение</DialogTitle>
                  </DialogHeader>
                  <Label className="mb-1 md:mb-2 text-cyan-800 text-xs md:text-sm">Название</Label>
                  <Input
                    value={newExercise.name}
                    onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="Название"
                    className="mb-2 md:mb-4 bg-cyan-100 border-black text-cyan-900 text-xs md:text-sm !h-8 md:!h-10 px-2 md:px-4"
                  />
                  <Label className="mb-1 md:mb-2 text-cyan-800 text-xs md:text-sm">Описание</Label>
                  <Textarea
                    value={newExercise.description}
                    onChange={e => setNewExercise({ ...newExercise, description: e.target.value })}
                    placeholder="Описание"
                    className="mb-2 md:mb-4 bg-cyan-100 border-black text-cyan-900 text-xs md:text-sm min-h-[40px] md:min-h-[80px] py-2 md:py-4 px-2 md:px-4"
                  />
                  <Label className="mb-1 md:mb-2 text-cyan-800 text-xs md:text-sm">Тип</Label>
                  <select
                    className="rounded px-2 md:px-4 py-2 md:py-3 mb-2 md:mb-4 bg-cyan-100 border border-black text-cyan-900 text-xs md:text-sm !h-8 md:!h-10 w-full"
                    value={newExercise.type}
                    onChange={e => setNewExercise({ ...newExercise, type: e.target.value })}
                  >
                    <option value="Динамика">Динамика</option>
                    <option value="Статика">Статика</option>
                  </select>
                  <div className="flex flex-col gap-2 md:gap-4 mb-2 md:mb-4">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="w-20 md:w-24 bg-cyan-100 border-black text-cyan-900 font-bold text-xs md:text-sm !h-8 md:!h-10 px-2 md:px-4"
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-24 md:w-28 bg-cyan-100 border-black text-cyan-900 font-bold text-xs md:text-sm !h-8 md:!h-10 px-2 md:px-4"
                    />
                  </div>
                  <Button
                    onClick={handleAddNewExerciseToWorkoutAndBase}
                    variant="default"
                    className="bg-gradient-to-r from-cyan-600 to-emerald-700 font-bold rounded-lg text-white text-xs md:text-sm h-8 md:h-10 w-full"
                    disabled={!newExercise.name.trim()}
                  >
                    Добавить в тренировку и базу
                  </Button>
                </DialogContent>
              </Dialog>
            </DialogContent>
          </Dialog>
        </div>
        {/* Список упражнений */}
        <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 w-full max-w-full md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto">
          {exercises.map((ex, idx) => (
            <div key={idx} className="flex flex-row gap-2 md:gap-3 items-center border-b border-cyan-100 pb-2 md:pb-3 w-full">
              <Input value={ex.name} readOnly className="w-32 md:w-40 lg:w-56 bg-white border-cyan-200 text-cyan-900 font-bold text-sm md:text-base lg:text-lg !h-8 md:!h-10 lg:!h-12 px-2 md:px-3" placeholder="Название" />
              <Input value={ex.sets} readOnly className="w-16 md:w-20 lg:w-24 bg-white border-cyan-200 text-cyan-900 font-bold text-sm md:text-base lg:text-lg !h-8 md:!h-10 lg:!h-12 px-2 md:px-3" placeholder="Подходы" />
              <Input value={ex.target} readOnly className="w-16 md:w-20 lg:w-24 bg-white border-cyan-200 text-cyan-900 font-bold text-sm md:text-base lg:text-lg !h-8 md:!h-10 lg:!h-12 px-2 md:px-3" placeholder="Целевое" />
              <div className="w-20 md:w-24 lg:w-28 text-sm md:text-base lg:text-lg text-cyan-500 font-semibold flex items-center justify-center">{ex.type}</div>
              <Button variant="destructive" onClick={() => handleRemoveExercise(idx)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-2 md:px-3 rounded-lg text-sm md:text-base lg:text-lg !h-8 md:!h-10 lg:!h-12 flex items-center justify-center">Удалить</Button>
            </div>
          ))}
        </div>
        {/* Кнопки управления */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-end mt-6 md:mt-8">
          <Button variant="default" className="bg-gradient-to-r from-cyan-500 to-emerald-600 font-bold rounded-lg shadow text-base md:text-lg lg:text-xl !h-12 md:!h-14 lg:!h-16 w-full md:w-64 lg:w-80 px-2 md:px-4" onClick={handleSave} disabled={!workoutName.trim()}>
            Сохранить тренировку
          </Button>
        </div>
      </Card>
    </div>
  );
}