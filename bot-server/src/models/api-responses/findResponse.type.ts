export interface FindResponsesTypeResponse {
  success: boolean;
  msg: string;
  responses: Responses;
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
