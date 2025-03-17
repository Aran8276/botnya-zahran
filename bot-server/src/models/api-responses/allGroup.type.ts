import { Group } from "../../group/group";

export interface AllGroupsResponse {
  success: boolean;
  msg: string;
  groups: Group[];
  status: number;
}
