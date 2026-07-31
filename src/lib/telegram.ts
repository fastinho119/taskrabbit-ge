/**
 * Telegram notification hooks for TaskRabbit GE.
 * Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local
 */

export interface TelegramNotificationPayload {
  type: "new_task" | "task_accepted" | "task_completed" | "new_review";
  taskId?: string;
  title?: string;
  district?: string;
  category?: string;
  price?: number;
  handymanName?: string;
  customerName?: string;
  rating?: number;
}

function formatMessage(payload: TelegramNotificationPayload): string {
  switch (payload.type) {
    case "new_task":
      return `🆕 *ახალი დავალება*\n\n📋 ${payload.title}\n📍 ${payload.district}\n🏷 ${payload.category}\n💰 ₾${payload.price}\n\n[ID: ${payload.taskId}]`;
    case "task_accepted":
      return `✅ *დავალება მიღებულია*\n\n📋 ${payload.title}\n👷 ${payload.handymanName}\n\n[ID: ${payload.taskId}]`;
    case "task_completed":
      return `🎉 *დავალება დასრულდა*\n\n📋 ${payload.title}\n👷 ${payload.handymanName}\n💰 ₾${payload.price}\n\n[ID: ${payload.taskId}]`;
    case "new_review":
      return `⭐ *ახალი შეფასება*\n\n👷 ${payload.handymanName}\n⭐ ${payload.rating}/5\n\n[ID: ${payload.taskId}]`;
    default:
      return `📢 TaskRabbit GE notification`;
  }
}

/** Send a Telegram notification. Returns true if sent, false if not configured or failed. */
export async function sendTelegramNotification(
  payload: TelegramNotificationPayload
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("[Telegram] Not configured — skipping notification:", payload.type);
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formatMessage(payload),
          parse_mode: "Markdown",
        }),
      }
    );

    if (!response.ok) {
      console.error("[Telegram] Failed to send:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Telegram] Error:", error);
    return false;
  }
}

/** Hook: call when a new task is posted */
export async function notifyNewTask(task: {
  id: string;
  title: string;
  district: string;
  categoryName: string;
  estimatedPrice: number;
}) {
  return sendTelegramNotification({
    type: "new_task",
    taskId: task.id,
    title: task.title,
    district: task.district,
    category: task.categoryName,
    price: task.estimatedPrice,
  });
}

/** Hook: call when a handyman accepts a task */
export async function notifyTaskAccepted(task: {
  id: string;
  title: string;
  handymanName: string;
}) {
  return sendTelegramNotification({
    type: "task_accepted",
    taskId: task.id,
    title: task.title,
    handymanName: task.handymanName,
  });
}

/** Hook: call when a task is completed */
export async function notifyTaskCompleted(task: {
  id: string;
  title: string;
  handymanName: string;
  finalPrice: number;
}) {
  return sendTelegramNotification({
    type: "task_completed",
    taskId: task.id,
    title: task.title,
    handymanName: task.handymanName,
    price: task.finalPrice,
  });
}

/** Hook: call when a customer leaves a review */
export async function notifyNewReview(review: {
  taskId: string;
  handymanName: string;
  rating: number;
}) {
  return sendTelegramNotification({
    type: "new_review",
    taskId: review.taskId,
    handymanName: review.handymanName,
    rating: review.rating,
  });
}
