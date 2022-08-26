import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { abi } from "../../../eth/abi/NFT.json";
import { nft } from "../../../eth/deployment.json";

const address = "0xBB768aF10D9Ec805F5CF3491218056e342b98005";
export const NFTDisplay: React.FC = () => {
  const { isConnected } = useAccount();

  const { data: adminData } = useContractRead({
    addressOrName: nft,
    contractInterface: abi,
    functionName: "getAllAdmins",
    watch: true,
  });
  console.log(`admins`, adminData);

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
  console.log(`count`, count);

  let tokenUris: string[] = [];

  const args = [BigNumber.from(1)];
  console.log(args);

  const { data: uris } = useContractRead({
    addressOrName: nft,
    contractInterface: abi,
    functionName: "bulkTokenURI",
    watch: true,
    args: [...args],
  });

  console.log(`tokenURIS`, uris);
  tokenUris = uris as string[];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Couldn't load nft count.</div>;

  return (
    <>
      {count && <div>{count} rewards minted</div>}
      {uris && <div>{uris}</div>}
      {!isConnected ? <div>Must connect wallet to mint!</div> : null}
    </>
  );
};
