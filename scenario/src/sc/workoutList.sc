theme: /
    state: WorkoutList
        q: (покажи | список | какие есть) (тренировки | воркауты)
        a: Сейчас
        script:
            workouts = getWorkouts();
            if (!workouts || workouts.length === 0) {
                answer("У тебя пока нет тренировок");
            } else {
                answer("Вот твои тренировки: " + workouts.join(", "));
            }