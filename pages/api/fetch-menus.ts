import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { NextApiRequest, NextApiResponse } from "next";

const compRepo = new MYSQLCompanyRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    resp.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins, you can restrict this to specific origins
    resp.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if(req.method == "OPTIONS"){
        resp.status(200).end();
    } else if(req.method == "POST"){

        const comp_info = await compRepo.LoadMenus();
        resp.status(200).json(comp_info);

    }else{
        resp.status(405).end();
    }

}