export interface Datum {
  id: string;
  case: string;
  reply: string;
  images: null;
  created_at: Date;
  updated_at: Date;
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}

export interface GroupPermissionCheckResponse {
  success: boolean;
  msg: string;
  groupid: string;
  status: number;
}

export interface DeleteAdminBroadcastPfpSlide {
  success: boolean;
  msg: string;
  status: number;
}

export interface ChangeAdminBroadcastResponse {
  success: boolean;
  msg: string;
  status: number;
}

export interface ChangeAdminSettingsResponse {
  success: boolean;
  msg: string;
  status: number;
}

export interface AdminGroupsResponse {
  success: boolean;
  msg: string;
  groups: Group[];
  status: number;
}

export interface Participant {
  id: ID;
  isMe: boolean;
  name?: string;
  type: string;
  image?: string;
  isUser: boolean;
  number: string;
  isGroup: boolean;
  pushname: string;
  isBlocked: boolean;
  shortName?: string;
  isBusiness: boolean;
  isMyContact: boolean;
  isWAContact: boolean;
  isEnterprise?: boolean;
  verifiedName?: string;
  verifiedLevel?: number;
  businessProfile?: BusinessProfile;
}

export interface Category {
  id: string;
  localized_display_name: string;
}

export interface ID {
  user: string;
  server: Server;
  _serialized: string;
}

export interface ProfileOptions {
  cartEnabled: boolean;
  commerceExperience: string;
}

export interface Website {
  url: string;
}

export interface AdminDetailsResponse {
  success: boolean;
  msg: string;
  group: Group;
  status: number;
}

export interface Group {
  id: string;
  admin_user_id: string;
  login_email: string;
  login_password: string;
  created_at: Date;
  updated_at: Date;
  admin_broadcaster: AdminBroadcaster;
  admin_settings: AdminSettings;
}

export interface AdminBroadcaster {
  id: string;
  admin_id: string;
  pfpslide_enabled: boolean;
  pfpslide: string;
  pfpslide_interval: number;
  created_at: Date;
  updated_at: Date;
}

export interface AdminSettings {
  id: string;
  admin_id: string;
  bot_delay_enabled: boolean;
  bot_delay: number;
  created_at: Date;
  updated_at: Date;
}

export interface DeleteBroadcastImagesResponse {
  success: boolean;
  msg: string;
  status: number;
}

export interface ChangeGroupSettingsResponse {
  success: boolean;
  msg: string;
  status: number;
}

export interface GroupLoginResponse {
  success: boolean;
  msg: string;
  access_token: string;
  status: number;
}

export interface GroupCheckPwResponse {
  success: boolean;
  msg: string;
  value: boolean;
  status: number;
}

export interface GroupResponse {
  success: boolean;
  msg: string;
  group: Group;
  status: number;
}

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

export interface Participant {
  id: ID;
  isMe: boolean;
  name?: string;
  type: string;
  image?: string;
  isUser: boolean;
  number: string;
  isGroup: boolean;
  pushname: string;
  isBlocked: boolean;
  shortName?: string;
  isBusiness: boolean;
  isMyContact: boolean;
  isWAContact: boolean;
  isEnterprise?: boolean;
  verifiedName?: string;
  verifiedLevel?: number;
  businessProfile?: BusinessProfile;
}

export interface BusinessProfile {
  id: ID;
  tag: string;
  email: null;
  fbPage: string[];
  address: null;
  prompts: null;
  website: Website[];
  commands: null;
  latitude: null;
  longitude: null;
  categories: Category[];
  coverPhoto: null;
  dataSource: string;
  description: null;
  automatedType: string;
  businessHours: null;
  igProfessional: string[];
  profileOptions: ProfileOptions;
  isProfileLinked: boolean;
  isProfileLocked: boolean;
  commandsDescription: null;
  welcomeMsgProtocolMode: string;
}

export interface Category {
  id: string;
  localized_display_name: string;
}

export interface ID {
  user: string;
  server: Server;
  _serialized: string;
}

export interface ProfileOptions {
  cartEnabled: boolean;
  commerceExperience: string;
}

export interface Website {
  url: string;
}

export interface SearchResponse {
  success: boolean;
  msg: string;
  responses: Response[];
  status: number;
}

export interface Response {
  id: string;
  case: string;
  reply: string;
  images: null;
  created_at: Date;
  updated_at: Date;
}

export interface DeleteManagePictureType {
  success: boolean;
  msg: string;
  id: string;
  status: number;
}

export interface OTPResponse {
  success: boolean;
  msg: string;
  status: number;
  access_token?: string;
}

export interface GroupData {
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

export interface Broadcaster {
  id: string;
  group_id: string;
  motd_enabled: boolean;
  motd: null;
  motd_time: null;
  pfpslide_enabled: boolean;
  pfp_slide: null;
  pfp_slide_interval: null;
  created_at?: Date;
  updated_at?: Date;
}

export interface GroupSettings {
  id: string;
  group_id: string;
  lock_mention_everyone: boolean;
  schedule_piket: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Participant {
  id: ID;
  isMe: boolean;
  name?: string;
  type: string;
  image?: string;
  isUser: boolean;
  number: string;
  isGroup: boolean;
  pushname: string;
  isBlocked: boolean;
  shortName?: string;
  isBusiness: boolean;
  isMyContact: boolean;
  isWAContact: boolean;
  isEnterprise?: boolean;
  verifiedName?: string;
  verifiedLevel?: number;
  businessProfile?: BusinessProfile;
}

export interface BusinessProfile {
  id: ID;
  tag: string;
  email: null;
  // fbPage: any[];
  address: null;
  prompts: null;
  website: Website[];
  commands: null;
  latitude: null;
  longitude: null;
  categories: Category[];
  coverPhoto: null;
  dataSource: string;
  description: null;
  automatedType: string;
  businessHours: null;
  // igProfessional: any[];
  profileOptions: ProfileOptions;
  isProfileLinked: boolean;
  isProfileLocked: boolean;
  commandsDescription: null;
  welcomeMsgProtocolMode: string;
}

export interface Category {
  id: string;
  localized_display_name: string;
}

export interface ID {
  user: string;
  server: Server;
  _serialized: string;
}

export enum Server {
  CUs = "c.us",
}

export interface ProfileOptions {
  cartEnabled: boolean;
  commerceExperience: string;
}

export interface Website {
  url: string;
}

export interface TextResponse {
  choices: Choice[];
  created: number;
  id: string;
  model: string;
  object: string;
  system_fingerprint: string;
  usage: Usage;
}

export interface Choice {
  finish_reason: string;
  index: number;
  logprobs: null;
  message: Message;
}

export interface Message {
  content: string;
  role: string;
}

export interface Usage {
  completion_tokens: number;
  completion_tokens_after_first_per_sec: number;
  completion_tokens_after_first_per_sec_first_ten: number;
  completion_tokens_per_sec: number;
  end_time: number;
  is_last_response: boolean;
  prompt_tokens: number;
  start_time: number;
  time_to_first_token: number;
  total_latency: number;
  total_tokens: number;
  total_tokens_per_sec: number;
}
