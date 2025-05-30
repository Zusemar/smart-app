"use client"
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/BackButton";

const MOCK = [
  {id: 1, name: "Жим лёжа", type: "Динамика"},
  {id: 2, name: "Планка", type: "Статика"}
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState(MOCK);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Динамика");

  const addExercise = () => {
    if (newName.trim()) {
      setExercises(e => [
        ...e,
        { id: Date.now(), name: newName, type: newType }
      ]);
      setNewName("");  
      setNewType("Динамика");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-cyan-50 text-slate-900 flex flex-col items-center pt-20">
      <div className="w-full max-w-md">
      <BackButton className="w-fit mb-6 bg-white border-cyan-300 text-cyan-700 shadow hover:bg-cyan-50 transition font-semibold px-6 py-2" />

        <h1 className="text-3xl font-extrabold mb-10 text-cyan-700 drop-shadow-md">База упражнений</h1>
      </div>
      <div className="flex flex-col w-full max-w-md gap-4">
        {exercises.map(e =>
          <Card key={e.id} className="bg-white border-cyan-200 text-cyan-900 shadow-md">
            <div className="p-6 flex justify-between items-center">
              <span>{e.name}</span>
              <span className="text-xs text-cyan-500 font-semibold">{e.type}</span>
            </div>
          </Card>
        )}
      </div>
      <Card className="p-6 mt-12 w-full max-w-md bg-white border-cyan-200 shadow-md">
        <Label htmlFor="add-ex" className="block mb-2 text-cyan-700 font-bold">Новое упражнение</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="add-ex"
            className="flex-1"
            placeholder="Название"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <select
            className="rounded-md px-3 py-2 bg-cyan-50 border border-cyan-200 text-cyan-900"
            value={newType}
            onChange={e => setNewType(e.target.value)}
          >
            <option value="Динамика">Динамика</option>
            <option value="Статика">Статика</option>
          </select>
          <Button onClick={addExercise}>Добавить</Button>
        </div>
      </Card>
    </div>
  );
}