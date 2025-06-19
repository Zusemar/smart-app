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

        state: NextExercise
            intent!: /следующее упражнение
            a: Переходим к следующему упражнению
            script:
                addAction({ type: "next_exercise" }, $context);

        state: FinishWorkout
            intent!: /(закончить|завершить) тренировку
            a: Завершаю тренировку
            script:
                addAction({ type: "finish_workout" }, $context);

        state: IncreaseReps
            q!: (добавить|увеличить) повторени*
            a: Добавляю повторение
            script:
                addAction({ type: "increase_reps" }, $context);

        state: DecreaseReps
            intent!: /(убрать|уменьшить) повторени*
            a: Убираю повторение
            script:
                addAction({ type: "decrease_reps" }, $context);

        state: IncreaseTime
            intent!: /(добавить|увеличить) время
            a: Добавляю 10 секунд
            script:
                addAction({ type: "increase_time" }, $context);

        state: DecreaseTime
            intent!: /(убрать|уменьшить) время
            a: Убираю 10 секунд
            script:
                addAction({ type: "decrease_time" }, $context);

        state: Help
            intent!: /помощь
            a: Доступные команды:
               - начать упражнение
               - следующее упражнение
               - закончить тренировку
               - добавить или убрать повторение
               - добавить или убрать время
               Что бы вы хотели сделать?

        state: NoMatch
            event!: noMatch
            a: Извините, я не понял команду. Скажите "помощь", чтобы узнать доступные команды.
            script:
                addAction({ type: "fallback" }, $context);
    