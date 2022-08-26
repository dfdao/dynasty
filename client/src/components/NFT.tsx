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
import { storeExampleNFT } from "../lib/nft";
import { ImageUpload } from "./ImageUpload";

const address = "0xBB768aF10D9Ec805F5CF3491218056e342b98005";
export const NFTDisplay: React.FC = () => {
  const [image, setImage] = useState<Blob>();
  const [uri, setURI] = useState<string>(" ");
  const { isConnected } = useAccount();

  const { data: adminData } = useContractRead({
    addressOrName: nft,
    contractInterface: abi,
    functionName: "getAllAdmins",
    watch: true,
  });
  console.log(`admins`, adminData);

  const { config } = usePrepareContractWrite({
    addressOrName: nft,
    contractInterface: abi,
    functionName: "mintTo",
    args: [address, uri],
  });

  const { writeAsync: nftMintTo } = useContractWrite({
    ...config,
  });

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

  const args = Array.from(Array(count).keys()).map((a) => a.toString());

  const { data: uris } = useContractRead({
    addressOrName: nft,
    contractInterface: abi,
    functionName: "bulkTokenURI",
    watch: true,
    args: args,
  });

  console.log(`tokenURIS`, uris);
  tokenUris = uris as string[];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Couldn't load nft count.</div>;

  const showFile = (e: any) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      // @ts-expect-error @error might be null
      const text = e.target.result;
    };
    // reader.readAsText(e.target.files[0]);
    setImage(e.target.files[0]);
  };

  return (
    <>
      <div>
        {count} {count == 1 ? "reward has" : "rewards have"} been minted
      </div>
      {/* <ImageUpload setImage={setImage}/> */}
      <div>
        <input type="file" onChange={showFile} />
      </div>
      {image ? (
        <button onClick={async () => setURI(await storeExampleNFT(image))}>
          {" "}
          Store NFT
        </button>
      ) : null}
      {uri != " " ? (
        <button
          onClick={async () => {
            await nftMintTo?.();
            setURI(" ");
          }}
        >
          Mint!
        </button>
      ) : null}
      {!isConnected ? <div>Must connect wallet to mint!</div> : null}
    </>
  );
};
