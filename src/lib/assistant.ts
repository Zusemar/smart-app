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

  private constructor() {
    const state = {};
    const recoveryState = {};

    const initialize = (getState: any, getRecoveryState: any) => {
      if (process.env.NODE_ENV === "development") {
        return createSmartappDebugger({
          token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJiNmNkOTlhZC03ZTM0LTQxNTgtOTU1NS00OTQxOWM5MTQwOWEiLCJzdWIiOiJmZjAwMTYxNWFmOWVkMTExNDgyMGE3OGFkMzAzYzc1MGU5MTEwOTUyN2RhNTAwNTBmYzBiZDY2NWE2Y2JiMDQ4M2IxNTYiLCJpc3MiOiJLRVlNQVNURVIiLCJleHAiOjE3NDk4MjAyNzMsImF1ZCI6IlZQUyIsInVzciI6IjBhMjY2ZjI2LTJjZmEtNDA5ZC1iOGJjLWM0OWVjZjFjZjliNiIsImlhdCI6MTc0OTczMzg2Mywic2lkIjoiMmY0MjVhOGYtNGZjNy00MzcxLTllMjUtZjY0NjU0NTQ4MmFkIn0.jJv2PkroL_deh-6k96ynm2havERiZqd5t-Z3TKXr21xAgChrBVVIM4-HDdXpKrPA54udn8vg1HbsOdwkZgmbfLD3pMM_AqGzv104k1j6KBsmMprOPuFX3YMZ4wLf1vGq4uDBkhE4xg0lDYlhchrqwP6Nd_805O_aA0ZlL4j6LZCRh5KMfgHz2cVfeBnGApHVSpDbgKBISTxlfZUgavrplEuX7nwVagIVj1cz7H77lT7GSuhxZzPuUIBNlLRUfzrARSXnwZnQx8WO_VINFCH6qWSKiGM9TtOxqt0FpF1Fgm_exUI-bpLPId1bV9DnWq9Xl7dUeplhPPUUmqCa86WwSWxZWLrh-waXST7ywrpzM0hlIRXKBw2eDTyIyUe9luQVwwh-_Hgkam0Z2lavXzmbqlhZ7arR1SA1yzBx-0MoHmNNynIx_OjicToLMICg6vD8y3UJN9AJrosiKxYxIH1_XdENI044QWe8XpSGyfZW-EU7zFx7gzCaWkJkOESoxK_pX6SkDjT4u--TmjVa1boDQkperSHU0YAsTaH9HxrvsPhlgcj6X7vGuQUgZXYaeN38WPFLRnL3fAjwyaPFKDE-VobRAxU0QoPdmEDIgdyJTW-KIUcdoa6xoZkqiqdOJs4gEMchTsIKmoNtnGyxI-LpRi5jQSMFAVXGS4vj5TfmV4o",
          initPhrase: "Запусти smart-app",
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
          case "fallback":
            this.notifyMessage(
              "Скажи, например, 'начни тренировку', 'покажи тренировки' или 'открой базу упражнений'."
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
}

export const getAssistant = VoiceAssistant.getInstance; 