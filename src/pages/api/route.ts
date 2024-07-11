import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable"; // Import required types
import fs from "fs"; // File system module to work with file streams
import FormData from "form-data"; // Library to create form data for HTTP requests
const pinataSDK = require("@pinata/sdk"); // Pinata SDK to interact with Pinata API
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT }); // Initialize Pinata with JWT key from environment variables

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle form data manually
  },
};

// Handler for the API endpoint
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const form = new formidable.IncomingForm(); // Initialize formidable form

    // Parse the incoming form data (which includes files and fields)
    form.parse(req, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        res.status(500).json({ error: "Form parsing error" }); // Handle form parsing errors
        return;
      }

      const userField = fields.user as string | string[]; // Get the user field
      const user = Array.isArray(userField)
        ? JSON.parse(userField[0])
        : JSON.parse(userField); // Parse the user information from the form fields
      let imageUrl = ""; // Initialize image URL variable

      if (!user || !user.signer_uuid) {
        res.status(400).json({ error: "User information is missing" }); // Handle missing user information
        return;
      }

      // Check if a file was uploaded
      const fileArray = files.file as formidable.File | formidable.File[]; // Get the uploaded file
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

      if (file) {
        const formData = new FormData(); // Initialize form data
        formData.append("file", fs.createReadStream(file.filepath)); // Append the file to the form data

        try {
          // Make a request to Pinata to upload the file to IPFS
          const response = await fetch(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`, // Authorization header with JWT token
              },
              body: formData as unknown as BodyInit, // Set the form data as the request body
            }
          );

          const json = await response.json(); // Parse the response JSON
          const { IpfsHash } = json; // Get the IPFS hash from the response
          imageUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`; // Construct the image URL using the IPFS hash
        } catch (error) {
          console.error(error); // Log the error for debugging
          res.status(500).json({ error: "Failed to upload image to IPFS" }); // Respond with an error if the upload fails
          return;
        }
      }

      // Prepare the options for the Farcaster API request
      const castOptions = {
        method: "POST",
        headers: {
          accept: "application/json", // Accept JSON response
          api_key: process.env.NEYNAR_API_KEY || "", // Neynar API key from environment variables
          "content-type": "application/json", // Content type of the request
        },
        body: JSON.stringify({
          parent_author_fid: 410626, // Example parent author FID
          text: `urbe houz 🇧🇪 cast from script ${
            imageUrl ? "with pic" : "with no pic"
          }`, // Example text for the cast
          signer_uuid: user.signer_uuid, // Signer UUID from the user information
          embeds: imageUrl ? [{ url: imageUrl }] : [], // Include the image URL in embeds if available
        }),
      };

      try {
        // Make a request to Neynar API to post the cast
        const response = await fetch(
          "https://api.neynar.com/v2/farcaster/cast",
          castOptions
        );
        const data = await response.json(); // Parse the response JSON
        res.status(200).json(data); // Respond with the data from the Neynar API
      } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: "Internal server error" }); // Respond with an internal server error
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed" }); // Respond with method not allowed for non-POST requests
  }
}
