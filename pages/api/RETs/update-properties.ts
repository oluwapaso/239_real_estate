import { APIResponseProps } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";
import Client from '@oluwapaso/rets'; 
import { MysqlListingsRepo } from "@/_repo/listings_repo";    
import tough from 'tough-cookie'; // For handling cookies
import "axios-cookiejar-support"; // Import it without calling 
import { ListingsFields, ListingsJsonFields } from "@/components/data";
import { Helpers } from "@/_lib/helpers";
import moment from "moment";

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

        try {

            const rets_url = process.env.NEXT_PUBLIC_RETS_URL as string;
            const rets = new Client(rets_url, retsConfig);
            await rets.login().then(async ()=>{

                console.log('Login successful::::'); 
                const classes = ["RES", "RIN", "LOT", "COM", "DOCK"]; // "RNT",

                const propRepo = new MysqlListingsRepo();

                for(const prop_class of classes){
                    
                    const skip_col_date = `${prop_class}_Date`;
                    const skip_col_count = `${prop_class}_Skip`;
                    let modified_date = "";
                    let offset = 0;
                    
                    const refresh_prms = propRepo.GetRefreshSkips(skip_col_date, skip_col_count);
                    const skips = await refresh_prms;
                    if(skips && skips.length){

                        const skip_date = skips[0][skip_col_date] as string;
                        const skip_count = parseInt(skips[0][skip_col_count]);
                        console.log("skip_date", skip_date, "skip_count", skip_count)
                        if (skip_date && skip_date != "" && skip_date != "Invalid Date" && skip_date != "0000-00-00 00:00:00" && skip_count > 0) {

                            modified_date = moment(skip_date).format("YYYY-MM-DD HH:mm:ss");
                            modified_date = modified_date.replace(" ", "T")+"+";
                            offset = skip_count;

                            console.log("Using skipped");

                        } else {

                            const newest_prms = propRepo.GetNewestProp(prop_class);
                            modified_date = await newest_prms;
                            console.log("Using newest with", modified_date);

                        }

                        const status_ftch = 'A,S,AP,P,PC';

                        // Step 2: Construct the DMQL2 query
                        const query = `(Status=|${status_ftch}), (MatrixModifiedDT=${modified_date})`;

                        const params = {
                            SearchType: 'Property',
                            Class: prop_class, // Adjust this to the correct property class
                            Query: query,
                            Format: 'COMPACT-DECODED',
                            Limit: 25,
                            Offset: offset,
                        };

                        let counter = 0;
                        //Search
                        await rets.search("Property", prop_class, query, params)
                        .then(async (objects: any) => {
                            //console.log("objects", objects[0], "objects count", objects.length);
                            
                            const ReplyText = objects[0].data.rets["@_ReplyText"];
                            if((ReplyText && ReplyText == "No Records Found.") || (!Array.isArray(objects[0].data.rets.data))){

                                const isUpdated = await propRepo.UpdateRefreshSkip( `UPDATE refresh_skips SET ${skip_col_date}=NULL, 
                                ${skip_col_count}='0' WHERE skip_id='1'`);
                                
                                //Log out
                                // rets.logout().catch((error: any) => {
                                //     console.error('Error logging out: ', error);
                                // });
                                
                                return resp.status(200).json({"message": `${prop_class} properties successful replicated` as string});   
                            }

                            if(!objects[0].data.rets.columns || !objects[0].data.rets.data || !objects[0].data.rets.count){
                                
                                //Log out
                                // rets.logout().catch((error: any) => {
                                //     console.error('Error logging out: ', error);
                                // });

                                return resp.status(200).json({"message": `${prop_class} columns, data OR count is not found!` as string});   
                            }
                            
                            //console.dir(objects[0], { depth: null });
                            // Step 1: Split the columns by tab character (\t)
                            const columns = objects[0].data.rets.columns.split('\t');
                            const total_listings = objects[0].data.rets.count["@_Records"];
                            console.log("total_listings", total_listings)

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
                                        update_cond += `PropertyClass='${prop_class}', AllPixDownloaded='No'`;   
                                    }             

                                    const field_string = fields.join(",");
                                    if(field_string && field_string!="" && values && values.length > 0 ){

                                        const placeholders = Array.from({length: values.length}, () => "?").join(", ");
                                        update_cond = helpers.rTrim(update_cond, ",");
                                        //values = this.helpers.rTrim(values, ",");

                                        const isAdded = await propRepo.AddNewListing(prop_class, field_string, values, placeholders, 
                                        update_cond, elem);
                                        console.log("isAdded", isAdded)
                                    }

                                    counter++;
                                });

                                await Promise.all(addPromises);
                                
                                const new_skip = skip_count + counter; 
                                let updateSkips = "";
                                if (total_listings > new_skip) {
                                    let modifiedDate = modified_date.replace("T", " ");
                                    modifiedDate = modifiedDate.replace("+", "");
                                    updateSkips = `UPDATE refresh_skips SET ${skip_col_date}='${modifiedDate}', ${skip_col_count}='${new_skip}' WHERE skip_id='1'`;
                                } else {
                                    updateSkips = `UPDATE refresh_skips SET ${skip_col_date}=NULL, ${skip_col_count}='0' WHERE skip_id='1'`;
                                }

                                const isUpdated = await propRepo.UpdateRefreshSkip(updateSkips);
                                if(isUpdated){
                                    console.log(`${skip_col_date} will now skip ${new_skip} properties`)
                                }else {
                                    console.log(`Error updating {skip_col_date} skips`)
                                }

                                console.log("Done");

                            }else{

                                const updateSkips = `UPDATE refresh_skips SET ${skip_col_date}=NULL, ${skip_col_count}='0' WHERE skip_id='1'`;
                                const isUpdated = await propRepo.UpdateRefreshSkip(updateSkips);
                                if(isUpdated){
                                    console.log(`${skip_col_date} will now skip 0 properties`)
                                }else {
                                    console.log(`Error updating {skip_col_date} skips`)
                                }
                            }

                        }).catch((error: any) => {
                            console.error('Error searching: ', error);
                        });

                    }
                };  

                //Log out
                rets.logout().catch((error: any) => {
                    console.error('Error logging out: ', error);
                });

                resp.status(200).json({"message": "Property successful updated" as string});   

            }).catch((e: any)=>{
                console.error('Property update failed', e);
                resp.status(500).json({"message": e as string});
            });

        } catch (error) {
            console.error('Property update failed', error);
            resp.status(500).json({"message": error as string})
        }

    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}