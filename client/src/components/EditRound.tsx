import React from "react";
import styled from "styled-components";
import { abi } from "@dfdao/gp-registry/out/Registry.sol/Registry.json";
import { registry } from "@dfdao/gp-registry/deployment.json";
import { ScoringResponse } from "./RoundList";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export const EditRound: React.FC<{ round: ScoringResponse; id: number }> = ({
  round,
  id,
}) => {
  const { config } = usePrepareContractWrite({
    addressOrName: registry,
    contractInterface: abi,
    functionName: "setAdmin",
    args: [id].concat([...Object.values(round)]),
  });

  const { write: editRound } = useContractWrite(config);
  return <MutedButton onClick={() => editRound?.()}>Edit</MutedButton>;
};

const MutedButton = styled.button`
  background: #61c6ff;
  border: none;
  color: #0f5a9f;
  border: 2px solid rgba(15, 90, 159);
  &:disabled {
    background: rgba(97, 198, 255, 0.4);
    border-color: rgba(15, 90, 159, 0.4);
    color: rgba(15, 90, 159, 0.4);
  }
`;
