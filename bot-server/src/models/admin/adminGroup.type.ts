import { AdminBroadcaster } from "./adminBroadcaster.type";
import { AdminSettings } from "./adminSettings.type";

export interface AdminGroup {
  id: string;
  admin_user_id: string;
  group_list: any[];
  login_email: string;
  login_password: string;
  created_at: Date;
  updated_at: Date;
  admin_broadcaster: AdminBroadcaster;
  admin_settings: AdminSettings;
}
