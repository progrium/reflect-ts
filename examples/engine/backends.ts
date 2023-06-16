import { RawNode } from "../manifold/mod.ts";

export interface Authenticator {
  login();
  logout();
  currentUser(): User|null;
}

export interface User {
  userID(): string;
  displayName(): string;
  avatarURL(): string;
}

export interface SearchIndex {
  index(node: RawNode);
  remove(id: string);
  search(query: string): string[];
}


export interface FileStore {
  readFile(path: string): Promise<string|null>;
  writeFile(path: string, contents: string): Promise<void>;
}


