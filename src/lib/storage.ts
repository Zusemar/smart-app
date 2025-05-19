export type WorkoutExercise = {
  id: number;
  name: string;
  type: string;
  description: string;
  sets: string;
  target: string;
};

export type Workout = {
  id: number;
  name: string;
  exercises: WorkoutExercise[];
};

const STORAGE_KEY = "workouts_db_v1";

export function getAllWorkouts(): Workout[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWorkout(w: Workout) {
  const prev = getAllWorkouts();
  const exists = prev.find(x => x.id === w.id);
  let updated: Workout[];
  if (exists) {
    updated = prev.map(x => (x.id === w.id ? w : x));
  } else {
    updated = [...prev, w];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function removeWorkout(id: number) {
  const updated = getAllWorkouts().filter(x => x.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}