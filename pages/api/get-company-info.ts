import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { NextApiRequest, NextApiResponse } from "next";

const compRepo = new MYSQLCompanyRepo()
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const comp_info = await compRepo.GetCompayInfo();
        resp.status(200).json(comp_info);

    }else{
        resp.status(405).end();
    }

}