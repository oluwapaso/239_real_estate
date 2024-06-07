import pool from "@/_lib/db_conn";
import { APIResponseProps, AddServiceParams, CheckSlugParams, LoadServicesParams, ServiceDetails, ServiceLists } from "@/components/types";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 

export interface ServiceRepo {
    CheckServiceSlug(params: CheckSlugParams): Promise<number>
    AddNewService(params: AddServiceParams) : Promise<[boolean, number]>
    LoadServiceInfo(slug: string, search_by: string): Promise<ServiceDetails | null>
    LoadDraftInfo(draft_id: number): Promise<ServiceDetails | null>
    UpdateService(params: AddServiceParams) : Promise<boolean>
    LoadServices(params: LoadServicesParams): Promise<ServiceLists[] | null>
    DeleteService(draft_id: number): Promise<boolean>
}

export class MYSQLServiceRepo implements ServiceRepo {

    public async CheckServiceSlug(params: CheckSlugParams): Promise<number>{

        const slug = params.slug
        const check_by = params.check_by
        let rows: RowDataPacket[] = []

        if(check_by == "Slug"){
            [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS slug_exist FROM service_drafts WHERE slug=?`, [slug]);
        }else if(check_by == "Slug Alt"){
            const draft_id = params?.draft_id;
            [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS slug_exist FROM service_drafts WHERE slug=? AND draft_id!=?`, [slug, draft_id]);
        }

        if(rows.length){
            return rows[0].slug_exist
        }else{
            return 0
        }

    }

