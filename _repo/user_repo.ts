import pool from "@/_lib/db_conn";
import { Helpers } from "@/_lib/helpers";
import { AddNotesParams, AddTokenParams, AdminsType, GetResetTokenParams, GetSingleUserParams, LoadUsersActivities, LoadUsersParams, SendMailParams, UpUserPasswordParams, User, UserAuthParams, UserLoginParams } from "@/components/types"
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs"
import moment from "moment";
import { NextApiRequest } from "next";
//import { MailService } from "@/_services/mail_service";
import { MYSQLCompanyRepo } from "./company_repo";
import { MYSQLNotesRepo } from "./notes_repo";
import { PoolConnection } from "mysql2/promise";

export interface UserRepo {
    UserLogin(params: UserLoginParams): Promise<any>
    UserAuthLogin(params: UserAuthParams): Promise<any>
    GetSingleUser({params}:{params: GetSingleUserParams}): Promise<User | string | null>
    GetResetToken({params}:{params: GetResetTokenParams}): Promise<string | null>
    AddNewToken({params}:{params: AddTokenParams}): Promise<boolean>
    UpdateAccountPassword({params}:{params: UpUserPasswordParams}): Promise<boolean>
    UpdateLeadDetails(req: NextApiRequest): Promise<boolean>
    Registerccount(email: string, password: string): Promise<[boolean, number]>
    DeleteAccount(req: NextApiRequest): Promise<boolean>
    AddSellingRequest(req: NextApiRequest): Promise<boolean>
    AddBuyingRequest(req: NextApiRequest): Promise<boolean>
    AddShowingRequest(req: NextApiRequest): Promise<boolean>
    AddInquiryRequest(req: NextApiRequest): Promise<boolean>
    UpdateLastSeen(req: NextApiRequest): Promise<boolean>
    UpdateLeadStatus(req: NextApiRequest): Promise<boolean>
}

export class MYSQLUserRepo implements UserRepo {

    //mail_service = new MailService();
    com_repo = new MYSQLCompanyRepo();
    note_repo = new MYSQLNotesRepo();

