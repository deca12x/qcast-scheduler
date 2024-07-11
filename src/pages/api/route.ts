import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable"; // Library to handle form data, especially file uploads
import fs from "fs"; // File system module to work with file streams
import FormData from "form-data"; // Library to create form data for HTTP requests
const pinataSDK = require("@pinata/sdk"); // Pinata SDK to interact with Pinata API
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT }); // Initialize Pinata with JWT key from environment variables

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle form data manually
  },
};

// for uploading images to IPFS
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

// receive user information from client (first POST request)
// if it receives first post and has a uuid, send to Neynar API (second POST request)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { user, url } = req.body;

    if (!user || !user.signer_uuid) {
      res.status(400).json({ error: "User information is missing" });
      return;
    }

    // try {
    //   const uploadImageOptions = {
    //     method: "POST",
    //     headers: {
    //       accept: "application/json",
    //       "content-type": "application/json",
    //       authorization: `Bearer ${process.env.PINATA_JWT}`,
    //     },
    //     body: JSON.stringify(keyRestrictions),
    //   };

    //   const jwtRepsonse = await fetch(
    //     "https://api.pinata.cloud/users/generateApiKey",
    //     uploadImageOptions
    //   );
    //   const json = await jwtRepsonse.json();
    //   const { JWT } = json;
    //   res.send(JWT);
    // } catch (e) {
    //   console.log(e);
    //   res.status(500).send("Server Error");
    // }

    const imageUrlStatic = "https://i.imgur.com/cniMfvm.jpeg"; // Replace this with your dynamic URL if needed

    let castOptions = {};

    if (url == "") {
      castOptions = {
        method: "POST",
        headers: {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY || "",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parent_author_fid: 410626,
          text: "urbe houz 🇧🇪 cast from script with no pic",
          signer_uuid: user.signer_uuid,
        }),
      };
    } else {
      castOptions = {
        method: "POST",
        headers: {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY || "",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parent_author_fid: 410626,
          text: "urbe houz 🇧🇪 cast from script with pic",
          signer_uuid: user.signer_uuid,
          embeds: [{ url: url }],
        }),
      };
    }

    try {
      const response = await fetch(
        "https://api.neynar.com/v2/farcaster/cast",
        castOptions
      );
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
