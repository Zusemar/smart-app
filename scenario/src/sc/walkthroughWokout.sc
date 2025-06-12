require: slotfilling/slotFilling.sc
  module = sys.zb-common

# Подключение js обработчиков
require: js/getters.js
require: js/reply.js
require: js/actions.js

# Подключение сценариев
require: sc/workoutList.sc
require: sc/exerciseBase.sc
require: sc/log.sc

patterns:
    $AnyText = $nonEmptyGarbage

theme: /
    state: Start
        q!: $regex</start>
        a: Привет
    state: StartTraining    
        q!: (запусти|начать|включи|открой) (мои тренировки|тренировки|тренировку|фитнес)
        a: Привет! Я помогу тебе с тренировками. Хочешь начать новую, посмотреть список или журнал, или отредактировать упражнения?
        
    state: OpenJournal
        q!: (журнал|историю тренировок)
        a: Открываю журнал тренировок
        script:
            log('startNewRound: context: ' + JSON.stringify($context));
            openJournal($context);

    state: OpenWorkouts
        q!: (список|тренировки|воркауты)
        a: Показываю список тренировок
        script:
            openWorkouts($context);

    state: OpenExercises
        q!: (база упражнений|упражнения)
        a: Открываю базу упражнений
        script:
            openExercises($context);
    
    state: OpenMainScreen
        q!: (главный экран|домой|на главную)
        a: Открываю главный экран
        script:
            openmainScreen($context);

    state: StartExercise
        q!: (начать|старт|стартуй|запусти|поехали) упражнени*
        a: Начинаем упражнение
        script:
            addAction({ type: "start_exercise" }, $context);

    state: NextExercise
        q!: (следующ(ий|ее|ую)|дальше|перейти к следующему) упражнени*
        a: Переходим к следующему упражнению
        script:
            addAction({ type: "next_exercise" }, $context);

    state: FinishWorkout
        q!: (закончить|завершить|стоп|остановить|финиш) тренировк*
        a: Завершаю тренировку
        script:
            addAction({ type: "finish_workout" }, $context);

    state: IncreaseReps
        q!: (добавить|увеличить|прибавь|сделай больше) повторени*
        a: Добавляю повторение
        script:
            addAction({ type: "increase_reps" }, $context);

    state: DecreaseReps
        q!: (убрать|уменьшить|убавь|сделай меньше) повторени*
        a: Убираю повторение
        script:
            addAction({ type: "decrease_reps" }, $context);

    state: IncreaseTime
        q!: (добавить|увеличить|прибавь|сделай больше) врем(я|ени)*
        a: Добавляю 10 секунд
        script:
            addAction({ type: "increase_time" }, $context);

    state: DecreaseTime
        q!: (убрать|уменьшить|убавь|сделай меньше) врем(я|ени)*
        a: Убираю 10 секунд
        script:
            addAction({ type: "decrease_time" }, $context);

    state: Help
        q!: (помощь|что умеешь|какие команды|help)
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
    
    state: Test
        event!: start_crossfit
        script:
            log('HAHHAHAHA');
            log('context: ' + JSON.stringify($context));
