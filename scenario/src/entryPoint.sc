require: slotfilling/slotFilling.sc
  module = sys.zb-common

require: zenflow.sc
  module = sys.zfl-common

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
    $WorkoutNamePattern = $regexp<([а-яА-Я]+ *)+>


theme: /
    state: getid
        event!: init
        script:
            log('INIT EVENT');
            addAction({ type: "userid", parameters: { id: $request.channelUserId } }, $context);

    state: Start
        q!: $regex</start>
        q!: (запусти* | открой | активируй | включи*) (Дом feat | DomFit | domfit)
        script:
            addAction({ type: "userid", parameters: { id: $request.channelUserId } }, $context);
            addSuggestions(["Помощь"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        if: $temp.character == "Джой"
            a: Привет! Я помогу тебе с тренировками. Скажи "Помощь", чтобы узнать, что я умею.
        elseif: $temp.character == "Cбер"
            a: Добро пожаловать в приложение для тренировок! Я помогу вам начать. Скажите "Помощь", чтобы узнать больше.
        elseif: $temp.character == "Афина"
            a: Добро пожаловать в приложение для тренировок! Я помогу вам начать. Скажите "Помощь", чтобы узнать больше.
        else:
            a: Добро пожаловать! Скажите "Помощь", чтобы узнать больше

    state: OpenJournal
        q!: (журнал | мой журнал | дневник | история тренировок)
        script:
            log('startNewRound: context: ' + JSON.stringify($context));
            openJournal($context);
            addSuggestions(["Вернуться", "Помощь", "Тренировки", "Упражнения"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        if: $temp.character == "Джой"
            a: Открываю твой журнал тренировок
        elseif: $temp.character == "Cбер"
            a: Открываю ваш журнал тренировок
        elseif: $temp.character == "Афина"
            a: Открываю ваш журнал тренировок
        else:
            a: Открываю журнал тренировок

    state: OpenWorkouts
        q!: (начать тренировку | мои тренировки | тренировки | занятия | воркауты )
        script:
            openWorkouts($context);
            addSuggestions(["Начать тренировку", "Вернуться", "Журнал", "Помощь", "Упражнения"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        if: $temp.character == "Джой"
            a: Показываю твои тренировки
        elseif: $temp.character == "Cбер"
            a: Показываю ваши тренировки
        elseif: $temp.character == "Афина"
            a: Показываю ваши тренировки
        else:
            a: Показываю список тренировок


    state: OpenExercises
        q!: (база упражнений | упражнения | база)
        script:
            openExercises($context);
            addSuggestions(["Вернуться", "Журнал", "Помощь", "Тренировки"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        if: $temp.character == "Джой"
            a: Открываю твою базу упражнений
        elseif: $temp.character == "Cбер"
            a: Открываю вашу базу упражнений
        elseif: $temp.character == "Афина"
            a: Открываю вашу базу упражнений
        else:
            a: Открываю базу упражнений

    
    state: OpenMainScreen
        q!: (вернуться|главный экран|на главный экран|вернуться на главный экран|домой|на главную|в начало|назад)
        script:
            addAction({ type: "open_main_screen" }, $context);
            addSuggestions(["Помощь", "Журнал", "Тренировки", "Упражнения"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        a: Открываю главный экран


    state: StartExercise
        q!: (начать|старт|стартуй|запусти|поехали) упражнени*
        script:
            addAction({ type: "start_exercise" }, $context);
            addSuggestions(["Закончить тренировку", "Следующее упражнение", "Назад"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        a: Начинаем упражнение

    state: NextExercise
        q!: (следующее|дальше|перейти к следующему) упражнени*
        script:
            addAction({ type: "next_exercise" }, $context);
            addSuggestions(["Закончить тренировку", "Следующее упражнение", "Добавить 10 секунд", "Добавить повторение", "Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        a: Переходим к следующему упражнению

    state: FinishWorkout
        q!: (закончить|завершить|стоп|остановить|финиш) тренировк*
        script:
            addAction({ type: "finish_workout" }, $context);
            addSuggestions(["Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        if: $temp.character == "Джой"
            a: Завершаю твою тренировку
        elseif: $temp.character == "Cбер"
            a: Завершаю вашу тренировку
        elseif: $temp.character == "Афина"
            a: Завершаю вашу тренировку
        else:
            a: Завершаю тренировку

    state: IncreaseReps
        q!: (добав*|увелич*|прибавь|сделай больше) повторени*
        script:
            addAction({ type: "increase_reps" }, $context);
            addSuggestions(["Закончить тренировку", "Следующее упражнение", "Добавить 10 секунд", "Добавить повторение", "Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        a: Добавляю повторение

    state: DecreaseReps
        q!: (убери|убрать|уменьшить|убавь|сделай меньше) повторени*
        script:
            addAction({ type: "decrease_reps" }, $context);
            addSuggestions(["Закончить тренировку", "Следующее упражнение", "Добавить 10 секунд", "Добавить повторение", "Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        a: Убираю повторение

    state: IncreaseTime
        q!: (добав*|прибав*|плюс*) * секунд
        script:
            addAction({ type: "increase_time" }, $context);
            addSuggestions(["Закончить тренировку", "Следующее упражнение", "Добавить 10 секунд", "Добавить повторение", "Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        a: Добавляю 10 секунд


    state: DecreaseTime
        q!: (убир*|убрать|убер*|убав*|минус*) * секунд
        script:
            addAction({ type: "decrease_time" }, $context);
            addSuggestions(["Закончить тренировку", "Следующее упражнение", "Добавить 10 секунд", "Добавить повторение", "Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        a: Убираю 10 секунд

    state: Help
        q!: (помощь|что умеешь|какие команды|help)
        script:
            log('INIT EVENT');
            addAction({ type: "userid", parameters: { id: $request.channelUserId } }, $context);
            addSuggestions(["Журнал", "Тренировки", "Упражнения", "Вернуться", "Начать тренировку"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        if: $temp.character == "Джой"
            a: Я могу открыть твой журнал, показать тренировки или упражнения. Можешь сказать: "Журнал", "Тренировки", "Упражнения", "Вернуться" или "Начать тренировку". Чем могу помочь?
        elseif: $temp.character == "Cбер"
            a: Я могу открыть ваш журнал, показать тренировки или упражнения. Скажите: "Журнал", "Тренировки", "Упражнения", "Вернуться" или "Начать тренировку". Чем могу помочь?
        elseif: $temp.character == "Афина"
            a: Я могу открыть ваш журнал, показать тренировки или упражнения. Скажите: "Журнал", "Тренировки", "Упражнения", "Вернуться" или "Начать тренировку". Чем могу помочь?
        else:
            a: Я могу открыть журнал, показать тренировки или упражнения. Скажите: "Журнал", "Тренировки", "Упражнения", "Вернуться" или "Начать тренировку". Чем могу помочь?


    
    

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
            addSuggestions(["Закончить тренировку", "Следующее упражнение", "Добавить 10 секунд", "Добавить повторение", "Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        a: Начинаем тренировку

    state: StartFirstWorkout
        q!: * (начать|запусти*) * тренировку *
        script:
            log('StartFirstWorkout: Входящий запрос: ' + JSON.stringify($request));
            log('StartFirstWorkout: Доступные тренировки: ' + JSON.stringify($session.workouts));
            
            addAction({ 
                type: "start_workout"
            }, $context);
            
            log('StartFirstWorkout: Команда отправлена для запуска первой тренировки');
            addSuggestions(["Закончить тренировку", "Следующее упражнение", "Добавить 10 секунд", "Добавить повторение", "Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        if: $temp.character == "Джой"
            a: Начинаем твою тренировку!
        elseif: $temp.character == "Cбер"
            a: Начинаем вашу тренировку!
        elseif: $temp.character == "Афина"
            a: Начинаем вашу тренировку!
        else:
            a: Начинаем тренировку!

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

    state: NoMatch
        event!: noMatch
        script:
            log('NO MATCH');
            log('NO match REQ: ', JSON.stringify($request));
            addAction({ type: "userid", parameters: { id: $request.channelUserId } }, $context);
            addSuggestions(["Помощь", "Журнал", "Тренировки", "Упражнения", "Вернуться"], $context);
            $temp.character = $request.rawRequest && $request.rawRequest.payload && $request.rawRequest.payload.character && $request.rawRequest.payload.character.name ? $request.rawRequest.payload.character.name : "";
        if: $temp.character == "Джой"
            a: Я пока не знаю такой команды. Я могу открыть твой журнал, тренировки или упражнения. Скажи "Помощь", если нужна подсказка!
        elseif: $temp.character == "Cбер"
            a: Я пока не знаю такой команды. Я могу открыть ваш журнал, тренировки или упражнения. Скажите "Помощь", если нужна подсказка!
        elseif: $temp.character == "Афина"
            a: Я пока не знаю такой команды. Я могу открыть ваш журнал, тренировки или упражнения. Скажите "Помощь", если нужна подсказка!
        else:
            a: Я пока не знаю такой команды. Скажите "Помощь", чтобы узнать, что я умею.