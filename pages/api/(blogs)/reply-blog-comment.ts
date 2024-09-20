import { BlogService } from "@/_services/blog_service";
import { APIResponseProps } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const blog_service = new BlogService()

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {

        const response = await blog_service.ReplyBlogPostComment(req); 
        if(response.success){

            resp.status(200).json(response)

        }else{
            resp.status(400).json({"message":response.message, "success": false})
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request", "success": false})
    
    }

}