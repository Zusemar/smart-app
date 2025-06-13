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

function sanitizeForApiPath(str: string) {
  // Оставляем только буквы, цифры, дефис и подчёркивание
  return str.replace(/[^a-zA-Z0-9-_]/g, '');
}

class VoiceAssistant {
  private static instance: VoiceAssistant;
  private assistant: any;
  private handlers: CommandHandler[] = [];
  private router?: AppRouterInstance;
  private messageCallbacks: MessageCallback[] = [];
  private userId: string = '1';

  private constructor() {
    const state = {};
    const recoveryState = {};

    const initialize = (getState: any, getRecoveryState: any) => {
      if (process.env.NODE_ENV === "development") {
        return createSmartappDebugger({
          token: process.env.NEXT_PUBLIC_ASSISTANT_TOKEN!,
          initPhrase: process.env.NEXT_PUBLIC_ASSISTANT_INIT_PHRASE!,
          getState,
          getRecoveryState,
          nativePanel: {
            defaultText: "Помощь",
            screenshotMode: false,
            tabIndex: 0,
          },
        });
      }

      // return createAssistant({ getState, getRecoveryState });
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
              this.userId = sanitizeForApiPath(command.action.parameters.id);
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

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL;
} 

export const getAssistant = VoiceAssistant.getInstance; 