import { MysqlListingsRepo } from "@/_repo/listings_repo";
import { ListingsService } from "@/_services/listing_service";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    try{

        const listing_service = new ListingsService();
        const listings_repo = new MysqlListingsRepo();
        const next_link_prms = listings_repo.GetNextReplicateLink();
        const next_link = await next_link_prms;

        if(next_link.includes("https://api.mlsgrid.com/v2")){

            console.log('Fetching data from API: ', next_link);
            fetch(next_link, {
                method:"GET",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_MLS_API_TOKEN}`,
                }
            }).then((resp) => {
                return resp.json(); 
            }).then(async (data) => {

                //console.log("data:", data);

                if(data?.value?.length>0){

                    listing_service.AddNewListing(data?.value);

                    let new_next_link = data["@odata.nextLink"];
                    if(new_next_link && new_next_link !=""){
                        console.log("Update new next_link");
                    }else{
                        new_next_link = "";
                    }

                    await listings_repo.UpdateNextLink(new_next_link);
                    resp.status(200).json({"status":"Success", "message": "Found "+data?.value?.length+" data"});

                }else{
                    console.log("No data found.");
                    resp.status(200).json({"status":"Error", "message": "No data found."});
                }

            }).catch((e: any) => {
                console.log(e.message);
                resp.status(200).json({"status":"Error", "message": e.message});
            });

        }else{
            console.log("Next link error:", next_link);
            resp.status(200).json({"status":"Error", "message": "Next link error: "+next_link});
        }
        

    }catch(e: any){
        console.log("error:", e.message);
        resp.status(200).json({"status":"Error", "message": e.message});
    }

}