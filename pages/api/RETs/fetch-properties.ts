import { APIResponseProps } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";
import Client from '@aptuitiv/rets-client'; 
import { MysqlListingsRepo } from "@/_repo/listings_repo";  
import "axios-cookiejar-support"; // Import it without calling 
import { ListingsFields, ListingsJsonFields } from "@/components/data";
import { Helpers } from "@/_lib/helpers";

const helpers = new Helpers();
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
        console.log("retsConfig", retsConfig)
        try {

            const rets_url = process.env.NEXT_PUBLIC_RETS_URL as string;
            const rets = new Client(rets_url, retsConfig);
            await rets.login().then(async ()=>{

                console.log('Login successful::::'); 

                const propRepo = new MysqlListingsRepo();
                const syncs_prms = propRepo.GetPendingSyncs();
                const syncs = await syncs_prms;

                if(!syncs || !syncs.length){
                    return resp.status(500).json({"message": "Seems all properties class has been downloaded."});  
                }

                const row = syncs[0];
                const RES = row['RES'];
                const RIN = row['RIN'];
                const LOT = row['LOT'];
                const COM = row['COM'];
                const DOCK = row['DOCK'];
                
                let defaultClass = "RES";
                if (RES == "Done") {
                    if (RIN == "Done") {
                        if (LOT == "Done") {
                            if (COM == "Done") {
                                defaultClass = "DOCK";
                            } else {
                                defaultClass = "COM";
                            }
                        } else {
                            defaultClass = "LOT";
                        }
                    } else {
                        defaultClass = "RIN";
                    }
                }

                const offset_prms = propRepo.GetSyncOffset(defaultClass);
                const offset = await offset_prms;

                /**
                Status 
                -------
                A	A	Active
                AP	AP	Application In Progress
                P	P	Pending
                PC	PC	Pending With Contingencies
                R	R	Rented
                S	S	Sold
                **/

                // Step 2: Construct the DMQL2 query
                const query = '(Status=|A), (MatrixModifiedDT=1900-01-01T00:00:00+)';

                const params = {
                    SearchType: 'Property',
                    Class: defaultClass, // Adjust this to the correct property class
                    Query: query,
                    Format: 'COMPACT-DECODED',
                    Limit: 150,//150
                    Offset: offset,
                };

                //Search
                rets.search("Property", defaultClass, query, params)
                .then(async (objects: any) => {
        
                    //console.log("objects", objects[0], "objects count", objects.length);
                    //console.dir(objects[0], { depth: null });
                    // Step 1: Split the columns by tab character (\t)
                    const columns = objects[0].data.rets.columns.split('\t');

                    // Step 2: Split the data rows by tab character (\t)
                    const dataRows = objects[0].data.rets.data.map((row: any) => row.split('\t'));

                    // Step 3: Combine columns with data rows
                    const processedData = dataRows.map((row: any) => {
                        let rowData: { [key: string]: string } = {};
                        columns.forEach((col: any, index: any) => {
                            rowData[col] = row[index] || '';
                        });
                        return rowData;
                    });

                    const cleanedData = processedData.map((obj: any) => {
                        return Object.fromEntries(
                            Object.entries(obj).filter(([key, value]) => value !== '')
                        );
                    });

                    // Step 4: Use the processed data
                    //console.log("cleanedData", cleanedData);
                    if(cleanedData && cleanedData.length >0){

                        const addPromises = cleanedData.map(async (elem: any) => {
                
                            const fields: string[] = [];
                            const values: any[] = [];
                            //let values = "";
                            let update_cond = "";
                            
                            ListingsFields.forEach(field => {
                                
                                //If field exists in data object, then we are game!
                                if(field in elem){

                                    fields.push(field);
                                    let value = elem[field];
                                    //values += `'${value}',`;

                                    if(ListingsJsonFields.includes(field)){
                                        values.push(JSON.stringify(value));
                                    }else{
                                        values.push(`${value}`);
                                    }
                                    
                                    /** Build for update **/
                                    update_cond += `${field}=VALUES(${field}),`;
                                    /** Build for update **/
                                    
                                }

                            });
                             
                            if(typeof elem == "object"){
                                elem = JSON.stringify(elem);
                            }

                            if(update_cond && update_cond!=""){
                                update_cond += `PropertyClass='${defaultClass}', AllPixDownloaded='No'`;   
                            }             

                            const field_string = fields.join(",");
                            if(field_string && field_string!="" && values && values.length > 0 ){

                                const placeholders = Array.from({length: values.length}, () => "?").join(", ");
                                update_cond = helpers.rTrim(update_cond, ",");
                                //values = this.helpers.rTrim(values, ",");

                                const isAdded = await propRepo.AddNewListing(defaultClass, field_string, values, placeholders, 
                                update_cond, elem);
                                console.log("isAdded", isAdded)
                            }

                        });

                        await Promise.all(addPromises);
                        console.log("Done");

                    }

                }).catch((error: any) => {
                    console.error('Error searching: ', error);
                });

                //Log out
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
            resp.status(500).json({"message": error as string})
        }

    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}