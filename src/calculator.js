// Minecraft Name Drop & Grace Period Calculator
// Accurately computes 30-day grace and 37-day public drop schedules in User's Local Time

export class DropCalculator {
  static calculateDropSchedule(changedDate, mode = 'standard_37') {
    const baseDate = new Date(changedDate);
    if (isNaN(baseDate.getTime())) {
      throw new Error('Invalid base timestamp');
    }

    const gracePeriodMs = 30 * 24 * 60 * 60 * 1000;
    const publicDropMs = (mode === 'account_delete_30' ? 30 : 37) * 24 * 60 * 60 * 1000;

    const graceEndTime = new Date(baseDate.getTime() + gracePeriodMs);
    const dropTime = new Date(baseDate.getTime() + publicDropMs);
    const now = Date.now();
    const remainingMs = dropTime.getTime() - now;

    return {
      baseDate,
      graceEndTime,
      dropTime,
      remainingMs,
      isExpired: remainingMs <= 0,
      mode
    };
  }

  // Formats in user's local time with clear timezone designation and UTC tooltip
  static formatLocalTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const localStr = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(d);

    const utcStr = d.toUTCString().split(' ').slice(1, 5).join(' ') + ' UTC';
    return { localStr, utcStr };
  }
}
