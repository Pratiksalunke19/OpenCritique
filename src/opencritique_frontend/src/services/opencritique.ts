// opencritique_frontend/src/services/opencritique.ts
import { getOpenCritiqueActor } from "./ic_agents";

export const uploadArt = async (title: string, description: string, imageUrl: string) => {
  const actor = await getOpenCritiqueActor();
  return actor.upload_art(title, description, imageUrl);
};


export const getArtworks = async () => {
  const actor = await getOpenCritiqueActor();
  return actor.get_artworks();
};

export const getCritiques = async (artId: number) => {
  const actor = await getOpenCritiqueActor();
  return actor.get_critiques(BigInt(artId));
};

export const postCritique = async (artId: number, text: string) => {
  const actor = await getOpenCritiqueActor();
  return actor.post_critique(BigInt(artId), text);
};

export const upvoteCritique = async (artId: number, critiqueId: number) => {
  const actor = await getOpenCritiqueActor();
  return actor.upvote_critique(BigInt(artId), BigInt(critiqueId));
};

export const getPoints = async (userPrincipal: string) => {
  const actor = await getOpenCritiqueActor();
  return actor.get_points(userPrincipal);
};
