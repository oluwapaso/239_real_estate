import { Helpers } from "@/_lib/helpers";
import { MYSQLBlogRepo } from "@/_repo/blog_repo";
import { APIResponseProps, AddBlogPostParams, AddCategoryParams, AddPostCommetsParams, AddPostReplyParams, CheckSlugParams, UpdateCategoryParams } from "@/components/types";
import * as formidable from "formidable";
import { NextApiRequest } from "next";
import { Readable } from "stream";
import fs from "fs";

export class BlogService {

    blog_repo = new MYSQLBlogRepo();
    helpers = new Helpers();

    public NameToSlug(str: string): string{
        return str.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
    }

    public async AddBlogCategory(params: CheckSlugParams): Promise<APIResponseProps> {
        
        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        const slug = params.slug
        if(slug && slug!=""){

            const isSlugAvailable = await this.blog_repo.CheckCategorySlug(params);
            if(isSlugAvailable < 1){

                const add_cat: AddCategoryParams = {
                    slug,
                    category_name: params.category_name || ""
                }

                const isCatAdded = await this.blog_repo.AddNewCategory(add_cat);

                if(isCatAdded){

                    default_resp.success = true;
                    default_resp.message = "Category successfully added."
                
                }else{
                    default_resp.message = "Unable to add new blog category."
                }

            }else{
                default_resp.message = "Category name already exist, try another name."
            }

        }else{
            default_resp.message = "Provide a valid category name."
        }
        
        return default_resp

    }

    public async UpdateBlogCategory(params: CheckSlugParams): Promise<APIResponseProps> {
        
        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        const slug = params.slug
        if(slug && slug!=""){

            const isSlugAvailable = await this.blog_repo.CheckCategorySlug(params);
            if(isSlugAvailable < 1){

                const up_cat: UpdateCategoryParams = {
                    slug,
                    category_id: params.category_id || 0,
                    category_name: params.category_name || ""
                }

                const isCatAdded = await this.blog_repo.UpdateCategory(up_cat);

                if(isCatAdded){

                    default_resp.success = true;
                    default_resp.message = "Category successfully updated."
                
                }else{
                    default_resp.message = "Unable to update blog category."
                }

            }else{
                default_resp.message = "Category name already exist, try another name."
            }

        }else{
            default_resp.message = "Provide a valid category name."
        }
        
        return default_resp

    }


