import { BusinessProfile } from "./businessProfile.type";
import { ID } from "./id.type";
import { Type } from "./typeEnum.type";

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
