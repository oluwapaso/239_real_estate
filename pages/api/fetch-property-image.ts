import { MysqlListingsRepo } from "@/_repo/listings_repo";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    try{

        const listings_repo = new MysqlListingsRepo();
        const props_prms = listings_repo.GetPropsWithoutImage(3);
        const props = await props_prms;

        if(props.length>0){

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            // Map each URL to a fetch request
            const requests = props.map(async prop => {
                const prop_address = `${prop.UnparsedAddress}-${prop.City}`;
                console.log("Fetching for:", prop.listing_id);
                return fetch(`${apiBaseUrl}/api/update-prop-image`, {
                    method: "POST",
                    headers:{
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify({"listing_id": prop.listing_id, "media": prop.Media, "prop_address": prop_address})
                }).then((resps): Promise<any> => {
                    return resps.json();
                }).then(data => {
                    return data
                })
            });

            // Use Promise.all to send all requests in parallel
            const responses = await Promise.all(requests);
            console.log("Fetch image responses:", responses);
            
            resp.status(200).json({"status":"Success", "message": "Fetch images for "+props.length+" properties", "responses":responses});
            // Extract the JSON data from each response

        }else{
            console.log("No prop image to download");
            resp.status(200).json({"status":"Error", "message": "No prop image to download"});
        }
        
    }catch(e: any){
        console.log("error:", e.message);
        resp.status(200).json({"status":"Error", "message": e.message});
    }
    
}