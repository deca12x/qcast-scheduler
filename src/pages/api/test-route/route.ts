import { NextApiRequest, NextApiResponse } from "next";

export default function postTest(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // const { fid, display_name } = req.body;
    const { cast, image } = req.body; // Extracting the fields directly
    // const fid = user.fid;
    return res.status(200).json({ cast, image });
  }
}
