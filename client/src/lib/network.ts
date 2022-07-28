import {
  getAddRoundMessage,
  getDeleteRoundMessage,
  getEditRoundMessage,
} from "../constants";
import { ScoringInterface } from "../types";

export const fetcher = (...args: any) =>
  // @ts-ignore
  fetch(...args).then((res) => res.json());

export const getURLSearchParmsForRound = (
  round: ScoringInterface
): URLSearchParams => {
  return new URLSearchParams({
    endTime: round.endTime.toString(),
    startTime: round.startTime.toString(),
    timeScoreWeight: round.timeScoreWeight.toString(),
    moveScoreWeight: round.moveScoreWeight.toString(),
    configHash: round.configHash.toString(),
  });
};
export const getRoundID = async (round: ScoringInterface): Promise<number> => {
  const searchParams = getURLSearchParmsForRound(round);
  const selectedRoundID = await fetch(
    `http://localhost:3000/rounds?${searchParams}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const fetchedText = await selectedRoundID.text();
  const fetchedId = JSON.parse(fetchedText).body[0].id;
  return fetchedId;
};

export const deleteRound = async (
  roundId: number,
  address: string | undefined,
  signature: string
): Promise<Response> => {
  const res = await fetch(`http://localhost:3000/rounds/${roundId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: getDeleteRoundMessage(address),
      signature: signature,
    }),
  });
  return res;
};

export const addRound = async (
  round: ScoringInterface,
  address: string | undefined,
  signature: string
): Promise<Response> => {
  const res = await fetch(`http://localhost:3000/rounds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature: signature,
      message: getAddRoundMessage(address),
      timeScoreWeight: round.timeScoreWeight,
      moveScoreWeight: round.moveScoreWeight,
      startTime: round.startTime,
      endTime: round.endTime,
      winner: round.winner,
      configHash: round.configHash,
    }),
  });
  return res;
};

export const editRound = async (
  newRound: ScoringInterface,
  roundId: number,
  address: string | undefined,
  signature: string
): Promise<Response> => {
  const params = getURLSearchParmsForRound(newRound);
  const res = await fetch(`http://localhost:3000/rounds/${roundId}?${params}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: getEditRoundMessage(address),
      signature: signature,
    }),
  });
  return res;
};
