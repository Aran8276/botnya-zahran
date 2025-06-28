export interface GroupKelompok {
  participants: string[];
  numberOfParticipants: number;
}

export interface GroupShufflePfpResponse {
  success: boolean;
  msg: string;
  status: number;
  image: string;
}

export interface AllGroupsResponse {
  success: boolean;
  msg: string;
  groups: Group[];
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

export interface GroupSettings {
  id: string;
  group_id: string;
  lock_mention_everyone: boolean;
  schedule_piket: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Participant {
  id: ID;
  isMe: boolean;
  name?: string;
  type: Type;
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
  fbPage: any[];
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
  igProfessional: any[];
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

export enum Type {
  In = "in",
}

export interface AdminDetailResponse {
  success: boolean;
  msg: string;
  group: Group;
  status: number;
}

export interface Group {
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
  bot_delay: null;
  created_at: Date;
  updated_at: Date;
}

export interface GroupDetailResponse {
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

export interface GroupSettings {
  id: string;
  group_id: string;
  lock_mention_everyone: boolean;
  schedule_piket: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Participant {
  id: ID;
  isMe: boolean;
  name?: string;
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
  fbPage: any[];
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
  igProfessional: any[];
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

export interface AdminShufflePfpResponse {
  success: boolean;
  msg: string;
  status: number;
  image: string;
}

export interface CheckIfGroupHasPwResponse {
  success: boolean;
  msg: string;
  value: boolean;
  status: number;
}

export interface CheckIfGroupRegisteredResponse {
  success: boolean;
  msg: string;
  value: boolean;
  status: number;
}

export interface OTPLoginResponse {
  success: boolean;
  msg: string;
  otp: number;
  status: number;
}

export interface Responses {
  id: string;
  case: string;
  reply: string;
  images: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface APICheckResponse {
  success: boolean;
  msg: string;
  status: number;
}

export interface APICheckResponse {
  success: boolean;
}

export interface AdminShufflePfpResponse {
  image: string;
}

export interface CheckIfGroupHasPwResponse {
  success: boolean;
  value: boolean;
}

export interface CheckIfGroupRegisteredResponse {
  success: boolean;
  value: boolean;
}

export interface FindResponsesTypeResponse {
  success: boolean;
  responses?: {
    reply?: string;
    images?: string;
  };
}

export interface GroupKelompok {
  participants: string[];
  numberOfParticipants: number;
}

export interface GroupShufflePfpResponse {
  image: string;
}

export interface Pfp {
  target: string | null;
  interval: number | null;
}

export interface Piket {
  target: string | null;
}

export interface Motd {
  target: string | null;
  schedule: Date | null;
  body: string | null;
}

export interface Deck {
  color: string;
  value: string;
}
