import { BlogService } from "@/_services/blog_service";
import { NextApiRequest, NextApiResponse } from "next";

const blog_service = new BlogService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const comp_info = await blog_service.LoadDraftInfo(req)
        resp.status(200).json(comp_info);

    }else{
        resp.status(405).end()
    }

}