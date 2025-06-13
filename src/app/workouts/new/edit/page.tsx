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
import { getAssistant } from "@/lib/assistant";

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
    fetch(`http://localhost:8000/api/exercises/${userId}`)
      .then(res => res.json())
      .then(setBaseExercises);
  }, [userId]);

  function handleAddExerciseToWorkout(ex: BaseExercise) {
    setExercises([...exercises, { ...ex, sets, target }]);
    setChooseExerciseOpen(false); setSelectedExercise(null); setSets(""); setTarget("");
  }

  function handleAddNewExerciseToWorkoutAndBase() {
    if (!userId) return;

    fetch("http://localhost:8000/api/exercises", {
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
    fetch("http://localhost:8000/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wrk)
    }).then(() => router.push("/workouts"));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-cyan-50 text-slate-900 flex flex-col items-center pt-20 pb-[72px]">
      <Card className="p-8 w-full max-w-2xl bg-white border-cyan-200 shadow-md rounded-xl">
        <BackButton className="w-fit mb-6 bg-white border-cyan-300 text-cyan-700 shadow hover:bg-cyan-50 transition font-semibold px-6 py-2" />
        <h2 className="text-2xl font-extrabold mb-8 text-cyan-700 drop-shadow-md">Новая тренировка</h2>
        <div className="flex gap-4 items-center mb-8">
          <Input
            className="flex-1 bg-cyan-50 border-cyan-200 text-cyan-900"
            placeholder="Название тренировки"
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
          />
          <Dialog open={chooseExerciseOpen} onOpenChange={setChooseExerciseOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="font-bold text-cyan-700 border-cyan-400 hover:bg-cyan-100 rounded-lg">добавить упражнение</Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-cyan-200 max-w-lg w-full text-slate-900">
              <DialogHeader>
                <DialogTitle className="text-cyan-700 font-bold">Добавить упражнение</DialogTitle>
              </DialogHeader>
              <div className="mb-2 font-bold text-cyan-700">База упражнений:</div>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto mb-4">
                {baseExercises.map((ex: BaseExercise) => (
                  <Card
                    key={ex.id}
                    className={`cursor-pointer border transition border-cyan-200 hover:border-blue-400 bg-cyan-50 p-3 ${selectedExercise?.id === ex.id ? "border-blue-400" : ""}`}
                    onClick={() => setSelectedExercise(ex)}
                  >
                    <div className="font-bold text-cyan-900">{ex.name}</div>
                    <div className="text-xs text-cyan-500">{ex.type}</div>
                    <div className="text-xs text-cyan-700 mt-1">{ex.description}</div>
                  </Card>
                ))}
              </div>
              <Button onClick={() => setAddNewExerciseOpen(true)} variant="secondary" className="mb-4 w-full bg-cyan-200 text-cyan-900 hover:bg-cyan-300 font-bold rounded-lg">+ Новое упражнение</Button>
              {selectedExercise && (
                <div className="mt-2 border-t border-cyan-200 pt-2 space-y-1">
                  <div className="font-bold text-cyan-700 mb-2">{selectedExercise.name}</div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="w-32 bg-cyan-50 border-cyan-200 text-cyan-900"
                      type="number"
                      min={1}
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-40 bg-cyan-50 border-cyan-200 text-cyan-900"
                    />
                  </div>
                  <Button
                    onClick={() => handleAddExerciseToWorkout(selectedExercise)}
                    variant="default"
                    className="bg-gradient-to-r from-cyan-500 to-emerald-600 font-bold rounded-lg"
                  >
                    Добавить в тренировку
                  </Button>
                </div>
              )}
              {/* Вложенный диалог для нового упражнения */}
              <Dialog open={addNewExerciseOpen} onOpenChange={setAddNewExerciseOpen}>
                <DialogContent className="bg-white border-cyan-200 max-w-md w-full rounded-xl text-slate-900">
                  <DialogHeader>
                    <DialogTitle className="text-cyan-700">Новое упражнение</DialogTitle>
                  </DialogHeader>
                  <Label className="mb-1 text-cyan-700">Название</Label>
                  <Input
                    value={newExercise.name}
                    onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="Название"
                    className="mb-2 bg-cyan-50 border-cyan-200 text-cyan-900"
                  />
                  <Label className="mb-1 text-cyan-700">Описание</Label>
                  <Textarea
                    value={newExercise.description}
                    onChange={e => setNewExercise({ ...newExercise, description: e.target.value })}
                    placeholder="Описание"
                    className="mb-2 bg-cyan-50 border-cyan-200 text-cyan-900"
                  />
                  <Label className="mb-1 text-cyan-700">Тип</Label>
                  <select
                    className="rounded px-3 py-2 mb-2 bg-cyan-50 border border-cyan-200 text-cyan-900"
                    value={newExercise.type}
                    onChange={e => setNewExercise({ ...newExercise, type: e.target.value })}
                  >
                    <option value="Динамика">Динамика</option>
                    <option value="Статика">Статика</option>
                  </select>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="w-32 bg-cyan-50 border-cyan-200 text-cyan-900"
                      type="number"
                      min={1}
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-40 bg-cyan-50 border-cyan-200 text-cyan-900"
                    />
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button
                      onClick={handleAddNewExerciseToWorkoutAndBase}
                      variant="default"
                      className="bg-gradient-to-r from-cyan-500 to-emerald-600 font-bold rounded-lg text-white"
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
        <div className="space-y-6 mb-8">
          {exercises.map((ex, idx) => (
            <div key={idx} className="flex items-center gap-3 border-b border-cyan-100 pb-3">
              <Input value={ex.name} readOnly className="w-64 bg-white border-cyan-200 text-cyan-900" placeholder="Название" />
              <Input value={ex.sets} readOnly className="w-24 bg-white border-cyan-200 text-cyan-900" placeholder="Кол-во подходов" />
              <Input value={ex.target} readOnly className="w-40 bg-white border-cyan-200 text-cyan-900" placeholder="Целевое" />
              <div className="text-xs ml-2 text-cyan-500 px-2 font-semibold">{ex.type}</div>
              <Button variant="destructive" onClick={() => handleRemoveExercise(idx)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg">Удалить</Button>
            </div>
          ))}
        </div>
        {/* Кнопки управления */}
        <div className="flex justify-end mt-12">
          <Button variant="default" className="bg-gradient-to-r from-cyan-500 to-emerald-600 font-bold rounded-lg shadow" onClick={handleSave}>
            Сохранить тренировку
          </Button>
        </div>
      </Card>
    </div>
  );
}