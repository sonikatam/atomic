import type { Challenge, DailyCheckin, Goal } from '../types';
import { todayISO } from '../lib/utils';

function dateRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    dates.push(cursor.toISOString().slice(0, 10));
  }
  return dates;
}

export function isDayComplete(requiredGoals: Goal[], checkins: DailyCheckin[], userId: string, date: string) {
  if (requiredGoals.length === 0) return false;
  return requiredGoals.every((goal) =>
    checkins.some((checkin) => checkin.user_id === userId && checkin.goal_id === goal.id && checkin.checkin_date === date && checkin.completed),
  );
}

export function getRequiredCompleted(requiredGoals: Goal[], checkins: DailyCheckin[], userId: string, date: string) {
  return requiredGoals.filter((goal) =>
    checkins.some((checkin) => checkin.user_id === userId && checkin.goal_id === goal.id && checkin.checkin_date === date && checkin.completed),
  ).length;
}

export function calculateChallengeStreaks(challenge: Challenge, goals: Goal[], checkins: DailyCheckin[], userId: string) {
  const requiredGoals = goals.filter((goal) => goal.required);
  const today = todayISO();
  const dates = dateRange(challenge.start_date, today < challenge.end_date ? today : challenge.end_date);
  const completedDates = new Set(dates.filter((date) => isDayComplete(requiredGoals, checkins, userId, date)));

  let longestStreak = 0;
  let run = 0;
  for (const date of dates) {
    if (completedDates.has(date)) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else if (date < today) {
      run = 0;
    }
  }

  let cursorDate = completedDates.has(today) ? today : previousDate(today);
  let currentStreak = 0;
  while (completedDates.has(cursorDate)) {
    currentStreak += 1;
    cursorDate = previousDate(cursorDate);
  }

  return {
    currentStreak,
    longestStreak,
    completedDays: completedDates.size,
  };
}

export function calculateGoalStreak(goal: Goal, checkins: DailyCheckin[], userId: string) {
  let date = todayISO();
  let streak = 0;
  while (checkins.some((checkin) => checkin.goal_id === goal.id && checkin.user_id === userId && checkin.checkin_date === date && checkin.completed)) {
    streak += 1;
    date = previousDate(date);
  }
  return streak;
}

function previousDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  parsed.setDate(parsed.getDate() - 1);
  return parsed.toISOString().slice(0, 10);
}
