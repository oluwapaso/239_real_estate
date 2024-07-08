import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import * as formidable from "formidable";
import { MYSQLAgentsRepo } from "@/_repo/agents_repo";
import { APIResponseProps } from "@/components/types"; 
import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { Readable } from "stream";
import fs from "fs"; 

//This is important for formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler: NextApiHandler = async (req: NextApiRequest, resp: NextApiResponse) => {

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    if (err) {
      return resp.status(500).json({ succes: false, message: 'Error parsing form data' });
    }

    try {

      if(files.file?.length){

        let update_resp: Promise<APIResponseProps> = {} as Promise<APIResponseProps>

        let agent_id = "";
        let old_dp = "";
        let old_logo = "";
        let old_header = "";
        let upload_type = ""; 
        
        if(fields.upload_type?.length){
            upload_type = fields.upload_type[0];
        }
        
        if(fields.agent_id?.length){
            agent_id = fields.agent_id[0];
        }

        const imageName = `logo-${Date.now()}-${files.file[0].originalFilename}`; // Use a unique name for the image
        const formData = new FormData();

        const stream = fs.createReadStream(files.file[0].filepath);
        const buffer = await streamToBuffer(stream);
        const blob = new Blob([buffer], { type: files.file[0]?.mimetype as string });
        formData.append('image', blob, imageName);

        if(upload_type == "Primary Logo" || upload_type == "Secondary Logo" || upload_type == "MLS Logo"){
            if(fields.old_logo?.length){
                old_logo = fields.old_logo[0];
                old_logo = old_logo.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/logos/`, "../logos/");
                formData.append('old_logo', old_logo);
                formData.append('upload_type', "logo");
            }
        }else if(upload_type == "Home Header" || upload_type == "Calculator Header" || upload_type == "Blog Header"){
            if(fields.old_header?.length){
                old_header = fields.old_header[0];
                old_header = old_header.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/page_headers/`, "../page_headers/");
                formData.append('old_header', old_header);
                formData.append('upload_type', "header");
            }
        }else if(upload_type == "Agent DP"){
            if(fields.old_dp?.length){
                old_dp = fields.old_dp[0];
                old_dp = old_dp.replace(`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/agents_dp/`, "../agents_dp/");
                formData.append('old_dp', old_dp);
                formData.append('upload_type', "agent_dp");
            }
        }
        console.log(`Endpoint::: ${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/next-requests/upload_images.php`)
        const phpServerUrl = `${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/next-requests/upload_images.php`; // Replace with your PHP server URL
        const phpResponse = await fetch(phpServerUrl, {
          method: 'POST',
          body: formData,
        }).then((resp): Promise<APIResponseProps> => {
            return resp.json();
        }).then(data => {
          return data;
        }).catch((e:any)=>{
          console.log("Error:", e)
        });

        if(phpResponse?.success){

            let img_loc = phpResponse?.data as string;
            img_loc = img_loc.replace("../",`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/`);

            if(upload_type == "Agent DP" && agent_id !=""){

                const agent_repo = new MYSQLAgentsRepo();

                const image_data = {
                  image_loc: img_loc,
                }

                update_resp = agent_repo.UpdateDP({agent_id, image_data});

            }else if(upload_type == "Primary Logo" || upload_type == "Secondary Logo" || upload_type == "MLS Logo"){

                const comp_repo = new MYSQLCompanyRepo();

                const logo_data = {
                  image_loc: img_loc,
                }

                update_resp = comp_repo.UpdateLogo({upload_type, logo_data});

            }else if(upload_type == "Home Header" || upload_type == "Calculator Header" || upload_type == "Blog Header"){

                const comp_repo = new MYSQLCompanyRepo();

                const header_data = {
                  image_loc: img_loc,
                }

                update_resp = comp_repo.UpdatePageHeaders({upload_type, header_data});

            }

        }

        const resp_promise = await update_resp;
        resp.status(200).json(resp_promise);

      }else{
        return resp.status(500).json({ succes: false, message: 'No image to upload' });
      }

    } catch (error: any) {
      return resp.status(500).json({ succes: false, message: 'Error uploading image to '+error.message });
    }
  });

};

// Helper function to convert a Readable stream to a Buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (error) => reject(error));
  });
}


export default handler;