import { Helpers } from "@/_lib/helpers";
import { APIResponseProps, UpdateCityParams } from "@/components/types";
import * as formidable from "formidable";
import { NextApiRequest } from "next";
import { Readable } from "stream";
import { MYSQLCityRepo } from "@/_repo/city_repo";

export class CityService {

    comm_repo = new MYSQLCityRepo();
    helpers = new Helpers();

    public NameToSlug(str: string): string{
        return str.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
    }

    public async LoadCityInfo(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const keyword = req_body.keyword;
        const search_by = req_body.search_by;
        if(!keyword || keyword == "" || !search_by || search_by == ""){
            default_resp.message = "Invalid city info provided.";
        }else{

            const city_info = await this.comm_repo.LoadCityInfo(keyword, search_by);
            default_resp.success = true;
            default_resp.data = {city_info: city_info};

        }

        return default_resp;

    }

    public async UpdateCity(req: NextApiRequest): Promise<APIResponseProps> {

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
                        if(!req_body.mls_name || !req_body.friendly_name){
                            default_resp.message = "Provide a valid MLS name and friendly name";
                            resolve(default_resp);
                        }

                        let old_header_image = this.helpers.GetParsedFieldJSON(req_body.header_image);
                        let draft_header_image = this.helpers.GetParsedFieldJSON(req_body.draft_header_image);
                        const submit_type = this.helpers.GetParsedFieldString(req_body.submit_type);
                        let header_image_loc = old_header_image?.image_loc; 
                        let draft_image_loc = draft_header_image?.image_loc; 
                        
                        let header_image = {
                            image_loc: header_image_loc || "", 
                        }; 

                        const city_id = parseInt(this.helpers.GetParsedFieldString(req_body.city_id));
                        if(files.file?.length){
 
                            const imageName = `logo-${Date.now()}-${files.file[0].originalFilename}`; // Use a unique name for the image
                            const filePath = files.file[0].filepath;
                            const fileUrl = await this.helpers.uploadToS3(filePath, imageName);
                            header_image = {
                                image_loc: fileUrl
                            };
                            
                            //Delete old image if exist
                            if (draft_image_loc != "" && draft_image_loc != header_image_loc && submit_type == "Draft") {
                                await this.helpers.deleteS3Image(draft_image_loc);
                            }

                            //Delete old image if exist
                            if (submit_type == "Publish") {

                                if (header_image_loc != "") {
                                    await this.helpers.deleteS3Image(header_image_loc);
                                }

                                if (draft_image_loc != "") {
                                    await this.helpers.deleteS3Image(draft_image_loc);
                                }
                            }

                        }else {
                            if(draft_image_loc != "" && header_image_loc != draft_image_loc && submit_type == "Publish"){
                                await this.helpers.deleteS3Image(draft_image_loc);
                            }
                        }
                        
                        const add_params: UpdateCityParams = {
                            city_id: city_id,
                            mls_name: this.helpers.GetParsedFieldString(req_body.mls_name),
                            friendly_name: this.helpers.GetParsedFieldString(req_body.friendly_name),
                            excerpt: this.helpers.GetParsedFieldString(req_body.excerpt),
                            post_body: this.helpers.GetParsedFieldString(req_body.post_body),
                            submit_type: submit_type,
                            header_image: header_image,
                            menus: this.helpers.GetParsedFieldString(req_body.menus),
                        }
                        
                        const isPostUpdated = await this.comm_repo.UpdateCity(add_params);
                        if(isPostUpdated){

                            default_resp.success = true;
                            default_resp.data = {header_image: header_image};
                            if(submit_type == "Draft"){
                                default_resp.message = "City page successfully saved to draft."
                            }else{
                                default_resp.message = "City page successfully published."
                            }
                        
                        }else{
                            default_resp.message = "Unable to update city page."
                        }

                    }catch(e:any){
                        default_resp.message = 'Error updating city page '+e.message
                    }
                    
                }

                resolve(default_resp); // Resolve the promise with the response

            });
        
        });

    }

    public async LoadCityStats(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const slug = req_body.slug;
        if(!slug || slug == ""){
            default_resp.message = "Invalid city info provided.";
        }else{

            const city_stats = await this.comm_repo.LoadCityStats(slug);
            default_resp.success = true;
            default_resp.data = {city_stats: city_stats};

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