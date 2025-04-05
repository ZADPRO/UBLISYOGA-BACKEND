import { parse } from "date-fns";

export function generateCouponCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let couponCode = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters[randomIndex];
  }

  return couponCode;
}

export const ServerTime = (): Date => {
  const Time = new Date();
  const timeDiff = parseInt(process.env.TIME_DIFF_MINUTES || "0", 10);
  Time.setMinutes(Time.getMinutes() + timeDiff);
  return Time;
};

export const getAdjustedTime = (): string => {
  const serverTime = new Date();
  serverTime.setMinutes(serverTime.getMinutes() + 330);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-IN", options).format(serverTime);
};

export const CurrentTime = (): string => {
  const systemTime = new Date();

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-IN", options).format(systemTime);
};

export function formatDate(isoDate: any) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

export function formatDate_Time(isoDate: any) {
  const date = new Date(isoDate);

  // Get date components
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  // Get time components
  let hours = date.getHours();
  let minutes = String(date.getMinutes()).padStart(2, "0");
  let seconds = String(date.getSeconds()).padStart(2, "0");

  // Convert hours to 12-hour format and determine AM/PM
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Format the time
  const time = `${hours}:${minutes}:${seconds} ${ampm}`;

  // Return the final formatted date and time
  return `${day}/${month}/${year}, ${time}`;
}

