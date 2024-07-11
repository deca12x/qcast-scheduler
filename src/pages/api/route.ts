import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import pinataSDK from "@pinata/sdk";

export const config = {
  api: {
    bodyParser: false,
  },
};

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

const uploadFile = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        console.error("Form parsing error:", err);
        res.status(500).json({ error: "Form parsing error" });
        return;
      }

      console.log("Received fields:", fields);
      console.log("Received files:", files);

      try {
        const userField = fields.user as string | string[];
        const userString = Array.isArray(userField) ? userField[0] : userField;
        console.log("User string:", userString);

        if (!userString || typeof userString !== "string") {
          console.error("Invalid user field format.");
          res.status(400).json({ error: "Invalid user field format" });
          return;
        }

        const user = JSON.parse(userString);
        let imageUrl = "";

        if (!user || !user.signer_uuid) {
          res.status(400).json({ error: "User information is missing" });
          return;
        }

        const fileArray = files.file as formidable.File | formidable.File[];
        const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

        if (file) {
          try {
            const stream = fs.createReadStream(file.filepath);
            const options = {
              pinataMetadata: {
                name: file.originalFilename,
              },
            };

            const result = await pinata.pinFileToIPFS(stream, options);

            const { IpfsHash } = result;
            imageUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
          } catch (error) {
            console.error("Failed to upload image to IPFS:", error);
            res.status(500).json({ error: "Failed to upload image to IPFS" });
            return;
          }
        }

        const castOptions = {
          method: "POST",
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY || "",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            parent_author_fid: 410626,
            text: `cast during live stream, time to rest, tomorrow ethglobal brussels ${
              imageUrl ? "with pic" : "with no pic"
            }`,
            signer_uuid: user.signer_uuid,
            embeds: imageUrl ? [{ url: imageUrl }] : [],
          }),
        };

        const response = await fetch(
          "https://api.neynar.com/v2/farcaster/cast",
          castOptions
        );

        if (!response.ok) {
          throw new Error(`Neynar API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default uploadFile;
