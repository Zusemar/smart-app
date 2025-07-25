"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

const BASE_EXERCISES: BaseExercise[] = [
  { id: 1, name: "Жим лёжа", type: "Динамика", description: "Жим лежа для груди" },
  { id: 2, name: "Планка", type: "Статика", description: "Планка на время" },
  { id: 3, name: "Приседания", type: "Динамика", description: "Базовое упражнение для ног" }
];

export default function EditWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id ? Number(params.id) : null;
  const isEdit = !!workoutId;
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

  useEffect(() => {
    if (isEdit && userId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${userId}/${workoutId}`)
        .then(res => res.json())
        .then(w => {
          setWorkoutName(w.name);
          setExercises(w.exercises);
        });
    }
  }, [workoutId, isEdit, userId]);

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
      id: workoutId ? workoutId : Date.now(),
      name: workoutName,
      exercises,
      user_id: userId
    };
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workouts${isEdit ? `/${userId}/${wrk.id}` : ""}`, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wrk)
    }).then(() => router.push("/workouts"));
  }
  
  function handleDeleteWorkout() {
    if (workoutId && userId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${userId}/${workoutId}`, { method: "DELETE" })
        .then(() => router.push("/workouts"));
    } else {
      router.push("/workouts");
    }
  }

  return (
    <div className="min-h-screen text-slate-900 flex flex-col items-center pt-24 pb-[80px]">
      <Card className="p-4 md:p-6 lg:p-8 w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl 2xl:max-w-5xl bg-white border-black shadow-lg rounded-xl">
        <BackButton className="w-fit mb-6 md:mb-8 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 transition font-semibold px-4 md:px-6 py-2 md:py-3 text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl h-8 md:h-10 lg:h-12" />
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-extrabold mb-6 md:mb-8 text-cyan-800 drop-shadow-md">Новая тренировка</h2>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 items-center mb-6 md:mb-8 w-full max-w-full md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto">
          <Input
            className="flex-[3] min-w-0 w-full bg-cyan-100 border-black text-cyan-900 font-bold text-lg md:text-xl lg:text-2xl !h-8 md:!h-10 lg:!h-12 px-2 md:px-4"
            placeholder="Название тренировки"
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
          />
          <Dialog open={chooseExerciseOpen} onOpenChange={setChooseExerciseOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="flex-[2] font-bold text-cyan-800 border-black hover:bg-cyan-100 rounded-lg text-lg md:text-xl lg:text-2xl !h-8 md:!h-10 lg:!h-12 px-2 md:px-4 whitespace-nowrap flex items-center justify-center">добавить упражнение</Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-black max-w-full md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-5xl w-full text-slate-900 p-2 md:p-4 lg:p-8 max-h-[95vh] overflow-y-auto pb-24 md:pb-32 lg:pb-36 xl:pb-40 2xl:pb-44 !mb-[100px]">
              <DialogHeader>
                <DialogTitle className="text-cyan-800 font-bold text-lg md:text-xl lg:text-2xl mb-4 md:mb-6">Добавить упражнение</DialogTitle>
              </DialogHeader>
              <div className="mb-4 md:mb-6 font-bold text-cyan-800 text-base md:text-lg lg:text-xl">База упражнений:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 max-h-[400px] md:max-h-[600px] overflow-y-auto mb-4 md:mb-6">
                {baseExercises.map((ex: BaseExercise) => (
                  <Card
                    key={ex.id}
                    className={`cursor-pointer border transition border-black hover:border-blue-500 bg-cyan-100 p-2 md:p-4 lg:p-6 ${selectedExercise?.id === ex.id ? "border-blue-500" : ""}`}
                    onClick={() => setSelectedExercise(ex)}
                  >
                    <div className="font-bold text-cyan-900 text-base md:text-lg lg:text-xl mb-1 md:mb-2">{ex.name}</div>
                    <div className="text-sm md:text-base lg:text-lg text-cyan-600">{ex.type}</div>
                    <div className="text-xs md:text-sm lg:text-base text-cyan-800 mt-1 md:mt-2">{ex.description}</div>
                  </Card>
                ))}
              </div>
              <Button onClick={() => setAddNewExerciseOpen(true)} variant="secondary" className="w-full bg-cyan-300 text-cyan-900 hover:bg-cyan-400 font-bold rounded-lg border-black text-base md:text-lg lg:text-xl h-8 md:h-10 lg:h-12">+ Новое упражнение</Button>
              {selectedExercise && (
                <div className="mt-4 md:mt-6 border-t border-black pt-4 md:pt-6 space-y-4 md:space-y-6">
                  <div className="font-bold text-cyan-800 mb-4 md:mb-6 text-base md:text-lg lg:text-xl">{selectedExercise.name}</div>
                  <div className="flex flex-row gap-2 md:gap-3 mb-2">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="w-24 md:w-28 bg-cyan-100 border-black text-cyan-900 font-bold text-sm md:text-base !h-8 px-2"
                      type="number"
                      min={1}
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-28 md:w-32 bg-cyan-100 border-black text-cyan-900 font-bold text-sm md:text-base !h-8 px-2"
                    />
                  </div>
                  <Button
                    onClick={() => handleAddExerciseToWorkout(selectedExercise)}
                    variant="default"
                    className="bg-gradient-to-r from-cyan-600 to-emerald-700 font-bold rounded-lg border-black text-base md:text-lg lg:text-xl !h-8 md:!h-10 lg:!h-12 w-full py-2 md:py-3 px-2 md:px-4 mt-2 md:mt-4 mb-[60px]"
                    disabled={!selectedExercise?.name.trim()}
                  >
                    Добавить в тренировку
                  </Button>
                </div>
              )}
              <Dialog open={addNewExerciseOpen} onOpenChange={setAddNewExerciseOpen}>
                <DialogContent className="bg-white border-black max-w-full md:max-w-xl lg:max-w-2xl 2xl:max-w-3xl w-full rounded-xl text-slate-900 p-2 md:p-4 lg:p-8 max-h-[98vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-cyan-800 text-base md:text-lg lg:text-xl mb-2 md:mb-4">Новое упражнение</DialogTitle>
                  </DialogHeader>
                  <Label className="mb-1 md:mb-2 text-cyan-800 text-sm md:text-base lg:text-lg">Название</Label>
                  <Input
                    value={newExercise.name}
                    onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="Название"
                    className="mb-2 md:mb-4 bg-cyan-100 border-black text-cyan-900 text-sm md:text-base lg:text-lg !h-8 md:!h-10 lg:!h-12 px-2 md:px-4"
                  />
                  <Label className="mb-1 md:mb-2 text-cyan-800 text-sm md:text-base lg:text-lg">Описание</Label>
                  <Textarea
                    value={newExercise.description}
                    onChange={e => setNewExercise({ ...newExercise, description: e.target.value })}
                    placeholder="Описание"
                    className="mb-2 md:mb-4 bg-cyan-100 border-black text-cyan-900 text-sm md:text-base lg:text-lg min-h-[40px] md:min-h-[80px] py-2 md:py-4 px-2 md:px-4"
                  />
                  <Label className="mb-1 md:mb-2 text-cyan-800 text-sm md:text-base lg:text-lg">Тип</Label>
                  <select
                    className="rounded px-2 md:px-4 py-2 md:py-3 mb-2 md:mb-4 bg-cyan-100 border border-black text-cyan-900 text-sm md:text-base lg:text-lg !h-8 md:!h-10 lg:!h-12 w-full"
                    value={newExercise.type}
                    onChange={e => setNewExercise({ ...newExercise, type: e.target.value })}
                  >
                    <option value="Динамика">Динамика</option>
                    <option value="Статика">Статика</option>
                  </select>
                  <div className="flex flex-row gap-2 md:gap-3 mb-2">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="w-24 md:w-28 bg-cyan-100 border-black text-cyan-900 font-bold text-xs md:text-sm !h-8 px-2"
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-28 md:w-32 bg-cyan-100 border-black text-cyan-900 font-bold text-xs md:text-sm !h-8 px-2"
                    />
                  </div>
                  <Button
                    onClick={handleAddNewExerciseToWorkoutAndBase}
                    variant="default"
                    className="bg-gradient-to-r from-cyan-600 to-emerald-700 font-bold rounded-lg text-white text-sm md:text-base lg:text-lg h-8 md:h-10 lg:h-12 w-full"
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
          {isEdit && (
            <Button variant="outline" className="text-red-500 border-red-400 hover:bg-red-400/10 rounded-lg font-bold text-base md:text-lg lg:text-xl !h-12 md:!h-14 lg:!h-16 w-full md:w-64 lg:w-80 px-2 md:px-4" onClick={handleDeleteWorkout}>
              Удалить тренировку
            </Button>
          )}
          <Button variant="default" className="bg-gradient-to-r from-cyan-500 to-emerald-600 font-bold rounded-lg shadow text-base md:text-lg lg:text-xl !h-12 md:!h-14 lg:!h-16 w-full md:w-64 lg:w-80 px-2 md:px-4" onClick={handleSave} disabled={!workoutName.trim()}>
            Сохранить тренировку
          </Button>
        </div>
      </Card>
    </div>
  );
}