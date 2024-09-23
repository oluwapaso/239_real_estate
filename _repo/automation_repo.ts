import pool from "@/_lib/db_conn";
import { APIResponseProps, AutomationInfoAndStep, Automations, AutomationStep, AutomationSteps, SendSMSParams, SentMailParams, TemplateDetails, User } from "@/components/types";
import moment, { Duration } from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise"; 
import { NextApiRequest } from "next";
import { MYSQLUserRepo } from "./user_repo";
import { MYSQLTemplateRepo } from "./templates_repo";
import { MYSQL_SMS_Repo } from "./sms_repo";
import { MYSQLCompanyRepo } from "./company_repo"; 
import { MYSQLMailRepo } from "./mail_repo";

export interface AutomationRepo {
    LoadAutomations(params: any): Promise<Automations[] | null> 
    LoadAutomationInfoSteps(automation_id: number): Promise<AutomationInfoAndStep>

    AddNewStep(params: any): Promise<APIResponseProps>
    DeleteStep(params: any): Promise<APIResponseProps>
    LoadUserAutomations(params: NextApiRequest): Promise<Automations[] | null>
    IsCampaignRunning(automation_id: any, user_id: any): Promise<boolean>
    StartDrip(automation_id: any, user_id: any, strat_from: any): Promise<boolean>
    PauseResumeCampaign(req: NextApiRequest, status: string): Promise<APIResponseProps>
    ProcessDrips(): Promise<APIResponseProps>

}


export class MYSQLAutomationRepo implements AutomationRepo {

