import { Helpers } from "@/_lib/helpers";
import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { MysqlListingsRepo } from "@/_repo/listings_repo";
import { MYSQLUserRepo } from "@/_repo/user_repo";
import { MailService } from "@/_services/mail_service";
import { GetSingleUserParams, SendMailParams } from "@/components/types";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import numeral from "numeral";

export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    try{

        const helpers = new Helpers();
        const com_repo = new MYSQLCompanyRepo();
        const listings_repo = new MysqlListingsRepo();
        const user_repo = new MYSQLUserRepo();
        const mail_service = new MailService();
        const comp_info = await com_repo.GetCompayInfo();
        const api_info = await com_repo.GetApiInfo();
        const from_email = api_info.data.sendgrid_mailer;
        const alerts_prms = listings_repo.GetAlerts();
        const alerts = await alerts_prms;
        const mail_to: any[] = [];

        if(alerts && alerts.length){

            const search_ids: any[] = [];

            await Promise.all(alerts.map(async (alert: any)=> {

                search_ids.push(alert.search_id);

                const req: Partial<NextApiRequest> = {
                    body: {
                        search_by: "Alerts",
                        location: alert.location,
                        sales_type: alert.sales_type || "For Sale",
                        min_price: alert.min_price || "0",
                        max_price: alert.max_price || "0",
                        min_bed: alert.min_bed || "0",
                        max_bed: alert.max_bed || "0",
                        min_bath: alert.min_bath || "0",
                        max_bath: alert.max_bath || "0",
                        max_hoa: alert.max_hoa || "-1",
                        include_incomp_hoa_data: alert.include_incomp_hoa_data || true,
                        virtual_tour: alert.virtual_tour || false,
                        garage: alert.garage || false,
                        basement: alert.basement || false,
                        pool: alert.pool || false,
                        ac: alert.ac || false,
                        waterfront: alert.waterfront || false,
                        photos: alert.photos || false,
                        min_square_feet: alert.min_square_feet || "0",
                        max_square_feet: alert.max_square_feet || "0",
                        min_lot: alert.min_lot || "0",
                        max_lot: alert.max_lot || "0",
                        min_year: alert.min_year || "",
                        max_year: alert.max_year || "",
                        parking_spots: alert.parking_spots || "0",
                        home_type: alert.home_type,
                        sort_by: alert.sort_by,
                        last_alert: alert.last_alert,
                        page: 1,
                        limit: 11
                    }
                }
                
                const params: GetSingleUserParams = {
                    search_by:"User ID",
                    fields:"user_id, email, firstname, sub_to_updates",
                    user_id: alert.user_id
                } 

                const user_info = await user_repo.GetSingleUser({params}) as any;
                if(user_info && typeof user_info != "string" && user_info.sub_to_updates == "true"){
                    
                    let [search_filter, order_by] = helpers.BuildSearchFilter(req as NextApiRequest);
                    order_by = `LastChangeTimestamp DESC, ${order_by}`;
                    const prop_prms = listings_repo.LoadListings(req as NextApiRequest, search_filter, order_by);
                    const properties = await prop_prms;
                    
                    const no_image = "https://placehold.co/600x400.png?text=No+Image+Found";

                    if(properties && properties.length){

                        let rest = "";
                        properties.forEach((prop: any, index: number)=> {
                            if(index>0){ //Skipping first property

                                let prop_address = prop.FullAddress;
                                prop_address = prop_address.replace(/[^a-zA-Z0-9]+/g, "-") + "-" + prop.StateOrProvince + "-" + prop.PostalCode;;

                                let extra = "";
                                if(index % 2 == 0){
                                    extra = '<div style="width: 2%; margin-bottom: 30px; display: inline-block; float: left; color: white;">.</div>';
                                }

                                rest += `${extra} <div style="width: 49%; margin-bottom: 30px; display: inline-block; float: left;">
                                    <div style="width: 100%;">
                                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/listings/${prop.MLSNumber}/${prop_address}" style="width: 100%;">
                                        <img src="${(prop.Images && prop.Images[0]) ? prop.Images[0] : no_image}" style="width: 100%; height: 180px;" />
                                        </a>
                                    </div>
                                    
                                    <div style="width: 100%; margin-top: 5px;">
                                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/listings/${prop.MLSNumber}/${prop_address}" 
                                        style="width: 100%; text-decoration: none; color: #222;">
                                        <div style="width: 100%; font-weight: bold;">${prop.FullAddress}, ${prop.City}</div>
                                        <div style="width: 100%; font-weight: bold; font-size: 25px; margin-top: 5px;">${numeral(prop.ListPrice).format("$0,0")}</div>
                                        <div style="width: 100%; margin-top: 0px; font-size: 13px;">${prop.BedsTotal} BEDS, 
                                        ${numeral(properties[0].BathsTotal).format("0,0")} BATHS, ${numeral(prop.TotalArea).format("0,0")} SQFT</div>
                                        </a>

                                        <div style="margin-top: 14px;">
                                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/listings/${prop.MLSNumber}/${prop_address}" 
                                        style="padding: 12px 18px; text-align: center; background-color: #222; color: white; 
                                        width: 140px; border-radius: 4px; text-decoration: none;">More Details</a>
                                        </div>
                                    </div>
                                </div>`
                            }
                        });
                        
                        let address_main = properties[0].FullAddress;
                        address_main = address_main.replace(/[^a-zA-Z0-9]+/g, "-");
                        const msg_body = `<body style="background-color: #EFEFEF; padding-top: 70px; padding-bottom: 70px;">

                        <center>

                        <div style="width: 600px; float: none; margin: auto;">
                        <div style="width: 100%; background-color: #222; padding: 15px 0px; box-sizing: border-box;">
                            <img src="${comp_info.data?.primary_logo?.image_loc}" style="height: 50px;" />
                        </div>

                        <div style="width: 600px; float: none; margin: auto; background-color: white; padding: 20px 25px; border: 1px solid silver; text-align: left; box-sizing: border-box;">
                            
                            <div style="width: 100%; margin-top: 10px;">
                                <div>Hello <strong>${user_info.firstname},</strong></div>
                            </div>
                            
                            <div style="width: 100%; margin-top: 15px;">
                                There are <strong>${properties[0].total_records} new properties</strong> for the <strong>${alert.search_title}</strong> 
                                you saved on ${process.env.NEXT_PUBLIC_BASE_URL}
                            </div>
                            
                            <div style="width: 100%; margin-top: 15px;">
                                <div style="width: 100%;">
                                    <div style="width: 100%;">
                                        <img src="${(properties[0].Images && properties[0].Images[0]) ? properties[0].Images[0] : no_image}" style="width: 100%; height: auto;" />
                                    </div>
                                    <div style="width: 100%; margin-top: 10px; display: flex; justify-content: space-between; flex-wrap: wrap;">
                                        <div style="width: 49%;">
                                        <img src="${(properties[0].Images && properties[0].Images[1]) ? properties[0].Images[1] : no_image}" style="width: 100%; height: auto;" />
                                        </div>
                                        <div style="width: 49%; margin-left: 2%;">
                                        <img src="${(properties[0].Images && properties[0].Images[2]) ? properties[0].Images[2] : no_image}" style="width: 100%; height: auto;" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="width: 100%; margin-top: 15px;">
                                    <div style="width: 100%; font-weight: bold;">${properties[0].FullAddress}, ${properties[0].City}</div>
                                    <div style="width: 100%; font-weight: bold; font-size: 25px; margin-top: 5px;">${numeral(properties[0].ListPrice).format("$0,0")}</div>
                                    <div style="width: 100%; margin-top: 0px; font-size: 13px;">${properties[0].BedsTotal} BEDS, 
                                    ${numeral(properties[0].BathsTotal).format("0,0")} BATHS, ${numeral(properties[0].TotalArea).format("0,0")} SQFT</div>
                                    
                                    <div style="margin-top: 14px;">
                                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/listings/${properties[0].MLSNumber}/${address_main}" 
                                    style="padding: 12px 18px; text-align: center; margin-top: 10px; background-color: #222; color: white; 
                                    width: 140px; border-radius: 4px; text-decoration: none;">More Details</a>
                                    </div>
                                </div>
                            </div>
                            
                            
                            <div style="width: 100%; margin-top: 35px; display: block; float: left;">
                                ${rest}
                            </div>
                            
                            
                            <div style="width: 100%; margin-top: 20px;">
                                <div style="width: 100%;">Showing <strong>${properties.length}</strong> of <strong>${properties[0].total_records}</strong> new properties that match your saved search for <strong>${alert.search_title}</strong>.</div>
                                
                                <div style="width: 100%; margin-top: 45px; margin-bottom: 25px;">
                                <center><a href="${process.env.NEXT_PUBLIC_BASE_URL}/search?search_by=Map&${alert.query_link}" style="padding: 14px 20px; text-align: center; 
                                margin-top: 10px; background-color: #222; color: white; border-radius: 4px; text-decoration: none;">
                                View All Properties</a>
                                </center>
                                </div>
                            </div>
                        </div>

                        <div style="width: 100%; background-color: #222; padding: 15px 10px; box-sizing: border-box;">
                            <div style="font-size: 12px; color: white;">&copy; ${moment().format("YYYY")} ${process.env.NEXT_PUBLIC_COMPANY_NAME}. 
                            All rights reserved. This email is a promotional message. ${process.env.NEXT_PUBLIC_COMPANY_NAME} is a licensed real estate broker and abides by Equal Housing Opportunity laws. 
                            Information deemed reliable but not guaranteed. This is not intended to solicit property already listed. 
                            This email was sent to <span style="color: yellow;">${user_info.email}</span>. To unsubscribe, 
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/my-dashboard?tab=Preferences" style="color: yellow; text-decoration: underline;">click here</span>.
                            </div>
                        </div>
                        </div>
                        </center>
                        </body>`
                        
                        mail_to.push({
                            "user_id": user_info.user_id, 
                            "email": user_info.email, 
                            "message_body": msg_body, 
                            "subject": `${properties[0].total_records} new listing${properties[0].total_records > 1 ? "s" : "" } in your search`
                        });

                    }


                }

            }));

            let searchIDs = search_ids.join("', '");
            searchIDs = `'${searchIDs}'`;

            if(mail_to && mail_to.length > 0){

                mail_to.forEach(async (mail)=> {

                    const params: SendMailParams = {
                        user_id: mail.user_id,
                        mailer: "Sendgrid",
                        from_email: from_email,
                        to_email: mail.email,
                        subject: mail.subject,
                        body: mail.message_body,
                        message_type: "Property Alert"
                    } 
                    
                    const send_mail = await mail_service.SendMail(params);

                });

            }else{
                console.log("No alert to send at the moment.");
                resp.status(200).json({"status":"Error", "message": "No alert to send at the moment."});
            }

            if(search_ids && search_ids.length > 0){
                const isUpdated = await listings_repo.UpdateAlertedSearches(searchIDs);
                console.log("Updating Update Alerted Searches:", searchIDs, "isUpdated:", isUpdated);
            }
            
            resp.status(200).json({"status":"Success", "message": 'Email sent'});

        }else{
            console.log("No alert to send at the moment..");
            resp.status(200).json({"status":"Error", "message": "No alert to send at the moment.."});
        }

    }catch(e: any){
        console.log("error:", e.message);
        resp.status(200).json({"status":"Error", "message": e.message});
    }
 
}