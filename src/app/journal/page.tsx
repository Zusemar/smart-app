"use client";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getAssistant, getApiUrl } from "@/lib/assistant";

type JournalExerciseResult = {
  name: string;
  type: string;
  result: string;
};

type JournalEntry = {
  date: string;
  workout: string;
  exercises: JournalExerciseResult[];
};

export default function JournalPage() {
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const assistant = getAssistant();
    setUserId(assistant.getUserId());
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/journal/${userId}`)
      .then(res => res.json())
      .then(setJournal);
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100 text-slate-900 flex flex-col items-center pt-24 pb-[80px]">
      <div className="w-full max-w-md">
        <BackButton className="w-fit mb-8 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 transition font-semibold px-8 py-3 text-2xl" />
        <h1 className="text-6xl font-extrabold mb-12 text-cyan-800 drop-shadow-md">Журнал</h1>
        <div className="flex flex-col gap-6 w-full max-w-md">
          {journal.length === 0 && (
            <Card className="p-6 bg-white border-black text-cyan-800 text-center text-3xl shadow-lg">
              Нет завершённых тренировок
            </Card>
          )}
          <Accordion type="multiple" className="w-full">
            {journal.map((item, i) => (
              <AccordionItem value={"item-" + i} key={i} className="mb-3 border-none">
                <AccordionTrigger className="rounded-lg bg-white border-black px-5 py-4 text-3xl font-semibold shadow-lg hover:bg-cyan-100 transition flex justify-between items-center">
                  <span>{item.date} — {item.workout}</span>
                </AccordionTrigger>
                <AccordionContent className="bg-cyan-100 px-7 pb-5 pt-3 rounded-b-lg">
                  <ul className="list-disc pl-6">
                    {item.exercises.map((ex, j) => (
                      <li key={j} className="mb-2">
                        <span className="font-semibold">{ex.name}</span>: <span className="text-cyan-700">{ex.result}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}