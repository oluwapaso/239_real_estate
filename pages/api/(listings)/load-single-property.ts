import { ListingsService } from "@/_services/listing_service";
import { NextApiRequest, NextApiResponse } from "next";

const listingsService = new ListingsService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const property = await listingsService.LoadSingleProperty(req);
        resp.status(200).json(property);

    }else{
        resp.status(405).end()
    }

}