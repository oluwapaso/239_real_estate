import { CityService } from "@/_services/city_service";
import { NextApiRequest, NextApiResponse } from "next"

//This is important for formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const comm_service = new CityService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "PATCH"){
        
        const response = await comm_service.UpdateCity(req);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
