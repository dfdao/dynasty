
# Install

Contract addresses, abi, and types for dfdao's eternal grand prix.  
Includes the registry and reward contracts
```
yarn add @dfdao/dyntasty
```

# Usage

```ts
// abis
import { abi as RegistryAbi } from "@dfdao/dyntasy/abi/Registry.json";
import { abi as NFTAbi } from "@dfdao/dyntasy/abi/NFT.json";
// Contract addresses
import { registry, nft } from "@dfdao/gp-registry/deployment.json";

// assuming you're using wagmi.sh
const {
    data,
    isError,
    isLoading,
	} = useContractRead({
    addressOrName: registry,
    contractInterface: registryABI,
    functionName: "getAllGrandPrix",
    watch: true,
});
```

# Deployment 
1. `$ cp .env.example .env`
2. If deploying contracts to a public chain, switch out `PRIVATE_KEY`, `RPC_URL`, and `CHAIN_ID` in `.env` with the correct values for your chain.
3. `$ yarn deploy`. This will also copy the new values over to the Dynasty client.

# Local testing
Make sure you have [Foundry](https://github.com/foundry-rs/foundry) installed.

In your terminal, run:

```
yarn start:node
```

In another tab:

```
yarn deploy
```
The NFT and Registry contracts are now deployed locally.  
You can test them in the `client` by running `yarn dev` in `dynasty/client`