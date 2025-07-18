// opencritique_frontend/src/services/ic_agents.ts
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as opencritique_backend_idl, canisterId as opencritique_backend_canister_id } from "../../../declarations/opencritique_backend";

let agent: HttpAgent;

export const getOpenCritiqueActor = async () => {
  if (!agent) {
    agent = await HttpAgent.create({ host: "http://localhost:4943" }); // Use boundary node in prod
    await agent.fetchRootKey(); // Only in local dev mode
  }

  return Actor.createActor(opencritique_backend_idl, {
    agent,
    canisterId: opencritique_backend_canister_id,
  });
};
