import * as Hapi from "@hapi/hapi";
import {
  UserRouters,
  UserProfile,
  StaffRoutes,
  DirectorRoutes,
  UserPageRoutes,
  BatchProgram,
  Finance,
  Testing,
  Notes,
  Settings,
  FutureClients,
  StudentFees,
  ForgotPassword,
  Attendance,
  UserPayment,
  trailVideo,
  ClassInfo,
  GoogleWorkSpace,
} from "./api/routes";
// import StaffRoutes from "./api/staff/routes";

export default class Router {
  public static async loadRoutes(server: Hapi.Server): Promise<any> {
    await new UserRouters().register(server);
    await new UserProfile().register(server);
    await new StaffRoutes().register(server);
    await new DirectorRoutes().register(server);
    await new UserPageRoutes().register(server);
    await new BatchProgram().register(server);
    await new Finance().register(server);
    await new Notes().register(server);
    await new Settings().register(server);
    await new FutureClients().register(server);
    await new StudentFees().register(server);
    await new ForgotPassword().register(server);
    await new Attendance().register(server);
    await new trailVideo().register(server);
    await new UserPayment().register(server);
    await new GoogleWorkSpace().register(server);
    await new ClassInfo().register(server);
    await new Testing().register(server);
  }
}
