"use client"
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20">
      <h1 className="text-3xl font-bold mb-10">База упражнений</h1>
      <div className="flex flex-col w-full max-w-md gap-4">
        {exercises.map(e =>
          <Card key={e.id} className="bg-zinc-950">
            <div className="p-6 flex justify-between items-center">
              <span>{e.name}</span>
              <span className="text-xs text-zinc-400">{e.type}</span>
            </div>
          </Card>
        )}
      </div>
      <Card className="p-6 mt-12 w-full max-w-md bg-zinc-950">
        <Label htmlFor="add-ex" className="block mb-2">Новое упражнение</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="add-ex"
            className="flex-1"
            placeholder="Название"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <select
            className="rounded-md px-3 py-2 bg-zinc-900 border border-zinc-700 text-white"
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