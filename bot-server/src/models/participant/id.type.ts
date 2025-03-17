export interface ID {
  user: string;
  server: Server;
  _serialized: string;
}

export enum Server {
  CUs = "c.us",
}
