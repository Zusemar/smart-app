"use client"
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/BackButton";
import { getAssistant, getApiUrl } from "@/lib/assistant";

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
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const assistant = getAssistant();
    setUserId(assistant.getUserId());
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises/${userId}`)
      .then(res => res.json())
      .then(setExercises);
  }, [userId]);

  const addExercise = async () => {
    if (newName.trim() && userId) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newName, 
          type: newType, 
          description: "",
          user_id: userId
        })
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
    <div className="min-h-screen bg-gray-100 text-slate-900 flex flex-col items-center pt-24 pb-[80px]">
      <div className="w-full max-w-md lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl px-4">
        <BackButton className="w-fit mb-8 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 hover:scale-[1.02] hover:-translate-y-0.5 transition-all font-semibold px-8 py-3 h-12 sm:h-14 lg:h-16 text-lg sm:text-xl lg:text-2xl xl:text-3xl" />
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold mb-12 text-cyan-800 drop-shadow-md">База упражнений</h1>
      </div>
      <div className="flex flex-col w-full max-w-md lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl px-4 gap-6">
        {exercises.map(e =>
          <Card key={e.id} className="bg-white border-black text-cyan-900 shadow-lg hover:scale-[1.01] hover:-translate-y-0.5 transition-all">
            <div className="p-5 sm:p-7 lg:p-8 flex justify-between items-center">
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl">{e.name}</span>
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-cyan-600 font-semibold">{e.type}</span>
            </div>
          </Card>
        )}
      </div>
      <Card className="p-6 sm:p-8 lg:p-10 mt-14 w-full max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl mx-4 bg-white border-black shadow-lg">
        <Label htmlFor="add-ex" className="block mb-3 text-cyan-900 font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl">Новое упражнение</Label>
        <div className="grid grid-cols-12 gap-3 mb-3">
          <Input
            id="add-ex"
            className="col-span-5 text-base sm:text-lg lg:text-xl xl:text-2xl text-cyan-900 border border-black h-12 sm:h-14 lg:h-16 px-4"
            placeholder="Название"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <select
            className="col-span-4 rounded-md border border-black text-cyan-900 text-base sm:text-lg lg:text-xl xl:text-2xl h-12 sm:h-14 lg:h-16 px-2 bg-cyan-100"
            value={newType}
            onChange={e => setNewType(e.target.value)}
          >
            <option value="Динамика">Динамика</option>
            <option value="Статика">Статика</option>
          </select>
          <Button 
            onClick={addExercise} 
            className="col-span-3 border-black text-base sm:text-lg lg:text-xl xl:text-2xl h-12 sm:h-14 lg:h-16 hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
          >
            Добавить
          </Button>
        </div>
      </Card>
    </div>
  );
}