import "../App.css";
import styled from "styled-components";
import { useContractRead } from "wagmi";
import { abi } from "../../../eth/abi/NFT.json";
import { nft } from "../../../eth/deployment.json";
import { NFTList } from "../types";
import { NftRow } from "./NftRow";

export const ListNFT: React.FC = () => {
  const {
    data: nftCount,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: nft,
    contractInterface: abi,
    functionName: "currentTokenId",
    watch: true,
  });

  // Result is BigNumber
  const count = nftCount?.toNumber();

  const args = Array.from({ length: count }, (_, i) => i + 1);
  const { data: uris } = useContractRead({
    addressOrName: nft,
    contractInterface: abi,
    functionName: "bulkTokenURI",
    // watch: true,
    args: [args],
  });

  const { data: owners } = useContractRead({
    addressOrName: nft,
    contractInterface: abi,
    functionName: "bulkOwner",
    watch: true,
    args: [args],
  });

  console.log(`tokenURIS`, uris);
  console.log(`owners`, owners);

  const roundData =
    owners &&
    uris &&
    args &&
    args.map((tokenId, i) => {
      return {
        id: tokenId,
        uri: uris[i],
        owner: owners[i],
      };
    });

  if (!uris || !owners || isLoading) return <div>Loading...</div>;
  if (count === 0)
    return (
      <div
        style={{ fontFamily: "Menlo, monospace", textTransform: "uppercase" }}
      >
        No rounds found.
      </div>
    );
  if (isError) return <div>Couldn't load previous rounds.</div>;

  return (
    <RoundsContainer>
      <thead>
        <tr>
          <TableHeader>ID</TableHeader>
          <TableHeader>Owner</TableHeader>
          <TableHeader>Meta</TableHeader>
        </tr>
      </thead>
      <tbody>
        {roundData &&
          roundData.map((round: NFTList, i: number) => (
            <NftRow token={round} key={i} />
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
