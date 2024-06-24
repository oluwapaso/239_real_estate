import pool from "@/_lib/db_conn";
import { APIResponseProps, AddAgentParams, AddTokenParams, AdminLoginParams, AdminsType, AgentsType, GetAgentsParams, GetResetTokenParams, 
    GetSingleAdminParams, GetSingleAgentParams, UpAdminPasswordParams, UpdateAgentParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs"
import { Helpers } from "@/_lib/helpers";
import moment from "moment";
import path from "path";
import fs from 'fs';
import { PoolConnection } from "mysql2/promise";

export interface AgentsRepo {
    GetAllAgents({params}:{params: GetAgentsParams}): Promise<AgentsType[] | null>
    GetSingleAgent({params}:{params: GetSingleAgentParams}): Promise<AgentsType | string | null>
    GetResetToken({params}:{params: GetResetTokenParams}): Promise<string | null>
    AddNewToken({params}:{params: AddTokenParams}):Promise<boolean>
    GetSingleAdmin({params}:{params: GetSingleAdminParams}): Promise<AdminsType | string | null>
    AddNewAgent({params}:{params: AddAgentParams}): Promise<APIResponseProps>
    GetSingleAgentInfo(agent_id: number): Promise<APIResponseProps>
    UpdateAgentInfo(params: UpdateAgentParams): Promise<APIResponseProps>
    DeleteAgentInfo(agent_id: number): Promise<APIResponseProps>
    UpdateDP({agent_id, image_data}:{agent_id:string, image_data:any}): Promise<APIResponseProps>
    DeleteOldDP({old_dp}:{old_dp:string}): Promise<string>
}

export class MYSQLAgentsRepo implements AgentsRepo {

    public async GetAllAgents({params}:{params: GetAgentsParams}): Promise<AgentsType[] | null>{

        const page = params.page;
        const limit = params.limit;
        const start_from = (page - 1) * limit;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM agents) AS total_records FROM agents LIMIT ${start_from}, ${limit}`);
            //await pool.end();
            //return rows as AgentsType[] | null;

            const formattedRows = rows.map((row) => {

                ['image'].forEach((field) => {
                    if (row[field] && row[field].length && typeof row[field] === 'string') {
                        row[field] = JSON.parse(row[field]);
                    }
                });

                return {
                    ...row,
                } as AgentsType
            });
        
            return formattedRows;

        }catch(e:any){

            console.log("e.sqlMessage", e.sqlMessage)
            return null;
            
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetSingleAgent({params}:{params: GetSingleAgentParams}): Promise<AgentsType | string | null>{

        const search_type = params.search_by
        const field = params.fields
        const email = params?.email
        let connection: PoolConnection | null = null;

        if(search_type == "Email"){

            try{
                connection = await pool.getConnection();
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM admins WHERE email=? `, [email]);
                return row.length ? row[0] as AgentsType : null
            }catch(e: any){
                return e.sqlMessage
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else{
            return null
        }

    }

    public async GetResetToken({params}:{params: GetResetTokenParams}): Promise<string | null>{
        
        const search_by = params.search_by
        let connection: PoolConnection | null = null;
        try{    

            connection = await pool.getConnection();
            let query = ``
            let qry_params:(string | number)[] = []

            if(search_by == "Email"){

                const email = params.email as string
                query = `SELECT token FROM reset_tokens WHERE email=?`
                qry_params.push(email)

            }else if (search_by == "Token"){

                const token = params.token as string
                query = `SELECT token FROM reset_tokens WHERE token=?`
                qry_params.push(token)

            }

            const [row] = await connection.query<RowDataPacket[]>(query, [...qry_params]);
            return  row.length ? row[0].token as string : null

        }catch(e:any){
            console.log(e.sqlMessage)
            return null
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    }

    public async GetSingleAdmin({params}:{params: GetSingleAdminParams}): Promise<AdminsType | string | null>{

        const search_type = params.search_by
        const field = params.fields
        const email = params?.email
        let connection: PoolConnection | null = null;

        if(search_type == "Email"){

            try{
                connection = await pool.getConnection();
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM admins WHERE email=? `, [email]);
                return row.length ? row[0] as AdminsType : null
            }catch(e: any){
                return e.sqlMessage
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else{
            return null
        }

    }

    public async AddNewToken({params}:{params: AddTokenParams}): Promise<boolean> {

        const email = params.email
        const date = params.date
        const token = params.token
        let connection: PoolConnection | null = null;

        try{
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO reset_tokens(email, token, date) VALUES (?, ?, ?) `, [email, token, date]);
            await connection.query(`UPDATE admins SET status='Reset Password' WHERE email=? `, [email]);
            return result.affectedRows > 0
        }catch(e: any){
            console.log(e.sqlMessage)
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateAdminPassword({params}:{params: UpAdminPasswordParams}): Promise<boolean> {

        const email = params.account_email
        const admin_id = params.admin_id
        const password = params.password
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE admins SET password=?, status=? WHERE admin_id=? `, [password, 'Active', admin_id]);
            const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM reset_tokens WHERE email=? `, [email]);
            return (up_result.affectedRows > 0 && del_result.affectedRows > 0)

        }catch(e: any){
            console.log(e.sqlMessage)
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AdminLogin(params:AdminLoginParams): Promise<any>{

        const username_or_email = params.username;
        const password = params.password;
        const helpers = new Helpers();
        let connection: PoolConnection | null = null;

        if(!username_or_email || !password){
            return {"message":"Provide a valid login credential.", "success": false}
        }

        let success = false
        let message = ""
        try{

            connection = await pool.getConnection();
            const [admin_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM admins WHERE (email=? OR username=?) `, [username_or_email, username_or_email]);
            if(admin_row.length){

                const admin_info = admin_row[0]
                const hashed_password = admin_info.password

                const isValidPwrd = await bcrypt.compare(password, hashed_password).then(async (result) => {

                    if (result && connection) {

                        const adminInfo = admin_row[0]
                        const token = helpers.GenarateRandomString(50)
                        const expire_on = moment().add(30, "days").unix()
                        
                        const [sess_result] = await connection.query<ResultSetHeader>(`INSERT INTO admin_session(admin_id, token, expire_on) VALUES (?, ?, ?) `, 
                        [adminInfo.admin_id, token, expire_on]);
                        
                        if(sess_result.affectedRows > 0){

                            success = true
                            message = "Success."
                            adminInfo.token = token
                            delete(adminInfo.password)
                            return adminInfo as AdminsType
                        
                        }else{

                            message = "Unable to add new session, try again later"
                            success = false
                            return null

                        }

                    } else {
                        message = "Invalid credentials provided.."
                        success = false
                        return null
                    }
                
                }).catch(e => {
                    console.log(e)
                    message = e.message
                    success = false
                    return null
                })

                return {"message":message, "data":isValidPwrd, "success":success}

            }else{
                throw new Error("Invalid credentials provided.")
            }

        }catch(e: any){
            return {"message":e.message, "data":null, "success": false}
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddNewAgent({params}:{params: AddAgentParams}): Promise<APIResponseProps> {

        const default_resp:APIResponseProps = {
            message:"",
            success:false,
            data: null
        }

        const p = params;
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO agents(name, email, phone, role, license_number, facebook, twitter, 
                instagram, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) `, [p.name, p.email, p.phone, p.role, p.license_number, 
                p.facebook, p.twitter, p.instagram, p.bio]);
            
            default_resp.success = true;
            default_resp.message = "New agent successfully added";
            default_resp.data = {"agent_id":result.insertId}

        }catch(e: any){
            default_resp.message = e.sqlMessage
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp
    
    }

    public async GetSingleAgentInfo(agent_id: number): Promise<APIResponseProps> {

        const default_resp:APIResponseProps = {
            message:"",
            success:false,
            data: null
        }

        let connection: PoolConnection | null = null;
 
        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM agents WHERE agent_id=? `, [agent_id]);
            
            if(rows.length > 0){

                const data = rows[0];
                ['image'].forEach((field) => {
                    if (data[field] && data[field].length && typeof data[field] === 'string') {
                        data[field] = JSON.parse(data[field]);
                    }
                });

                default_resp.success = true;
                default_resp.message = "Success.";
                default_resp.data = data;
                
            }else{
                default_resp.message = "Invalid agent info provided"
            }

        }catch(e: any){
            default_resp.message = e.sqlMessage
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp
    
    }

     public async UpdateAgentInfo(params: UpdateAgentParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        const p = params
        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE agents SET name=?, email=?, phone=?, role=?, license_number=?, 
            facebook=?, twitter=?, instagram=?, bio=? WHERE agent_id=?`, [p.name, p.email, p.phone, p.role, p.license_number, p.facebook, 
                p.twitter, params.instagram, p.bio, p.agent_id]);
            if(result.affectedRows >= 0){
                
                default_rep.success = true
                default_rep.message = "Agent info successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update agent info."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async DeleteAgentInfo(agent_id: number): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`DELETE FROM agents WHERE agent_id=?`, [agent_id]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "Agent profile successfully deleted."
                return default_rep

            }else{
                default_rep.message = "Unable to delete agent profile."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }


    public async UpdateDP({agent_id, image_data}:{agent_id:string, image_data: any}): Promise<APIResponseProps>{

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        
        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            image_data = JSON.stringify(image_data);
            const [result] = await connection.query<ResultSetHeader>(`UPDATE agents SET image=? WHERE agent_id=?`, [image_data, agent_id]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "Agent profile image successfully updated."
                default_rep.data = {"profile_image": JSON.parse(image_data)}
                return default_rep

            }else{
                default_rep.message = "Unable to update agent's profile image."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async DeleteOldDP({old_dp}:{old_dp:string}): Promise<string> {
        
        // Path to the directory where images are stored
        const imagesDirectory = path.join(process.cwd(), 'public', 'images');
        let connection: PoolConnection | null = null;

        try {
            // Check if the image exists
            const imagePath = path.join(imagesDirectory, old_dp);
            if (!fs.existsSync(imagePath)) {
                return "Image not found"
            }

            // Delete the image
            fs.unlinkSync(imagePath);

            return "Image deleted successfully"
            
        } catch (error) {
            console.error('Error deleting image:', error);
            return "Internal server error"
        }

    }

}  