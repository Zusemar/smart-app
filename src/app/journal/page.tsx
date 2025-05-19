import { Card } from "@/components/ui/card";

const MOCK = [
  {date: "2024-06-01", workout: "Фулбади", result: "OK"},
  {date: "2024-05-31", workout: "Грудь+бицепс", result: "OK"},
];

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20">
      <h1 className="text-3xl font-bold mb-10">Журнал</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        {MOCK.map((item, i) => (
          <Card key={i} className="bg-zinc-950">
            <div className="p-5">
              <span>{item.date} — {item.workout} — {item.result}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}