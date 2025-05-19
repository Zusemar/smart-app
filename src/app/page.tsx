"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { GlowCard } from "@/components/GlowCard";

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="flex w-full max-w-3xl justify-between mb-20">
        <Card
          onClick={()=>router.push("/journal")}
          className="cursor-pointer border-blue-400 border-2 bg-zinc-950 hover:shadow-blue-200"
        >
          <div className="px-10 py-7 text-xl text-center">Журнал</div>
        </Card>
        <Card
          onClick={()=>router.push("/workouts")}
          className="cursor-pointer border-green-400 border-2 bg-zinc-950 hover:shadow-green-200"
        >
          <div className="px-10 py-7 text-xl text-center">Мои тренировки</div>
        </Card>
      </div>
      <GlowCard className="cursor-pointer mb-20" onClick={()=>router.push("/workouts")}>
        начать<br />тренировку
      </GlowCard>
      <Card
        className="cursor-pointer border-yellow-400 border-2 bg-zinc-950 hover:shadow-yellow-200"
        onClick={()=>router.push("/exercises")}
      >
        <div className="px-10 py-7 text-xl text-center">База упражнений</div>
      </Card>
    </main>
  );
}