import { MYSQLCityRepo } from "@/_repo/city_repo";
import { LoadCitiesParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const city_repo = new MYSQLCityRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const page = req_body.page
        const post_type =req_body.post_type
        const limit = req_body.limit
        const paginated = req_body.paginated;

        const params: LoadCitiesParams = {
            paginated: paginated,
            post_type: post_type,
            page: page, 
            limit: limit
        }
        
        const commuities = await city_repo.LoadCities(params)
        resp.status(200).json(commuities);

    }else{
        resp.status(405).end()
    }

}