    public async AddNewBlogPost(req: NextApiRequest): Promise<APIResponseProps> {
        
        const form = new formidable.IncomingForm();
        return new Promise<APIResponseProps>((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                const default_resp = {
                    message: "",
                    data: {},
                    success: false,
                }

                if (err) {
                    default_resp.message = "Error parsing form data"
                }else{

                    try{

                        const req_body = fields;
                        const submit_type = this.helpers.GetParsedFieldString(req_body.submit_type);
                        let old_header_image = this.helpers.GetParsedFieldJSON(req_body.old_header_image); 
                        let old_header_image_loc = old_header_image?.image_loc;

                        if(old_header_image_loc && old_header_image_loc!=""){
                            old_header_image_loc = old_header_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/blog_uploads/`, "../blog_uploads/");
                        }

                        let header_file_name = {
                            image_loc:old_header_image?.image_loc || "", //Still uses the one with http
                        }; 

                        let check_by = "Slug";
                        const draft_id = parseInt(this.helpers.GetParsedFieldString(req_body.draft_id));
                        
                        if(draft_id > 0){
                            check_by = "Slug Alt";
                        }

                        const params: CheckSlugParams = {
                            check_by: check_by,
                            slug: this.helpers.GetParsedFieldString(req_body.slug),
                            draft_id: draft_id
                        } 

                        const isSlugAvailable = await this.blog_repo.CheckBlogSlug(params);
                        if(isSlugAvailable < 1){
                            
                            if(files.file?.length){

                                let folder = "blog_uploads";

                                const imageName = `logo-${Date.now()}-${files.file[0].originalFilename}`; // Use a unique name for the image
                                const formData = new FormData();

                                const stream = fs.createReadStream(files.file[0].filepath);
                                const buffer = await streamToBuffer(stream);
                                const blob = new Blob([buffer], { type: files.file[0]?.mimetype as string });
                                formData.append('image', blob, imageName);
                                formData.append('old_header_image_loc', old_header_image_loc);
                                formData.append('submit_type', submit_type);
                                formData.append('upload_type', "blog_header");

                                const phpServerUrl = `${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/next-requests/upload_images.php`; // Replace with your PHP server URL
                                const phpResponse = await fetch(phpServerUrl, {
                                method: 'POST',
                                body: formData,
                                }).then((resp): Promise<APIResponseProps> => {
                                    return resp.json();
                                }).then(data => {
                                return data;
                                });

                                if(phpResponse?.success){

                                    let img_loc = phpResponse?.data as string;
                                    img_loc = img_loc.replace("../",`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/`);

                                    header_file_name = {
                                        image_loc: img_loc
                                    };
                                }

                            }

                            const add_params: AddBlogPostParams = {
                                draft_id: draft_id,
                                post_title: this.helpers.GetParsedFieldString(req_body.post_title),
                                slug: this.helpers.GetParsedFieldString(req_body.slug),
                                excerpt: this.helpers.GetParsedFieldString(req_body.excerpt),
                                post_body: this.helpers.GetParsedFieldString(req_body.post_body),
                                submit_type: submit_type,
                                header_image: header_file_name,
                                categories: this.helpers.GetParsedFieldArray(req_body.categories),
                                menus: this.helpers.GetParsedFieldString(req_body.menus),
                            }
                            
                            const [isCatAdded, post_draft_id] = await this.blog_repo.AddNewBlogPost(add_params);
                            if(isCatAdded){

                                const categories = this.helpers.GetParsedFieldArray(req_body.categories); 
                                if(categories.length){
                                    categories.forEach((cats:string) => {
                                        this.blog_repo.updateCategoryCounts(cats);
                                    });
                                }
                                
                                default_resp.success = true;
                                default_resp.data = {post_draft_id: post_draft_id, header_file_name: header_file_name};
                                if(submit_type == "Draft"){
                                    default_resp.message = "Blog post successfully saved to draft."
                                }else{
                                    default_resp.message = "Blog post successfully published."
                                }
                            
                            }else{
                                default_resp.message = "Unable to add new blog post."
                            }

                        }else{
                            default_resp.message = "Slug already exist, try another slug."
                        }

                    }catch(e:any){
                        console.error(e);
                        default_resp.message = 'Error adding blog post '+e.message
                    }

                }

                resolve(default_resp); // Resolve the promise with the response

            });
        });

    }

    public async LoadBlogInfo(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const slug = req_body.slug;
        
        if(!slug || slug == ""){
            default_resp.message = "Invalid post info provided.";
        }else{

            const draft_info = await this.blog_repo.LoadBlogInfo(slug);
            default_resp.success = true;
            default_resp.data = {draft_info: draft_info};

        }

        return default_resp;

    }

    public async LoadDraftInfo(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const draft_id = req_body.draft_id;
        
        if(!draft_id || draft_id < 1){
            default_resp.message = "Invalid post info provided.";
        }else{

            const draft_info = await this.blog_repo.LoadDraftInfo(draft_id);
            default_resp.success = true;
            default_resp.data = {draft_info: draft_info};

        }

        return default_resp;

    }

    public async UpdateBlogPost(req: NextApiRequest): Promise<APIResponseProps> {

        const form = new formidable.IncomingForm();
        return new Promise<APIResponseProps>((resolve, reject) => {

            form.parse(req, async (err, fields, files) => {

                const default_resp = {
                    message: "",
                    data: {},
                    success: false,
                }
                
                if (err) {
                    default_resp.message = "Error parsing form data"
                }else{

                    try{
                        
                        const req_body = fields;
                        if(!req_body.post_title || !req_body.slug){
                            default_resp.message = "Provide a valid title and slug";
                            resolve(default_resp);
                        }

                        let old_header_image = this.helpers.GetParsedFieldJSON(req_body.old_header_image);
                        let old_categories = this.helpers.GetParsedFieldArray(req_body.old_categories);
                        let published_header_image = this.helpers.GetParsedFieldJSON(req_body.published_header_image);
                        const submit_type = this.helpers.GetParsedFieldString(req_body.submit_type);
                        let old_header_image_loc = old_header_image?.image_loc; 
                        let pub_image_loc = published_header_image?.image_loc;
                        
                        if(old_header_image_loc && old_header_image_loc!=""){
                            old_header_image_loc = old_header_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/blog_uploads/`, "../blog_uploads/");
                        }

                        if(pub_image_loc && pub_image_loc!=""){
                            pub_image_loc = pub_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/blog_uploads/`, "../blog_uploads/");
                        }

                        let header_file_name = {
                            image_loc: old_header_image?.image_loc || "",
                        }; 

                        const draft_id = parseInt(this.helpers.GetParsedFieldString(req_body.draft_id));
                        const params: CheckSlugParams = {
                            check_by: "Slug Alt",
                            slug: this.helpers.GetParsedFieldString(req_body.slug),
                            draft_id: draft_id
                        }  

                        const isSlugAvailable = await this.blog_repo.CheckBlogSlug(params);
                        if(isSlugAvailable < 1){
                            
                            let folder = "blog_uploads";

                            if(files.file?.length){

                                const imageName = `logo-${Date.now()}-${files.file[0].originalFilename}`; // Use a unique name for the image
                                const formData = new FormData();

                                const stream = fs.createReadStream(files.file[0].filepath);
                                const buffer = await streamToBuffer(stream);
                                const blob = new Blob([buffer], { type: files.file[0]?.mimetype as string });
                                formData.append('image', blob, imageName);
                                formData.append('old_header_image_loc', old_header_image_loc);
                                formData.append('submit_type', submit_type);
                                formData.append('pub_image_loc', pub_image_loc);
                                formData.append('upload_type', "blog_header");

                                const phpServerUrl = `${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/next-requests/upload_images.php`; // Replace with your PHP server URL
                                const phpResponse = await fetch(phpServerUrl, {
                                method: 'POST',
                                body: formData,
                                }).then((resp): Promise<APIResponseProps> => {
                                    return resp.json();
                                }).then(data => {
                                return data;
                                });

                                if(phpResponse?.success){

                                    let img_loc = phpResponse?.data as string;
                                    img_loc = img_loc.replace("../",`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/`);

                                    header_file_name = {
                                        image_loc: img_loc
                                    };
                                }

                            }else {
                                if(pub_image_loc != "" && old_header_image_loc != pub_image_loc && submit_type == "Publish"){

                                    const phpServerUrl = `${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/next-requests/delete_images.php`; // Replace with your PHP server URL
                                    const phpResponse = await fetch(phpServerUrl, {
                                    method: 'POST',
                                    body: JSON.stringify({"images":[pub_image_loc]}),
                                    }).then((resp): Promise<APIResponseProps> => {
                                        return resp.json();
                                    }).then(data => {
                                    return data;
                                    });

                                }
                            }

                            const add_params: AddBlogPostParams = {
                                draft_id:draft_id,
                                post_title: this.helpers.GetParsedFieldString(req_body.post_title),
                                slug: this.helpers.GetParsedFieldString(req_body.slug),
                                excerpt: this.helpers.GetParsedFieldString(req_body.excerpt),
                                post_body: this.helpers.GetParsedFieldString(req_body.post_body),
                                submit_type: submit_type,
                                header_image: header_file_name,
                                categories: this.helpers.GetParsedFieldArray(req_body.categories),
                                menus: this.helpers.GetParsedFieldString(req_body.menus),
                                date_added: this.helpers.GetParsedFieldString(req_body.date_added),
                            }
                            
                            const isPostUpdated = await this.blog_repo.UpdateBlogPost(add_params);
                            if(isPostUpdated){

                                const categories = this.helpers.GetParsedFieldArray(req_body.categories); 
                                const all_cats = Array.from(new Set([...old_categories, ...categories]));
                                if(all_cats.length){
                                    all_cats.forEach((cats:string) => {
                                        this.blog_repo.updateCategoryCounts(cats);
                                    });
                                }

                                default_resp.success = true;
                                default_resp.data = {header_file_name: header_file_name};
                                if(submit_type == "Draft"){
                                    default_resp.message = "Blog post successfully saved to draft."
                                }else{
                                    default_resp.message = "Blog post successfully published."
                                }
                            
                            }else{
                                default_resp.message = "Unable to update blog post."
                            }

                        }else{
                            default_resp.message = "Slug already exist, try another slug."
                        }

                    }catch(e){
                        default_resp.message = 'Error updating blog post '+e
                    }
                    
                }

                resolve(default_resp); // Resolve the promise with the response

            });
        
        });

    }

    public async AddBlogPostComment(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
         
        const req_body = req.body;

        if(!req_body.fullname || !req_body.email || !req_body.comments || !req_body.draft_id){
            default_resp.message = "Fatal error. Missing important fields.";
        }
 
        const add_params: AddPostCommetsParams = {
            draft_id: req_body.draft_id,
            reply_by: "Client",
            name: req_body.fullname,
            email: req_body.email,
            comments: req_body.comments,
        }

        const isCommAdded = await this.blog_repo.AddPostComment(add_params);
        if(isCommAdded){

            default_resp.success = true;
            default_resp.message = "Comments added"
        
        }else{
            default_resp.message = "Unable to add your comment."
        }

        return default_resp;

    }
    
    public async ReplyBlogPostComment(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
         
        const req_body = req.body;

        if(!req_body.comment_body || !req_body.comment_id){
            default_resp.message = "Fatal error. Missing important fields.";
        }
 
        const add_params: AddPostReplyParams = {
            comment_id: req_body.comment_id,
            draft_id: req_body.draft_id,
            comment_parent: req_body.comment_parent,
            comments: req_body.comments,
            reply_by: req_body.reply_by,
        }

        const isReplyAdded = await this.blog_repo.AddPostReply(add_params);
        if(isReplyAdded){

            default_resp.success = true;
            default_resp.message = "Reply successfully added."
        
        }else{
            default_resp.message = "Unable to add new reply."
        }

        return default_resp;

    }

    public async DeleteBlogPost(req: NextApiRequest): Promise<APIResponseProps> {
        
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
        
        const req_body = req.body;
        const draft_id = req_body.draft_id;

        if(!draft_id){
            default_resp.message = "Fatal error. Invalid post info provided.";
        }

        const draft_info = await this.blog_repo.LoadDraftInfo(draft_id) as any;
        const categories = draft_info.categories;
        const del_resp = await this.blog_repo.DeleteBlogPost(draft_id);
        
        if(del_resp){

            let header_image_loc = draft_info?.header_image?.image_loc;
            if(header_image_loc && header_image_loc!=""){
                header_image_loc = header_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/blog_uploads/`, "../blog_uploads/");
            }

            let pub_image_loc = draft_info?.published_header_image?.image_loc;
            if(pub_image_loc && pub_image_loc!=""){
                pub_image_loc = pub_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/blog_uploads/`, "../blog_uploads/");
            }

            const phpServerUrl = `${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/next-requests/delete_images.php`; // Replace with your PHP server URL
            const phpResponse = await fetch(phpServerUrl, {
            method: 'POST',
            body: JSON.stringify({"images":[header_image_loc, pub_image_loc]}),
            }).then((resp): Promise<APIResponseProps> => {
                return resp.json();
            }).then(data => {
            return data;
            });

            if(categories && categories.length){
                categories.forEach((cats: string) => {
                    this.blog_repo.updateCategoryCounts(cats);
                });
            }

            default_resp.success = true;
            default_resp.message = "Blog post successfully deleted.";

        }else{
            default_resp.message = "Unable to delete blog post.";
        }

        return default_resp;

    }

    public async DeleteBlogCategory(req: NextApiRequest): Promise<APIResponseProps> {
        
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
        
        const req_body = req.body;
        const category_id = req_body.category_id;

        if(!category_id){
            default_resp.message = "Fatal error. Invalid category info provided.";
        }

        const del_resp = await this.blog_repo.DeleteBlogCategory(category_id);
        if(del_resp){

            default_resp.success = true;
            default_resp.message = "Category successfully deleted.";

        }else{
            default_resp.message = "Unable to delete category.";
        }

        return default_resp;

    }

    public async AddBlogView(req: NextApiRequest): Promise<APIResponseProps> {
        
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
        
        const req_body = req.body;
        const slug = req_body.slug;
        const logged_id = req_body.logged_id;

        if(!slug || slug == "" || !logged_id || logged_id == ""){
            default_resp.message = "Fatal error. Invalid blog info provided.";
        }

        const del_resp = await this.blog_repo.AddBlogView(slug, logged_id);
        if(del_resp){

            default_resp.success = true;
            default_resp.message = "View successfully successfully.";

        }else{
            default_resp.message = "Unable to add view.";
        }

        return default_resp;

    }

}


// Helper function to convert a Readable stream to a Buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (error) => reject(error));
  });
}