export const convertToFormattedDateTime = (input: string): string => {
  const [date, time] = input.split(", ");
  const [day, month, year] = date.split("/");
  const [rawHours, minutes, seconds] = time.split(":");
  const period = time.includes("PM") ? "PM" : "AM";

  let hours = parseInt(rawHours, 10);
  if (period === "PM" && hours < 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const shortYear = year.slice(-2);

  return `${day}${month}${shortYear}${String(hours).padStart(
    2,
    "0"
  )}${minutes}`;
};

export function timeFormat(Time: string) {
  // Split input string into start and end time
  const [startTimeString, endTimeString] = Time.split(" to ");

  // Function to convert 24-hour time to 12-hour format
  const formatTo12Hour = (timeString: string) => {
    const [time, modifier] = timeString.trim().split(" "); // Split time and AM/PM
    let [hours, minutes] = time.split(":").map(Number);

    // Ensure hours stay within 1-12 for 12-hour format
    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    // Return formatted time
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${modifier}`;
  };

  // Format start and end times
  const startTime = formatTo12Hour(startTimeString);
  const endTime = formatTo12Hour(endTimeString);

  // Return both formatted times as an object
  return { startTime, endTime };
}

export function generateClassDurationString(
  refClassCount: number,
  refMonthDuration: number
): string {
  return `${refClassCount} Class${
    refClassCount > 1 ? "es" : ""
  } in ${refMonthDuration} Month${refMonthDuration > 1 ? "s" : ""} Duration`;
}

// function parseTime(timeStr: string): Date {
//   const [time, modifier] = timeStr.split(" ");
//   let [hours, minutes] = time.split(":").map(Number);

//   if (modifier === "PM" && hours !== 12) {
//     hours += 12;
//   } else if (modifier === "AM" && hours === 12) {
//     hours = 0;
//   }

//   const date = new Date();
//   date.setHours(hours, minutes, 0, 0);
//   return date;
// }

export function getMatchingData(
  registerCount: any[],
  passedDateTime: string
): any | null {
  const passedTimeStr = passedDateTime.split(", ")[1];
  const passedTime = parseTime(
    passedTimeStr.split(":").slice(0, 2).join(":") +
      " " +
      passedTimeStr.split(" ")[1]
  );

  let selectedData = null;

  for (let item of registerCount) {
    const [startTimeStr, endTimeStr] = item.refTime.split(" to ");
    const startTime = parseTime(startTimeStr);
    const endTime = parseTime(endTimeStr);

    if (passedTime >= startTime && passedTime <= endTime) {
      selectedData = item;
      break;
    }
  }

  if (!selectedData) {
    for (let item of [...registerCount].reverse()) {
      const [startTimeStr, endTimeStr] = item.refTime.split(" to ");
      const endTime = parseTime(endTimeStr);

      if (passedTime > endTime) {
        selectedData = item;
        break;
      }
    }
  }

  if (!selectedData) {
    for (let item of registerCount) {
      const [startTimeStr] = item.refTime.split(" to ");
      const startTime = parseTime(startTimeStr);

      if (passedTime < startTime) {
        selectedData = item;
        break;
      }
    }
  }

  return selectedData;
}

function parseTime(timeStr: string): number {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

export function generateDateArray(
  fromMonthYear: string,
  toMonthYear: string
): string[] {
  const dateArray: string[] = [];
  const fromParts = fromMonthYear.split("/");
  const toParts = toMonthYear.split("/");

  const fromYear = parseInt(fromParts[1], 10);
  const fromMonth = parseInt(fromParts[0], 10) - 1; // Months are 0-based in JS
  const toYear = parseInt(toParts[1], 10);
  const toMonth = parseInt(toParts[0], 10) - 1;

  let currentDate = new Date(fromYear, fromMonth, 1); // Start from the first day
  const endDate = new Date(toYear, toMonth + 1, 0); // Include all days in the 'To' month

  while (currentDate <= endDate) {
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = currentDate.getFullYear();

    // Use the required time for each date
    const formattedDate = `${day}/${month}/${year}, 3:45:30 PM`;
    dateArray.push(formattedDate);

    currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
  }

  return dateArray;
}

export function getDateRange(monthYearRange: string) {
  const [startMonthYear, endMonthYear] = monthYearRange
    .split(",")
    .map((str) => str.trim());

  const [startMonth, startYear] = startMonthYear
    .split("/")
    .map((num) => parseInt(num));
  const [endMonth, endYear] = endMonthYear
    .split("/")
    .map((num) => parseInt(num));

  const startDate = new Date(startYear, startMonth - 1, 1);

  const endDate = new Date(endYear, endMonth, 0);

  const formatDate = (date: any) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}/${month}/${year}, ${String(hours).padStart(
      2,
      "0"
    )}:${minutes}:${seconds} ${ampm}`;
  };

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return [formatDate(startDate), formatDate(endDate)];
}

export function mapAttendanceData(userMapData: any[]) {
  // const groupedData = userMapData.reduce((acc, curr) => {
  //   const {
  //     refTimeId,
  //     refTime,
  //     refSCustId,
  //     refStFName,
  //     refStLName,
  //     date,
  //     time,
  //     mode,
  //     refCtMobile,
  //   } = curr;
  //   if (!acc[refTimeId]) {
  //     acc[refTimeId] = { refTimeId, refTime, users: [] };
  //   }
  //   if (refSCustId) {
  //     let user = acc[refTimeId].users.find(
  //       (user: any) => user.refSCustId === refSCustId
  //     );
  //     if (!user) {
  //       user = {
  //         refSCustId,
  //         refStFName,
  //         refStLName,
  //         refCtMobile,
  //         attendance: [],
  //       };
  //       acc[refTimeId].users.push(user);
  //     }
  //     user.attendance.push(`${date}, ${time}`);
  //   }

  //   return acc;
  // }, {});

  const groupedData = userMapData.reduce((acc, curr) => {
    const {
      refTimeId,
      refTime,
      refSCustId,
      refStFName,
      refStLName,
      date,
      time,
      mode,
      refCtMobile,
    } = curr;
  
    if (!acc[refTimeId]) {
      acc[refTimeId] = { refTimeId, refTime, users: [] };
    }
  
    if (refSCustId) {
      let user = acc[refTimeId].users.find(
        (user: any) => user.refSCustId === refSCustId
      );
  
      if (!user) {
        user = {
          refSCustId,
          refStFName,
          refStLName,
          refCtMobile,
          attendance: [],
        };
        acc[refTimeId].users.push(user);
      }
  
      // Push attendance as an object with time and mode
      user.attendance.push({ time: `${date}, ${time}`, mode: mode });
    }
  
    return acc;
  }, {});
  
  return Object.values(groupedData);
}

type AttendanceCount = {
  reftime: string;
  refTimeId: string | number;
  [key: string]: any;
};

export async function  findNearestTimeRange(
  genderCount: AttendanceCount[],
  todayDate: string
) {
  function convertToMinutes(timeString: string): number {
    const [hour, minute] = timeString.split(":");
    const ampm = timeString.split(" ")[1]?.toUpperCase();
    let hours = parseInt(hour);

    if (!ampm) {
      console.error(`Invalid time format: ${timeString}`);
      return NaN;
    }

    if (ampm === "PM" && hours !== 12) hours += 12; // Convert PM hours
    if (ampm === "AM" && hours === 12) hours = 0; // Convert 12 AM to 0 hours
    return hours * 60 + parseInt(minute);
  }

  function parseCustomDate(dateString: string): Date | null {
    const dateTimeRegex =
      /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2}) (\w{2})$/;
    const match = dateString.match(dateTimeRegex);

    if (!match) {
      console.error(`Invalid todayDate format: ${dateString}`);
      return null;
    }

    const [, day, month, year, hours, minutes, seconds, period] = match;

    // Convert to 24-hour time
    let hour = parseInt(hours, 10);
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      hour,
      parseInt(minutes, 10),
      parseInt(seconds, 10)
    );
  }

  const parsedDate = parseCustomDate(todayDate);
  if (!parsedDate) {
    return null;
  }

  const todayHours = parsedDate.getHours();
  const todayMinutes = parsedDate.getMinutes();
  const todayTotalMinutes = todayHours * 60 + todayMinutes;

  let nearestTimeRange: AttendanceCount | null = null;
  let minDifference = Infinity;

  genderCount.forEach((item) => {
    if (!item.reftime || !item.reftime.includes("to")) {
      console.error(`Invalid reftime format: ${item.reftime}`);
      return;
    }

    const [startTime, endTime] = item.reftime
      .split("to")
      .map((str) => str.trim());
    const startMinutes = convertToMinutes(startTime);

    if (isNaN(startMinutes)) {
      console.error(`Failed to parse startTime: ${startTime}`);
      return;
    }

    const diff = Math.abs(todayTotalMinutes - startMinutes);

    console.log("item.reftime", item.reftime);

    if (diff < minDifference) {
      minDifference = diff;
      nearestTimeRange = item;
    }
  });

  return nearestTimeRange;
}

interface MeetParam {
  name: string;
  value?: string;
  boolValue?: boolean;
  intValue?: number;
}

// export function extractMeetData(params: MeetParam[]) {
//   return {
//     name:
//       params.find((param) => param.name === "display_name")?.value || "Unknown",
//     email:
//       params.find((param) => param.name === "identifier")?.value || "Unknown",
//     joinedTime:
//       params.find((param) => param.name === "start_timestamp_seconds")
//         ?.intValue || "N/A",
//     duration:
//       params.find((param) => param.name === "duration_seconds")?.intValue || 0,
//   };
// }

export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", // Convert to IST
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // AM/PM format
  });
};
