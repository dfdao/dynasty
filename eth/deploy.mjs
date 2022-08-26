#!/usr/bin/env zx

function parseForgeDeploy(output) {
  const parsed = output.split("\n");
  const lineWithAddress = parsed.find((line) =>
    line.startsWith("Contract Address:")
  );
  const address =
    lineWithAddress.split(" ")[lineWithAddress.split(" ").length - 1];
  return address;
}

const main = async () => {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const RPC_URL = process.env.RPC_URL;
  const names = ['Registry', 'NFT'];

  let deployments = {};

  for await (const name of names) {
    const { stdout: deploymentOutput } =
      await $`forge script script/${name}.s.sol:Deploy${name} --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --legacy --broadcast`;
    const registryAddress = parseForgeDeploy(deploymentOutput);
    deployments[name.toLowerCase()] = registryAddress;
  }

  console.log(`RPC`, RPC_URL);
  if(RPC_URL && RPC_URL == "http://localhost:8545") {
    deployments['chainId'] = '31337';
  }
  else {
    deployments['chainId'] = '300';
  }
  
  console.log(deployments);

  fs.writeFileSync("deployment.json", JSON.stringify(deployments));
}
main().catch(e => console.log(e));
