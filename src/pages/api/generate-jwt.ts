import type { NextApiRequest, NextApiResponse } from "next";

const keyRestrictions = {
  keyName: "Signed Upload JWT",
  maxUses: 1,
  permissions: {
    endpoints: {
      data: {
        pinList: false,
        userPinnedDataTotal: false,
      },
      pinning: {
        pinFileToIPFS: true,
        pinJSONToIPFS: false,
        pinJobs: false,
        unpin: false,
        userPinPolicy: false,
      },
    },
  },
};

export default async function generateJWT() {
  try {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify(keyRestrictions),
    };

    const jwtResponse = await fetch(
      "https://api.pinata.cloud/users/generateApiKey",
      options
    );
    const json = await jwtResponse.json();
    const { JWT } = json;
    return JWT;
  } catch (e) {
    console.error(e);
  }
}
