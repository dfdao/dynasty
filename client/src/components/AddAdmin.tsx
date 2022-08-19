import React, { useState } from "react";
import styled from "styled-components";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { abi } from "@dfdao/gp-registry/out/Registry.sol/Registry.json";
import { registry } from "@dfdao/gp-registry/deployment.json";
import { TextInput } from "./NewRoundForm";

export const AddAdmin = () => {
  const { isConnected } = useAccount();

  const [newAdminAddress, setNewAdminAddress] = useState<string>("");

  const { config } = usePrepareContractWrite({
    addressOrName: registry,
    contractInterface: abi,
    functionName: "setAdmin",
    args: [newAdminAddress, true],
  });

  const { write: addAdminWrite } = useContractWrite(config);

  return (
    <InputWithButtonContainer>
      <StyledInput
        placeholder="New admin address"
        onChange={(e) => setNewAdminAddress(e.target.value)}
        value={newAdminAddress}
      />
      <BlueButton
        style={{ position: "relative" }}
        onClick={async () => {
          addAdminWrite?.();
        }}
        disabled={
          !isConnected ||
          newAdminAddress.length === 0 ||
          !newAdminAddress.startsWith("0x") ||
          !addAdminWrite
        }
      >
        Add admin
      </BlueButton>
    </InputWithButtonContainer>
  );
};

const BlueButton = styled.button`
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
const StyledInput = styled(TextInput)`
  display: flex;
  flex: 1;
`;

const InputWithButtonContainer = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  gap: 16px;
  padding: 8px;
  border: 2px solid #e3cca0;
  position: relative;
`;
