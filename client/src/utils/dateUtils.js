// Date utility functions for formatting and display

// format date for html5 input fields (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear(); // 4-digit
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// format date with day for display
export const formatDateWithDay = (dateString) => {
  const date = new Date(dateString);
  const day = date.toLocaleDateString("en-GB", { weekday: "long" });
  const formattedDate = date.toLocaleDateString("en-GB");
  return `${day}, ${formattedDate}`;
};

// format time for display
export const formatTimeRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const startStr = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endStr = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startStr} - ${endStr}`;
};

// in js, jan is month 0, feb is month 1, ..., dec is month 11
// https://www.w3schools.com/js/js_date_methods.asp
