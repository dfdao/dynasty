import React from "react";
import { useAccount } from "wagmi";
import { formatStartTime } from "../lib/date";
import { RoundItem, TableCell } from "./RoundList";
import { NFTList, RoundResponse } from "../types";

export const NftRow: React.FC<{ token: NFTList }> = ({ token }) => {
  const { isConnected } = useAccount();

  return (
    <RoundItem key={token.id}>
      <TableCell>{token.id}</TableCell>
      <TableCell>{token.owner}</TableCell>
      <TableCell>
        <a href={token.uri} target="_blank">
          Meta
        </a>
      </TableCell>
    </RoundItem>
  );
};
