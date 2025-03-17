import { Broadcaster } from "./broadcaster.type";
import { GroupSettings } from "./groupSettings.type";

export interface Group {
  id: string;
  group_user_id: string;
  group_name: string;
  has_password: number;
  group_pfp: string;
  participants: Participant[];
  created_at: Date;
  updated_at: Date;
  broadcaster: Broadcaster;
  group_settings: GroupSettings;
}
