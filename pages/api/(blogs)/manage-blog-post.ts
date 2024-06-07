import { BlogService } from "@/_services/blog_service"
import { NextApiRequest, NextApiResponse } from "next"

//This is important for formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const blog_service = new BlogService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){


    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const response = await blog_service.AddNewBlogPost(req);
        resp.status(200).json(response);

    } else if(req.method == "PATCH"){
        
        const response = await blog_service.UpdateBlogPost(req);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
