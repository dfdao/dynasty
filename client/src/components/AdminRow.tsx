import React from "react";
import styled from "styled-components";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { abi } from "@dfdao/gp-registry/out/Registry.sol/Registry.json";
import { registry } from "@dfdao/gp-registry/deployment.json";

export const AdminRow: React.FC<{ admin: string }> = ({ admin }) => {
  const { address, isConnected } = useAccount();
  const { config: deleteAdminConfig } = usePrepareContractWrite({
    addressOrName: registry,
    contractInterface: abi,
    functionName: "setAdmin",
    args: [admin, false],
  });
  const { write: deleteAdmin } = useContractWrite(deleteAdminConfig);
  return (
    <RoundItem key={admin}>
      <TableCell>
        {admin}
        {admin === address && <span style={{ fontWeight: 600 }}> (you)</span>}
      </TableCell>
      <TableCell>
        <button
          disabled={!isConnected}
          onClick={() => {
            deleteAdmin?.();
          }}
        >
          Revoke
        </button>
      </TableCell>
    </RoundItem>
  );
};

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
