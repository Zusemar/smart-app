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
    <div className="min-h-screen text-slate-900 flex flex-col items-center pt-24 pb-[80px]">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl 2xl:max-w-5xl px-2">
        <BackButton className="w-fit mb-8 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 hover:scale-[1.02] hover:-translate-y-0.5 transition-all font-semibold px-6 py-3 h-10 md:h-12 lg:h-16 text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl" />
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl 2xl:text-9xl font-extrabold mb-8 text-cyan-800 drop-shadow-md">База упражнений</h1>
      </div>
      <div className="flex flex-col w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl 2xl:max-w-5xl px-2 gap-4 md:gap-6 lg:gap-8">
        {exercises.map(e =>
          <Card key={e.id} className="bg-white border-black text-cyan-900 shadow-lg hover:scale-[1.01] hover:-translate-y-0.5 transition-all">
            <div className="p-4 md:p-6 lg:p-8 flex justify-between items-center">
              <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">{e.name}</span>
              <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-cyan-600 font-semibold">{e.type}</span>
            </div>
          </Card>
        )}
      </div>
      <Card className="p-4 md:p-6 lg:p-8 mt-10 w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl 2xl:max-w-5xl mx-2 bg-white border-black shadow-lg">
        <Label htmlFor="add-ex" className="block mb-4 text-cyan-900 font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl">Новое упражнение</Label>
        <div className="grid grid-cols-12 gap-2 md:gap-4 mb-4">
          <Input
            id="add-ex"
            className="col-span-5 text-base md:text-lg lg:text-xl xl:text-2xl text-cyan-900 border border-black h-8 md:h-10 lg:h-12 px-2"
            placeholder="Название"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <select
            className="col-span-4 rounded-md border border-black text-cyan-900 text-base md:text-lg lg:text-xl xl:text-2xl h-8 md:h-10 lg:h-12 px-2 bg-cyan-100"
            value={newType}
            onChange={e => setNewType(e.target.value)}
          >
            <option value="Динамика">Динамика</option>
            <option value="Статика">Статика</option>
          </select>
          <Button 
            onClick={addExercise} 
            className="col-span-3 border-black text-base md:text-lg lg:text-xl xl:text-2xl h-8 md:h-10 lg:h-12 hover:scale-[1.02] hover:-translate-y-0.5 transition-all"
          >
            Добавить
          </Button>
        </div>
      </Card>
    </div>
  );
}