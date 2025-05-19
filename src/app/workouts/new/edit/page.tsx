"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getAllWorkouts, saveWorkout, removeWorkout, Workout, WorkoutExercise } from "@/lib/storage";

type BaseExercise = {
  id: number;
  name: string;
  type: string;
  description: string;
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

  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [baseExercises, setBaseExercises] = useState<BaseExercise[]>(BASE_EXERCISES);
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
    if (isEdit) {
      const workouts = getAllWorkouts();
      const w = workouts.find(x => x.id === workoutId);
      if (w) {
        setWorkoutName(w.name);
        setExercises(w.exercises);
      }
    }
  }, [workoutId, isEdit]);

  function handleAddExerciseToWorkout(ex: BaseExercise) {
    setExercises([...exercises, { ...ex, sets, target }]);
    setChooseExerciseOpen(false); setSelectedExercise(null); setSets(""); setTarget("");
  }
  function handleAddNewExerciseToWorkoutAndBase() {
    const newId = Date.now();
    const toAdd = { ...newExercise, id: newId };
    setExercises([...exercises, { ...toAdd, sets, target }]);
    setBaseExercises([...baseExercises, toAdd]);
    setAddNewExerciseOpen(false); setChooseExerciseOpen(false); setNewExercise({ id: -1, name: "", description: "", type: "Динамика" }); setSets(""); setTarget("");
  }
  function handleRemoveExercise(idx: number) {
    setExercises(exercises.filter((_, i) => i !== idx));
  }
  function handleSave() {
    const wrk: Workout = {
      id: workoutId ? workoutId : Date.now(),
      name: workoutName,
      exercises
    };
    saveWorkout(wrk);
    router.push("/workouts");
  }
  function handleDeleteWorkout() {
    if (workoutId) removeWorkout(workoutId);
    router.push("/workouts");
  }

  return (
    <div className="min-h-screen bg-[#10151a] flex flex-col items-center pt-20">
      <Card className="p-8 w-full max-w-2xl bg-[#16212e] border-[#234468] shadow-lg rounded-xl">
        <h2 className="text-2xl font-extrabold mb-8 text-cyan-300 drop-shadow-md">Редактирование тренировки</h2>
        <div className="flex gap-4 items-center mb-8">
          <Input
            className="flex-1 bg-[#234468]/30 border-[#378fc8] text-white"
            placeholder="Название тренировки"
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
          />
          <Dialog open={chooseExerciseOpen} onOpenChange={setChooseExerciseOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="font-bold text-cyan-200 border-cyan-400 hover:bg-cyan-400/10 rounded-lg">добавить упражнение</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#16212e] border-[#234468] max-w-lg w-full text-slate-100">
              <DialogHeader>
                <DialogTitle className="text-cyan-300 font-bold">Добавить упражнение</DialogTitle>
              </DialogHeader>
              <div className="mb-2 font-bold text-slate-200">База упражнений:</div>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto mb-4">
                {baseExercises.map((ex: BaseExercise) => (
                  <Card
                    key={ex.id}
                    className={`cursor-pointer border transition border-neutral-700 hover:border-blue-400 bg-[#1e2635] p-3 ${selectedExercise?.id === ex.id ? "border-blue-400" : ""}`}
                    onClick={() => setSelectedExercise(ex)}
                  >
                    <div className="font-bold text-white">{ex.name}</div>
                    <div className="text-xs text-cyan-400">{ex.type}</div>
                    <div className="text-xs text-neutral-400 mt-1">{ex.description}</div>
                  </Card>
                ))}
              </div>
              <Button onClick={() => setAddNewExerciseOpen(true)} variant="secondary" className="mb-4 w-full bg-[#113f5b] text-cyan-200 hover:bg-cyan-900/30 font-bold rounded-lg">+ Новое упражнение</Button>
              {selectedExercise && (
                <div className="mt-2 border-t border-neutral-800 pt-2 space-y-1">
                  <div className="font-bold text-slate-200">{selectedExercise.name}</div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Подходы"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      className="w-32 bg-[#234468]/20 border-[#378fc8] text-white"
                      type="number"
                      min={1}
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-40 bg-[#234468]/20 border-[#378fc8] text-white"
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
                <DialogContent className="bg-[#1e2635] border-[#234468] max-w-md w-full rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-cyan-300">Новое упражнение</DialogTitle>
                  </DialogHeader>
                  <Label className="mb-1">Название</Label>
                  <Input
                    value={newExercise.name}
                    onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="Название"
                    className="mb-2 bg-[#234468]/30 border-[#378fc8] text-white"
                  />
                  <Label className="mb-1">Описание</Label>
                  <Textarea
                    value={newExercise.description}
                    onChange={e => setNewExercise({ ...newExercise, description: e.target.value })}
                    placeholder="Описание"
                    className="mb-2 bg-[#234468]/30 border-[#378fc8] text-white"
                  />
                  <Label className="mb-1">Тип</Label>
                  <select
                    className="rounded px-3 py-2 mb-2 bg-[#234468]/30 border border-[#378fc8] text-white"
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
                      className="w-32 bg-[#234468]/30 border-[#378fc8] text-white"
                      type="number"
                      min={1}
                    />
                    <Input
                      placeholder="Повторы/сек"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-40 bg-[#234468]/30 border-[#378fc8] text-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button
                      onClick={handleAddNewExerciseToWorkoutAndBase}
                      variant="default"
                      className="bg-gradient-to-r from-cyan-500 to-emerald-600 font-bold rounded-lg"
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
            <div key={idx} className="flex items-center gap-3 border-b border-neutral-700 pb-3">
              <Input value={ex.name} readOnly className="w-64 bg-[#234468]/30 border-[#378fc8] text-cyan-200" placeholder="Название" />
              <Input value={ex.sets} readOnly className="w-24 bg-[#234468]/30 border-[#378fc8] text-white" placeholder="Кол-во подходов" />
              <Input value={ex.target} readOnly className="w-40 bg-[#234468]/30 border-[#378fc8] text-white" placeholder="Целевое" />
              <div className="text-xs ml-2 text-cyan-400 px-2">{ex.type}</div>
              <Button variant="destructive" onClick={() => handleRemoveExercise(idx)}>Удалить</Button>
            </div>
          ))}
        </div>
        {/* Кнопки управления */}
        <div className="flex justify-between mt-12">
          {isEdit && (
            <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-400/10 rounded-lg" onClick={handleDeleteWorkout}>
              Удалить тренировку
            </Button>
          )}
          <div />
          <Button variant="default" className="bg-gradient-to-r from-cyan-500 to-emerald-600 font-bold rounded-lg shadow" onClick={handleSave}>
            Сохранить тренировку
          </Button>
        </div>
      </Card>
    </div>
  );
}