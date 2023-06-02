import { Context, Logger } from "../shared.ts";

export interface Command {
  usage: string;
  short: string;
  long: string;
  hidden: boolean;
  aliases: string[];
  example: string;
  version: string;
  run: (ctx: Context, args: string[]) => void;
}

export interface Initializer {
  initializeCLI(root: Command);
}

export interface Preprocessor {
  preprocessCLI(args: string[]): string[];
}

export interface Runner {
  run(ctx: Context);
}

export class Framework {
  initializers: Initializer[];
  preprocessors: Preprocessor[];
  defaultRunner: Runner;
  root: Command;
  log: Logger;
}