import pool from "@/_lib/db_conn";
import { APIResponseProps, AddCommunityParams, CheckSlugParams, CommunityDetails, CommunityDraftsInfo, CommunityInfo, LoadCommunitiesParams } from "@/components/types";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface CommunityRepo {
    CheckCommunitySlug(params: CheckSlugParams): Promise<number>
    AddNewCommunity(params: AddCommunityParams) : Promise<[boolean, number]>
    LoadCommunityInfo(slug: string, search_by: string): Promise<CommunityDraftsInfo | null>
    LoadDraftInfo(draft_id: number): Promise<CommunityDraftsInfo | null>
    UpdateCommunity(params: AddCommunityParams) : Promise<boolean>
    LoadCommunities(params: LoadCommunitiesParams): Promise<CommunityInfo[] | null>
    DeleteCommunity(draft_id: number): Promise<boolean>
    LoadCommunityStats(slug: string): Promise<APIResponseProps>
}

export class MYSQLCommunityRepo implements CommunityRepo {

    public async CheckCommunitySlug(params: CheckSlugParams): Promise<number>{

        const slug = params.slug
        const check_by = params.check_by
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try {
            
            connection = await pool.getConnection();
            if(check_by == "Slug"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS slug_exist FROM community_drafts WHERE slug=?`, [slug]);
            }else if(check_by == "Slug Alt"){
                const draft_id = params?.draft_id;
                [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS slug_exist FROM community_drafts WHERE slug=? AND draft_id!=?`, [slug, draft_id]);
            }

            if(rows.length){
                return rows[0].slug_exist
            }else{
                return 0
            }

        } catch(e: any){
            console.log(e.sqlMessage);
            return 0;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddNewCommunity(params: AddCommunityParams) : Promise<[boolean, number]>{

        const draft_id = params.draft_id
        const city_id = params.city_id
        const city_slug = params.city_slug
        const mls_name = params.mls_name
        const friendly_name = params.friendly_name
        const slug = params.slug
        const excerpt = params.excerpt
        const body = params.post_body
        const submit_type = params.submit_type
        const header_image = JSON.stringify(params.header_image);
        const menus = params.menus;
        let connection: PoolConnection | null = null;

        try{
            
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            let isAdded: boolean = false;
            let comm_draft_id: number = draft_id;
            connection = await pool.getConnection();

            if(submit_type == "Draft"){

                //Newly added post
                if(draft_id < 1){

                    const [result] = await connection.query<ResultSetHeader>(`
                        INSERT INTO community_drafts(city_slug, city_id, mls_name, friendly_name, slug, excerpt, post_body, date_added, 
                        header_image, show_on_menus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, [city_slug, city_id, mls_name, friendly_name, 
                        slug, excerpt, body, now, header_image, menus]
                    );

                    isAdded = result.affectedRows > 0;
                    comm_draft_id = result.insertId;

                }else{
                    
                    //Still updating from the add new post page

                    const [result] = await connection.query<ResultSetHeader>(`UPDATE community_drafts SET city_slug=?, city_id=?, mls_name=?, 
                    friendly_name=?, slug=?, excerpt=?, post_body=?, date_added=?, header_image=?, show_on_menus=? WHERE draft_id=? `, 
                    [city_slug, city_id, mls_name, friendly_name, slug, excerpt, body, now, header_image, menus, draft_id]);

                    isAdded = result.affectedRows >= 0;
                    comm_draft_id = draft_id;
                
                }


            }else if(submit_type == "Publish"){

                //Newly added post
                if(draft_id < 1){

                    //Insert blog_post
                    const [add_post_result] = await connection.query<ResultSetHeader>(`
                        INSERT INTO communities(city_slug, city_id, mls_name, friendly_name, slug, excerpt, post_body, date_added, header_image, show_on_menus) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, [city_slug, city_id, mls_name, friendly_name, slug, excerpt, body, now, header_image, menus]
                    );

                    isAdded = add_post_result.affectedRows > 0;
                    const comm_id = add_post_result.insertId;

                    //Add draft post
                    const [add_draft_result] = await connection.query<ResultSetHeader>(`
                        INSERT INTO community_drafts(community_id, city_slug, city_id, mls_name, friendly_name, slug, excerpt, post_body, date_added, header_image, 
                        published_header_image, show_on_menus, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, 
                        [comm_id, city_slug, city_id, mls_name, friendly_name, slug, excerpt, body, now, header_image, header_image, menus, "Yes"]
                    );

                    comm_draft_id = add_draft_result.insertId;

                    //Update new post's darft id 
                    const [up_result] = await connection.query<ResultSetHeader>(`
                        UPDATE communities SET community_draft_id=? WHERE community_id=? `, [comm_draft_id, comm_id]
                    );

                }else{

                    //Still updating from the add new post page

                    //Delete old post with this draft_id
                    const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM communities WHERE community_draft_id=? `, [draft_id]);

                    //Insert blog_post
                    const [add_result] = await connection.query<ResultSetHeader>(`
                        INSERT INTO communities(community_draft_id, city_slug, city_id, mls_name, friendly_name, slug, excerpt, post_body, date_added, 
                        header_image, show_on_menus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, [draft_id, city_slug, city_id, mls_name, friendly_name, slug, excerpt, 
                        body, now, header_image, menus]
                    );

                    isAdded = add_result.affectedRows > 0;
                    const comm_id = add_result.insertId;

                    //Update draft post
                    const [update_result] = await connection.query<ResultSetHeader>(`
                        UPDATE community_drafts SET community_id=?, city_slug=?, city_id=?, mls_name=?, friendly_name=?, slug=?, excerpt=?, post_body=?, date_added=?, 
                        header_image=?, published_header_image=?, show_on_menus=?, published=? WHERE draft_id=? `, 
                        [comm_id, city_slug, city_id, mls_name, friendly_name, slug, excerpt, body, now, header_image, header_image, menus, "Yes", draft_id]
                    );

                }

            }
            
            return [isAdded, comm_draft_id];

        }catch(e: any){
            console.log(e.sqlMessage)
            return [false, 0]
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadCommunityInfo(slug: string, search_by: string): Promise<CommunityDetails | null> {

        let connection: PoolConnection | null = null;
        try{

            let rows: RowDataPacket[] = [];
            connection = await pool.getConnection();

            if(search_by == "Slug"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM communities WHERE slug=? `, [slug]);
            }else if(search_by == "Community Id"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM communities WHERE community_id=? `, [slug]);
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
                    } as CommunityDetails
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

    public async LoadDraftInfo(draft_id: number): Promise<CommunityDraftsInfo | null> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM community_drafts WHERE draft_id=? `, [draft_id]);
            if(rows.length){
                const formattedRows = rows.map((row) => {

                    ['header_image', 'show_on_menus'].forEach((field) => {
                        if (row[field] && row[field].length && typeof row[field] === 'string') {
                            row[field] = JSON.parse(row[field]);
                        }
                    });

                    return {
                        ...row,
                    } as CommunityDraftsInfo
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

    public async UpdateCommunity(params: AddCommunityParams) : Promise<boolean>{

        const draft_id = params.draft_id
        const city_id = params.city_id
        const city_slug = params.city_slug
        const mls_name = params.mls_name
        const friendly_name = params.friendly_name
        const slug = params.slug
        const excerpt = params.excerpt
        const body = params.post_body
        const submit_type = params.submit_type
        const header_image = JSON.stringify(params.header_image)
        const menus = params.menus
        const date_added = params.date_added;
        let connection: PoolConnection | null = null;

        try{
            
            let isUpdated: boolean = false;
            connection = await pool.getConnection();
            if(submit_type == "Draft"){

                const [result] = await connection.query<ResultSetHeader>(`
                    UPDATE community_drafts SET city_slug=?, city_id=?, mls_name=?, friendly_name=?, slug=?, excerpt=?, post_body=?, header_image=?, show_on_menus=?,
                    is_dirty=? WHERE draft_id=? `, [city_slug, city_id, mls_name, friendly_name, slug, excerpt, body, header_image, menus, "Yes", draft_id]
                );

                isUpdated = result.affectedRows >= 0;

                //Update published community
                const [update_result] = await connection.query<ResultSetHeader>(`
                    UPDATE communities SET has_active_draft=? WHERE community_draft_id=? `, ["Yes", draft_id]
                );

            }else if(submit_type == "Publish"){

                //Delete old post with this draft_id
                const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM communities WHERE community_draft_id=? `, [draft_id]);

                //Insert blog_post
                const [add_result] = await connection.query<ResultSetHeader>(`
                    INSERT INTO communities(community_draft_id, city_slug, city_id, mls_name, friendly_name, slug, excerpt, post_body, date_added, header_image, 
                    show_on_menus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, [draft_id, city_slug, city_id, mls_name, friendly_name, slug, excerpt, 
                    body, date_added, header_image, menus]
                );

                isUpdated = add_result.affectedRows > 0;
                const comm_id = add_result.insertId;

                //Update draft post
                const [update_result] = await connection.query<ResultSetHeader>(`
                    UPDATE community_drafts SET community_id=?, city_slug=?, city_id=?, mls_name=?, friendly_name=?, slug=?, excerpt=?, post_body=?, header_image=?, 
                    published_header_image=?, show_on_menus=?, published=?, is_dirty=?  WHERE draft_id=? `, [comm_id, city_slug, city_id, 
                    mls_name, friendly_name, slug, excerpt, body, header_image, header_image, menus, "Yes", "No", draft_id]
                );

            }
            
            return isUpdated;

        }catch(e: any){
            console.log(e.sqlMessage);
            return false; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadCommunities(params: LoadCommunitiesParams): Promise<CommunityInfo[] | null> {

        const paginated = params.paginated
        const post_type = params.post_type
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try {
            
            connection = await pool.getConnection();
            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;

                if(post_type == "Draft"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM community_drafts) AS total_records FROM community_drafts ORDER BY friendly_name ASC LIMIT ${start_from}, ${limit}`);
                } else if(post_type == "Published"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM communities) AS total_records FROM communities ORDER BY friendly_name ASC LIMIT ${start_from}, ${limit}`);
                } else if(post_type == "City's Community"){
                    const city_slug = params.city_slug;
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM communities WHERE city_slug=?) 
                    AS total_records FROM communities WHERE city_slug=? ORDER BY friendly_name ASC LIMIT ${start_from}, ${limit}`, [city_slug, city_slug]);
                }
                
            }else{

                if(post_type == "Draft"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM community_drafts ORDER BY friendly_name ASC `);
                } else if(post_type == "Published"){ 
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM communities ORDER BY friendly_name ASC `);
                } else if(post_type == "Featured Communities"){ 
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM communities WHERE JSON_EXTRACT(show_on_menus, '$.home_page')=? ORDER BY friendly_name ASC `, ["Yes"]);
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

            return formattedRows as CommunityInfo[] | null;

        } catch(e: any){
            console.log(e.sqlMessage);
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }
 

    public async DeleteCommunity(draft_id: number): Promise<boolean> {
        
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [del_draft] = await connection.query<ResultSetHeader>(`DELETE FROM community_drafts WHERE draft_id=? `, [draft_id]);
            const [del_post] = await connection.query<ResultSetHeader>(`DELETE FROM communities WHERE community_draft_id=? `, [draft_id]);
            
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

    public async LoadCommunityData(community: string): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [data] = await connection.query<RowDataPacket[]>(`SELECT
            (SELECT COUNT(*) FROM listings WHERE PropertyType='Land' AND StandardStatus='Active' AND City='${community}') as Lands,
            (SELECT COUNT(*) FROM listings WHERE PropertyType='Residential' AND StandardStatus='Active' AND City='${community}') as Residentials,
            (SELECT COUNT(*) FROM listings WHERE PropertyType='Commercial Sale' AND StandardStatus='Active' AND City='${community}') as Commercial_Sale,
            (SELECT COUNT(*) FROM listings WHERE PropertyType='Residential Income' AND StandardStatus='Active' AND City='${community}') as Residential_Income,
            (SELECT AVG(ListPrice) FROM listings WHERE StandardStatus='Active' AND City='${community}') as AVG_Price,
            (SELECT MAX(ListPrice) FROM listings WHERE StandardStatus='Active' AND City='${community}') as Highest_Price,
            (SELECT MIN(ListPrice) FROM listings WHERE StandardStatus='Active' AND City='${community}' AND ListPrice > 0) as Lowest_Price,
            (SELECT AVG(RAN_PricePerSqFt) FROM listings WHERE StandardStatus='Active' AND City='${community}') as AVG_Price_Per_SqFt,
            (SELECT COUNT(*) FROM listings WHERE StandardStatus='Active' AND City='${community}') as Total_Listings`);

            if(data.length) {
                default_rep.success = true;
                default_rep.message = "Success.";
                default_rep.data = data[0];
            }

            return default_rep;

        }catch(e: any){
            console.log(e.message);
            return default_rep;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadCommunityStats(slug: string): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const comm_info = await this.LoadCommunityInfo(slug, "Slug");
            console.log("comm_info:", comm_info)
            if(comm_info && comm_info.mls_name){
                const mls_name = comm_info?.mls_name;

                const [data] = await connection.query<RowDataPacket[]>(`SELECT
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Lot & Land' AND Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}')) as Lands,
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Residential' AND Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}')) as Residentials,
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Commercial' AND Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}')) as Commercial_Sale,
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Residential Income' AND Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}')) as Residential_Income,
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Boat Dock' AND Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}')) as Docks,
                (SELECT AVG(CAST(ListPrice AS DECIMAL)) FROM properties WHERE Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}')) as AVG_Price,
                (SELECT MAX(CAST(ListPrice AS DECIMAL)) FROM properties WHERE Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}') AND ListPrice > 0) as Highest_Price,
                (SELECT MIN(CAST(ListPrice AS DECIMAL)) FROM properties WHERE Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}') AND ListPrice > 0) as Lowest_Price,
                (SELECT AVG(CAST(PricePerAcre AS DECIMAL)) FROM properties WHERE Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}')) as AVG_Price_Per_SqFt,
                (SELECT COUNT(*) FROM properties WHERE Status='Active' AND LOWER(CountyOrParish)=LOWER('${mls_name}')) as Total_Listings`);

                if(data.length) {
                    default_rep.success = true;
                    default_rep.message = "Success.";
                    default_rep.data = data[0];
                }
            }else{
                default_rep.success = false;
                default_rep.message = "Unable to load city's mls data.";
            }

            return default_rep;

        }catch(e: any){
            console.log(e.message);
            return default_rep;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}