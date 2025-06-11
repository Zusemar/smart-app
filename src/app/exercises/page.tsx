"use client"
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/BackButton";

type Exercise = {
  id: number;
  name: string;
  type: string;
  description?: string;
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Динамика");

  useEffect(() => {
    fetch("https://localhost:8000/api/exercises")
      .then(res => res.json())
      .then(setExercises);
  }, []);

  const addExercise = async () => {
    if (newName.trim()) {
      const res = await fetch("https://localhost:8000/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, type: newType, description: "" })
      });
      if (res.ok) {
        const newEx = await res.json();
        setExercises(e => [...e, newEx]);
        setNewName("");
        setNewType("Динамика");
      }
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