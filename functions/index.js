const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const TIME_ZONE = "Europe/Berlin";
const REMINDER_WINDOW_MINUTES = 5;
const REMINDER_TYPES = {
  workout: true,
  habit: true,
  coverage: true,
  restday: true,
};

function getLocalDateParts(date = new Date(), timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${byType.year}-${byType.month}-${byType.day}`,
    time: `${byType.hour}:${byType.minute}`,
    minutes: Number(byType.hour) * 60 + Number(byType.minute),
  };
}

function parseReminderMinutes(reminderTime) {
  if (typeof reminderTime !== "string" || !/^\d{2}:\d{2}$/.test(reminderTime)) return null;
  const [hour, minute] = reminderTime.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return hour * 60 + minute;
}

function isReminderDue(reminderTime, currentMinutes) {
  const targetMinutes = parseReminderMinutes(reminderTime);
  if (targetMinutes == null) return false;
  const delta = currentMinutes - targetMinutes;
  return delta >= 0 && delta < REMINDER_WINDOW_MINUTES;
}

function getEnabledTypes(data = {}) {
  return { ...REMINDER_TYPES, ...(data.types || {}) };
}

function normalizeTokens(data = {}) {
  return Array.from(new Set([
    ...(Array.isArray(data.tokens) ? data.tokens : []),
    ...(data.token ? [data.token] : []),
  ].filter(Boolean)));
}

function exerciseHasTrainingSignal(exercise = {}) {
  if (!exercise || typeof exercise !== "object") return false;
  if (exercise.done === true) return true;

  const noteFields = [exercise.notes, exercise.comment, exercise.feedback]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();
  if (/(done|completed|train|trained|workout|session|sent|yes|ja)/.test(noteFields)) return true;

  const numericFields = [exercise.sets, exercise.reps, exercise.weight, exercise.rpe, exercise.duration];
  if (numericFields.some((value) => Number(value) > 0)) return true;

  const setsArray = Array.isArray(exercise.setsArray) ? exercise.setsArray : [];
  return setsArray.some((set) => Number(set?.reps) > 0 || Number(set?.weight) > 0 || Number(set?.rpe) > 0);
}

async function getSessionsForDate(userRef, date) {
  const snap = await userRef.collection("sessions").where("date", "==", date).get();
  return snap.docs.map((doc) => doc.data() || {});
}

async function hasCompletedTrainingToday(userRef, date) {
  const sessions = await getSessionsForDate(userRef, date);
  return sessions.some((session) =>
    Array.isArray(session.exercises) && session.exercises.some((exercise) => exerciseHasTrainingSignal(exercise))
  );
}

async function getDaysSinceLastCompletedTraining(userRef, todayDate) {
  const snap = await userRef.collection("sessions").orderBy("date", "desc").limit(120).get();
  const today = new Date(`${todayDate}T12:00:00`);
  for (const doc of snap.docs) {
    const session = doc.data() || {};
    const date = session.date;
    if (!date) continue;
    const exercises = Array.isArray(session.exercises) ? session.exercises : [];
    if (!exercises.some((exercise) => exerciseHasTrainingSignal(exercise))) continue;
    const last = new Date(`${date}T12:00:00`);
    return Math.floor((today - last) / 86400000);
  }
  return null;
}

async function getOpenHabits(userRef, date) {
  const [habitsSnap, recordsSnap] = await Promise.all([
    userRef.collection("habits").get(),
    userRef.collection("habitRecords")
      .where("date", "==", date)
      .where("completion", "==", "DONE")
      .get(),
  ]);

  const doneIds = new Set(recordsSnap.docs.map((doc) => doc.data()?.habitId).filter(Boolean));
  return habitsSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
    .filter((habit) => !habit.deleted && !doneIds.has(habit.id))
    .map((habit) => habit.name || habit.id);
}

function buildReminderMessage({ hasWorkoutToday, openHabits, daysSinceLastTraining, types }) {
  if (types.workout && !hasWorkoutToday) {
    return {
      title: "VitalOS Fitness",
      body: "Heute ist noch kein Training geloggt. Wenn du trainiert hast, trag die Session kurz ein.",
      tab: "session",
      link: "/?tab=session",
      kind: "workout",
    };
  }

  if (types.habit && openHabits.length > 0) {
    const names = openHabits.slice(0, 3).join(", ");
    return {
      title: "VitalOS Habits",
      body: `Offene Habits heute: ${names}`,
      tab: "habits",
      link: "/?tab=habits",
      kind: "habit",
    };
  }

  if (types.restday && daysSinceLastTraining != null && daysSinceLastTraining >= 4) {
    return {
      title: "VitalOS Fitness",
      body: `Seit ${daysSinceLastTraining} Tagen ist keine Trainings-Session mit Signal geloggt.`,
      tab: "session",
      link: "/?tab=session",
      kind: "restday",
    };
  }

  return null;
}

async function sendReminder(pushRef, tokens, payload) {
  const message = {
    tokens,
    data: {
      title: payload.title,
      body: payload.body,
      tab: payload.tab,
      link: payload.link,
      kind: payload.kind,
    },
    android: {
      priority: "high",
      notification: {
        color: "#7e57c2",
        channelId: "default",
      },
    },
    webpush: {
      fcmOptions: {
        link: payload.link,
      },
      headers: {
        Urgency: "high",
      },
    },
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  const invalidTokens = response.responses
    .map((item, index) => ({ item, token: tokens[index] }))
    .filter(({ item }) => !item.success)
    .filter(({ item }) => {
      const code = item.error?.code || "";
      return code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token";
    })
    .map(({ token }) => token);

  if (invalidTokens.length > 0) {
    const remaining = tokens.filter((token) => !invalidTokens.includes(token));
    await pushRef.set({
      tokens: remaining,
      token: remaining[0] || null,
    }, { merge: true });
  }

  return response;
}

exports.scheduledPushReminders = functions.pubsub
  .schedule("every 5 minutes")
  .timeZone(TIME_ZONE)
  .onRun(async () => {
    const now = getLocalDateParts();
    functions.logger.info("Push check started", { date: now.date, time: now.time });

    const pushDocs = await admin
      .firestore()
      .collectionGroup("settings")
      .where("enabled", "==", true)
      .get();

    if (pushDocs.empty) {
      functions.logger.info("No enabled push settings found");
      return null;
    }

    for (const pushDoc of pushDocs.docs) {
      if (pushDoc.id !== "push") continue;

      const data = pushDoc.data() || {};
      const tokens = normalizeTokens(data);
      if (tokens.length === 0) continue;
      if (!isReminderDue(data.reminderTime || "18:00", now.minutes)) continue;

      const lastSentDate = data.last_sent_date || null;
      const lastSentKind = data.last_sent_kind || null;
      const types = getEnabledTypes(data);
      const userRef = pushDoc.ref.parent.parent;
      if (!userRef) continue;

      const [hasWorkoutToday, openHabits, daysSinceLastTraining] = await Promise.all([
        hasCompletedTrainingToday(userRef, now.date),
        types.habit ? getOpenHabits(userRef, now.date) : Promise.resolve([]),
        types.restday ? getDaysSinceLastCompletedTraining(userRef, now.date) : Promise.resolve(null),
      ]);

      const reminder = buildReminderMessage({
        hasWorkoutToday,
        openHabits,
        daysSinceLastTraining,
        types,
      });

      if (!reminder) continue;
      if (lastSentDate === now.date && lastSentKind === reminder.kind) continue;

      const response = await sendReminder(pushDoc.ref, tokens, reminder);
      await pushDoc.ref.set({
        last_sent_at: admin.firestore.FieldValue.serverTimestamp(),
        last_sent_date: now.date,
        last_sent_kind: reminder.kind,
        token: tokens[0] || null,
        tokens,
      }, { merge: true });

      functions.logger.info("Push reminder sent", {
        uid: userRef.id,
        kind: reminder.kind,
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    }

    return null;
  });
