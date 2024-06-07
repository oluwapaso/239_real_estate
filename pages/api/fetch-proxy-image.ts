import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { image_url } = req.query;

  try {
    
    const imageResponse = await fetch(image_url as string);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBufferUint8 = Buffer.from(imageBuffer);
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBufferUint8);

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).end('Error fetching image');
  }
};