import { Helpers } from "@/_lib/helpers";
import { APIResponseProps, AddServiceParams, CheckSlugParams } from "@/components/types";
import * as formidable from "formidable";
import { NextApiRequest } from "next";
import { MYSQLServiceRepo } from "@/_repo/service_repo";
import fs from "fs";
import { Readable } from "stream";

export class ServicesService {

    comm_repo = new MYSQLServiceRepo();
    helpers = new Helpers();

    public NameToSlug(str: string): string{
        return str.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
    }

    public async AddNewService(req: NextApiRequest): Promise<APIResponseProps> {
        
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
                            old_header_image_loc = old_header_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/service_uploads/`, "../service_uploads/");
                        }

                        let header_image = {
                            image_loc: old_header_image?.image_loc || "", //Still uses the one with http
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

                        const isSlugAvailable = await this.comm_repo.CheckServiceSlug(params);
                        if(isSlugAvailable < 1){
                            
                            if(files.file?.length){

                                let folder = "service_uploads";
                                
                                const imageName = `logo-${Date.now()}-${files.file[0].originalFilename}`; // Use a unique name for the image
                                const formData = new FormData();

                                const stream = fs.createReadStream(files.file[0].filepath);
                                const buffer = await streamToBuffer(stream);
                                const blob = new Blob([buffer], { type: files.file[0]?.mimetype as string });
                                formData.append('image', blob, imageName);
                                formData.append('old_header_image_loc', old_header_image_loc);
                                formData.append('submit_type', submit_type);
                                formData.append('upload_type', "service_header");

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

                                    header_image = {
                                        image_loc: img_loc
                                    };
                                }

                            }

                            const add_params: AddServiceParams = {
                                draft_id: draft_id,
                                friendly_name: this.helpers.GetParsedFieldString(req_body.friendly_name),
                                slug: this.helpers.GetParsedFieldString(req_body.slug),
                                excerpt: this.helpers.GetParsedFieldString(req_body.excerpt),
                                post_body: this.helpers.GetParsedFieldString(req_body.post_body),
                                submit_type: submit_type,
                                header_image: header_image,
                                menus: this.helpers.GetParsedFieldString(req_body.menus),
                            }
                            
                            const [isCatAdded, service_draft_id] = await this.comm_repo.AddNewService(add_params);
                            if(isCatAdded){
                                
                                default_resp.success = true;
                                default_resp.data = {service_draft_id: service_draft_id, header_image: header_image};
                                if(submit_type == "Draft"){
                                    default_resp.message = "Service page successfully saved to draft."
                                }else{
                                    default_resp.message = "Service page successfully published."
                                }
                            
                            }else{
                                default_resp.message = "Unable to add new service page."
                            }

                        }else{
                            default_resp.message = "Slug already exist, try another slug."
                        }

                    }catch(e:any){
                        console.error(e);
                        default_resp.message = 'Error adding service page '+e.message
                    }

                }

                resolve(default_resp); // Resolve the promise with the response

            });
        });

    }

    public async LoadServiceInfo(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const slug = req_body.slug;
        const search_by = req_body.search_by;
        
        if(!slug || slug == "" || !search_by || search_by == ""){
            default_resp.message = "Invalid service info provided.";
        }else{

            const service_info = await this.comm_repo.LoadServiceInfo(slug, search_by);
            default_resp.success = true;
            default_resp.data = {service_info: service_info};

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
            default_resp.message = "Invalid service info provided.";
        }else{

            const draft_info = await this.comm_repo.LoadDraftInfo(draft_id);
            default_resp.data = {draft_info: draft_info};

        }

        return default_resp;

    }

    public async UpdateService(req: NextApiRequest): Promise<APIResponseProps> {

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
                        if(!req_body.friendly_name || !req_body.slug){
                            default_resp.message = "Provide a valid friendly name and slug";
                            resolve(default_resp);
                        }

                        let old_header_image = this.helpers.GetParsedFieldJSON(req_body.old_header_image);
                        let published_header_image = this.helpers.GetParsedFieldJSON(req_body.published_header_image);
                        const submit_type = this.helpers.GetParsedFieldString(req_body.submit_type);
                        let old_header_image_loc = old_header_image?.image_loc; 
                        let pub_image_loc = published_header_image?.image_loc; 

                        if(old_header_image_loc && old_header_image_loc!=""){
                            old_header_image_loc = old_header_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/service_uploads/`, "../service_uploads/");
                        }

                        if(pub_image_loc && pub_image_loc!=""){
                            pub_image_loc = pub_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/service_uploads/`, "../service_uploads/");
                        }

                        let header_image = {
                            image_loc: old_header_image_loc || "", 
                        }; 

                        const draft_id = parseInt(this.helpers.GetParsedFieldString(req_body.draft_id));
                        const params: CheckSlugParams = {
                            check_by: "Slug Alt",
                            slug: this.helpers.GetParsedFieldString(req_body.slug),
                            draft_id: draft_id
                        }  

                        const isSlugAvailable = await this.comm_repo.CheckServiceSlug(params);
                        if(isSlugAvailable < 1){
                            
                            let folder = "service_uploads";
                            
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
                                formData.append('upload_type', "service_header");

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

                                    header_image = {
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

                            const add_params: AddServiceParams = {
                                draft_id: draft_id,
                                friendly_name: this.helpers.GetParsedFieldString(req_body.friendly_name),
                                slug: this.helpers.GetParsedFieldString(req_body.slug),
                                excerpt: this.helpers.GetParsedFieldString(req_body.excerpt),
                                post_body: this.helpers.GetParsedFieldString(req_body.post_body),
                                submit_type: submit_type,
                                header_image: header_image,
                                menus: this.helpers.GetParsedFieldString(req_body.menus),
                                date_added: this.helpers.GetParsedFieldString(req_body.date_added),
                            }
                            
                            const isPostUpdated = await this.comm_repo.UpdateService(add_params);
                            if(isPostUpdated){

                                default_resp.success = true;
                                default_resp.data = {header_image: header_image};
                                if(submit_type == "Draft"){
                                    default_resp.message = "Service page successfully saved to draft."
                                }else{
                                    default_resp.message = "Service page successfully published."
                                }
                            
                            }else{
                                default_resp.message = "Unable to update service page."
                            }

                        }else{
                            default_resp.message = "Slug already exist, try another slug."
                        }

                    }catch(e:any){
                        default_resp.message = 'Error updating blog post '+e.message
                    }
                    
                }

                resolve(default_resp); // Resolve the promise with the response

            });
        
        });

    }

    public async DeleteService(req: NextApiRequest): Promise<APIResponseProps> {
        
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
        
        const req_body = req.body;
        const draft_id = req_body.draft_id;

        if(!draft_id){
            default_resp.message = "Fatal error. Invalid service info provided.";
        }

        const draft_info = await this.comm_repo.LoadDraftInfo(draft_id) as any;
        const del_resp = await this.comm_repo.DeleteService(draft_id);
        
        if(del_resp){

            let header_image_loc = draft_info?.header_image?.image_loc;
            if(header_image_loc && header_image_loc!=""){
                header_image_loc = header_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/service_uploads/`, "../service_uploads/");
            }

            let pub_image_loc = draft_info?.published_header_image?.image_loc;
            if(pub_image_loc && pub_image_loc!=""){
                pub_image_loc = pub_image_loc.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/service_uploads/`, "../service_uploads/");
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

            default_resp.success = true;
            default_resp.message = "Service page successfully deleted.";

        }else{
            default_resp.message = "Unable to delete service page.";
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