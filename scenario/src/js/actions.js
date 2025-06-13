function startWorkout(workout, context) {
    addAction({
        type: "start_workout",
        workout: workout
    }, context);
}

function finishWorkout(workout, context) {
    addAction({
        type: "finish_workout",
        workout: workout
    }, context);
}

function deleteWorkout(workout, context) {
    addAction({
        type: "delete_workout",
        workout: workout
    }, context);
}

function addExercise(exercise, context) {
    addAction({
        type: "add_exercise",
        exercise: exercise
    }, context);
}

function removeExercise(exercise, context) {
    addAction({
        type: "remove_exercise",
        exercise: exercise
    }, context);
}

function renameWorkout(oldName, newName, context) {
    addAction({
        type: "rename_workout",
        old_name: oldName,
        new_name: newName
    }, context);
}

function startExercise(exercise, context) {
    addAction({
        type: "start_exercise",
        exercise: exercise
    }, context);
}

function finishExercise(exercise, context) {
    addAction({
        type: "finish_exercise",
        exercise: exercise
    }, context);
}

function openJournal(context) {
    addAction({ type: "open_journal" }, context);
}

function openWorkouts(context) {
    addAction({ type: "open_workouts" }, context);
}

function openExercises(context) {
    addAction({ type: "open_exercises" }, context);
}

function openMainscreen(context) {
    addAction({ type: "open_mainscreen" }, context);
}
