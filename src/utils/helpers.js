export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export const getDateKey = (date = new Date()) => {
  return formatDate(date);
};

export const getDayName = (date) => {
  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) return "Today";

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
};

export const getColorForMood = (colorName) => {
  const colors = {
    green: "#10b981",
    yellow: "#f59e0b",
    blue: "#3b82f6",
    orange: "#f97316",
    red: "#ef4444",
    purple: "#a855f7",
  };
  return colors[colorName] || colors.green;
};

export const getMoodLabel = (colorName) => {
  const labels = {
    green: "Calm",
    yellow: "Hopeful",
    blue: "Tired",
    orange: "Motivated",
    red: "Stressed",
    purple: "Confused",
  };
  return labels[colorName] || "Unknown";
};

export const calculateStreak = async (storage) => {
  const lastMoodDate = await storage.getLastMoodDate();
  const today = getDateKey();
  const yesterday = getDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  let currentStreak = await storage.getStreakCount();

  if (!lastMoodDate) {
    // First time tracking
    await storage.updateStreakCount(1);
    await storage.updateLastMoodDate(today);
    return 1;
  }

  if (lastMoodDate === today) {
    // Already tracked today
    return currentStreak;
  }

  if (lastMoodDate === yesterday) {
    // Consecutive day
    currentStreak += 1;
  } else {
    // Streak broken
    currentStreak = 1;
  }

  await storage.updateStreakCount(currentStreak);
  await storage.updateLastMoodDate(today);
  return currentStreak;
};

export const getWeekDates = () => {
  const today = new Date();
  const dates = [];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }

  return dates;
};
