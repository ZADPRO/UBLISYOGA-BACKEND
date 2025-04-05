import cron from "node-cron";
import { BatchRepository } from "../api/batch/dailyBatch-repository";
import { CurrentTime } from "../helper/common";

export const startCronJobs = () => {
  cron.schedule("0 10 * * *", async () => {
    console.log("Running daily batch job at 9:00 AM", CurrentTime());

    try {
      const batchRepo1 = new BatchRepository();
      await batchRepo1.BirthdayRepositoryV1();
      const batchRepo2 = new BatchRepository();
      await batchRepo2.WeedingWishRepositoryV1();
      console.log("Daily batch job completed successfully", CurrentTime());
    } catch (error) {
      console.error("Error in daily batch job:", error, CurrentTime());
    }
  });

  cron.schedule("*/10 * * * *", async () => {
    console.log("Running batch job every 10 Minutes", CurrentTime());
    try {
      const googleAttendanceBatch = new BatchRepository();
      await googleAttendanceBatch.googleMeetAttendanceV1();
    } catch (error) {
      console.log("Error in Running the !0 mins Batch Program", CurrentTime());
    }
  });
};
