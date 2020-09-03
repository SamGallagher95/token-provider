import { RedisStorageProvider } from "./src/Storage/redis";
import { MemoryStorageProvider } from "./src/Storage/memory";
import { TokenProvider } from "./src/TokenProvider";
import axios from "axios";

async function main() {
  // Setup the Token Provider
  const tokenProvider = new TokenProvider({
    name: "Gitlab Token Provider",
    quotas: [
      {
        numberOfRequests: 10,
        duration: "1s",
      },
      {
        numberOfRequests: 600,
        duration: "1m",
      },
    ],
    storage: new RedisStorageProvider({}),
  });

  // Get a Token from the provider
  const token = tokenProvider.getToken("LuKi7DiXTKRzEmTosUB_");

  // Use the token a bunch
  for (let i = 0; i < 10000; i++) {
    const startDate = new Date().getTime();

    await token.use();

    console.log(new Date().getTime() - startDate);
  }
}

console.log("Starting.\n\n");

main().then(() => console.log("\n\nFinished."));
