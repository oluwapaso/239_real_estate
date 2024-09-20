import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let { image_url, prop_address, index } = req.body;
  prop_address = prop_address as string;
  prop_address = prop_address.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  let image_name = prop_address+"-"+index;

  try {
    
    const imageResponse = await fetch(image_url as string);
    if (!imageResponse.ok) {
      //console.log('Failed to fetch image_url');
      res.status(500).json({"Error":'Failed to fetch image_url:'+ imageResponse});
    }
    const imageBuffer = await imageResponse.arrayBuffer(); 
    //console.log("imageBuffer:", imageBuffer)
    
    const imageName = `${image_name}-${Date.now()}.jpg`; // Use a unique name for the image
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, imageName);

    const phpServerUrl = `${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/next-requests/prop_image_upload.php`; // Replace with your PHP server URL
    const phpResponse = await fetch(phpServerUrl, {
      method: 'POST',
      body: formData,
    });

    if (!phpResponse.ok) {
      //console.log('Failed to upload image to PHP server');
      res.status(500).json({"Error":'Failed to upload image to PHP server:'+ phpResponse});
    }

    const imagePath = await phpResponse.text();
    res.status(200).json({ imagePath });


  } catch (error: any) {
    //console.error('Error fetching image:', error);
    res.status(500).json({"Error":"Error fetching image "+ error});
  }
};