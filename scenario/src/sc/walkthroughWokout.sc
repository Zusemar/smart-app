require: js/getters.js
require: js/reply.js
require: js/actions.js

theme: /
    state: WorkoutSession
        
        state: StartExercise
            intent!: /начать упражнение
            a: Начинаем упражнение
            script:
                addAction({ type: "start_exercise" }, $context);

        state: StopExercise
            intent!: /(остановить|пауза|стоп) упражнени*
            a: Останавливаю упражнение
            script:
                addAction({ type: "stop_exercise" }, $context);

        state: NextExercise
            intent!: /(следующее|дальше|следующий) упражнени*
            a: Переходим к следующему упражнению
            script:
                addAction({ type: "next_exercise" }, $context);

        state: PrevExercise
            intent!: /(предыдущее|назад|предыдущий) упражнени*
            a: Возвращаюсь к предыдущему упражнению
            script:
                addAction({ type: "prev_exercise" }, $context);

        state: RepeatExercise
            intent!: /(повторить|сбросить) упражнени*
            a: Повторяю упражнение сначала
            script:
                addAction({ type: "repeat_exercise" }, $context);

        state: FinishWorkout
            intent!: /(закончить|завершить) тренировку
            a: Завершаю тренировку
            script:
                addAction({ type: "finish_workout" }, $context);

        state: IncreaseReps
            intent!: /(добавить|увеличить|прибавь|сделай больше) повторени*
            a: Добавляю повторение
            script:
                addAction({ type: "increase_reps" }, $context);

        state: DecreaseReps
            intent!: /(убрать|уменьшить|убавь|сделай меньше) повторени*
            a: Убираю повторение
            script:
                addAction({ type: "decrease_reps" }, $context);

        state: IncreaseTime
            intent!: /(добавить|увеличить|прибавь|сделай больше) врем(я|ени)*
            a: Добавляю 10 секунд
            script:
                addAction({ type: "increase_time" }, $context);

        state: DecreaseTime
            intent!: /(убрать|уменьшить|убавь|сделай меньше) врем(я|ени)*
            a: Убираю 10 секунд
            script:
                addAction({ type: "decrease_time" }, $context);

        state: Help
            intent!: /помощь
            a: Доступные команды:
               - начать упражнение
               - остановить упражнение
               - следующее/предыдущее упражнение
               - закончить тренировку
               - добавить или убрать повторение
               - добавить или убрать время
               - повторить упражнение
               Что бы вы хотели сделать?

        state: NoMatch
            event!: noMatch
            a: Извините, я не понял команду. Скажите \"помощь\", чтобы узнать доступные команды.
            script:
                addAction({ type: "fallback" }, $context);
    