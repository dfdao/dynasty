import "../App.css";
import styled from "styled-components";
import { getConfigName } from "../lib/getConfigName";
import { formatStartTime } from "../lib/date";
import { ScoringInterface } from "../types";
import { useAccount, useSignMessage } from "wagmi";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "../lib/network";
import { getDeleteRoundMessage } from "../constants";
import { useState } from "react";
import { ErrorBanner } from "./ErrorBanner";

export const RoundList = () => {
  const { mutate } = useSWRConfig();
  const { address, isConnected } = useAccount();
  const [submissionError, setSubmissionError] = useState<string | undefined>(
    undefined
  );
  const { signMessageAsync } = useSignMessage({
    message: getDeleteRoundMessage(address),
  });
  const { data: serverData, error } = useSWR(
    "http://localhost:3000/rounds",
    fetcher
  );
  if (!serverData) return <div>Loading...</div>;
  if (error) return <div>Couldn't load previous rounds.</div>;

  return (
    <RoundsContainer>
      {submissionError && (
        <ErrorBanner>
          <span>{submissionError}</span>
        </ErrorBanner>
      )}
      <thead>
        <tr>
          <TableHeader>Name</TableHeader>
          <TableHeader>Start</TableHeader>
          <TableHeader>End</TableHeader>
          <TableHeader>TimeWeight</TableHeader>
          <TableHeader>MoveWeight</TableHeader>
        </tr>
      </thead>
      <tbody>
        {serverData.body.map((round: ScoringInterface) => (
          <RoundItem>
            <TableCell>{getConfigName(round.configHash)}</TableCell>
            <TableCell>{formatStartTime(round.startTime)}</TableCell>
            <TableCell>{formatStartTime(round.endTime)}</TableCell>
            <TableCell>{round.timeScoreWeight}</TableCell>
            <TableCell>{round.moveScoreWeight}</TableCell>
            <TableCell>
              <button
                onClick={async () => {
                  if (submissionError) setSubmissionError(undefined);
                  // get selected round
                  let params = new URLSearchParams({
                    endTime: round.endTime.toString(),
                    startTime: round.startTime.toString(),
                    timeScoreWeight: round.timeScoreWeight.toString(),
                    moveScoreWeight: round.moveScoreWeight.toString(),
                    configHash: round.configHash.toString(),
                  });
                  let selectedRoundID = await fetch(
                    `http://localhost:3000/rounds?${params}`,
                    {
                      method: "GET",
                      headers: { "Content-Type": "application/json" },
                    }
                  );
                  const fetchedText = await selectedRoundID.text();
                  const fetchedId = JSON.parse(fetchedText).body[0].id;
                  const signed = await signMessageAsync();
                  mutate(
                    `http://localhost:3000/rounds/${fetchedId}`,
                    async () => {
                      const res = await fetch(
                        `http://localhost:3000/rounds/${fetchedId}`,
                        {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            message: getDeleteRoundMessage(address),
                            signature: signed,
                          }),
                        }
                      );
                      const responseError = await res.text();
                      if (res.status !== 200 && res.status !== 201) {
                        setSubmissionError(responseError);
                      }
                    }
                  );
                }}
                disabled={!isConnected}
              >
                Delete
              </button>
            </TableCell>
          </RoundItem>
        ))}
      </tbody>
    </RoundsContainer>
  );
};

const TableHeader = styled.th``;

const RoundsContainer = styled.div`
  border-collapse: collapse;
  display: block;
  border-spacing: 0;
  font-size: 1rem;
  overflow-y: auto;
`;

const RoundItem = styled.tr`
  border: 2px solid #e3cca0;
  width: 100%;
  transition: all 0.2s ease;
  &:hover {
    background: #ead7b0;
  }
`;

const TableCell = styled.td`
  padding: 8px 16px;
`;
