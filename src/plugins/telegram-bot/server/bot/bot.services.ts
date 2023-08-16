import { Strapi } from "@strapi/strapi";
import { env } from "@strapi/utils";
import TelegramBot, { Message } from "node-telegram-bot-api";

class Bot {
  private bot: TelegramBot | null;

  constructor(private strapi: Strapi, private token: string) {
    this.bot = this.token
      ? new TelegramBot(this.token, { polling: true })
      : null;

    this.connectListeners();
  }

  private connectListeners() {
    if (!this.bot) return;

    // Set up bot listeners and commands here
    this.bot.onText(
      /\/start/,
      async (msg) => await this.handleOnText(msg, true)
    );

    this.bot.onText(
      /^(?!\/start).*/,
      async (msg) => await this.handleOnText(msg, false)
    );

    // Add more listeners and commands as needed
  }

  private async handleOnText(msg: Message, isStart = false) {
    if (!this.bot) throw "No connect bot";

    const { text = "" } = msg;
    const { id: chatId, first_name = "", last_name = "" } = msg.chat;

    if (!isStart) {
      this.bot.sendMessage(chatId, "This bot only sends messages.");
      return;
    }

    const message = await this.registerChat({
      chatId: chatId.toString(),
      clientName: `${first_name} ${last_name}`,
      lastMessage: text,
      isSendInformation: false,
    });

    this.bot.sendMessage(chatId, message);
  }

  private async registerChat(data): Promise<string> {
    try {
      const { chatId } = data;

      const chats = await strapi
        .plugin("telegram-bot")
        .service("telegramServices")
        .find({ filters: { chatId } });

      if (chats.length !== 0) return "You are already registered";

      await strapi
        .plugin("telegram-bot")
        .service("telegramServices")
        .create(data);
    } catch (err) {
      return "Chat registration error";
    }

    return "You are registered";
  }

  public async sendMessageToAdmins(message: string) {
    if (!this.bot) throw "No connect bot";

    const adminChats = await strapi
      .plugin("telegram-bot")
      .service("telegramServices")
      .find({ filters: { isSendInformation: true } });

    if (adminChats.length === 0) throw "No recipients found";

    const arrayOfPromises = adminChats.map((chat) => {
      return this.bot!.sendMessage(chat.chatId, message);
    });

    await Promise.all(arrayOfPromises);

    return { result: "Message send" };
  }

  public async sendMessage(chatId: string, message: string) {
    if (!this.bot) throw "No connect bot";

    await this.bot.sendMessage(chatId, message);
  }
}

export default ({ strapi }: { strapi: Strapi }) => {
  const token = env("TELEGRAM_TOKEN", "") || "";
  const bot = new Bot(strapi, token);

  return bot;
};