    public async AddNewService(params: AddServiceParams) : Promise<[boolean, number]>{

        const draft_id = params.draft_id
        const friendly_name = params.friendly_name
        const slug = params.slug
        const excerpt = params.excerpt
        const body = params.post_body
        const submit_type = params.submit_type
        const header_image = JSON.stringify(params.header_image);
        const menus = params.menus

        try{
            
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            let isAdded: boolean = false;
            let srvc_draft_id: number = draft_id;

            if(submit_type == "Draft"){

                //Newly added post
                if(draft_id < 1){

                    const [result] = await pool.query<ResultSetHeader>(`
                        INSERT INTO service_drafts(friendly_name, slug, excerpt, post_body, date_added, header_image, show_on_menus) 
                        VALUES (?, ?, ?, ?, ?, ?, ?) `, [friendly_name, slug, excerpt, body, now, header_image, menus]
                    );

                    isAdded = result.affectedRows > 0;
                    srvc_draft_id = result.insertId;

                }else{
                    
                    //Still updating from the add new post page

                    const [result] = await pool.query<ResultSetHeader>(`UPDATE service_drafts SET friendly_name=?, slug=?, excerpt=?, 
                    post_body=?, date_added=?, header_image=?, show_on_menus=? WHERE draft_id=? `, [friendly_name, slug, excerpt, body, now, 
                    header_image, menus, draft_id]);

                    isAdded = result.affectedRows >= 0;
                    srvc_draft_id = draft_id;
                
                }


            }else if(submit_type == "Publish"){

                //Newly added post
                if(draft_id < 1){

                    //Insert blog_post
                    const [add_post_result] = await pool.query<ResultSetHeader>(`
                        INSERT INTO services(friendly_name, slug, excerpt, post_body, date_added, header_image, show_on_menus) 
                        VALUES (?, ?, ?, ?, ?, ?, ?) `, [friendly_name, slug, excerpt, body, now, header_image, menus]
                    );

                    isAdded = add_post_result.affectedRows > 0;
                    const service_id = add_post_result.insertId;

                    //Add draft post
                    const [add_draft_result] = await pool.query<ResultSetHeader>(`
                        INSERT INTO service_drafts(service_id, friendly_name, slug, excerpt, post_body, date_added, header_image, 
                        published_header_image, show_on_menus, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, 
                        [service_id, friendly_name, slug, excerpt, body, now, header_image, header_image, menus, "Yes"]
                    );

                    srvc_draft_id = add_draft_result.insertId;

                    //Update new post's darft id 
                    const [up_result] = await pool.query<ResultSetHeader>(`
                        UPDATE services SET service_draft_id=? WHERE service_id=? `, [srvc_draft_id, service_id]
                    );

                }else{

                    //Still updating from the add new post page

                    //Delete old post with this draft_id
                    const [del_result] = await pool.query<ResultSetHeader>(`DELETE FROM services WHERE service_draft_id=? `, [draft_id]);

                    //Insert blog_post
                    const [add_result] = await pool.query<ResultSetHeader>(`
                        INSERT INTO services(service_draft_id, friendly_name, slug, excerpt, post_body, date_added, header_image, 
                        show_on_menus) VALUES (?, ?, ?, ?, ?, ?, ?, ?) `, [draft_id, friendly_name, slug, excerpt, body, now, header_image, 
                        menus]
                    );

                    isAdded = add_result.affectedRows > 0;
                    const comm_id = add_result.insertId;

                    //Update draft post
                    const [update_result] = await pool.query<ResultSetHeader>(`
                        UPDATE service_drafts SET service_id=?, friendly_name=?, slug=?, excerpt=?, post_body=?, date_added=?, 
                        header_image=?, published_header_image=?, show_on_menus=?, published=? WHERE draft_id=? `, 
                        [comm_id, friendly_name, slug, excerpt, body, now, header_image, header_image, menus, "Yes", draft_id]
                    );

                }

            }
            
            return [isAdded, srvc_draft_id];

        }catch(e: any){
            console.log(e.sqlMessage)
            return [false, 0]
        }

    }

    public async LoadServiceInfo(slug: string, search_by: string): Promise<ServiceDetails | null> {

        try{

            let rows: RowDataPacket[] = []

            if(search_by == "Slug"){
                [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM services WHERE slug=? `, [slug]);
            }else if(search_by == "Community Id"){
                [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM services WHERE service_id=? `, [slug]);
            }

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    
                    ['header_image', 'show_on_menus'].forEach((field) => {
                        if (row[field] && row[field].length && typeof row[field] === 'string') {
                            row[field] = JSON.parse(row[field]);
                        }
                    });

                    return {
                        ...row,
                    } as ServiceDetails
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

    public async LoadDraftInfo(draft_id: number): Promise<ServiceDetails | null> {

        try{
            const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM service_drafts WHERE draft_id=? `, [draft_id]);
            if(rows.length){
                const formattedRows = rows.map((row) => {

                    ['header_image', 'show_on_menus'].forEach((field) => {
                        if (row[field] && row[field].length && typeof row[field] === 'string') {
                            row[field] = JSON.parse(row[field]);
                        }
                    });

                    return {
                        ...row,
                    } as ServiceDetails
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

    public async UpdateService(params: AddServiceParams) : Promise<boolean>{

        const draft_id = params.draft_id
        const friendly_name = params.friendly_name
        const slug = params.slug
        const excerpt = params.excerpt
        const body = params.post_body
        const submit_type = params.submit_type
        const header_image = JSON.stringify(params.header_image)
        const menus = params.menus
        const date_added = params.date_added

        try{
            
            let isUpdated: boolean = false;
            if(submit_type == "Draft"){

                const [result] = await pool.query<ResultSetHeader>(`
                    UPDATE service_drafts SET friendly_name=?, slug=?, excerpt=?, post_body=?, header_image=?, show_on_menus=?,
                    is_dirty=? WHERE draft_id=? `, [friendly_name, slug, excerpt, body, header_image, menus, "Yes", draft_id]
                );

                isUpdated = result.affectedRows >= 0;

                //Update published community
                const [update_result] = await pool.query<ResultSetHeader>(`
                    UPDATE services SET has_active_draft=? WHERE service_draft_id=? `, ["Yes", draft_id]
                );

            }else if(submit_type == "Publish"){

                //Delete old post with this draft_id
                const [del_result] = await pool.query<ResultSetHeader>(`DELETE FROM services WHERE service_draft_id=? `, [draft_id]);

                //Insert blog_post
                const [add_result] = await pool.query<ResultSetHeader>(`
                    INSERT INTO services(service_draft_id, friendly_name, slug, excerpt, post_body, date_added, header_image, 
                    show_on_menus) VALUES (?, ?, ?, ?, ?, ?, ?, ?) `, [draft_id, friendly_name, slug, excerpt, 
                    body, date_added, header_image, menus]
                );

                isUpdated = add_result.affectedRows > 0;
                const comm_id = add_result.insertId;

                //Update draft post
                const [update_result] = await pool.query<ResultSetHeader>(`
                    UPDATE service_drafts SET service_id=?, friendly_name=?, slug=?, excerpt=?, post_body=?, header_image=?, 
                    published_header_image=?, show_on_menus=?, published=?, is_dirty=?  WHERE draft_id=? `, [comm_id, friendly_name, slug, 
                    excerpt, body, header_image, header_image, menus, "Yes", "No", draft_id]
                );

            }
            
            return isUpdated;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false; 
        }

    }

    public async LoadServices(params: LoadServicesParams): Promise<ServiceLists[] | null> {

        const paginated = params.paginated
        const post_type = params.post_type
        let rows: RowDataPacket[] = [];

        if(paginated){
            
            const page = params.page;
            const limit = params.limit;
            const start_from = (page - 1) * limit;

            if(post_type == "Draft"){
               [rows] = await pool.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM service_drafts) AS total_records FROM service_drafts ORDER BY friendly_name ASC LIMIT ${start_from}, ${limit}`);
            } else if(post_type == "Published"){
                [rows] = await pool.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM services) AS total_records FROM services ORDER BY friendly_name ASC LIMIT ${start_from}, ${limit}`);
            }
            
        }else{

            if(post_type == "Draft"){
                [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM service_drafts ORDER BY friendly_name ASC `);
            } else if(post_type == "Published"){ 
                [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM services ORDER BY friendly_name ASC `);
            } else if(post_type == "Featured Services"){ 
                [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM services WHERE JSON_EXTRACT(show_on_menus, '$.home_page')=? ORDER BY friendly_name ASC `, ["Yes"]);
            }

        }
 
        const formattedRows = rows.map((row) => {

            ['header_image', 'show_on_menus'].forEach((field) => {
                if (row[field] && row[field].length && typeof row[field] === 'string') {
                    row[field] = JSON.parse(row[field]);
                }
            });

            return {
                ...row,
            }

        });

        return formattedRows as ServiceLists[] | null;

    }
 

    public async DeleteService(draft_id: number): Promise<boolean> {
        
        try{

            const [del_draft] = await pool.query<ResultSetHeader>(`DELETE FROM service_drafts WHERE draft_id=? `, [draft_id]);
            const [del_post] = await pool.query<ResultSetHeader>(`DELETE FROM services WHERE service_draft_id=? `, [draft_id]);
            
            return del_draft.affectedRows >= 0;

        }catch(e: any){
            console.log(e.message);
            return false;
        }

    }

}