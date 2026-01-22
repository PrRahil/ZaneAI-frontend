export function explainCron(cron: string): string {
    if (!cron) return "";

    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5) return "Invalid cron format";

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const getHour = (h: string) => {
        if (h === "*") return "every hour";
        const num = parseInt(h);
        if (isNaN(num)) return h;
        const ampm = num >= 12 ? "PM" : "AM";
        const hour12 = num % 12 || 12;
        return `${hour12} ${ampm}`;
    };

    const getMinute = (m: string) => {
        if (m === "*") return "every minute";
        if (m === "0") return "00";
        return m.length === 1 ? `0${m}` : m;
    };

    const getMonth = (m: string) => {
        if (m === "*") return "";
        const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const num = parseInt(m);
        if (!isNaN(num) && num >= 1 && num <= 12) return `in ${months[num]}`;
        return `in month ${m}`;
    };

    const getDayOfWeek = (d: string) => {
        if (d === "*" || d === "?") return "";
        const days = ["Unknown", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; // Usually cron 0-6 or 1-7, mapped roughly here for simplicity or needs adjustment based on system cron (0=Sun usually)
        // Let's assume standard: 0=Sun, 1=Mon...
        const standardDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const num = parseInt(d);
        if (!isNaN(num) && num >= 0 && num <= 6) return `on ${standardDays[num]}`;
        return `on day ${d}`;
    };

    const getDayOfMonth = (d: string) => {
        if (d === "*") return "";
        return `on day ${d} of the month`;
    };

    const timeStr = getHour(hour) === "every hour" ? "Every hour" : `At ${getHour(hour).split(' ')[0]}:${getMinute(minute)} ${getHour(hour).split(' ')[1]}`;

    let result = timeStr;

    if (dayOfMonth !== "*" && dayOfWeek === "*") result += ` ${getDayOfMonth(dayOfMonth)}`;
    if (dayOfWeek !== "*" && dayOfWeek !== "?") result += ` ${getDayOfWeek(dayOfWeek)}`;
    if (month !== "*") result += ` ${getMonth(month)}`;

    return result;
}
