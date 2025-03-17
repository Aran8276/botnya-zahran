import { Group } from "../../group/group";

export interface GroupDetailResponse {
  success: boolean;
  msg: string;
  group: Group;
  status: number;
}
