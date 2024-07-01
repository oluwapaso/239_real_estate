import { ListingsService } from "@/_services/listing_service";
import { NextApiRequest, NextApiResponse } from "next";

const listingsService = new ListingsService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {

    resp.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins, you can restrict this to specific origins
    resp.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if(req.method == "OPTIONS"){
        resp.status(200).end();
    } else if(req.method == "POST"){
        
        const blog_cats = await listingsService.LoadListings(req);
        resp.status(200).json(blog_cats);

    }else{
        resp.status(405).end()
    }

}