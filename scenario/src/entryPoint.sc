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
    
    # Паттерн для захвата названия тренировки
    # Структура паттерна:
    # ([а-яА-Я]+ *)+
    #   [а-яА-Я] - любая русская буква (строчная или заглавная)
    #   + - одно или более повторений предыдущего символа
    #   * - пробел
    #   (...) - группировка
    #   (...)+  - одно или более повторений группы
    # 
    # Примеры корректных названий:
    # - "грудь и спина" -> захватит "грудь и спина"
    # - "ноги"         -> захватит "ноги"
    # - "руки плечи"   -> захватит "руки плечи"
    #
    # Использование в сценарии:
    # $WorkoutNamePattern::workout - создает алиас 'workout'
    # Значение будет доступно через $parseTree._workout
    $WorkoutNamePattern = $regexp<([а-яА-Я]+ *)+>

theme: /
    state: Start
        q!: $regex</start>
        a: Привет
    state: StartTraining    
        q!: (запусти| начать | включи | открой) (мои тренировки | тренировки | тренировку | фитнес)
        a: Привет! Я помогу тебе с тренировками. Хочешь начать новую, посмотреть список или журнал, или отредактировать упражнения?
        

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
    
    state: OpenMainScreen
        q!: (Главный экран | на главный экран | вернуться на главный экран | домой | на главную | в начало)
        a: Открываю главный экран
        script:
            addAction({ type: "open_main_screen" }, $context);

        state: StartExercise
        q!: (начать|старт|стартуй|запусти|поехали) упражнени*
        a: Начинаем упражнение
        script:
            addAction({ type: "start_exercise" }, $context);

    state: NextExercise
        q!: (следующее|дальше|перейти к следующему) упражнени*
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
        q!: (добавить|добавь|увеличить|прибавь|сделай больше) (время|времени)
        a: Добавляю 10 секунд
        script:
            addAction({ type: "increase_time" }, $context);

    state: DecreaseTime
        q!: (убрать|уменьшить|уменьши|убавь|сделай меньше) (время|времени)
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
            - вернуться на главный экран
            Что бы вы хотели сделать?



    state: NoMatch
        event!: noMatch
        a: Извините, я не понял команду. Скажите "помощь", чтобы узнать доступные команды.
        script:
            addAction({ type: "fallback" }, $context);
    

    state: Test
        event!: test
        script:
            #"request":{"data":{"eventData":{"workouts":[{"id":1,"name":"Грудь и #спина"},{"id":2,"name":"Ноги"}]}
            log('HAHHAHAHA');
            log('context: ' + JSON.stringify($context));
            log('data: ' + JSON.stringify($context.request.data.eventData.workouts))

    state: SelectWorkout
        q!: * (начать|запустить|выбрать) * тренировку * $WorkoutNamePattern::workout *
        script:
            // Логируем входящий запрос
            log('SelectWorkout: Входящий запрос: ' + JSON.stringify($request));
            log('SelectWorkout: Дерево разбора: ' + JSON.stringify($parseTree));
            
            // Получаем название тренировки из дерева разбора
            var workoutName = $parseTree._workout;
            log('SelectWorkout: Найдено название тренировки: ' + workoutName);
            
            // Проверяем доступные тренировки в сессии
            log('SelectWorkout: Доступные тренировки: ' + JSON.stringify($session.workouts));
            
            // Отправляем команду
            addAction({ 
                type: "select_workout",
                parameters: { 
                    name: workoutName
                } 
            }, $context);
            
            log('SelectWorkout: Команда отправлена для тренировки: ' + workoutName);

    state: StartFirstWorkout
        q!: * (начать|запустить) * тренировку *
        script:
            log('StartFirstWorkout: Входящий запрос: ' + JSON.stringify($request));
            log('StartFirstWorkout: Доступные тренировки: ' + JSON.stringify($session.workouts));
            
            addAction({ 
                type: "start_workout"
            }, $context);
            
            log('StartFirstWorkout: Команда отправлена для запуска первой тренировки');

    state: UpdateWorkouts
        event!: update_workouts
        script:
            log('UpdateWorkouts: Начало обновления списка тренировок');
            log('UpdateWorkouts: Входящий контекст: ' + JSON.stringify($context));
            
            if ($context.request && $context.request.data) {
                $session.workouts = $context.request.data.eventData.workouts;
                log('UpdateWorkouts: Тренировки обновлены: ' + JSON.stringify($session.workouts));
            } else {
                log('UpdateWorkouts: Ошибка - нет данных в запросе');
            }
