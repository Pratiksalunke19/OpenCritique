// utils/pinataUpload.js
export const uploadToPinata = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({ name: file.name });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 0 });
  formData.append("pinataOptions", options);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`, // keep JWT secret in .env
    },
    body: formData,
  });

  const data = await res.json();
  return data.IpfsHash; // e.g., bafkre...
};
