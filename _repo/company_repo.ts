import pool from "@/_lib/db_conn";
import { APIResponseProps, BlogDraftsInfo, UpdateAPIParams, UpdateCompanyParams, UpdatePrivacyAndTermsParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface CompanyRepo {
    GetCompayInfo(): Promise<APIResponseProps>
    GetApiInfo(): Promise<APIResponseProps>
    UpdateCompayInfo(params: UpdateCompanyParams): Promise<APIResponseProps>
    UpdatePrivacyAndTerms(params: UpdatePrivacyAndTermsParams): Promise<APIResponseProps>
    UpdateLogo({upload_type, logo_data}:{upload_type:string, logo_data: any}): Promise<APIResponseProps>
    LoadMenus(): Promise<APIResponseProps>
}

export class MYSQLCompanyRepo implements CompanyRepo {

    public async GetCompayInfo(): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try{
            
            const [row] = await pool.query<RowDataPacket[]>(`SELECT * FROM company_info WHERE company_id='1' `);
            if(row.length){
                
                default_rep.success = true;
                let data = row[0];

                delete data.google_auth_client_id;
                delete data.google_auth_client_secret;
                delete data.facebook_auth_app_id;
                delete data.facebook_auth_app_secret;
                delete data.google_map_key;

                ['primary_logo', 'secondary_logo', 'mls_logo', 'home_header', 'calculator_header', 'blog_header', 'featured_listings', 
                'lead_stages'].forEach((field) => {
                    if (data[field] && data[field].length && typeof data[field] === 'string') {
                        data[field] = JSON.parse(data[field]);
                    }
                });
                
                default_rep.data = data;
                return default_rep;

            }else{
                default_rep.message = "No company info loaded"
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep;
        }

    }

    public async GetApiInfo(): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try{
            
            const field = `google_auth_client_id, google_auth_client_secret, facebook_auth_app_id, facebook_auth_app_secret, google_map_key, 
            facebook_short_token, facebook_long_token, sendgrid_key, sendgrid_mailer, walkscore_api, twillio_account_sid, twillio_auth_token, 
            twillio_twiml_sid, twillio_phone_number`;
            const [row] = await pool.query<RowDataPacket[]>(`SELECT ${field} FROM company_info WHERE company_id='1' `);
            if(row.length){
                 
                default_rep.success = true;
                default_rep.data = row[0];
                return default_rep;

            }else{
                default_rep.message = "No company api loaded";
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }

    }

    public async UpdateCompayInfo(params: UpdateCompanyParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try{
            
            const [result] = await pool.query<ResultSetHeader>(`UPDATE company_info SET company_name=?, default_email=?, phone_number=?, 
            contact_us_email=?, buying_email=?, selling_req_email=?, address_1=?, address_2=?, facebook=?, instagram=?, twitter=?, youtube=?, 
            mls_office_key=? WHERE company_id=?`, [params.company_name, params.default_email, params.phone_number, params.contact_us_email, params.buying_email, 
            params.selling_req_email, params.address_1, params.address_2, params.facebook, params.instagram, params.twitter, params.youtube, 
            params.mls_office_key, "1"]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "Company info successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update company info."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }

    }

    public async UpdateApiInfo(params: UpdateAPIParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try{

            const [result] = await pool.query<ResultSetHeader>(`UPDATE company_info SET google_auth_client_id=?, google_auth_client_secret=?, 
            facebook_auth_app_id=?, facebook_auth_app_secret=?, google_map_key=?, facebook_short_token=?, facebook_long_token=?, 
            sendgrid_key=?, sendgrid_mailer=?, walkscore_api=?, twillio_account_sid=?, twillio_auth_token=?, twillio_twiml_sid=?, 
            twillio_phone_number=? WHERE company_id=?`, [params.google_auth_client_id, params.google_auth_client_secret, 
            params.facebook_auth_app_id, params.facebook_auth_app_secret, params.google_map_key, params.facebook_short_token, 
            params.facebook_long_token, params.sendgrid_key, params.sendgrid_mailer, params.walkscore_api, params.twillio_account_sid, 
            params.twillio_auth_token, params.twillio_twiml_sid, params.twillio_phone_number, "1"]
            );

            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "API info successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update API info."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage;
            console.log("e.sqlMessagee", e.sqlMessage)
            return default_rep
        }

    }

    public async UpdateLeadStages(lead_stages: any): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try{

            const [result] = await pool.query<ResultSetHeader>(`UPDATE company_info SET lead_stages=? WHERE company_id=?`, 
            [JSON.stringify(lead_stages), "1"]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "Lead stages successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update lead stages."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage;
            console.log("e.sqlMessagee", e.sqlMessage)
            return default_rep
        }

    }

    public async UpdatePrivacyAndTerms(params: UpdatePrivacyAndTermsParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try{
            
            let field = ""
            let type_resp = ""
            if(params.update_type == "Privacy"){
                field = "privacy_policy"
                type_resp = "Privacy policy"
            }else if(params.update_type == "Terms"){
                field = "terms_of_service"
                type_resp = "Terms of service"
            }else if(params.update_type == "Disclaimer"){
                field = "mls_disclaimer"
                type_resp = "MLS disclaimer"
            }else if(params.update_type == "About Us"){
                field = "about_us"
                type_resp = "About us"
            }

            const [result] = await pool.query<ResultSetHeader>(`UPDATE company_info SET ${field}=? WHERE company_id=?`, [params.value, "1"]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = type_resp+" successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update "+type_resp.toLocaleLowerCase()+"."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }

    }

    public async UpdateLogo({upload_type, logo_data}:{upload_type:string, logo_data: any}): Promise<APIResponseProps>{

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        
         try{
            
            let update_fld = "primary_logo";
            if(upload_type == "Primary Logo"){
                update_fld = "primary_logo";
            }else if(upload_type == "Secondary Logo"){
                update_fld = "secondary_logo";
            }else if(upload_type == "MLS Logo"){
                update_fld = "mls_logo";
            }

            logo_data = JSON.stringify(logo_data);
            const [result] = await pool.query<ResultSetHeader>(`UPDATE company_info SET ${update_fld}=? WHERE company_id=?`, [logo_data, "1"]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = upload_type+" Successfully Updated."
                default_rep.data = {"logo_data": JSON.parse(logo_data)}
                return default_rep

            }else{
                default_rep.message = "Unable to update logo."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }

    }

    public async UpdatePageHeaders({upload_type, header_data}:{upload_type:string, header_data: any}): Promise<APIResponseProps>{

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        
         try{
            
            let update_fld = "home_header";
            if(upload_type == "Home Header"){
                update_fld = "home_header";
            }else if(upload_type == "Calculator Header"){
                update_fld = "calculator_header";
            }else if(upload_type == "Blog Header"){
                update_fld = "blog_header";
            }

            header_data = JSON.stringify(header_data);
            const [result] = await pool.query<ResultSetHeader>(`UPDATE company_info SET ${update_fld}=? WHERE company_id=?`, [header_data, "1"]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = upload_type+" Successfully Updated."
                default_rep.data = {"header_data": JSON.parse(header_data)}
                return default_rep

            }else{
                default_rep.message = "Unable to update header."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }

    }

    public async LoadMenus(): Promise<APIResponseProps> {
        
        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try{
            
            const [rows] = await pool.query<RowDataPacket[]>(`SELECT slug, post_title, show_on_menus FROM blog_posts 
            WHERE (JSON_EXTRACT(show_on_menus, '$.buyer_menu')=? OR JSON_EXTRACT(show_on_menus, '$.seller_menu')=?) `, ["Yes", "Yes"]);
            
            if(rows.length){

                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    } as BlogDraftsInfo
                });

                default_rep.success = true;
                default_rep.data = formattedRows;
                return default_rep;

            }else{
                default_rep.message = "No menu found"
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }
    
    }

}