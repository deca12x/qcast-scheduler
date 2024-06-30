const options = {
  method: "POST",
  headers: {
    accept: "application/json",
    api_key: process.env.NEYNAR_API_KEY || "",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    parent_author_fid: 3,
    text: "test cast qcast",
    signer_uuid: user?.signer_uuid,
  }),
};

fetch("https://api.neynar.com/v2/farcaster/cast", options)
  .then((response) => response.json())
  .then((response) => console.log(response))
  .catch((err) => console.error(err));
