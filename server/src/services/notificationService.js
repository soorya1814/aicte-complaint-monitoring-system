import { Notification } from '../models/Notification.js';

export const createNotification = async ({
  recipientId,
  complaintId,
  referenceId,
  title,
  message,
  type = 'SYSTEM',
}) => {
  try {
    if (!recipientId) return null;

    const notification = await Notification.create({
      recipient: recipientId,
      complaint: complaintId,
      referenceId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
    });

    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
};

export const notifyUsers = async (recipients, notificationData) => {
  try {
    const promises = recipients
      .filter(Boolean)
      .map((recipientId) => createNotification({ ...notificationData, recipientId }));
    return await Promise.all(promises);
  } catch (error) {
    console.error('[NotificationService] Failed to dispatch multi-user notifications:', error.message);
  }
};
