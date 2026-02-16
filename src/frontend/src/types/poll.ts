import type { Principal } from '@icp-sdk/core/principal';

export type Time = bigint;
export type PollId = string;

export interface Poll {
  id: PollId;
  question: string;
  options: Array<string>;
  optionVotes: Array<bigint>;
  createdAt: Time;
  creator: Principal;
}
