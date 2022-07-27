import { useEffect, useState } from "react";
import "../App.css";
import styled from "styled-components";
import { getConfigName } from "../lib/getConfigName";
import { ethers } from "ethers";
import { formatStartTime, formatDate } from "../lib/date";
import { ScoringInterface } from "../App";
import { useAccount, useSignMessage } from "wagmi";
import useSWR from "swr";
import { fetcher } from "../lib/fetcher";

let mockDate = new Date();

const MOCK_ROUNDS: ScoringInterface[] = [
  {
    configHash: "0x0000000000000000000000000000000000000001",
    timeScoreWeight: 11,
    moveScoreWeight: 121,
    winner: undefined,
    startTime: mockDate.getTime(),
    endTime: new Date().getTime(),
  },
  {
    configHash: "0xab00000000000001234564132434145241254341",
    timeScoreWeight: 111,
    moveScoreWeight: 12,
    winner: undefined,
    startTime: new Date().getTime(),
    endTime: new Date().getTime(),
  },
  {
    configHash: "0x0000000000000000000000000000000000000003",
    timeScoreWeight: 1,
    moveScoreWeight: 1231,
    winner: undefined,
    startTime: new Date().getTime(),
    endTime: new Date().getTime(),
  },
];

export const RoundList = () => {
  const { address, isConnected } = useAccount();
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: `Deleting Grand Prix Round as ${address}`,
  });
  const { data: serverData, error } = useSWR(
    "http://localhost:3000/rounds",
    fetcher
  );
  if (!serverData) return <div>Loading...</div>;
  if (error) return <div>Couldn't load previous rounds.</div>;

  return (
    <RoundsContainer>
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
        {serverData.map((round: ScoringInterface) => (
          <RoundItem>
            <TableCell>{getConfigName(round.configHash)}</TableCell>
            <TableCell>{formatStartTime(round.startTime)}</TableCell>
            <TableCell>{formatStartTime(round.endTime)}</TableCell>
            <TableCell>{round.timeScoreWeight}</TableCell>
            <TableCell>{round.moveScoreWeight}</TableCell>
            <TableCell>
              <button onClick={() => signMessage()} disabled={!isConnected}>
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
