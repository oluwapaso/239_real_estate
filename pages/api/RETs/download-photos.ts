import { APIResponseProps } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";
import Client from '@oluwapaso/rets';
import AWS from 'aws-sdk'; 
import { Readable } from 'stream';
import { MysqlListingsRepo } from "@/_repo/listings_repo";

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {

        const retsConfig = {
            username: process.env.NEXT_PUBLIC_RETS_USERNAME as string,
            password: process.env.NEXT_PUBLIC_RETS_PASSWORD as string,
            retsVersion: 'RETS/1.8',
            product: 'PHRETS',
            productVersion: '2.0',
            authMethod: 'digest', // or 'basic' if required
        };

        try {

            const rets_url = process.env.NEXT_PUBLIC_RETS_URL as string;
            const rets = new Client(rets_url, retsConfig);
            await rets.login().then(async ()=>{

                console.log('Login successful::::');

                // AWS S3 configuration
                const s3 = new AWS.S3({
                    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
                    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
                    region: process.env.NEXT_PUBLIC_AWS_REGION as string,
                }); 

                const propRepo = new MysqlListingsRepo();
                const props_prms = propRepo.GetPropsWithoutImage(1);
                const props = await props_prms;

                if(props.length>0){
                    
                    const uploadPromises = props.map(async prop => {

                        let prop_address = `${prop.FullAddress}-${prop.City}`;
                        prop_address = prop_address.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
                        const AllPictures: any[] = [];
                        let DefaultPic = "";
                        let index = 1;
                        console.log("Fetching for:", prop.matrix_unique_id , " in ", prop_address);

                        await rets.getObjects('Property', 'XLargePhoto', {
                            [prop.matrix_unique_id]:"*",
                            //'29412105':[1,2],
                            //'29412105':"*",
                            //'location': 0,
                        }).then(async (objects: any) => {

                            if (Array.isArray(objects)) {
                                for (const object of objects) {
                                    if (!object.contentType.includes('xml')) {

                                        const key = `${prop_address}-${index}.jpg`; // Define S3 object key

                                        // Prepare S3 upload parameters
                                        const uploadParams = {
                                            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME as string, // Your S3 bucket name
                                            Key: key,
                                            Body: Readable.from(object.data), // Object data stream
                                            ContentType: object.contentType,
                                            ACL: 'public-read',
                                        };
                                        
                                        // Upload image to S3
                                        try {
                                            const uploadResult = await s3.upload(uploadParams).promise();
                                            AllPictures.push(uploadResult.Location);
                                            console.log(`Image ${key} uploaded successfully`); //, uploadResult
                                        } catch (uploadError) {
                                            console.error(`Error uploading image ${key}: `, uploadError);
                                        }

                                    }else{
                                        console.log("if (!object.contentType.includes('xml'))---->failed----", object) 
                                    }

                                    index++;
                                }
                            }else{
                                console.log('Objects are not array');
                            }

                        }).catch((e: any) => {
                            console.log('error getting image: ', e);
                        });

                        DefaultPic = AllPictures[0];
                        const all_pictures = JSON.stringify(AllPictures);
                        const update_prms = propRepo.UpdatePropImages(prop.matrix_unique_id, all_pictures, DefaultPic);
                        const props_updated = await update_prms;

                    })

                    // Wait for all promises to resolve
                    await Promise.all(uploadPromises);

                }

                // Log out
                rets.logout().catch((error: any) => {
                    console.error('Error logging out: ', error);
                });

                resp.status(200).json({"message": "Login successful" as string});   

            }).catch((e: any)=>{
                console.error('Login failed', e);
                resp.status(500).json({"message": e as string});
            });

        } catch (error) {
            console.error('Login failed', error);
            resp.status(500).json({"message": error as string});
        }

    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}