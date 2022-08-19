import "../App.css";
import styled from "styled-components";
import { useContractRead } from "wagmi";
import { useState } from "react";
import { ErrorBanner } from "./ErrorBanner";
import { abi } from "@dfdao/gp-registry/out/Registry.sol/Registry.json";
import { registry } from "@dfdao/gp-registry/deployment.json";
import { AdminRow } from "./AdminRow";
import { AddAdmin } from "./AddAdmin";
import { ethers } from "ethers";

export const AdminManager: React.FC = () => {
  const [submissionError, setSubmissionError] = useState<string | undefined>(
    undefined
  );

  const {
    data: adminData,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: registry,
    contractInterface: abi,
    functionName: "getAllAdmins",
  });
  if (!adminData || isLoading) return <div>Loading...</div>;
  if (adminData.length === 0) return <div>No admins found.</div>;
  if (isError) return <div>Couldn't load admins.</div>;

  return (
    <RoundsContainer>
      {submissionError && (
        <ErrorBanner>
          <span>{submissionError}</span>
        </ErrorBanner>
      )}
      <div>Admin Address</div>
      <table>
        <tbody>
          {adminData
            .filter((a) => a !== ethers.constants.AddressZero)
            .map((admin) => (
              <AdminRow admin={admin} />
            ))}
        </tbody>
      </table>
      <div style={{ height: "16px" }} />
      <AddAdmin />
    </RoundsContainer>
  );
};

const RoundsContainer = styled.div`
  border-collapse: collapse;
  display: block;
  border-spacing: 0;
  font-size: 1rem;
  overflow-y: auto;
`;