    public async UserLogin(params: UserLoginParams): Promise<any>{

        const email = params.email;
        const password = params.password;
        const helpers = new Helpers();
        let connection: PoolConnection | null = null;

        if(!email || !password){
            return {"message":"Provide a valid login credential.", "success": false}
        }

        let success = false;
        let message = "";
        try{

            connection = await pool.getConnection();
            const [user_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM users WHERE email=?`, [email]);
            if(user_row.length){

                const user_info = user_row[0];
                const hashed_password = user_info.password;
                const status = user_info.status;
                
                if(status == "Inactive"){
                    throw new Error("Account not active, please contact support.");
                }else if(status == "Reset Password"){
                    throw new Error("A password reset is required to access your account.");
                }

                const isValidPwrd = await bcrypt.compare(password, hashed_password).then(async (result) => {

                    if (result && connection) {

                        const userInfo = user_row[0];
                        const token = helpers.GenarateRandomString(50);
                        const expire_on = moment().add(30, "days").unix();
                        
                        const [sess_result] = await connection.query<ResultSetHeader>(`INSERT INTO user_session(user_id, token, expire_on) VALUES (?, ?, ?) `, 
                        [userInfo.user_id, token, expire_on]);
                        
                        if(sess_result.affectedRows > 0){

                            const [fav_row] = await connection.query<RowDataPacket[]>(`SELECT matrix_unique_id FROM favorites WHERE user_id=?`, [userInfo.user_id]);
                            const favs: any[] = [];
                            if(fav_row.length){
                                fav_row.forEach(fav=> {
                                    favs.push(fav.matrix_unique_id);
                                });
                            }

                            success = true
                            message = "Success."
                            userInfo.token = token;
                            userInfo.favorites = favs;
                            delete(userInfo.password);
                            return userInfo as User;
                        
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
                });

                return {"message":message, "data":isValidPwrd, "success":success}

            }else{
                throw new Error("Invalid credentials provided.");
            }

        }catch(e: any){
            return {"message":e.message, "data":null, "success": false}
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UserAuthLogin(params: UserAuthParams): Promise<any>{

        const email = params.email;
        const name = params.name;
        const helpers = new Helpers();
        let connection: PoolConnection | null = null;

        if(!email){
            return {"message":"Invalid auth credential provided, email is missing.", "success": false}
        }

        let success = false;
        let message = "";
        try{

            connection = await pool.getConnection();
            const [user_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM users WHERE email=? `, [email]);
            if(user_row.length){

                const user_info = user_row[0];
                const token = helpers.GenarateRandomString(50);
                
                const [fav_row] = await connection.query<RowDataPacket[]>(`SELECT matrix_unique_id FROM favorites WHERE user_id=?`, [user_info.user_id]);
                const favs: any[] = [];
                if(fav_row.length){
                    fav_row.forEach(fav=> {
                        favs.push(fav.matrix_unique_id);
                    });
                }

                success = true;
                message = "Success.";
                user_info.token = token;
                user_info.favorites = favs;
                delete(user_info.password);
                return {"message":message, "data": user_info as User, "success":success}

            }else{
                
                const first_name = name.split(" ")[0];
                const last_name = name.split(" ")[1];
                
                // Generate a random password of length 8
                const password = helpers.GenarateRandomString(13);
                const hashedPassword = await bcrypt.hash(password, 10);

                const [sess_result] = await connection.query<ResultSetHeader>(`INSERT INTO users(email, firstname, lastname, password) VALUES (?, ?, ?, ?) `, 
                [email, first_name, last_name, hashedPassword]);
                
                if(sess_result.affectedRows > 0){
                    
                    const api_info_prms = this.com_repo.GetApiInfo();
                    const api_info = await api_info_prms;
                    const user_id = sess_result.insertId;

                    const mail_params: SendMailParams = {
                        user_id: user_id,
                        mailer: "Sendgrid",
                        from_email: api_info.data.sendgrid_mailer,
                        to_email: email,
                        subject: "",
                        body: "",
                        message_type: "New Account"
                    } 
                    //Lazy-load MYSQLUserRepo to avoid import cycle
                    const {MailService} = await import("@/_services/mail_service");
                    const mail_service = new MailService();
                    const send_email_ar = await mail_service.SendAutoResponder(mail_params);

                    return this.UserAuthLogin(params);
                }else{
                    return {"message": "Unable to add new account, try again later", "data":null, "success": false}
                }

            }

        }catch(e: any){
            return {"message":e.message, "data":null, "success": false}
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetSingleUser({params}:{params: GetSingleUserParams}): Promise<User | string | null>{

        const search_type = params.search_by;
        const field = params.fields; 

        let connection = await pool.getConnection();
        if(search_type == "Email"){

            const email = params?.email;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM users WHERE email=? `, [email]);
                return row.length ? row[0] as User : null
            }catch(e: any){
                return e.sqlMessage
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else if(search_type == "Email ALT"){

            const email = params?.email;
            const user_id = params?.user_id;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM users WHERE email=? AND user_id!=?`, [email, user_id]);
                return row.length ? row[0] as User : null
            }catch(e: any){
                return `search_type == "Email ALT": ${e.sqlMessage}`
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else if(search_type == "User ID"){

            const user_id = params?.user_id;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM users WHERE user_id=? `, [user_id]);
                return row.length ? row[0] as User : null
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
        
        const search_by = params.search_by;
        let connection: PoolConnection | null = null;
        try{    

            let query = ``;
            let qry_params:(string | number)[] = [];
            connection = await pool.getConnection();

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

    public async AddNewToken({params}:{params: AddTokenParams}): Promise<boolean> {

        const email = params.email;
        const date = params.date;
        const token = params.token;

        let connection: PoolConnection | null = null;
        try{
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO reset_tokens(email, token, date) VALUES (?, ?, ?) `, [email, token, date]);
            await connection.query(`UPDATE users SET status='Reset Password' WHERE email=? `, [email]);
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

    public async UpdateAccountPassword({params}:{params: UpUserPasswordParams}): Promise<boolean> {

        const email = params.account_email;
        const user_id = params.user_id;
        const password = params.password;
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE users SET password=?, status=? WHERE user_id=? `, [password, 'Active', user_id]);
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

    public async Registerccount(email: string, password: string): Promise<[boolean, number]> {

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO users(email, password) VALUES (?, ?) `, [email, password]);
            if(result.affectedRows){
                return [true, result.insertId]
            }else{
                return [false, 0] 
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return [false, 0]
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddNewAccount(req: NextApiRequest): Promise<[boolean, number]>{

        const req_body = req.body;
        let connection: PoolConnection | null = null; 

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO users(email, secondary_email, firstname, lastname, phone_1, 
            phone_2, work_phone, fax, street_address, city, state, zip, background, birthday, facebook, tictoc, twitter, whatsapp, linkedin, 
            lead_stage, price_range, spouse_name, profession) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, [req_body.email, req_body.secondary_email, 
            req_body.firstname, req_body.lastname, req_body.phone_1, req_body.phone_2, req_body.work_phone, req_body.fax, 
            req_body.street_address, req_body.city, req_body.state, req_body.zip, req_body.background, req_body.birthday, req_body.facebook, 
            req_body.tictoc, req_body.twitter, req_body.whatsapp, req_body.linkedin, req_body.lead_stage, req_body.price_range, 
            req_body.spouse_name, req_body.profession]);
            if(result.affectedRows){
                return [true, result.insertId]
            }else{
                return [false, 0] 
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return [false, 0]
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateAccountDetails(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE users SET email=?, secondary_email=?, firstname=?, lastname=?, 
            phone_1=?, phone_2=?, work_phone=?, fax=?, street_address=?, city=?, state=?, zip=?, country=?, sub_to_updates=?, 
            sub_to_mailing_lists=? WHERE user_id=? `, [req_body.email, req_body.secondary_email, req_body.firstname, req_body.lastname,
                req_body.phone_1, req_body.phone_2, req_body.work_phone, req_body.fax, req_body.street_address, req_body.city, req_body.state,
                req_body.zip, req_body.country, req_body.sub_to_updates, req_body.sub_to_mailing_lists, req_body.user_id
            ]);
            return up_result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage);
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateLeadDetails(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const birthday = moment(req_body.birthday).format("YYYY-MM-DD");
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE users SET email=?, secondary_email=?, firstname=?, lastname=?, 
            phone_1=?, phone_2=?, work_phone=?, fax=?, street_address=?, city=?, state=?, zip=?, price_range=?, spouse_name=?, profession=?, 
            birthday=?, facebook=?, linkedin=?, twitter=?, tictoc=?, whatsapp=?, background=?, lead_stage=? WHERE user_id=? `, 
            [req_body.email, req_body.secondary_email, req_body.firstname, req_body.lastname, req_body.phone_1, req_body.phone_2, 
            req_body.work_phone, req_body.fax, req_body.street_address, req_body.city, req_body.state, req_body.zip, req_body.price_range, 
            req_body.spouse_name, req_body.profession, birthday, req_body.facebook, req_body.linkedin, req_body.twitter, req_body.tictoc, 
            req_body.whatsapp, req_body.background, req_body.lead_stage, req_body.user_id]);
            return up_result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage);
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async DeleteAccount(req: NextApiRequest): Promise<boolean> {

        const user_id = req.body.user_id;
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const [fav_result] = await connection.query<ResultSetHeader>(`DELETE FROM favorites WHERE user_id=? `, [user_id]);
            const [srch_result] = await connection.query<ResultSetHeader>(`DELETE FROM saved_searches WHERE user_id=? `, [user_id]);
            const [sess_result] = await connection.query<ResultSetHeader>(`DELETE FROM user_session WHERE user_id=? `, [user_id]);
            const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM users WHERE user_id=? `, [user_id]);

            return del_result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage);
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateLastSeen(req: NextApiRequest): Promise<boolean> {

        const user_id = req.body.user_id;
        let last_seen = req.body.last_seen;
        last_seen = moment(last_seen).format("YYYY-MM-DD HH:mm:ss");
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE users SET last_seen=? WHERE user_id=? `, [last_seen, user_id]);
            return result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

     public async UpdateLeadStatus(req: NextApiRequest): Promise<boolean> {

        const user_ids = req.body.user_ids;
        const lead_stage = req.body.lead_stage;
        let userIds = user_ids.join("', '");
        userIds = `'${userIds}'`;

        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE users SET lead_stage=? WHERE user_id IN(${userIds}) `, [lead_stage]);
            return result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadUsers(params: LoadUsersParams): Promise<User[] | null> {

        const paginated = params.paginated;
        const search_type = params.search_type;
        const lead_stage = params.lead_stage;
        const keyword = params.keyword;
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;
                let kw_filter = "";
                let stage_filter = "";

                if(keyword && keyword !=""){
                    kw_filter = ` AND (firstname LIKE '%${keyword}%' OR lastname LIKE '%${keyword}%' OR CONCAT(firstname, " ", lastname) 
                    LIKE '%${keyword}%' OR email LIKE '%${keyword}%' OR secondary_email LIKE '%${keyword}%' OR phone_1 LIKE '%${keyword}%' 
                    OR phone_2 LIKE '%${keyword}%' OR work_phone LIKE '%${keyword}%')`;
                }

                if(lead_stage && lead_stage !="" && lead_stage !="Any"){
                    stage_filter = ` AND lead_stage='${lead_stage}'`;
                }

                if(search_type == "User Lists"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM users WHERE user_id IS NOT NULL 
                    ${kw_filter} ${stage_filter}) AS total_records FROM users WHERE user_id IS NOT NULL ${kw_filter} ${stage_filter} 
                    ORDER BY CONCAT(firstname, ' ', lastname) ASC LIMIT ${start_from}, ${limit}`);
                }
                
            }else{

            }

            const formattedRows = rows.map((row) => {
                delete row.password;
                return {
                    ...row,
                }
            });

            return formattedRows as User[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadSingleUser(user_id: string): Promise<User | null> {
        
        let connection: PoolConnection | null = null;
        try{
        
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM users WHERE user_id=?`,[user_id]);
            const formattedRows = rows.map((row) => {
                delete row.password;
                return {
                    ...row,
                } as User
            });

            return formattedRows[0] as User | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async CountUserActivities(user_id: number): Promise<any | null>{

        let connection: PoolConnection | null = null;
        try{
        
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT 
            (SELECT COUNT(*) AS total_notes FROM notes WHERE user_id='${user_id}' AND notes_type='Notes') AS TotalNotes,
            (SELECT COUNT(*) AS total_call_log FROM notes WHERE user_id='${user_id}' AND notes_type='Call Log') AS TotalCallLog,
            (SELECT COUNT(*) AS total_fav_props FROM favorites WHERE user_id='${user_id}') AS TotalFavorites,
            (SELECT COUNT(*) AS total_unfav_props FROM notes WHERE user_id='${user_id}' AND notes_type='Unfavorite a Property') AS TotalUnfavorites,
            (SELECT COUNT(*) AS total_views FROM notes WHERE user_id='${user_id}' AND notes_type='Viewed a Property') AS TotalViewed,
            (SELECT COUNT(*) AS total_searches FROM notes WHERE user_id='${user_id}' AND notes_type='Search For Listings') AS TotalSearches,
            (SELECT COUNT(*) AS total_saves FROM saved_searches WHERE user_id='${user_id}') AS TotalSavedSearches,
            (SELECT COUNT(*) AS total_del_searches FROM notes WHERE user_id='${user_id}' AND notes_type='Viewed a Property') AS TotalDeletedSearches,
            (SELECT COUNT(*) AS total_emails FROM logged_messages WHERE user_id='${user_id}' AND message_kind='Email') AS TotalEmails,
            (SELECT COUNT(*) AS total_sms FROM logged_messages WHERE user_id='${user_id}' AND message_kind='SMS') AS TotalSMS,
            (SELECT COUNT(*) AS total_selling_req FROM property_requests WHERE user_id='${user_id}' AND request_type='Selling Request') AS TotalSellingRequests,
            (SELECT COUNT(*) AS total_buying_req FROM property_requests WHERE user_id='${user_id}' AND request_type='Buying Request') AS TotalBuyingRequests,
            (SELECT COUNT(*) AS total_info_req FROM property_requests WHERE user_id='${user_id}' AND request_type='Info Request') AS TotalInfoRequests,
            (SELECT COUNT(*) AS total_tour_req FROM property_requests WHERE user_id='${user_id}' AND request_type='Tour Request') AS TotalTourRequests,
            (SELECT COUNT(*) AS total_showing_req FROM property_requests WHERE user_id='${user_id}' AND request_type='Showing Request') AS TotalShowingRequests
            `);
            
            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                }
            });

            return formattedRows[0] || null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadUsersActivities(params: LoadUsersActivities): Promise<any | null> {

        const user_id = params.user_id;
        const type = params.type;
        const skip = params.skip;
        const limit = params.limit;
        
        const start_from = (skip - 1) * limit;
        let rows:RowDataPacket[] = [];

        let connection: PoolConnection | null = null;
        try{
        
            connection = await pool.getConnection();
            if(type == "All"){

                [rows] = await connection.query<RowDataPacket[]>(`
                (SELECT user_id, 'notes' AS table_name, note_id AS activity_id, notes AS description, notes_type AS type, number_called AS field_1, 
                property_id AS field_2, property_address AS field_3, NULL AS field_4, date_added AS date FROM notes WHERE user_id='${user_id}')
                UNION (SELECT user_id, 'emails' AS table_name, message_id AS activity_id, message_body AS description, message_type AS type, 
                message_kind AS field_1, subject AS field_2, from_info AS field_3, to_info AS field_4, date_added AS date FROM logged_messages 
                WHERE user_id='${user_id}' AND message_kind='Email')
                UNION (SELECT user_id, 'sms' AS table_name, message_id AS activity_id, message_body AS description, message_type AS type, 
                message_kind AS field_1, subject AS field_2, from_info AS field_3, to_info AS field_4, date_added AS date FROM logged_messages 
                WHERE user_id='${user_id}' AND message_kind='SMS')
                UNION (SELECT user_id, 'property_requests' AS table_name, request_id AS activity_id, request_info AS description, request_type AS type, 
                status AS field_1, NULL AS field_2, NULL AS field_3, NULL AS field_4, date_added AS date FROM property_requests WHERE user_id='${user_id}')
                ORDER BY date DESC LIMIT ${start_from}, ${limit}`);
            
            }else if(type == "Notes" || type == "Call Log" || type == "Unfavorite a Property" || type == "Favorite a Property" || 
                type == "Unfavorite a Property" || type == "Viewed a Property" || type == "Search For Listings" || type == "Saved a Search" ||
                type == "Deleted a Search"){

                [rows] = await connection.query<RowDataPacket[]>(`SELECT user_id, 'notes' AS table_name, note_id AS activity_id, notes AS description, 
                notes_type AS type, number_called AS field_1, property_id AS field_2, property_address AS field_3, NULL AS field_4, date_added 
                AS date FROM notes WHERE user_id='${user_id}' AND notes_type='${type}' ORDER BY date DESC LIMIT ${start_from}, ${limit}`);
            
            }else if(type == "Email" || type == "SMS"){

                let table_name = "emails"; //For Email 
                if(type == "SMS"){
                    table_name = "sms";
                }
                
                [rows] = await connection.query<RowDataPacket[]>(`SELECT user_id, '${table_name}' AS table_name, message_id AS activity_id, message_body AS 
                description, message_type AS type, message_kind AS field_1, subject AS field_2, from_info AS field_3, to_info AS field_4, 
                date_added AS date FROM logged_messages WHERE user_id='${user_id}' AND message_kind='${type}' ORDER BY date DESC 
                LIMIT ${start_from}, ${limit}`);

            }else if(type == "Info Requests" || type == "Tour Requests" || type == "Buying Requests" || type == "Selling Requests" || 
                type == "Showing Requests"){

                const request_type = type.replace("Requests", "Request");
                
                [rows] = await connection.query<RowDataPacket[]>(`SELECT user_id, 'property_requests' AS table_name, request_id AS activity_id, 
                request_info AS description, request_type AS type, status AS field_1, NULL AS field_2, NULL AS field_3, NULL AS field_4, 
                date_added AS date FROM property_requests WHERE user_id='${user_id}' AND request_type='${request_type}' ORDER BY date DESC 
                LIMIT ${start_from}, ${limit}`);

            }else if(type == "Favorites"){
                
                let fields = `property_id, matrix_unique_id, MLSNumber, BedsTotal, BathsTotal, ListPrice, OriginalListPrice, LastChangeTimestamp, 
                LastChangeType, OwnershipDesc, PropertyType, DefaultPic, Images, FullAddress, MatrixModifiedDT, TotalArea, ForSaleYN, Status, City, 
                StateOrProvince, PostalCode`;

                const field_array = fields.split(",");
                const fieldsRslt = field_array.map(entry => 'L.' + entry).join(', ');

                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fieldsRslt}, F.date_added FROM properties AS L JOIN favorites AS F 
                ON L.matrix_unique_id=F.matrix_unique_id WHERE F.user_id='${user_id}' ORDER BY F.date_added DESC LIMIT ${start_from}, ${limit}`);

            }else if(type == "Saved Searches"){
                
                let fields = `search_id, search_title, query_link, query_type, email_frequency, date_saved, last_alert, started`;
                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM saved_searches WHERE user_id='${user_id}' ORDER BY date_saved 
                DESC LIMIT ${start_from}, ${limit}`);

            }
            
            const formattedRows = rows.map((row) => {
                delete row.password;
                return {
                    ...row
                }
            });

            const activities_counts = await this.CountUserActivities(user_id);
            return {activities: formattedRows, data_counts: activities_counts} as any | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddSellingRequest(req: NextApiRequest): Promise<boolean> {

        const user_id = req.body.user_id;
        let home_address = req.body.home_address;
        let email_address = req.body.email_address;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        let connection: PoolConnection | null = null;

        let request_body: any = {home_address: home_address, email_address: email_address};
        request_body = JSON.stringify(request_body);

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO property_requests(user_id, request_type, request_info, date_added) 
            VALUES (?, ?, ?, ?) `, [user_id, "Selling Request", request_body, date]);
            if(result.affectedRows){
                return true;
            }else{
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddBuyingRequest(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        const user_id = req_body.user_id;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        let connection: PoolConnection | null = null;

        let request_body: any = {
            first_name: req_body.first_name, 
            last_name: req_body.last_name,
            email: req_body.email,
            primary_phone: req_body.primary_phone,
            secondary_phone: req_body.secondary_phone,
            fax: req_body.fax,
            address: req_body.address,
            city: req_body.city,
            state: req_body.state,
            zip_code: req_body.zip_code,
            num_of_beds: req_body.num_of_beds,
            num_of_baths: req_body.num_of_baths,
            square_feet: req_body.square_feet,
            mode_of_contact: req_body.mode_of_contact,
            price_range: req_body.price_range,
            move_on: req_body.move_on,
            started_looking_in: req_body.started_looking_in,
            own_in: req_body.own_in,
            with_an_agent: req_body.with_an_agent,
            home_description: req_body.home_description,
        };
        request_body = JSON.stringify(request_body);

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO property_requests(user_id, request_type, request_info, date_added) 
            VALUES (?, ?, ?, ?) `, [user_id, "Buying Request", request_body, date]);
            if(result.affectedRows){
                return true;
            }else{
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddShowingRequest(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        const user_id = req_body.user_id;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        let connection: PoolConnection | null = null;

        let request_body: any = {
            fullname: req_body.fullname, 
            phone_number: req_body.phone_number,
            email: req_body.email,
            prefer_date: req_body.prefer_date,
            exact_date: req_body.exact_date,
            prop_url: req_body.prop_url,
        };
        request_body = JSON.stringify(request_body);

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO property_requests(user_id, request_type, request_info, date_added) 
            VALUES (?, ?, ?, ?) `, [user_id, "Showing Request", request_body, date]);
            if(result.affectedRows){
                return true;
            }else{
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddInquiryRequest(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        const user_id = req_body.user_id;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        let connection: PoolConnection | null = null;

        let request_type = "Info Request";
        const type = req_body.type;
        if(type == "Tour"){
            request_type = "Tour Request";
        }

        let request_body: any = {
            first_name: req_body.first_name, 
            last_name: req_body.last_name, 
            phone_number: req_body.phone_number,
            email: req_body.email,
            type: req_body.type,
            tour_type: req_body.tour_type,
            comments: req_body.comments,
            prop_link: req_body.prop_link,
        };
        request_body = JSON.stringify(request_body);

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO property_requests(user_id, request_type, request_info, date_added) 
            VALUES (?, ?, ?, ?) `, [user_id, request_type, request_body, date]);
            if(result.affectedRows){
                return true;
            }else{
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LogPropertyView(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        const user_id = parseInt(req_body.user_id as string);
        const listing_key = req_body.listing_key;
        let property_address = req_body.property_address;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        let connection: PoolConnection | null = null;

        if(property_address && property_address!=""){
            property_address = property_address.replace(/[^a-zA-Z0-9]+/g, "-");
        }

        try{
            
            connection = await pool.getConnection();
            let toatal_view = 0;
            const [check_view] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_views FROM property_views WHERE user_id='${user_id}' AND listing_key='${listing_key}' AND date_added > DATE_SUB(NOW(), INTERVAL 30 MINUTE)`);
            if(check_view.length){
                toatal_view = check_view[0].total_views;
            }
 
            if(toatal_view < 1 && user_id > 0){
                
                const [result] = await connection.query<ResultSetHeader>(`INSERT INTO property_views(user_id, listing_key, date_added) 
                VALUES (?, ?, ?) `, [user_id, listing_key, date]);
                if(result.affectedRows){
                    //
                    const notes = "Viewed property {{property_id}}";
                    const notes_type = "Viewed a Property";

                    const notes_payload: AddNotesParams = {
                        user_id: user_id,
                        notes: notes,
                        notes_type: notes_type,
                        property_id: listing_key,
                        property_address: property_address,
                    }

                    const fav_prms = await this.note_repo.AddNewNote(notes_payload);
                    return true;

                }else{
                    return false;
                }

            }else{
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }
}