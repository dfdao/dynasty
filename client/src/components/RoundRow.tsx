import React from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { formatStartTime } from "../lib/date";
import { getConfigName } from "../lib/getConfigName";
import { RoundItem, RoundResponse, TableCell } from "./RoundList";
import { abi } from "@dfdao/gp-registry/out/Registry.sol/Registry.json";
import { registry } from "@dfdao/gp-registry/deployment.json";

export const RoundRow: React.FC<{ round: RoundResponse }> = ({ round }) => {
  const { isConnected } = useAccount();

  const { config } = usePrepareContractWrite({
    addressOrName: registry,
    contractInterface: abi,
    functionName: "deleteRound",
    args: [round.configHash],
  });

  const { write: deleteRound } = useContractWrite(config);

  return (
    <RoundItem key={round.configHash}>
      <TableCell>{getConfigName(round.configHash)}</TableCell>
      <TableCell>{formatStartTime(round.startTime.toNumber())}</TableCell>
      <TableCell>{formatStartTime(round.endTime.toNumber())}</TableCell>
      <TableCell>{round.seasonId.toNumber()}</TableCell>
      <TableCell>
        <button
          className="btn"
          onClick={async () => {
            deleteRound?.();
          }}
          disabled={!isConnected}
        >
          Delete
        </button>
      </TableCell>
    </RoundItem>
  );
};
