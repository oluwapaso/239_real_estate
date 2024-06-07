import { BlogService } from "@/_services/blog_service";
import { APIResponseProps, AddAgentParams, CheckSlugParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const blog_service = new BlogService()

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body
        const category_name = req_body.category_name
        const slug = blog_service.NameToSlug(category_name)

        const check_slug: CheckSlugParams = {
            check_by:"Slug",
            slug,
            category_name
        }

        const response = await blog_service.AddBlogCategory(check_slug) 
        if(response.success){

            resp.status(200).json(response)

        }else{
            resp.status(400).json({"message":response.message, "success": false})
        }
    
    }else if(req.method == "PATCH") {
        
        const req_body = req.body
        const category_name = req_body.category_name
        const category_id = req_body.category_id
        const slug = blog_service.NameToSlug(category_name)

        const check_slug: CheckSlugParams = {
            check_by:"Slug Alt",
            category_id,
            slug,
            category_name
        }
        
        const response = await blog_service.UpdateBlogCategory(check_slug) 
        if(response.success){

            resp.status(200).json(response)

        }else{
            resp.status(400).json({"message":response.message, "success": false})
        }
    
    }else if(req.method == "DELETE") {
        
        const response = await blog_service.DeleteBlogCategory(req) 
        if(response.success){
            resp.status(200).json(response);
        }else{
            resp.status(400).json({"message":response.message, "success": false})
        }
    
    }else{ 
        resp.status(400).json({"message":"Bad request", "success": false})
    }

}