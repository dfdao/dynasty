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
      <button
        style={{ position: "relative" }}
        onClick={async () => {
          addAdminWrite?.();
        }}
        className="btn"
        disabled={
          !isConnected ||
          newAdminAddress.length === 0 ||
          !newAdminAddress.startsWith("0x") ||
          !addAdminWrite
        }
      >
        Add admin
      </button>
    </InputWithButtonContainer>
  );
};

const StyledInput = styled(TextInput)`
  display: flex;
  flex: 1;
  color: #fff;
`;

const InputWithButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  border: 1px solid rgb(53, 71, 73);
  position: relative;
`;
