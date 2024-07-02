import type { NextApiRequest, NextApiResponse } from "next";

// receive user information from client (first POST request)
// if it receives first post and has a uuid, send to Neynar API (second POST request)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { user } = req.body;

    if (!user || !user.signer_uuid) {
      res.status(400).json({ error: "User information is missing" });
      return;
    }

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        parent_author_fid: 410626,
        text: "testing qcast",
        signer_uuid: user.signer_uuid,
      }),
    };

    try {
      const response = await fetch(
        "https://api.neynar.com/v2/farcaster/cast",
        options
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
