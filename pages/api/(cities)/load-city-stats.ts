import { CityService } from "@/_services/city_service";
import { NextApiRequest, NextApiResponse } from "next";

const city_service = new CityService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const comp_info = await city_service.LoadCityStats(req)
        resp.status(200).json(comp_info);

    }else{
        resp.status(405).end()
    }

}