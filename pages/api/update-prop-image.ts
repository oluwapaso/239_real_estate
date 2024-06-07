import { MysqlListingsRepo } from "@/_repo/listings_repo";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let { listing_id, media, prop_address } = req.body;
  const listings_repo = new MysqlListingsRepo();

  try {
    
    let responses: any[] = [];
    if(media && media.length>0){

        if(typeof media === 'string'){
            media = JSON.parse(media);
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const requests = media.map(async (media:any, index: number) => {
            return fetch(`${apiBaseUrl}/api/upload-prop-image`, {
                method: "POST",
                headers:{
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({"image_url": media.MediaURL, "prop_address": prop_address, "index": index})
            }).then((resps): Promise<any> => {
                return resps.json();
            }).then(data => {
                return data
            })
        });

        // Use Promise.all to send all requests in parallel
        responses = await Promise.all(requests);
        //console.log("Update image responses:", responses);

    }else{
        console.log("Media not found for:", listing_id, "media:", media)
    }
    
    const isUploaded = await listings_repo.AddUploadedImages(listing_id, responses);
    res.status(200).json({"Info": `Done with ${listing_id}: ${isUploaded}`});

  } catch (error) {
    await listings_repo.ResetUploadImageStatus(listing_id);
    //console.error('Error updating image:', error);
    res.status(500).json({"Error": 'Error updating image: '+error});
  }
};