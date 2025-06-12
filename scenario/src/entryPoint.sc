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
        q!: (запусти| начать | включи | открой) (мои тренировки | тренировки | тренировку | фитнес)
        a: Привет! Я помогу тебе с тренировками. Хочешь начать новую, посмотреть список или журнал, или отредактировать упражнения?

    state: Fallback
        event!: noMatch
        a: Я тебя не понимаю. Скажи, например, "начни тренировку", "покажи тренировки" или "открой базу упражнений".
        script:
            log('entryPoint: Fallback: context: ' + JSON.stringify($context))


    state: OpenJournal
        q!: (журнал | историю тренировок)
        a: Открываю журнал тренировок
        script:
            log('startNewRound: context: ' + JSON.stringify($context));
            openJournal($context);

    state: OpenWorkouts
        q!: (список | тренировки | воркауты)
        a: Показываю список тренировок
        script:
            openWorkouts($context);

    state: OpenExercises
        q!: (база упражнений | упражнения)
        a: Открываю базу упражнений
        script:
            openExercises($context);

