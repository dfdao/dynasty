export interface RoundInterface {
  startTime: number;
  endTime: number;
  configHash: string;
  parentAddress: string;
  seasonId: number;
}

export type ValidationErrorType =
  | "configHashRequired"
  | "configHashInvalid"
  | "configHashNotFound"
  | "startTimeAfterEndTime"
  | "timeOverlaps";

export type ServerErrorType = "genericServerError";
