theme: /
    state: TrainingLog
        q: (покажи | открой | открой) (журнал | историю тренировок)
        script:
            logs = getTrainingLog();
            if (!logs || logs.length === 0) {
                answer("Журнал пуст, ты пока не проводил тренировок.");
            } else {
                answer("Вот твои последние тренировки: " + logs.join(", "));
            }