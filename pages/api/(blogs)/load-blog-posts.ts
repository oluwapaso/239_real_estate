import { MYSQLBlogRepo } from "@/_repo/blog_repo";
import { LoadBlogPostsParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const blogsRepo = new MYSQLBlogRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const page = req_body.page
        const post_type =req_body.post_type
        const limit = req_body.limit
        const paginated = req_body.paginated;
        const category_id = req_body.category_id;
        const keyword = req_body.keyword;

        const params: LoadBlogPostsParams = {
            paginated: paginated,
            post_type: post_type,
            page: page, 
            limit: limit,
            category_id: category_id,
            keyword: keyword,
        }
        
        const blog_cats = await blogsRepo.LoadBlogPosts(params)
        resp.status(200).json(blog_cats);

    }else{
        resp.status(405).end()
    }

}