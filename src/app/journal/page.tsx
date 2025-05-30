"use client";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { getJournal, JournalEntry } from "@/lib/storage";
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function JournalPage() {
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  useEffect(() => {
    setJournal(getJournal());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-cyan-50 text-slate-900 flex flex-col items-center pt-20">
      <div className="w-full max-w-md">
        <BackButton className="w-fit mb-6 bg-white border-cyan-300 text-cyan-700 shadow hover:bg-cyan-50 transition font-semibold px-6 py-2" />
        <h1 className="text-3xl font-extrabold mb-10 text-cyan-700 drop-shadow-md">Журнал</h1>
        <div className="flex flex-col gap-4 w-full max-w-md">
          {journal.length === 0 && (
            <Card className="p-5 bg-white border-cyan-200 text-cyan-700 text-center text-lg shadow-md">
              Нет завершённых тренировок
            </Card>
          )}
          <Accordion type="multiple" className="w-full">
            {journal.map((item, i) => (
              <AccordionItem value={"item-" + i} key={i} className="mb-2 border-none">
                <AccordionTrigger className="rounded-lg bg-white border-cyan-200 px-4 py-3 text-lg font-semibold shadow hover:bg-cyan-50 transition flex justify-between items-center">
                  <span>{item.date} — {item.workout}</span>
                </AccordionTrigger>
                <AccordionContent className="bg-cyan-50 px-6 pb-4 pt-2 rounded-b-lg">
                  <ul className="list-disc pl-5">
                    {item.exercises.map((ex, j) => (
                      <li key={j} className="mb-1">
                        <span className="font-semibold">{ex.name}</span>: <span className="text-cyan-600">{ex.result}</span>
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