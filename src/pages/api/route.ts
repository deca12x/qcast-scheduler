import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // cors middleware needed to call the API from the client
  await runMiddleware(req, res, cors);

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
        text: "test cast qcast",
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
