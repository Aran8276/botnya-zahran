export interface Broadcaster {
  id: string;
  group_id: string;
  motd_enabled: boolean;
  motd: null | string;
  motd_time: Date | null | string;
  pfpslide_enabled: boolean;
  pfp_slide: null | string;
  pfp_slide_interval: number | null;
  created_at: Date;
  updated_at: Date;
}
