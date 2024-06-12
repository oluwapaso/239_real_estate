import pool from "@/_lib/db_conn";
import { APIResponseProps, AutomationInfoAndStep, Automations } from "@/components/types";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface AutomationRepo {
    LoadAutomations(params: any): Promise<Automations[] | null> 
    LoadAutomationInfoSteps(automation_id: number): Promise<AutomationInfoAndStep>
}


export class MYSQLAutomationRepo implements AutomationRepo {

    public async LoadAutomations(params: any): Promise<Automations[] | null> {

        const paginated = params.paginated;
        let rows: RowDataPacket[] = [];
        
        if(paginated){
            
            const page = params.page;
            const limit = params.limit;
            const search_type = params.search_type;
            const start_from = (page - 1) * limit;

            if(search_type == "Automation Lists"){
                [rows] = await pool.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM automations 
                WHERE automation_id IS NOT NULL) AS total_records FROM automations WHERE automation_id IS NOT NULL 
                ORDER BY name ASC LIMIT ${start_from}, ${limit}`);
            }
            
        }else{

        }

        const formattedRows = rows.map((row) => {
            delete row.password;
            return {
                ...row,
            }
        });

        return formattedRows as Automations[] | null;

    }

    public async LoadAutomationInfoSteps(automation_id: number): Promise<AutomationInfoAndStep> {

        const [drip_row] = await pool.query<RowDataPacket[]>(`SELECT automation_id, name, \`trigger\`, parent_id, status, published_version 
        FROM automations WHERE automation_id=?`, [automation_id]);
        if(drip_row.length){

            const drip_info = drip_row[0];
            const parent_id = drip_info.parent_id; 
            const steps: any[] = [];
            const versions: any[] = [];

            const [steps_row] = await pool.query<RowDataPacket[]>(`SELECT * FROM automation_steps WHERE automation_id=? ORDER BY 
            CAST(step_position AS UNSIGNED) ASC`, [automation_id]);
            
            if(steps_row.length){
                steps_row.forEach(step => {
                    steps.push({...step})
                });
            }

            const [versions_row] = await pool.query<RowDataPacket[]>(`SELECT automation_id, parent_id, status, published_version, last_save, 
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
    }

    public async AddNewDrip(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_name = params.automation_name;

        try {
                
            const [check_name] = await pool.query<RowDataPacket[]>(`SELECT automation_id FROM automations WHERE name=?`, [automation_name]);
            if(check_name.length > 0){
                default_resp.message = "Automation name already exist, please try another name";
                return default_resp;
            }

            const deafultTrigger = {
                trigger: "New Account Created"
            }
            const date = moment().format("YYYY-MM-DD HH:mm:ss");
            const [add_result] = await pool.query<ResultSetHeader>(` INSERT INTO automations(name, date_created, \`trigger\`, last_save) 
                VALUES(?, ?, ?, ?) `, [automation_name, date, JSON.stringify(deafultTrigger), date]
            );

            if(add_result.affectedRows >0 ){

                const automation_id = add_result.insertId;
                const [up_result] = await pool.query<ResultSetHeader>(`UPDATE automations SET parent_id=? WHERE automation_id=? `, 
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

        const [drip_row] = await pool.query<RowDataPacket[]>(`SELECT parent_id, \`trigger\`, name FROM automations WHERE automation_id=?`, [automation_id]);
        if(drip_row.length){

            const drip_info = drip_row[0];
            const autom_parent_id = drip_info.parent_id; 
            let trigger = drip_info.trigger; 
            const autom_name = drip_info.name; 
            
            let dupName = `${autom_name} - Dupl_${Math.floor(moment().unix() * 1000)}`;
            let version = 1;

            if(type == "Edit"){

                dupName = autom_name;
                const [version_row] = await pool.query<RowDataPacket[]>(`SELECT version_number FROM automations WHERE parent_id=? 
                    ORDER BY version_number DESC LIMIT 1`, [autom_parent_id]);
                if(version_row.length){
                    const version_info = version_row[0];
                    version = parseInt(version_info.version_number + 1);
                }
            }

            try{

                const date = moment().format("YYYY-MM-DD HH:mm:ss");
                if(trigger && trigger !=""){
                    trigger = JSON.stringify(trigger);
                }
                const [add_result] = await pool.query<ResultSetHeader>(`INSERT INTO automations(name, date_created, \`trigger\`, last_save, 
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
                    
                    const [steps_row] = await pool.query<RowDataPacket[]>(`SELECT * FROM automation_steps WHERE automation_id=? 
                    ORDER BY step_position ASC`, [automation_id]);
                    
                    if(steps_row.length > 0){
                        steps_row.forEach(async (step) => {

                            const children =  JSON.stringify(step.children);
                            const event_info =  JSON.stringify(step.event_info);
                            const [add_steps] = await pool.query<ResultSetHeader>(`INSERT INTO automation_steps(automation_id, step_uid, 
                            step_type, parent_id, parent_uid, parent_type, step_position, children, event_info) 
                            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?) `, [new_automation_id, step.step_uid, step.step_type, step.parent_id, 
                            step.parent_uid, step.parent_type, step.step_position, children, event_info]
                            );

                        });
                    }

                    const [up_result] = await pool.query<ResultSetHeader>(`UPDATE automations SET parent_id=? WHERE automation_id=? `, 
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

            }catch(e:any){
                console.log(e);
                default_resp.message = e.message;
            }

        }else {
            default_resp.message = "Invalid drip info provided."
        }

        return default_resp;

    }

    public async UpdatePublishstatus(params: any): Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const automation_id = params.automation_id;
        const is_published = params.is_published;

        const [drip_row] = await pool.query<RowDataPacket[]>(`SELECT parent_id FROM automations WHERE automation_id=?`, [automation_id]);
        if(drip_row.length){

            const drip_info = drip_row[0];
            const dripParent = drip_info.parent_id;

            try {
                
                if(is_published == "Yes"){

                    const [steps_row] = await pool.query<RowDataPacket[]>(`SELECT event_info, step_uid FROM automation_steps 
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

                    const [reset_result] = await pool.query<ResultSetHeader>(`UPDATE automations SET published_version=?, status=? 
                        WHERE parent_id=? AND automation_id!=? `, ["No", "Inactive", dripParent, automation_id]
                    );

                    status = 'Active';
                }else{
                    status = 'Inactive';
                }

                const [up_result] = await pool.query<ResultSetHeader>(`UPDATE automations SET status=?, published_version=? 
                    WHERE automation_id=? `, [status, is_published, automation_id]
                );

                if(up_result.affectedRows >=0 ){

                    if(is_published == "No"){
                        const [del_result] = await pool.query<ResultSetHeader>(`DELETE FROM todo_drips WHERE automation_id=? `, [automation_id]);
                    }
                    
                    default_resp.success = true;
                    default_resp.message = "success.";

                }else{
                    default_resp.message = "Unable to update drip status";
                }

            } catch(e:any){
                console.log(e);
                default_resp.message = e.message;
            }

        }else {
            default_resp.message = "Invalid drip info provided."
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

        const [drip_row] = await pool.query<RowDataPacket[]>(`SELECT parent_id FROM automations WHERE automation_id=?`, [automation_id]);
        if(drip_row.length){

            const drip_info = drip_row[0];
            const parent_id = drip_info.parent_id;

            try {
                
                const [check_name] = await pool.query<RowDataPacket[]>(`SELECT automation_id FROM automations WHERE automation_id!=? 
                AND name=? AND parent_id!=?`, [automation_id, automation_name, parent_id]);
            
                if(check_name.length > 0){
                    default_resp.message = "Automation name already exist, please try another name";
                    return default_resp;
                }

                const [up_result] = await pool.query<ResultSetHeader>(`UPDATE automations SET name=? WHERE automation_id=? `, 
                    [automation_name, automation_id]
                );

                if(up_result.affectedRows >=0 ){
                    default_resp.success = true;
                    default_resp.message = "Automation name successfully updated.";
                    default_resp.data = {new_name: automation_name}
                }

                return default_resp;

            } catch(e:any){
                console.log(e);
                default_resp.message = e.message;
            }

        }else {
            default_resp.message = "Invalid drip info provided."
        }

        return default_resp;

    }

}