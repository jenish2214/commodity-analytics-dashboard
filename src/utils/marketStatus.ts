export const getMarketStatus = () => {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const utcDay = now.getUTCDay(); // 0=Sun, 6=Sat
  const utcMins = utcHour * 60 + utcMin;

  const isWeekend = utcDay === 0 || utcDay === 6;

  // NYSE: 13:30–20:00 UTC (9:30am–4:00pm EST) -> 810 to 1200
  let nyseOpen = false;
  let nyseMinsToOpen = 0;
  let nyseMinsToClose = 0;
  
  if (!isWeekend) {
    if (utcMins >= 810 && utcMins < 1200) {
      nyseOpen = true;
      nyseMinsToClose = 1200 - utcMins;
    } else if (utcMins < 810) {
      nyseMinsToOpen = 810 - utcMins;
    } else {
      // It's after close, next open is tomorrow (or Monday if Friday)
      const daysUntilNextOpen = utcDay === 5 ? 3 : 1; 
      nyseMinsToOpen = (1440 - utcMins) + ((daysUntilNextOpen - 1) * 1440) + 810;
    }
  } else {
    // Weekend logic for NYSE
    const daysUntilNextOpen = utcDay === 6 ? 2 : 1;
    nyseMinsToOpen = (1440 - utcMins) + ((daysUntilNextOpen - 1) * 1440) + 810;
  }

  // London: 08:00–16:30 UTC -> 480 to 990
  let londonOpen = false;
  let londonMinsToOpen = 0;
  let londonMinsToClose = 0;

  if (!isWeekend) {
    if (utcMins >= 480 && utcMins < 990) {
      londonOpen = true;
      londonMinsToClose = 990 - utcMins;
    } else if (utcMins < 480) {
      londonMinsToOpen = 480 - utcMins;
    } else {
      const daysUntilNextOpen = utcDay === 5 ? 3 : 1; 
      londonMinsToOpen = (1440 - utcMins) + ((daysUntilNextOpen - 1) * 1440) + 480;
    }
  } else {
    const daysUntilNextOpen = utcDay === 6 ? 2 : 1;
    londonMinsToOpen = (1440 - utcMins) + ((daysUntilNextOpen - 1) * 1440) + 480;
  }

  // Metals trade nearly 24h on weekdays
  const metalsOpen = !isWeekend;

  const formatText = (open: boolean, toOpen: number, toClose: number) => {
    if (open) {
      if (toClose <= 60) return `Closes in ${toClose}m`;
      return "Open";
    } else {
      if (toOpen < 60) return `Opens in ${toOpen}m`;
      if (toOpen < 1440) return `Opens in ${Math.floor(toOpen/60)}h ${toOpen%60}m`;
      return "Closed";
    }
  };

  return {
    nyse: { 
      open: nyseOpen, 
      label: "NYSE", 
      minsToOpen: nyseMinsToOpen, 
      minsToClose: nyseMinsToClose,
      statusText: formatText(nyseOpen, nyseMinsToOpen, nyseMinsToClose)
    },
    london: { 
      open: londonOpen, 
      label: "London", 
      minsToOpen: londonMinsToOpen, 
      minsToClose: londonMinsToClose,
      statusText: formatText(londonOpen, londonMinsToOpen, londonMinsToClose)
    },
    metals: { 
      open: metalsOpen, 
      label: "Metals",
      statusText: metalsOpen ? "Open" : "Closed"
    },
    anyOpen: nyseOpen || londonOpen || metalsOpen,
  };
};
