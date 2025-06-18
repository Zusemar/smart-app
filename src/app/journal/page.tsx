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
    <div className="min-h-screen text-slate-900 flex flex-col items-center pt-24 pb-[80px]">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl 2xl:max-w-5xl">
        <BackButton className="w-fit mb-8 bg-white border-black text-cyan-800 shadow-lg hover:bg-cyan-100 transition font-semibold px-6 py-3 text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl" />
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl 2xl:text-9xl font-extrabold mb-8 text-cyan-800 drop-shadow-md">Журнал</h1>
        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl 2xl:max-w-5xl">
          {journal.length === 0 && (
            <Card className="p-4 md:p-6 lg:p-8 bg-white border-black text-cyan-800 text-center text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl shadow-lg">
              Нет завершённых тренировок
            </Card>
          )}
          <Accordion type="multiple" className="w-full">
            {journal.map((item, i) => (
              <AccordionItem value={"item-" + i} key={i} className="mb-4 border-none">
                <AccordionTrigger className="rounded-lg bg-white border-black px-4 py-3 text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold shadow-lg hover:bg-cyan-100 transition flex justify-between items-center">
                  <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold">{item.date} — {item.workout}</span>
                </AccordionTrigger>
                <AccordionContent className="bg-cyan-100 px-4 pb-4 pt-3 rounded-b-lg">
                  <ul className="list-disc pl-6">
                    {item.exercises.map((ex, j) => (
                      <li key={j} className="mb-2">
                        <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
                          <span className="font-semibold">{ex.name}</span>: <span className="text-cyan-700">{ex.result}</span>
                        </span>
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