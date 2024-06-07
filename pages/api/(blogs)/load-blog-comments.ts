import { MYSQLBlogRepo } from "@/_repo/blog_repo";
import { LoadPostCommentsParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const blogsRepo = new MYSQLBlogRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const post_id = req_body.post_id
        const page = req_body.page
        const limit = req_body.limit
        const paginated = req_body.paginated;

        const params: LoadPostCommentsParams = {
            post_id: post_id,
            paginated: paginated,
            page: page, 
            limit: limit
        }
        
        const blog_cats = await blogsRepo.LoadPostComments(params)
        resp.status(200).json(blog_cats);

    }else{
        resp.status(405).end()
    }

}