import { BlogService } from "@/_services/blog_service"
import { NextApiRequest, NextApiResponse } from "next"

const blog_service = new BlogService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const response = await blog_service.DeleteBlogPost(req);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
