export const getMarketStatus = () => {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const utcDay = now.getUTCDay(); // 0=Sun, 6=Sat
  const utcMins = utcHour * 60 + utcMin;

  const isWeekend = utcDay === 0 || utcDay === 6;

  // NYSE: 13:30–20:00 UTC (9:30am–4:00pm EST)
  const nyseOpen = isWeekend ? false : utcMins >= 810 && utcMins < 1200;
  // London: 08:00–16:30 UTC
  const londonOpen = isWeekend ? false : utcMins >= 480 && utcMins < 990;
  // Metals trade nearly 24h on weekdays
  const metalsOpen = !isWeekend;

  return {
    nyse: { open: nyseOpen, label: "NYSE" },
    london: { open: londonOpen, label: "London" },
    metals: { open: metalsOpen, label: "Metals" },
    anyOpen: nyseOpen || londonOpen || metalsOpen,
  };
};
