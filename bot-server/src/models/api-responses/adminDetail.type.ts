import { AdminGroup } from "../../admin/admin-group";

export interface AdminDetailResponse {
  success: boolean;
  msg: string;
  group: AdminGroup;
  status: number;
}
