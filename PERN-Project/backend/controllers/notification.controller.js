import { prisma } from "../config/db.js";

export const getNotifications = async (req, res) => {
  const userId = req.user.userId;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

export const markAllAsRead = async (req, res) => {
  const userId = req.user.userId;
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};
