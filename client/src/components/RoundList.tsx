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

export interface ScoringResponse {
  configHash: string;
  description: string;
  winner: string | undefined;
  startTime: ethers.BigNumber;
  endTime: ethers.BigNumber;
}

export const RoundList: React.FC = () => {
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
        </tr>
      </thead>
      <tbody>
        {roundData.map((round: ScoringResponse) => (
          <RoundItem key={round.configHash}>
            <TableCell>{getConfigName(round.configHash)}</TableCell>
            <TableCell>{formatStartTime(round.startTime.toNumber())}</TableCell>
            <TableCell>{formatStartTime(round.endTime.toNumber())}</TableCell>
            <TableCell>
              <button
                className="btn"
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

export const TableHeader = styled.th`
  font-family: "Menlo", "Inconsolata", monospace;
  text-transform: uppercase;
  font-weight: 400;
  color: rgb(100, 115, 120);
  margin-bottom: 1rem;
  text-align: left;
  padding: 8px 16px;
`;

export const RoundsContainer = styled.div`
  border-collapse: collapse;
  display: block;
  border-spacing: 0;
  font-size: 1rem;
  overflow-y: auto;
`;

export const RoundItem = styled.tr`
  border: 1px solid rgb(53, 71, 73);
  width: 100%;
  transition: all 0.2s ease;
  &:hover {
    background: rgb(32, 36, 37);
  }
`;

export const TableCell = styled.td`
  padding: 8px 16px;
  text-align: left;
`;
