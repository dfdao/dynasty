import "../App.css";
import styled from "styled-components";
import { getConfigName } from "../lib/getConfigName";
import { formatStartTime } from "../lib/date";
import { ScoringInterface } from "../types";
import { useAccount, useContractRead, useSignMessage } from "wagmi";
import useSWR, { useSWRConfig } from "swr";
import { deleteRound, fetcher } from "../lib/network";
import { abi } from "@dfdao/gp-registry/out/Registry.sol/Registry.json";
import { registry } from "@dfdao/gp-registry/deployment.json";
import { useState } from "react";
import { ErrorBanner } from "./ErrorBanner";
import { ethers } from "ethers";
import { EditRound } from "./EditRound";

export interface ScoringResponse {
  configHash: string;
  description: string;
  winner: string | undefined;
  startTime: ethers.BigNumber;
  endTime: ethers.BigNumber;
}

export const RoundList: React.FC<{
  onEditRound: (round: ScoringInterface) => void;
}> = ({ onEditRound }) => {
  const { mutate } = useSWRConfig();
  const { address, isConnected } = useAccount();
  const [submissionError, setSubmissionError] = useState<string | undefined>(
    undefined
  );

  const {
    data: roundData,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: registry,
    contractInterface: abi,
    functionName: "getAllGrandPrix",
  });

  if (!roundData || isLoading) return <div>Loading...</div>;
  if (roundData.length === 0) return <div>No rounds found.</div>;
  if (isError) return <div>Couldn't load previous rounds.</div>;

  console.log(roundData);

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
          <TableHeader>Description</TableHeader>
          <TableHeader>Winner</TableHeader>
        </tr>
      </thead>
      <tbody>
        {roundData.map((round: ScoringResponse, i: number) => (
          <RoundItem key={round.configHash}>
            <TableCell>{getConfigName(round.configHash)}</TableCell>
            <TableCell>{formatStartTime(round.startTime.toNumber())}</TableCell>
            <TableCell>{formatStartTime(round.endTime.toNumber())}</TableCell>
            {/* <TableCell>{round.description.slice(0, 24) + "..."}</TableCell> */}
            <TableCell>
              {round.winner && round.winner.length > 0 ? round.winner : "None"}
            </TableCell>
            <TableCell>
              <EditRound round={round} id={i} />
            </TableCell>
            <TableCell>
              <button
                onClick={async () => {
                  // if (submissionError) setSubmissionError(undefined);
                  // const signed = await signMessageAsync();
                  // mutate(
                  //   `${import.meta.env.VITE_SERVER_URL}/rounds/${
                  //     round.configHash
                  //   }`,
                  //   async () => {
                  //     const res = await deleteRound(
                  //       round.configHash,
                  //       address,
                  //       signed
                  //     );
                  //     const responseError = await res.text();
                  //     if (res.status !== 200 && res.status !== 201) {
                  //       setSubmissionError(responseError);
                  //     }
                  //   }
                  // );
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
