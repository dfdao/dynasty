// Store the NFT image on nft.storage and return IPFS hash
import meta from "./grandPrixMeta";
import mime from "mime";
import path from "path";
import { NFTStorage } from "nft.storage";

const API_KEY = import.meta.env.VITE_NFT_STORAGE_KEY;

// async function fileFromPath(filePath: string) {
//   const content = await fs.promises.readFile(filePath)
//   const type = mime.getType(filePath)
//   return new File([content], path.basename(filePath), { type })
// }
// async function readFile(filePath: string) {
//   if (filePath) {
//     const reader = new FileReader();
//     reader.readAsText(filePath, "UTF-8");
//     reader.onload = (evt) => {
//       document.getElementById("fileContents").innerHTML = evt.target.result;
//     };
//     reader.onerror = (evt) => {
//       document.getElementById("fileContents").innerHTML = "error reading file";
//     };
//   }
// }

export async function storeExampleNFT(image: Blob | File): Promise<string> {
  // const image = await fileFromPath(imagePath)
  const nft = {
    image, // use image Blob as `image` field
    ...meta,
  };
  console.log(image instanceof Blob);

  if (!API_KEY) throw new Error("no NFT STORAGE key found");
  const client = new NFTStorage({ token: API_KEY });
  console.log(`nft`, nft);
  const metadata = await client.store(nft);
  console.log("NFT data stored!");
  console.log("Metadata URI: ", metadata.url);
  return metadata.url;
}
