import { Context, Logger } from "../shared.ts";

export interface Initializer {
  initializeDaemon();
}

export interface Terminator {
  terminateDaemon(ctx: Context);
}

export interface Service {
  serve(ctx: Context);
}

export class Framework {
  initializers: Initializer[];
  services: Service[];
  terminators: Terminator[];
  log: Logger;
}