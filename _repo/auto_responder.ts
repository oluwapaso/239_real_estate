import pool from "@/_lib/db_conn";
import { AutoResponderDetails, AutoResponderLists, LoadSingleAutoResponderParams,UpdateAutoResponderParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 

export interface AutoResponderRepo { 
    LoadARInfo(params: LoadSingleAutoResponderParams): Promise<AutoResponderDetails | null>
    UpdateARInfo(params: UpdateAutoResponderParams) : Promise<boolean>
    LoadAutoResponders(): Promise<AutoResponderLists[] | null>
}

export class MYSQLAutoResponderRepo implements AutoResponderRepo {


    public async LoadARInfo(params: LoadSingleAutoResponderParams): Promise<AutoResponderDetails | null> {

        try{

            let rows: RowDataPacket[] = []
            const search_by = params.search_by;
            let value = params.search_value;
            const type = params.template_type;
            
            if(value && value !=""){
                if(value == "Enquiry"){
                    value = "Property Inquiry";
                }else if(value == "Tour"){
                    value = "Tour Request";
                }else if(value == "Buying Request"){
                    value = "Ready To Buy"
                }
            }
            
            if(!type || type == ''){
                if(search_by == "AR Type"){
                    [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE ar_type=? `, [value]);
                }else if(search_by == "AR Id"){
                    [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE auto_responder_id=? `, [value]);
                }
            }else{
                if(search_by == "AR Type"){
                    [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE ar_type=? AND type=? `, [value, type]);
                }else if(search_by == "AR Id"){
                    [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE auto_responder_id=? AND type=? `, [value, type]);
                }
            }

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    } as AutoResponderDetails
                });
                return formattedRows[0];
            }else{
                return null
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return e.sqlMessage
        }

    } 

    public async UpdateARInfo(params: UpdateAutoResponderParams) : Promise<boolean>{

        const auto_responder_id = params.auto_responder_id;
        const type = params.type;
        const send_ar = params.send_ar;
        const name = params.name;
        const email_body = params.email_body;
        const email_subject = params.email_subject;
        const sms_body = params.sms_body;

        try{
            
            const [result] = await pool.query<ResultSetHeader>(` 
                UPDATE auto_responders SET name=?, email_subject=?, email_body=?, sms_body=?, send_ar=? WHERE auto_responder_id=? `, 
                [name, email_subject, email_body, sms_body, send_ar, auto_responder_id]
            );

            return result.affectedRows >= 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false; 
        }

    }

    public async LoadAutoResponders(): Promise<AutoResponderLists[] | null> {
        
        const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders ORDER BY name ASC `);
        const formattedRows = rows.map((row) => {
 
            return {
                ...row,
            }

        });

        return formattedRows as AutoResponderLists[] | null;

    }

}