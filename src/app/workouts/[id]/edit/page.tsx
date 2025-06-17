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
    <div className="min-h-screen bg-gray-100 text-slate-900 flex flex-col items-center pt-16 pb-[80px]">
      <Card className="p-8 w-full max-w-2xl bg-white border-black shadow-lg rounded-xl">
        <BackButton className="w-fit mb-6 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 transition font-semibold px-8 py-3 text-3xl h-16" />
        <h2 className="text-6xl font-extrabold mb-8 text-cyan-800 drop-shadow-md">Новая тренировка</h2>
        <div className="flex gap-4 items-center mb-8">
          <Input
            className="flex-1 bg-cyan-100 border-black text-cyan-900 !text-4xl !h-20 !px-6"
            placeholder="Название тренировки"
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
          />
          <Dialog open={chooseExerciseOpen} onOpenChange={setChooseExerciseOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="font-bold text-cyan-800 border-black hover:bg-cyan-100 rounded-lg !text-xl px-6 h-20 whitespace-nowrap">добавить упражнение</Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-black max-w-2xl w-full text-slate-900 p-8 pb-[72px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-cyan-800 font-bold !text-3xl mb-4">Добавить упражнение</DialogTitle>
              </DialogHeader>
              <div className="mb-4 font-bold text-cyan-800 !text-2xl">База упражнений:</div>
              <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto mb-6">
                {baseExercises.map((ex: BaseExercise) => (
                  <Card
                    key={ex.id}
                    className={`cursor-pointer border transition border-black hover:border-blue-500 bg-cyan-100 p-4 ${selectedExercise?.id === ex.id ? "border-blue-500" : ""}`}
                    onClick={() => setSelectedExercise(ex)}
                  >
                    <div className="font-bold text-cyan-900 !text-2xl mb-2">{ex.name}</div>
                    <div className="!text-xl text-cyan-600">{ex.type}</div>
                    <div className="!text-lg text-cyan-800 mt-2">{ex.description}</div>
                  </Card>
                ))}
              </div>
              <Button onClick={() => setAddNewExerciseOpen(true)} variant="secondary" className="mb-6 w-full bg-cyan-300 text-cyan-900 hover:bg-cyan-400 font-bold rounded-lg border-black !text-2xl !h-16">+ Новое упражнение</Button>
              {selectedExercise && (
                <div className="mt-4 border-t border-black pt-4 space-y-4">
                  <div className="font-bold text-cyan-800 mb-4 !text-2xl">{selectedExercise.name}</div>
                  <div className="flex gap-4 mb-4">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="!w-40 bg-cyan-100 border-black text-cyan-900 !text-2xl !h-16"
                      type="number"
                      min={1}
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="!w-48 bg-cyan-100 border-black text-cyan-900 !text-2xl !h-16"
                    />
                  </div>
                  <Button
                    onClick={() => handleAddExerciseToWorkout(selectedExercise)}
                    variant="default"
                    className="bg-gradient-to-r from-cyan-600 to-emerald-700 font-bold rounded-lg border-black !text-2xl !h-16 w-full"
                  >
                    Добавить в тренировку
                  </Button>
                </div>
              )}
              {/* Вложенный диалог для нового упражнения */}
              <Dialog open={addNewExerciseOpen} onOpenChange={setAddNewExerciseOpen}>
                <DialogContent className="bg-white border-black !max-w-2xl w-full rounded-xl text-slate-900 p-8 pb-[72px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-cyan-800 !text-3xl mb-4">Новое упражнение</DialogTitle>
                  </DialogHeader>
                  <Label className="mb-2 text-cyan-800 !text-xl">Название</Label>
                  <Input
                    value={newExercise.name}
                    onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="Название"
                    className="mb-4 bg-cyan-100 border-black text-cyan-900 !text-2xl !h-16"
                  />
                  <Label className="mb-2 text-cyan-800 !text-xl">Описание</Label>
                  <Textarea
                    value={newExercise.description}
                    onChange={e => setNewExercise({ ...newExercise, description: e.target.value })}
                    placeholder="Описание"
                    className="mb-4 bg-cyan-100 border-black text-cyan-900 !text-xl !min-h-[80px] py-3"
                  />
                  <Label className="mb-2 text-cyan-800 !text-xl">Тип</Label>
                  <select
                    className="rounded px-4 py-2 mb-4 bg-cyan-100 border border-black text-cyan-900 !text-2xl !h-16 w-full"
                    value={newExercise.type}
                    onChange={e => setNewExercise({ ...newExercise, type: e.target.value })}
                  >
                    <option value="Динамика">Динамика</option>
                    <option value="Статика">Статика</option>
                  </select>
                  <div className="flex gap-4 mb-[72px]">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="!w-40 bg-cyan-100 border-black text-cyan-900 !text-2xl !h-16"
                      type="number"
                      min={1}
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="!w-48 bg-cyan-100 border-black text-cyan-900 !text-2xl !h-16"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleAddNewExerciseToWorkoutAndBase}
                      variant="default"
                      className="bg-gradient-to-r from-cyan-600 to-emerald-700 font-bold rounded-lg text-white !text-2xl !h-16 w-full"
                    >
                      Добавить в тренировку и базу
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </DialogContent>
          </Dialog>
        </div>
        {/* Список упражнений */}
        <div className="space-y-4 mb-8">
          {exercises.map((ex, idx) => (
            <div key={idx} className="flex items-center gap-4 border-b border-cyan-100 pb-4">
              <Input value={ex.name} readOnly className="w-64 bg-white border-cyan-200 text-cyan-900 text-3xl h-20" placeholder="Название" />
              <Input value={ex.sets} readOnly className="w-28 bg-white border-cyan-200 text-cyan-900 text-3xl h-20" placeholder="Подходы" />
              <Input value={ex.target} readOnly className="w-44 bg-white border-cyan-200 text-cyan-900 text-3xl h-20" placeholder="Целевое" />
              <div className="text-2xl ml-2 text-cyan-500 px-3 font-semibold">{ex.type}</div>
              <Button variant="destructive" onClick={() => handleRemoveExercise(idx)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 rounded-lg text-2xl h-20">Удалить</Button>
            </div>
          ))}
        </div>
        {/* Кнопки управления */}
        <div className="flex justify-between mt-12">
          {isEdit && (
            <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-400/10 rounded-lg !text-xl h-20 px-8" onClick={handleDeleteWorkout}>
              Удалить тренировку
            </Button>
          )}
          <div />
          <Button variant="default" className="bg-gradient-to-r from-cyan-500 to-emerald-600 font-bold rounded-lg shadow !text-xl h-20 px-8" onClick={handleSave}>
            Сохранить тренировку
          </Button>
        </div>
      </Card>
    </div>
  );
}