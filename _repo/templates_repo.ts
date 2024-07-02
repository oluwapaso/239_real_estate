import pool from "@/_lib/db_conn";
import { AddServiceParams, AddTemplateParams, GetSingleUserParams, LoadSingleTemplateParams, LoadTemplatesParams, TemplateDetails, TemplateLists, UpdateTemplateParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { MYSQLUserRepo } from "./user_repo";
import { MYSQLCompanyRepo } from "./company_repo";
import { PoolConnection } from "mysql2/promise";

export interface TemplateRepo { 
    AddNewTemplate(params: AddTemplateParams) : Promise<[boolean, number, string]>
    LoadTemplateInfo(params: LoadSingleTemplateParams): Promise<TemplateDetails | null>
    UpdateTemplateInfo(params: UpdateTemplateParams) : Promise<boolean>
    LoadTemplates(params: LoadTemplatesParams): Promise<TemplateLists[] | null>
    DeleteService(draft_id: number): Promise<boolean>
}

export class MYSQLTemplateRepo implements TemplateRepo {

    public async AddNewTemplate(params: AddTemplateParams) : Promise<[boolean, number, string]>{

        const template_type = params.template_type;
        const template_name = params.template_name;
        const email_body = params.email_body;
        const email_subject = params.email_subject;
        const sms_body = params.sms_body;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            let isAdded: boolean = false;
            const temp_info = await this.LoadTemplateInfo({search_by: "Name", search_value: template_name, template_type: template_type})

                //Newly added post
                if(temp_info && temp_info.template_id){
                    return [false, 0, "Template name already exist, please try another"];
                }

                const [result] = await connection.query<ResultSetHeader>(`
                    INSERT INTO templates(template_type, template_name, email_subject, email_body, sms_body) VALUES (?, ?, ?, ?, ?) `, 
                    [template_type, template_name, email_subject, email_body, sms_body]
                );

                isAdded = result.affectedRows > 0;
                const temp_id = result.insertId;
            
            return [isAdded, temp_id, "Template added successfully"];

        }catch(e: any){
            console.log(e.sqlMessage)
            return [false, 0, e.sqlMessage]
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadTemplateInfo(params: LoadSingleTemplateParams): Promise<TemplateDetails | null> {

        let connection: PoolConnection | null = null;
        try{

            let rows: RowDataPacket[] = []
            const search_by = params.search_by;
            const value = params.search_value;
            const type = params.template_type;
            connection = await pool.getConnection();

            if(!type || type == ''){
                if(search_by == "Name"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM templates WHERE template_name=? `, [value]);
                }else if(search_by == "Temp Id"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM templates WHERE template_id=? `, [value]);
                }
            }else{
                if(search_by == "Name"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM templates WHERE template_name=? AND template_type=? `, [value, type]);
                }else if(search_by == "Temp Id"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM templates WHERE template_id=? AND template_type=? `, [value, type]);
                }
            }

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    } as TemplateDetails
                });
                return formattedRows[0];
            }else{
                return null
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return e.sqlMessage
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    } 

    public async UpdateTemplateInfo(params: UpdateTemplateParams) : Promise<boolean>{

        const template_id = params.template_id;
        const template_type = params.template_type;
        const template_name = params.template_name;
        const email_body = params.email_body;
        const email_subject = params.email_subject;
        const sms_body = params.sms_body;

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`
                UPDATE templates SET template_type=?, template_name=?, email_subject=?, email_body=?, sms_body=? WHERE template_id=? `, 
                [template_type, template_name, email_subject, email_body, sms_body, template_id]
            );

            return result.affectedRows >= 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadTemplates(params: LoadTemplatesParams): Promise<TemplateLists[] | null> {

        const paginated = params.paginated;
        const search_type = params.search_type;
        const template_type = params.template_type;
        let rows: RowDataPacket[] = [];

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            let type_filter = "";
            if(template_type != "any"){
                type_filter = ` WHERE template_type='${template_type}' `;
            }

            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;

                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM templates ${type_filter}) 
                AS total_records FROM templates ${type_filter} ORDER BY template_name ASC LIMIT ${start_from}, ${limit}`);
                
            }else{
                //template_id, template_name
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM templates ${type_filter} ORDER BY template_name ASC `);

            }
    
            const formattedRows = rows.map((row) => {
    
                return {
                    ...row,
                }

            });

            return formattedRows as TemplateLists[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }
    
    public async ReplaceTemplateCode(temp_body: string, type: string, user_id: number): Promise<string> {
        
        const comp_repo = new MYSQLCompanyRepo();
        const user_repo = new MYSQLUserRepo();
        const params: GetSingleUserParams = {
            search_by: "User ID",
            fields: "*",
            user_id: user_id as unknown as string,
        }

        const comp_info = await comp_repo.GetCompayInfo();
        const user_info = await user_repo.GetSingleUser({params});
        if(user_info && typeof user_info != "string"){

            user_id = user_info.user_id;
            
            temp_body = temp_body.replace(/{{firstname}}/ig, user_info.firstname || "");
            temp_body = temp_body.replace(/{{lastname}}/ig, user_info.lastname || "");
            temp_body = temp_body.replace(/{{email}}/ig, user_info.email || "");
            temp_body = temp_body.replace(/{{secondary_email}}/ig, user_info.secondary_email || "");
            temp_body = temp_body.replace(/{{phone_1}}/ig, user_info.phone_1 || "");
            temp_body = temp_body.replace(/{{phone_2}}/ig, user_info.phone_2 || "");
            temp_body = temp_body.replace(/{{work_phone}}/ig, user_info.work_phone || "");
            temp_body = temp_body.replace(/{{fax}}/ig, user_info.fax || "");
            temp_body = temp_body.replace(/{{street_address}}/ig, user_info.street_address || "");
            temp_body = temp_body.replace(/{{city}}/ig, user_info.city || "");
            temp_body = temp_body.replace(/{{state}}/ig, user_info.state || "");
            temp_body = temp_body.replace(/{{zip}}/ig, user_info.zip || "");
            temp_body = temp_body.replace(/{{country}}/ig, user_info.country || "");
            temp_body = temp_body.replace(/{{price_range}}/ig, user_info.price_range || "");
            temp_body = temp_body.replace(/{{spouse_name}}/ig, user_info.spouse_name || "");
            temp_body = temp_body.replace(/{{facebook}}/ig, user_info.facebook || "");
            temp_body = temp_body.replace(/{{linkedin}}/ig, user_info.linkedin || "");
            temp_body = temp_body.replace(/{{x\/twitter}}/ig, user_info.twitter || "");
            temp_body = temp_body.replace(/{{tictoc}}/ig, user_info.tictoc || "");
            temp_body = temp_body.replace(/{{whatsapp}}/ig, user_info.whatsapp || "");
            temp_body = temp_body.replace(/{{background}}/ig, user_info.background || "");
            temp_body = temp_body.replace(/{{birthday}}/ig, user_info.birthday || "");

            temp_body = temp_body.replace(/{{broker_company_name}}/ig, comp_info.data.company_name);
            temp_body = temp_body.replace(/{{broker_default_email}}/ig, comp_info.data.default_email);
            temp_body = temp_body.replace(/{{broker_phone_number}}/ig, comp_info.data.phone_number);
            temp_body = temp_body.replace(/{{broker_contact_us_email}}/ig, comp_info.data.contact_us_email);
            temp_body = temp_body.replace(/{{broker_buying_email}}/ig, comp_info.data.buying_email);
            temp_body = temp_body.replace(/{{broker_selling_email}}/ig, comp_info.data.selling_req_email);
            temp_body = temp_body.replace(/{{broker_address_1}}/ig, comp_info.data.address_1);
            temp_body = temp_body.replace(/{{broker_address_2}}/ig, comp_info.data.address_2);
            temp_body = temp_body.replace(/{{broker_facebook}}/ig, comp_info.data.facebook);
            temp_body = temp_body.replace(/{{broker_instagram}}/ig, comp_info.data.instagram);
            temp_body = temp_body.replace(/{{broker_x\/twitter}}/ig, comp_info.data.twitter);
            temp_body = temp_body.replace(/{{broker_youtube}}/ig, comp_info.data.youtube);
            temp_body = temp_body.replace(/{{primary_logo_link}}/ig, comp_info.data.instagram);
            temp_body = temp_body.replace(/{{secondary_logo_link}}/ig, comp_info.data.instagram);
 
        }

        return temp_body;
    }

    public async DeleteService(draft_id: number): Promise<boolean> {
        
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [del_draft] = await connection.query<ResultSetHeader>(`DELETE FROM service_drafts WHERE draft_id=? `, [draft_id]);
            const [del_post] = await connection.query<ResultSetHeader>(`DELETE FROM services WHERE service_draft_id=? `, [draft_id]);
            
            return del_draft.affectedRows >= 0;

        }catch(e: any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}