    public async LoadAutomations(params: any): Promise<Automations[] | null> {

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const paginated = params.paginated;
            let rows: RowDataPacket[] = [];
            
            if(paginated){
                
                const page = params.page;
                const limit = params.limit;
                const search_type = params.search_type;
                const start_from = (page - 1) * limit;

                if(search_type == "Automation Lists"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM automations 
                    WHERE automation_id IS NOT NULL) AS total_records FROM automations WHERE automation_id IS NOT NULL 
                    ORDER BY name ASC LIMIT ${start_from}, ${limit}`);
                }
                
            }else{

                const search_type = params.search_type;
                if(search_type == "Active Automation Lists"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM automations WHERE status="Active" 
                    AND published_version='Yes' ORDER BY name ASC`);
                }

            }

            const formattedRows = rows.map((row) => {
                delete row.password;
                return {
                    ...row,
                }
            });

            return formattedRows as Automations[] | null;
        }catch(e: any){

            console.log("e.sqlMessage", e.sqlMessage)
            return null;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadAutomationInfoSteps(automation_id: number): Promise<AutomationInfoAndStep> {

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT automation_id, name, \`trigger\`, parent_id, status, published_version 
            FROM automations WHERE automation_id=?`, [automation_id]);
            if(drip_row.length){

                const drip_info = drip_row[0];
                const parent_id = drip_info.parent_id; 
                const steps: any[] = [];
                const versions: any[] = [];

                const [steps_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM automation_steps WHERE automation_id=? ORDER BY 
                CAST(step_position AS UNSIGNED) ASC`, [automation_id]);
                
                if(steps_row.length){
                    steps_row.forEach(step => {
                        steps.push({...step})
                    });
                }

                const [versions_row] = await connection.query<RowDataPacket[]>(`SELECT automation_id, parent_id, status, published_version, last_save, 
                version_number FROM automations WHERE parent_id=? ORDER BY version_number ASC`, [parent_id]);
                
                if(versions_row.length){
                    versions_row.forEach(version => {
                        versions.push({
                            ...version,
                            last_save: moment(version.last_save).format("MMMM/DD/YYYY")
                        })
                    });
                }

                return {
                    total_records: drip_row.length,
                    automation_id: automation_id,
                    automation_name: drip_info.name,
                    trigger: drip_info.trigger,
                    automation_status: drip_info.status,
                    published_version: drip_info.published_version,
                    steps: steps,
                    versions: versions,
                } as AutomationInfoAndStep;

            }else{
                return {total_records: 0} as AutomationInfoAndStep;
            }
        }catch(e: any){

            console.log("e.sqlMessage", e.sqlMessage)
            return {} as AutomationInfoAndStep;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddNewDrip(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_name = params.automation_name;
        let connection: PoolConnection | null = null;

        try {
                
            connection = await pool.getConnection();
            const [check_name] = await connection.query<RowDataPacket[]>(`SELECT automation_id FROM automations WHERE name=?`, [automation_name]);
            if(check_name.length > 0){
                default_resp.message = "Automation name already exist, please try another name";
                return default_resp;
            }

            const deafultTrigger = {
                trigger: "New Account Created"
            }
            const date = moment().format("YYYY-MM-DD HH:mm:ss");
            const [add_result] = await connection.query<ResultSetHeader>(` INSERT INTO automations(name, date_created, \`trigger\`, last_save) 
                VALUES(?, ?, ?, ?) `, [automation_name, date, JSON.stringify(deafultTrigger), date]
            );

            if(add_result.affectedRows >0 ){

                const automation_id = add_result.insertId;
                const [up_result] = await connection.query<ResultSetHeader>(`UPDATE automations SET parent_id=? WHERE automation_id=? `, 
                [automation_id, automation_id]
                );

                if(up_result.affectedRows>0){
                    
                    default_resp.success = true;
                    default_resp.message = "Automation successfully added.";
                    default_resp.data = {automation_name: automation_name, automation_id: automation_id}

                } else{
                    default_resp.message = "Unable to update new drip's parent id";
                }
                    
            
            }else{
                default_resp.message = "Unable to add new automation.";
            }

            return default_resp;

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async DuplicateDrips(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const type = params.type;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT parent_id, \`trigger\`, name FROM automations WHERE automation_id=?`, [automation_id]);
            
            if(drip_row.length){

                const drip_info = drip_row[0];
                const autom_parent_id = drip_info.parent_id; 
                let trigger = drip_info.trigger; 
                const autom_name = drip_info.name; 
                
                let dupName = `${autom_name} - Dupl_${Math.floor(moment().unix() * 1000)}`;
                let version = 1;

                if(type == "Edit"){

                    dupName = autom_name;
                    const [version_row] = await connection.query<RowDataPacket[]>(`SELECT version_number FROM automations WHERE parent_id=? 
                        ORDER BY version_number DESC LIMIT 1`, [autom_parent_id]);
                    if(version_row.length){
                        const version_info = version_row[0];
                        version = parseInt(version_info.version_number + 1);
                    }
                    
                }

                const date = moment().format("YYYY-MM-DD HH:mm:ss");
                if(trigger && trigger !=""){
                    trigger = JSON.stringify(trigger);
                }
                const [add_result] = await connection.query<ResultSetHeader>(`INSERT INTO automations(name, date_created, \`trigger\`, last_save, 
                version_number) VALUES(?, ?, ?, ?, ?) `, [dupName, date, trigger, date, version]
                );

                if(add_result.affectedRows>0){

                    const new_automation_id = add_result.insertId;
                    let ParentID = new_automation_id;
                    if(type == "Duplicate"){
                        ParentID = new_automation_id;
                    }else if(type == "Edit"){
                        ParentID = autom_parent_id;
                    }
                    
                    const [steps_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM automation_steps WHERE automation_id=? 
                    ORDER BY step_position ASC`, [automation_id]);
                    
                    if(steps_row.length > 0  && connection !== null){
                        for (const step of steps_row) {

                            const children =  JSON.stringify(step.children);
                            const event_info =  JSON.stringify(step.event_info);
                            const [add_steps] = await connection.query<ResultSetHeader>(`INSERT INTO automation_steps(automation_id, step_uid, 
                            step_type, parent_id, parent_uid, parent_type, step_position, children, event_info) 
                            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?) `, [new_automation_id, step.step_uid, step.step_type, step.parent_id, 
                            step.parent_uid, step.parent_type, step.step_position, children, event_info]
                            );

                        };
                    }

                    const [up_result] = await connection.query<ResultSetHeader>(`UPDATE automations SET parent_id=? WHERE automation_id=? `, 
                        [ParentID, new_automation_id]
                    );

                    if(up_result.affectedRows>0){
                        default_resp.success = true;
                        default_resp.data = {automation_id: new_automation_id};
                        default_resp.message = "Drip successfully duplicated.";
                    } else{
                        default_resp.message = "Unable to update new drip's parent id";
                    }

                } else{
                    default_resp.message = "Unable to add new drip";
                }

            }else {
                default_resp.message = "Invalid drip info provided."
            }
        
        }catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async UpdatePublishstatus(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{

            const automation_id = params.automation_id;
            const is_published = params.is_published;
            connection = await pool.getConnection();

            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT parent_id FROM automations WHERE automation_id=?`, [automation_id]);
            if(drip_row.length){

                const drip_info = drip_row[0];
                const dripParent = drip_info.parent_id; 
                
                if(is_published == "Yes"){

                    const [steps_row] = await connection.query<RowDataPacket[]>(`SELECT event_info, step_uid FROM automation_steps 
                    WHERE automation_id=? ORDER BY CAST(step_position AS UNSIGNED) ASC `, [automation_id]);
                    
                    if(steps_row.length < 1){
                        default_resp.message = 'Add at least one step to continue.';
                        return default_resp;
                    }

                    let missingField = "No";
                    const returendData:any = {}
                    steps_row.forEach((step)=>{

                        const step_uid = step.step_uid;
                        const event_info = step.event_info;
                        const trigger = event_info?.trigger;
                        const name = event_info?.name;

                        if(trigger == "Send an Email"){

                            if(!event_info?.value?.template_id || event_info?.value?.template_id == ""){
                                returendData.step_uid = step_uid;
                                missingField = "Yes"; 
                            }

                            if(name == "Send an Email To Multiple Addresses" && (!event_info?.value?.email_address || event_info?.value?.email_address == "")){
                                returendData.step_uid = step_uid;
                                missingField = "Yes"; 
                            }

                        }else if(trigger == "Send an SMS"){
                            
                            if(!event_info?.value?.template_id || event_info?.value?.template_id == ""){
                                returendData.step_uid = step_uid;
                                missingField = "Yes"; 
                            }
                            
                            if(name == "Send an SMS To Multiple Phone Number" && (!event_info?.value?.phone_numbers || event_info?.value?.phone_numbers == "")){
                                returendData.step_uid = step_uid;
                                missingField = "Yes"; 
                            }
                        
                        }else if(trigger == "Delay" && (!event_info?.value?.time || event_info?.value?.time == "" || !event_info?.value?.period || event_info?.value?.period == "")){
                            
                            missingField = "Yes";
                            returendData.step_uid = step_uid;
                        
                        }
                        
                        if(missingField == "Yes"){
                            default_resp.message = 'Missing required field.';
                            default_resp.data = returendData;
                            return default_resp;
                        }

                    });
                }

                let status = "Active";
                if(is_published == "Yes"){

                    const [reset_result] = await connection.query<ResultSetHeader>(`UPDATE automations SET published_version=?, status=? 
                        WHERE parent_id=? AND automation_id!=? `, ["No", "Inactive", dripParent, automation_id]
                    );

                    status = 'Active';
                }else{
                    status = 'Inactive';
                }

                const [up_result] = await connection.query<ResultSetHeader>(`UPDATE automations SET status=?, published_version=? 
                    WHERE automation_id=? `, [status, is_published, automation_id]
                );

                if(up_result.affectedRows >=0 ){

                    if(is_published == "No"){
                        const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM todo_drips WHERE automation_id=? `, [automation_id]);
                    }
                    
                    default_resp.success = true;
                    default_resp.message = "success.";

                }else{
                    default_resp.message = "Unable to update drip status";
                }

            }else {
                default_resp.message = "Invalid drip info provided."
            }

        }catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async UpdateDripName(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const automation_name = params.automation_name;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT parent_id FROM automations WHERE automation_id=?`, [automation_id]);
            if(drip_row.length){

                const drip_info = drip_row[0];
                const parent_id = drip_info.parent_id;
                    
                const [check_name] = await connection.query<RowDataPacket[]>(`SELECT automation_id FROM automations WHERE automation_id!=? 
                AND name=? AND parent_id!=?`, [automation_id, automation_name, parent_id]);
            
                if(check_name.length > 0){
                    default_resp.message = "Automation name already exist, please try another name";
                    return default_resp;
                }

                const [up_result] = await connection.query<ResultSetHeader>(`UPDATE automations SET name=? WHERE automation_id=? `, 
                    [automation_name, automation_id]
                );

                if(up_result.affectedRows >=0 ){
                    default_resp.success = true;
                    default_resp.message = "Automation name successfully updated.";
                    default_resp.data = {new_name: automation_name}
                }

                return default_resp;

            }else {
                default_resp.message = "Invalid drip info provided."
            }

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async UpdateTriger(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const trigger = params.trigger;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT parent_id FROM automations WHERE automation_id=?`, [automation_id]);
            if(drip_row.length){

                let triggerInfo = {
                    name: "",
                    trigger: trigger,
                };

                if(trigger == "New Account Created"){
                    triggerInfo.name = "New Account Created On Main Website"; 
                }else{
                    triggerInfo.name = "Drip Manually Added To a Lead"; 
                }

                const [up_result] = await connection.query<ResultSetHeader>(`UPDATE automations SET \`trigger\`=? WHERE automation_id=?`, 
                    [JSON.stringify(triggerInfo), automation_id]
                );

                if(up_result.affectedRows >=0 ){
                    default_resp.success = true;
                    default_resp.message = "Success.";
                    default_resp.data = {trigger: triggerInfo}
                }

                return default_resp;

            }else {
                default_resp.message = "Invalid drip info provided."
            }

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async LoadSingleAutomationStep(params: any): Promise<AutomationStep | APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const step_id = params.step_id;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT parent_id FROM automations WHERE automation_id=?`, [automation_id]);
            if(drip_row.length){

                let steps_details: any = {};
                const [steps_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM automation_steps WHERE automation_id=?
                AND step_id=? ORDER BY step_position ASC`, [automation_id, step_id]);
                
                if(steps_row.length){
                    
                    steps_details = {...steps_row[0]};
                    let email_templates: any[] = [];
                    let sms_templates: any[] = [];

                    if(steps_details && typeof steps_details == "object" ){
                        
                        /** Fetch email templates starts **/
                        /** Fetch email templates starts **/
                        if(steps_details.event_info.trigger == "Send an Email"){
                            const [email_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM templates WHERE template_type=? 
                            ORDER BY template_name ASC`, ["Email"]);
                            
                            if(email_row.length){
                                email_row.forEach(email_temp => {
                                    email_templates.push({...email_temp})
                                });
                            }
                        }
                        /** Fetch email templates ends **/
                        /** Fetch email templates ends **/
                        
                        /** Fetch sms templates starts **/
                        /** Fetch sms templates starts **/
                        if(steps_details.event_info.trigger == "Send an SMS"){
                            const [sms_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM templates WHERE template_type=? 
                            ORDER BY template_name ASC`, ["SMS"]);
                            
                            if(sms_row.length){
                                sms_row.forEach(sms_temp => {
                                    sms_templates.push({...sms_temp})
                                });
                            }
                        }
                        /** Fetch sms templates ends **/
                        /** Fetch sms templates ends **/

                    }
                    //console.log("steps_details", steps_details, typeof steps_details)
                    
                    const resp: AutomationStep = {
                        ...steps_details as AutomationSteps,
                        email_templates: email_templates,
                        sms_templates: sms_templates,
                    }

                    return resp;

                }else {
                    default_resp.message = "Invalid action info provided.";
                    return default_resp;
                }

            }else {
                default_resp.message = "Invalid drip info provided.";
                return default_resp;
            }
            

        }catch(e: any){

            console.log("e.sqlMessage", e.sqlMessage)
            default_resp.message = e.sqlMessage;
            return default_resp;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async ChangeStepAction(params: any): Promise<APIResponseProps>{

        console.log("Here")
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
        
        const automation_id = params.automation_id;
        const step_id = params.step_id;
        const step_uid = params.step_uid;
        const trigger = params.trigger;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT parent_id FROM automation_steps WHERE step_id=? 
            AND automation_id=? AND step_uid=?`, [step_id, automation_id, step_uid]);
            if(drip_row.length){

                let eventInfo = {
                    name: trigger,
                    trigger: trigger,
                    wait_time: "5",
                    wait_period: "Minutes",
                };

                const [up_result] = await connection.query<ResultSetHeader>(`UPDATE automation_steps SET event_info=? WHERE step_id=? 
                AND automation_id=? AND step_uid=? `, [JSON.stringify(eventInfo), step_id, automation_id, step_uid]
                );

                if(up_result.affectedRows >= 0 ){
                    default_resp.success = true;
                    default_resp.message = "Success.";
                    default_resp.data = {event_info: eventInfo}
                }

                return default_resp;

            }else {
                default_resp.message = "Invalid drip info provided."
            }

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async UpdateStep(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const step_id = params.step_id;
        const step_uid = params.step_uid;
        const wait_period = params.wait_period;
        const wait_time = params.wait_time;
        const email_template = params.email_template;
        const sms_template = params.sms_template;
        const trigger = params.trigger;

        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT step_position FROM automation_steps WHERE step_id=? 
            AND automation_id=? AND step_uid=?`, [step_id, automation_id, step_uid]);
            if(drip_row.length){

                let eventInfo = {
                    name: trigger,
                    trigger: trigger,
                    value: { 
                        template_id: email_template || sms_template, 
                    },
                    wait_time: wait_time,
                    wait_period: wait_period,
                };

                const [up_result] = await connection.query<ResultSetHeader>(`UPDATE automation_steps SET event_info=? WHERE step_id=? 
                AND automation_id=? AND step_uid=? `, [JSON.stringify(eventInfo), step_id, automation_id, step_uid]
                );

                if(up_result.affectedRows >= 0 ){
                    default_resp.success = true;
                    default_resp.message = "Success.";
                    default_resp.data = {event_info: eventInfo}
                }

                return default_resp;

            }else {
                default_resp.message = "Invalid drip info provided."
            }

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async AddNewStep(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const step_id = params.step_id;
        const parent_id = params.parent_id;
        const parent_type = params.parent_type;
        const parent_uid = params.parent_uid;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [autom_row] = await connection.query<RowDataPacket[]>(`SELECT step_position FROM automation_steps WHERE automation_id=?`, [automation_id]);
            if(autom_row.length < 1 && step_id > 0){
                default_resp.message = "Invalid drip info provided."
                return default_resp;
            }

            const [parent_row] = await connection.query<RowDataPacket[]>(` SELECT step_id, step_uid, step_position, step_type 
            FROM automation_steps WHERE parent_id=? AND automation_id=? `, [step_id, automation_id]);
                
            const [add_result] = await connection.query<ResultSetHeader>(` INSERT INTO automation_steps(automation_id, step_type) 
            VALUES(?, ?) `, [automation_id, "Action"]
            );

            if(add_result.affectedRows >0 ){
                
                const new_step_id = add_result.insertId;
                const new_step_uid = `action_${new_step_id}`;
                
                /** Attaches new step to the clicked parent **/
                let newChildren = '[]';

                /** Need to attach new child to clicked parent and attach old child to new child **/
                if(parent_row.length >0 ){

                    const old_step_id = parent_row[0].step_id;
                    const old_step_uid = parent_row[0].step_uid;
                    const old_step_position = parent_row[0].step_position;

                    const [next_row] = await connection.query<RowDataPacket[]>(`SELECT step_id, step_position FROM automation_steps 
                    WHERE automation_id=? AND CAST(step_position AS UNSIGNED)>=? AND step_id!=? `, [automation_id, old_step_position, 
                    new_step_id]);

                    if(next_row.length >0 ){

                        const updateQuery = `UPDATE automation_steps SET step_position=? WHERE automation_id=? AND step_id=?`;
                        for (const rowNextPos of next_row) {
                            const next_step_id = rowNextPos.step_id;
                            const next_step_pos = rowNextPos.step_position;
                            const up_step_pos_to = parseInt(next_step_pos) + 1;

                            const [updateResult] = await connection.query<ResultSetHeader>(updateQuery, [ 
                                up_step_pos_to, automation_id, next_step_id,
                            ]);

                            if (updateResult.affectedRows === 0) {
                                throw new Error('Failed to update the step position');
                            }
                        }

                    }

                    newChildren = `["${old_step_uid}"]`;
                    
                    //Extra update for old child details
                    const [old_child_update] = await connection.query<ResultSetHeader>(`UPDATE automation_steps SET parent_id=?, 
                        parent_uid=?, parent_type=? WHERE automation_id=? AND step_id=? `, [new_step_id, new_step_uid, "action", 
                        automation_id, old_step_id]
                    );

                }

                let parent_step_id;
                let parent_step_uid;
                let parent_step_type;
                let old_step_position;

                if(step_id != "0"){
                    
                    //Select the clicked step 
                    const [clicked_step] = await connection.query<RowDataPacket[]>(`SELECT step_id, step_uid, step_position, 
                    step_type FROM automation_steps WHERE step_id=? AND automation_id=? `, [step_id, automation_id]);
                    
                    if(clicked_step.length >0 ){

                        parent_step_id = clicked_step[0].step_id;
                        parent_step_uid = clicked_step[0].step_uid;
                        parent_step_type = clicked_step[0].step_type;
                        const parent_step_pos = clicked_step[0].step_position;
                        old_step_position = parseInt(parent_step_pos) + 1; //Actually new step position

                    }else{
                        //Early return
                        default_resp.message = "Invalid step info provided."
                        return default_resp;
                    }

                }else{
                    
                    parent_step_id = "0";
                    parent_step_uid = "trigger_container";
                    parent_step_type = "trigger";
                    old_step_position = 2; //Actually new step position, always start from 2
                    
                }

                const event_info = {
                    "name": "Add New Action",
                    "wait_time": "5",
                    "wait_period": "Minutes",
                    "trigger": "Select To-Do Action",
                    "value": {}
                }

                const [updateNewStpPos] = await connection.query<ResultSetHeader>(`UPDATE automation_steps SET step_uid=?, 
                    parent_id=?, parent_uid=?, parent_type=?, step_position=?, children=?, event_info=? WHERE automation_id=? 
                    AND step_id=? `, [new_step_uid, parent_step_id, parent_step_uid, parent_step_type, old_step_position, 
                    newChildren, JSON.stringify(event_info), automation_id, new_step_id]
                );

                if(step_id != ""){

                    const parentChildren = `["${new_step_uid}"]`;
                    const [updateNewStpPos] = await connection.query<ResultSetHeader>(`UPDATE automation_steps SET children=? 
                        WHERE automation_id=? AND step_id=? `, [parentChildren, automation_id, step_id]
                    );
                
                }

                default_resp.success = true;
                default_resp.message = "Success.";

            }else {
                default_resp.message = "Unable to add new drip step.";
            }

            return default_resp;


        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        } finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async DeleteStep(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const step_id = params.step_id;
        const parent_id = params.parent_id;
        const parent_type = params.parent_type;
        const parent_uid = params.parent_uid;
        let connection: PoolConnection | null = null;

        try {

            connection = await pool.getConnection();
            //Select the clicked step 
            const [clicked_step] = await connection.query<RowDataPacket[]>(`SELECT step_id, step_uid, step_position, 
            step_type, children FROM automation_steps WHERE step_id=? AND automation_id=? `, [step_id, automation_id]);

            if(clicked_step.length >0 ){

                const clicked_step_id = clicked_step[0].step_id;
                const clicked_step_uid = clicked_step[0].step_uid;
                const clicked_step_type = clicked_step[0].step_type;
                const clicked_step_pos = clicked_step[0].step_position;
                const old_step_position = parseInt(clicked_step_pos + 1); //Actually new step position
                const clicked_children = clicked_step[0].children;

                let clicked_child_uid = "";
                if(Array.isArray(clicked_children)){
                    clicked_child_uid = clicked_children[0];
                }
                
                /** Just attach new step to the clicked parent **/
                let parentChildren = '[]';

                //Check children attached to parent_id(using clicked step_id)
                const [att_children] = await connection.query<RowDataPacket[]>(`SELECT step_id FROM automation_steps WHERE parent_id=? 
                AND automation_id=? `, [clicked_step_id, automation_id]);

                if(att_children.length >0 ){
                    /** Need to attach new child to clicked parent and attach old child to new child **/ 

                    const [next_row] = await connection.query<RowDataPacket[]>(`SELECT step_id, step_position FROM automation_steps 
                    WHERE automation_id=? AND CAST(step_position AS UNSIGNED)>? ORDER BY CAST(step_position AS UNSIGNED) ASC `, 
                    [automation_id, clicked_step_pos]);
                   
                    if(next_row.length >0 ){
                        
                        const updateQuery = `UPDATE automation_steps SET step_position=? WHERE automation_id=? AND step_id=?`;
                        for (const rowNextPos of next_row) {
                            const next_step_id = rowNextPos.step_id;
                            const next_step_pos = rowNextPos.step_position;
                            const up_step_pos_to = parseInt(next_step_pos) - 1;

                            const [updateResult] = await connection.query<ResultSetHeader>(updateQuery, [ 
                                up_step_pos_to, automation_id, next_step_id,
                            ]);

                            if (updateResult.affectedRows === 0) {
                                throw new Error('Failed to update the step position');
                            }
                        }

                    }

                    parentChildren = `["${clicked_child_uid}"]`;
                    const [updateImdtSibling] = await connection.query<ResultSetHeader>(`UPDATE automation_steps SET parent_id=?, 
                    parent_uid=?, parent_type=? WHERE automation_id=? AND step_uid=?`, [parent_id, parent_uid, parent_type, 
                    automation_id, clicked_child_uid]
                    );

                }

                const [delClickedStep] = await connection.query<ResultSetHeader>(`DELETE FROM automation_steps WHERE automation_id=? 
                AND step_id=?`, [automation_id, step_id]
                );

                if(parent_id != ""){

                    const [updateParent] = await connection.query<ResultSetHeader>(`UPDATE automation_steps SET children=? 
                    WHERE automation_id=? AND step_id=?`, [parentChildren, automation_id, parent_id]
                    );
                
                }

                default_resp.success = true;
                default_resp.message = "Success.";

            } else{
                //Early return
                default_resp.message = "Invalid step info provided."
                return default_resp;
            }

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        } finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async LoadUserAutomations(req: NextApiRequest): Promise<Automations[] | null> {

        const params = req.body
        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT u.automations, a.name, a.status, a.automation_id, 
            a.published_version FROM users AS u JOIN automations AS a ON (JSON_CONTAINS(u.automations, JSON_OBJECT('automation_id', 
            CAST(a.automation_id AS CHAR)), '$') OR JSON_CONTAINS(u.automations, JSON_OBJECT('automation_id', a.automation_id), '$'))
            WHERE a.status='Active' AND a.published_version='Yes' AND u.user_id='${params.user_id}' `);

            const formattedRows = rows.map((row) => {
                delete row.password;
                return {
                    ...row,
                }
            });

            return formattedRows as Automations[] | null;
        }catch(e: any){

            console.log("e.sqlMessage", e.sqlMessage)
            return null;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async IsCampaignRunning(automation_id: any, user_id: any): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT JSON_CONTAINS(automations, JSON_OBJECT('automation_id', 
            ${automation_id})) AS drip_exists FROM users WHERE user_id='${user_id}' `);

            if(rows.length && rows.length > 0 && parseInt(rows[0].drip_exists) > 0){
                return true;
            }else{
                return false;
            }

        }catch(e: any){

            console.log("e.sqlMessage", e.sqlMessage)
            return false;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async StartNewCampaign(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const params = req.body;
        const automation_id = params.automation_id;
        const user_id = params.user_id;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`
            UPDATE users SET automations=JSON_ARRAY_APPEND(IFNULL(automations, JSON_ARRAY()), '$', 
            JSON_OBJECT('status', 'Running', 'automation_id', ?)) WHERE user_id=? `, [automation_id, user_id]
            );

            if(up_result.affectedRows > 0){

                const start_campaign = this.StartDrip(automation_id, user_id, "2");
                if(!start_campaign){
                    default_resp.message = "Unable to start automation";
                    return default_resp;
                }

                default_resp.success = true;
                default_resp.message = "Success.";
            }

            return default_resp;

        }catch(e: any){

            console.log("e.sqlMessage", e.sqlMessage);
            default_resp.message = e.sqlMessage;
            return default_resp;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async StartDrip(automation_id: any, user_id: any, strat_from: any): Promise<boolean> {
        
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [drip_row] = await connection.query<RowDataPacket[]>(`SELECT name FROM automations WHERE automation_id=?`, [automation_id]);
            if(drip_row.length){
                
                const autom_name = drip_row[0].name;
                const custom_wait = moment().add("1", "minutes").format("YYYY-MM-DD HH:mm:ss");

                // const [add_drip] = await connection.query<ResultSetHeader>(`INSERT INTO drips(automation_id, user_id, next_step, 
                // next_execution_date) VALUES(?, ?, ?, ?)`, [automation_id, user_id, strat_from, custom_wait]
                // );
                
                // if(!add_drip){
                //     return false;
                // }

                // const new_drip_id = add_drip.insertId;
                const date = moment().format("YYYY-MM-DD HH:mm:ss");
                const strDtls = `Info: ${autom_name} Started!`;

                const [add_progress] = await connection.query<ResultSetHeader>(`INSERT automation_progress(automation_id, user_id, 
                automation_type, step_response, step_details, date_executed) VALUES(?, ?, ?, ?, ?, ?) `, 
                [automation_id, user_id, "Started", "Success", strDtls, date]
                );

                const [add_today_drip] = await connection.query<ResultSetHeader>(`INSERT todo_drips(automation_id, user_id, next_step, 
                next_execution_date) VALUES(?, ?, ?, ?) `, [automation_id, user_id, strat_from, custom_wait]
                );

                if(add_progress && add_today_drip){
                    return true;
                }else{
                    return false;
                }

            }else{
                return false;
            }

        }catch(e: any){

            console.log("e.sqlMessage", e.sqlMessage);
            return false;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async PauseResumeCampaign(req: NextApiRequest, status: string): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const params = req.body;
        const automation_id = params.automation_id;
        const user_id = params.user_id;
        let connection: PoolConnection | null = null;

        if(status == "Resume"){
            status = "Running";
        }else if(status == "Pause"){
            status = "Paused";
        }

        try{

            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`
            UPDATE users SET automations=JSON_SET(
                automations, 
                REPLACE(
                    JSON_UNQUOTE(JSON_SEARCH(automations, 'one', '${automation_id}', NULL, '$[*].automation_id')),
                    '.automation_id', 
                    '.status'
                ), 
                '${status}'
            ) WHERE JSON_SEARCH(automations, 'one', 
            '${automation_id}', NULL, '$[*].automation_id') IS NOT NULL AND user_id=?`, [user_id]);

            if(up_result.affectedRows > 0){ 

                const [up_todos] = await connection.query<ResultSetHeader>(`UPDATE todo_drips SET automation_status=? 
                    WHERE automation_id=? `, [status, automation_id]
                );

                default_resp.success = true;
                default_resp.message = "Success.";
            }

            return default_resp;

        }catch(e: any){

            console.log("e.sqlMessage", e.sqlMessage);
            default_resp.message = e.sqlMessage;
            return default_resp;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddAutomationLog(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const user_id = params.user_id;
        const message = params.message || "";
        const exception_msg = params.exception_msg || "";
        const step_uid = params.step_uid;
        const event_name = params.event_name;
        const type = params.type || "Info";
        const date = moment().format("YYYY-MM-DD H:m:s");
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [add_log] = await connection.query<ResultSetHeader>(` 
                INSERT INTO automation_logs(user_id, automation_id, step_uid, event_name, log_type, message, exception_msg, date_added) 
                VALUES(?, ?, ?, ?, ?, ?, ?, ?) `, [user_id, automation_id, step_uid, event_name, type, message, exception_msg, date]
            );

            if(add_log.affectedRows > 0){
                default_resp.success = true;
                default_resp.message = "Success.";
            }else {
                default_resp.message = "Error adding automation log.";
            }

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        } finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async ProcessDrips(): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
 
        let connection: PoolConnection | null = null;
        try {

            connection = await pool.getConnection();
            //Select the clicked step 
            const [to_exec] = await connection.query<RowDataPacket[]>(` SELECT t.*, s.* FROM todo_drips AS t 
            RIGHT JOIN automation_steps AS s ON t.next_step=s.step_position AND t.automation_id=s.automation_id 
            WHERE t.automation_status='Running' AND t.next_execution_date <= NOW() ORDER BY t.next_execution_date DESC LIMIT ? `, 
            [5]); //5 or 10 //AND t.next_execution_date <= DATE_ADD(NOW(), INTERVAL 1 HOUR)

            if(to_exec.length >0 ){
                
                for(const drip_info of to_exec){

                    const todo_id = drip_info.todo_id;
                    const user_id = drip_info.user_id;
                    const drip_id = drip_info.drip_id;
                    const automation_id = drip_info.automation_id;
                    const step_id = drip_info.step_id;
                    const step_uid = drip_info.step_uid;
                    const step_type = drip_info.step_type;
                    const event_info = drip_info.event_info;
                    const step_position = drip_info.step_position;

                    const event_name = event_info.name;
                    const event_trigger = event_info.trigger;

                    const user_repo = new MYSQLUserRepo();
                    const temp_repo = new MYSQLTemplateRepo();
                    const com_repo = new MYSQLCompanyRepo();
                    const sms_repo = new MYSQL_SMS_Repo();
                    const mail_repo = new MYSQLMailRepo();

                    const api_info_prms = com_repo.GetApiInfo();
                    const api_info = await api_info_prms; 
                    const twillio_number = api_info.data.twillio_phone_number;
                    let user_info = await user_repo.GetSingleUser({params: {search_by:"User ID", fields: "*", user_id: user_id}});

                    if(!user_info || (user_info && (typeof user_info == "string" || typeof user_info == "object" && !user_info.user_id) )){
                        console.log("Continue from next step");
                        default_resp.message= "Invalid user info provided";
                        await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Error", message: "Invalid user info provided" });
                        await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                        return default_resp;
                    }

                    user_info = user_info as User;
                    const template_id = event_info.value.template_id;
                    let temp_info: TemplateDetails | null = null;

                    if(event_trigger == "Send an Email"){

                        temp_info = await temp_repo.LoadTemplateInfo(
                            {search_by: "Temp Id", template_type: "Email", search_value: template_id}
                        );

                        if(!temp_info){
                            console.log("Continue from next step");
                            default_resp.message = "Invalid Email template selected for this step";
                            await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Error", message: "Invalid Email template selected for this step" });
                            await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                            return default_resp;
                        }

                        let email_body = temp_info.email_body;
                        let email_subject = temp_info.email_subject;
                        if(!email_body || email_body == "" || !email_subject || email_subject == ""){
                            console.log("Continue from next step");
                            default_resp.message = "Email template body/subject is missing";
                            await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Error", message: "Email template body/subject is missing" });
                            await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                            return default_resp;
                        }
                        
                        email_body = await temp_repo.ReplaceTemplateCode(email_body, "Email", user_id);
                        email_subject = await temp_repo.ReplaceTemplateCode(email_subject, "Email", user_id);
                        const queue_params: SentMailParams = {
                            user_id: user_id,
                            from_email: api_info.data.sendgrid_mailer,
                            to_email: user_info.email,
                            subject: email_subject,
                            body: email_body,
                            message_type: "CRM Message",
                        } 
                        
                        const add_to_queue = await mail_repo.AddMailToQueue(queue_params);
                        if(add_to_queue){
                            default_resp.success = add_to_queue;
                            default_resp.message = "Email queued successfully.";    
                            await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Info", message: `Sending ${temp_info.template_name} to the ${user_info.firstname}.` });
                            await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                        }else{
                            default_resp.message = "Unable to add auto SMS to queue.";
                            await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Error", message: "Unable to add auto SMS to queue." });
                            await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                        } 

                    }else if(event_trigger == "Send an SMS"){

                        temp_info = await temp_repo.LoadTemplateInfo(
                            {search_by: "Temp Id", template_type: "SMS", search_value: template_id}
                        );

                        if(!temp_info){
                            console.log("Continue from next step");
                            default_resp.message = "Invalid SMS template selected for this step";
                            await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Error", message: "Invalid SMS template selected for this step" });
                            await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                            return default_resp;
                        }
                    
                        let sms_body = temp_info.sms_body;
                        if(!sms_body || sms_body == ""){
                            console.log("Continue from next step");
                            default_resp.message = "SMS template body is missing";
                            await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Error", message: "SMS template body is missing" });
                            await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                            return default_resp;
                        }

                        sms_body = await temp_repo.ReplaceTemplateCode(sms_body, "SMS", user_id);
                        const queue_params: SendSMSParams = {
                            user_id: user_id,
                            from_phone: twillio_number,
                            to_phone: user_info.phone_1 || user_info.phone_2,
                            body: sms_body,
                            message_type: "CRM Message",
                        } 

                        const add_to_queue = await sms_repo.Add_SMS_ToQueue(queue_params);
                        if(add_to_queue){
                            default_resp.success = add_to_queue;
                            default_resp.message = "SMS queued successfully.";    
                            await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Info", message: `Sending ${temp_info.template_name} to the ${user_info.firstname}.` });
                            await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                        }else{
                            default_resp.message = "Unable to add auto SMS to queue.";
                            await this.AddAutomationLog({ automation_id, user_id, step_uid, event_name, type: "Error", message: "Unable to add auto SMS to queue." });
                            await this.ProcessNextDrip({ automation_id, user_id, step_position, todo_id });
                        } 

                    }

                }

                return default_resp;

            }else{
                default_resp.message = "No drips to execute";
                return default_resp;
            }
        
        }catch(e: any){

            console.log("e.sqlMessage", e);
            default_resp.message = e.sqlMessage;
            return default_resp;

        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async ProcessNextDrip(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const user_id = params.user_id;
        const step_position = parseInt(params.step_position); 
        const todo_id = params.todo_id;
        const date = moment().format("YYYY-MM-DD H:m:s");
        let connection: PoolConnection | null = null;

        try{
            
            const delTodoStep = await this.DeleteTodoStep({automation_id, user_id, todo_id});
            console.log("delTodoStep", delTodoStep);
            connection = await pool.getConnection();

            const nextStep = step_position + 1;
            const [next_step] = await connection.query<RowDataPacket[]>(`SELECT event_info FROM automation_steps WHERE automation_id=? 
            AND step_position=? `, [automation_id, nextStep]);
            console.log('next_step.length', next_step.length);

            if(next_step.length > 0){
                
                const event_info = next_step[0].event_info;
                const wait_time = event_info.wait_time;
                const wait_period = event_info.wait_period;
                const whole_time = parseInt(wait_time.split(".")[0]);
                const part_time = parseInt(wait_time.split(".")[1]);

                let partTime: moment.DurationInputArg2 = "seconds";
                let waitPeriod: moment.DurationInputArg2 = "days";
                if(wait_period == "Minutes"){
                    
                    waitPeriod = "minutes";
                    if(part_time && part_time>0){
                        partTime = "seconds";
                    }
                    
                }else if(wait_period == "Hours"){
                    
                    waitPeriod = "hours";
                    if(part_time && part_time>0){
                        partTime = 'minutes';
                    }
                    
                }

                const execution_date = moment().add(whole_time, waitPeriod).add(part_time, partTime).format('YYYY-MM-DD HH:mm:ss');
                
                const [add_next_drip] = await connection.query<ResultSetHeader>(`INSERT INTO todo_drips(user_id, automation_id, 
                next_step, next_execution_date) VALUES(?, ?, ?, ?)`, 
                [user_id, automation_id, nextStep, execution_date]
                );

                if(add_next_drip.affectedRows > 0){  
                    default_resp.success = true;
                    default_resp.message = "Success.";
                }else{  
                    default_resp.message = "Unable to add next drip to database.";
                }

            }else{
                /** If steps has ended, we need to set the drip to completed on user table **/

                const [up_result] = await connection.query<ResultSetHeader>(`
                UPDATE users SET automations=JSON_SET(
                    automations, 
                    REPLACE(
                        JSON_UNQUOTE(JSON_SEARCH(automations, 'one', '${automation_id}', NULL, '$[*].automation_id')),
                        '.automation_id', 
                        '.status'
                    ), 
                    'Done'
                ) WHERE JSON_SEARCH(automations, 'one', 
                '${automation_id}', NULL, '$[*].automation_id') IS NOT NULL AND user_id=?`, [user_id]);

                if(up_result.affectedRows > 0){  
                    default_resp.success = true;
                    default_resp.message = "Success.";
                }

            }

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        } finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

    public async DeleteTodoStep(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const todo_id = params.todo_id;
        const user_id = params.user_id;
        let connection: PoolConnection | null = null;

        try {

            connection = await pool.getConnection();
            const [delTodoStep] = await connection.query<ResultSetHeader>(`DELETE FROM todo_drips WHERE todo_id=? 
            AND user_id=? AND automation_id=?`, [todo_id, user_id, automation_id]
            );

            if(delTodoStep.affectedRows > 0){
                default_resp.success = true;
                default_resp.message = "Success.";
            }else {
                default_resp.message = "Unable to delete todo drip.";
            }

        } catch(e:any){
            console.log(e);
            default_resp.message = e.message;
        } finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp;

    }

}