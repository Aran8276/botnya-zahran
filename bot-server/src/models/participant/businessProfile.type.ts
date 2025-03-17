import { ID } from "./id.type";
import { Website } from "./website.type";
import { Category } from "./category.type";
import { ProfileOptions } from "./profileOptions.type";

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
