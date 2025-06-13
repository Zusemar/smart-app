import { createAssistant, createSmartappDebugger } from "@salutejs/client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type AssistantCommand = {
  action?: {
    type: string;
    parameters?: any;
  };
  navigation?: {
    command: 'UP' | 'DOWN';
  };
};

type CommandHandler = (command: AssistantCommand) => void;

type MessageCallback = (message: string) => void;

class VoiceAssistant {
  private static instance: VoiceAssistant;
  private assistant: any;
  private handlers: CommandHandler[] = [];
  private router?: AppRouterInstance;
  private messageCallbacks: MessageCallback[] = [];
  private userId: string = '';

  private constructor() {
    const state = {};
    const recoveryState = {};

    const initialize = (getState: any, getRecoveryState: any) => {
      if (process.env.NODE_ENV === "development") {
        return createSmartappDebugger({
          token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI1ODFjZDIwZC1jMjg5LTQyNWEtYTEzNC1mN2RhYmY1ZWMzMGQiLCJzdWIiOiJlNWIxYjM0NTk3OTY0YTdjYzI1NjY1ODA1N2M3MTFkODY1NDlmNGNlNzgzMTU3NWYxYTIzNmM4YWY3NWEyM2NlNTM5YmU5MjcwMDQyNjI5OCIsImlzcyI6IktFWU1BU1RFUiIsImV4cCI6MTc0OTg1NjM5NywiYXVkIjoiVlBTIiwidXNyIjoiYjQ0MDMyNDctMGExNS00ZWY0LWE3MGYtM2I0MDIxNjZmNjAyIiwiaWF0IjoxNzQ5NzY5OTg3LCJzaWQiOiIyZTY5MzBiZS0yM2JiLTQ5YWEtYmRmOC1kZjhjZTI0NjcyNWIifQ.IulAQ-2Ihc26C6mg08aKW2y649Q7DfruzxGx8Uf5PjBTfp_bzduo8wqPKLLtf99sniPeUKIeaHSdhB4Vj6Vw5TNOWNo3n2-or9FN4jcsYArN52Lsl6tlmq6M2OGaQ4cJ-U-2TahaqvQZ3sEVztMV9MIdVO74uXq6W5ebUfSw0AcIWXxzr0nol3qrH3ImX7ol2XV23Y-4gg3fz9jxJdJqXtpsx4xcjxRItVcRlzIZ6EBA77T_XffaSBKIWnEyRwqHBx3yuomZj_5qFnAL2wUnRjde68_F-ijwgKSu2aX07kN7lY0w7gzkknuzN9wHjGUja9SgueVJuS9bks03aGqD7CApMQrQcR4AVtaZDwZ2CSo-H92NPz9zut0DEC5HqwL4OYm8eRX7lAMUUCLPUWsATpgkN6c29pYA87iPu1LrAv4cRrxK6diSdjuXYIZfw3gxS9UqWnV-xju6Au2yIwKnpcAGcDrxzAu31ny8chKcT4iOtDdsmA047Andxi0aIjMo31-zCenFww3pHCfwt4ipyE3-4y2i-54FQWn3q3HBlNFgsac9nJEhMu9fm_ya3JNHqMOEopuh6PjTLqk6kgyTW5H4A3Y9U5gpZ4fzvui1pRhBshqrgsrFHrFX9O2KaKZayeFuXa0W-veFzvgUAWoZCQI_WLpHN3J962wrsIjIu78",
          initPhrase: "Запусти Тестовые тренировки",
          getState,
          getRecoveryState,
          nativePanel: {
            defaultText: "начать тренировку",
            screenshotMode: false,
            tabIndex: 0,
          },
        });
      }

      return createAssistant({ getState, getRecoveryState });
    };

    this.assistant = initialize(() => state, () => recoveryState);

    this.assistant.on("data", (command: AssistantCommand) => {
      // Handle navigation commands
      if (command.navigation) {
        switch(command.navigation.command) {
          case 'UP':
            window.scrollTo(0, 0);
            break;
          case 'DOWN':
            window.scrollTo(0, 1000);
            break;
        }
      }

      // Handle built-in navigation commands
      if (command.action && this.router) {
        switch (command.action.type) {
          case "userid":
            if (command.action.parameters?.id) {
              this.userId = command.action.parameters.id;
              console.log("User ID set:", this.userId);
            }
            break;
          case "open_journal":
            this.router.push("/journal");
            this.notifyMessage("Открываю журнал тренировок");
            break;
          case "open_workouts":
            this.router.push("/workouts");
            this.notifyMessage("Показываю список тренировок");
            break;
          case "open_exercises":
            this.router.push("/exercises");
            this.notifyMessage("Открываю базу упражнений");
            break;
          case "start_workout":
            this.router.push("/workouts");
            this.notifyMessage("Начинаем тренировку!");
            break;
          case "stop_workout":
            this.notifyMessage("Тренировка остановлена.");
            break;
          case "open_main_screen":
            this.router.push("/");
            this.notifyMessage("Перехожу на главный экран");
            break;
          case "fallback":
            this.notifyMessage(
              "Скажи, например, 'начни тренировку', 'покажи тренировки', 'открой базу упражнений' или 'вернуться'."
            );
            break;
        }
      }

      // Notify custom handlers
      this.handlers.forEach(handler => handler(command));
    });

    // Initialize the assistant
    this.assistant.sendData({
      action: { action_id: "init", parameters: {} },
    });
  }

  public static getInstance(): VoiceAssistant {
    if (!VoiceAssistant.instance) {
      VoiceAssistant.instance = new VoiceAssistant();
    }
    return VoiceAssistant.instance;
  }

  public setRouter(router: AppRouterInstance) {
    this.router = router;
  }

  public addCommandHandler(handler: CommandHandler) {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  public addMessageCallback(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  private notifyMessage(message: string) {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  public sendData(data: any) {
    this.assistant.sendData(data);
  }

  public getUserId(): string {
    return this.userId;
  }
}

export const getAssistant = VoiceAssistant.getInstance; 