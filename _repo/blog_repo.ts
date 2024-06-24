import pool from "@/_lib/db_conn";
import { AddBlogPostParams, AddCategoryParams, AddPostCommetsParams, AddPostReplyParams, BlogCatLists, BlogCommentsListsParams, BlogDraftsInfo, BlogDraftsInfoParams, BlogPostInfoParams, CheckSlugParams, LoadBlogCatsParams, LoadBlogPostsParams, LoadPostCommentsParams, UpdateCategoryParams } from "@/components/types";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface BlogRepo {
    CheckCategorySlug(params: CheckSlugParams): Promise<number>
    AddNewCategory(params: AddCategoryParams): Promise<boolean>
    LoadBlogCategories(params: LoadBlogCatsParams): Promise<BlogCatLists[] | null>
    UpdateCategory(params: UpdateCategoryParams): Promise<boolean>
    CheckBlogSlug(params: CheckSlugParams): Promise<number>
    LoadBlogInfo(slug: string): Promise<BlogDraftsInfo | null> 
    LoadDraftInfo(draft_id: number): Promise<BlogDraftsInfo | null>
    AddNewBlogPost(params: AddBlogPostParams) : Promise<[boolean, number]>
    UpdateBlogPost(params: AddBlogPostParams) : Promise<boolean>
    LoadBlogPosts(params: LoadBlogPostsParams): Promise<BlogPostInfoParams[] | null>
    LoadPostComments(params: LoadPostCommentsParams): Promise<BlogCommentsListsParams[] | null>
    AddPostComment(params: AddPostCommetsParams): Promise<boolean>
    AddPostReply(params: AddPostReplyParams): Promise<boolean>
    DeleteBlogPost(draft_id: number): Promise<boolean>
}

export class MYSQLBlogRepo implements BlogRepo {

    public async CheckCategorySlug(params: CheckSlugParams): Promise<number>{

        const slug = params.slug
        const check_by = params.check_by
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try{    

            connection = await pool.getConnection();
            if(check_by == "Slug"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS slug_exist FROM blog_categories WHERE slug=?`, [slug]);
            }else if(check_by == "Slug Alt"){
                const category_id = params?.category_id;
                [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS slug_exist FROM blog_categories WHERE slug=? AND category_id!=?`, [slug, category_id]);
                
            }

            if(rows.length){
                return rows[0].slug_exist
            }else{
                return 0
            }

        }catch(e:any){

            console.log("e.sqlMessage", e.sqlMessage)
            return 0;
            
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    }

    public async AddNewCategory(params: AddCategoryParams): Promise<boolean>{

        const slug = params.slug;
        const name = params.category_name;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO blog_categories(name, slug) VALUES (?, ?) `, [name, slug]);
            return result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadBlogCategories(params: LoadBlogCatsParams): Promise<BlogCatLists[] | null> {

        const paginated = params.paginated;
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            if(paginated){
                
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;
                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM blog_categories) AS total_records FROM blog_categories LIMIT ${start_from}, ${limit}`);
            
            }else{
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM blog_categories `);
            }

            return rows as BlogCatLists[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateCategory(params: UpdateCategoryParams): Promise<boolean>{

        const slug = params.slug;
        const name = params.category_name;
        const cat_id = params.category_id;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE blog_categories SET name=?, slug=? WHERE category_id=? `, [name, slug, cat_id]);
            return result.affectedRows >= 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async CheckBlogSlug(params: CheckSlugParams): Promise<number>{

        const slug = params.slug;
        const check_by = params.check_by;
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            if(check_by == "Slug"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS slug_exist FROM blog_posts_drafts WHERE slug=?`, [slug]);
            }else if(check_by == "Slug Alt"){
                const draft_id = params?.draft_id;
                [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS slug_exist FROM blog_posts_drafts WHERE slug=? AND draft_id!=?`, [slug, draft_id]);
            }

            if(rows.length){
                return rows[0].slug_exist;
            }else{
                return 0;
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return 0;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddNewBlogPost(params: AddBlogPostParams) : Promise<[boolean, number]>{

        const draft_id = params.draft_id
        const title = params.post_title
        const slug = params.slug
        const excerpt = params.excerpt
        const body = params.post_body
        const submit_type = params.submit_type
        const header_image = JSON.stringify(params.header_image)
        const categories = params.categories
        const menus = params.menus;
        let connection: PoolConnection | null = null;

        try{
            
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            let isAdded: boolean = false;
            let post_draft_id: number = draft_id;
            connection = await pool.getConnection();

            if(submit_type == "Draft"){

                //Newly added post
                if(draft_id < 1){

                    const [result] = await connection.query<ResultSetHeader>(`
                        INSERT INTO blog_posts_drafts(post_title, slug, excerpt, post_body, date_added, header_image, show_on_menus, categories) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?) `, [title, slug, excerpt, body, now, header_image, menus, JSON.stringify(categories)]
                    );

                    isAdded = result.affectedRows > 0;
                    post_draft_id = result.insertId;

                }else{
                    
                    //Still updating from the add new post page
                    
                    const [result] = await connection.query<ResultSetHeader>(`
                        UPDATE blog_posts_drafts SET post_title=?, slug=?, excerpt=?, post_body=?, date_added=?, header_image=?, 
                        show_on_menus=?, categories=? WHERE draft_id=? `, [title, slug, excerpt, body, now, header_image, menus, 
                            JSON.stringify(categories), draft_id]
                    );

                    isAdded = result.affectedRows >= 0;
                    post_draft_id = draft_id;
                
                }


            }else if(submit_type == "Publish"){

                //Newly added post
                if(draft_id < 1){

                    //Insert blog_post
                    const [add_post_result] = await connection.query<ResultSetHeader>(`
                        INSERT INTO blog_posts(post_title, slug, excerpt, post_body, date_added, header_image, show_on_menus, categories) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?) `, [title, slug, excerpt, body, now, header_image, menus, JSON.stringify(categories)]
                    );

                    isAdded = add_post_result.affectedRows > 0;
                    const post_id = add_post_result.insertId;

                    //Add draft post
                    const [add_draft_result] = await connection.query<ResultSetHeader>(`
                        INSERT INTO blog_posts_drafts(post_id, post_title, slug, excerpt, post_body, date_added, header_image, published_header_image,
                        show_on_menus, categories, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, [post_id, title, slug, excerpt, body, 
                        now, header_image, header_image, menus, JSON.stringify(categories), "Yes"]
                    );

                    post_draft_id = add_draft_result.insertId;

                    //Update new post's darft id 
                    const [up_result] = await connection.query<ResultSetHeader>(`
                        UPDATE blog_posts SET post_draft_id=? WHERE post_id=? `, [post_draft_id, post_id]
                    );

                }else{

                    //Still updating from the add new post page

                    //Delete old post with this draft_id
                    const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM blog_posts WHERE post_draft_id=? `, [draft_id]);

                    //Insert blog_post
                    const [add_result] = await connection.query<ResultSetHeader>(`
                        INSERT INTO blog_posts(post_draft_id, post_title, slug, excerpt, post_body, date_added, header_image, 
                        show_on_menus, categories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) `, [draft_id, title, slug, excerpt, body, now, 
                        header_image, menus, JSON.stringify(categories)]
                    );

                    isAdded = add_result.affectedRows > 0;
                    const post_id = add_result.insertId;

                    //Update draft post
                    const [update_result] = await connection.query<ResultSetHeader>(`
                        UPDATE blog_posts_drafts SET post_id=?, post_title=?, slug=?, excerpt=?, post_body=?, date_added=?, header_image=?, 
                        published_header_image=?, show_on_menus=?, categories=?, published=? WHERE draft_id=? `, [post_id, title, slug, excerpt, 
                        body, now, header_image, header_image, menus, JSON.stringify(categories), "Yes", draft_id]
                    );

                }

            }
            
            return [isAdded, post_draft_id];

        }catch(e: any){
            console.log(e.sqlMessage)
            return [false, 0]
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadBlogInfo(slug: string): Promise<BlogDraftsInfo | null> {

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM blog_posts WHERE slug=? `, [slug]);
            if(rows.length){
                const formattedRows = rows.map((row) => {

                    ['header_image', 'show_on_menus'].forEach((field) => {
                        if (row[field] && row[field].length && typeof row[field] === 'string') {
                            row[field] = JSON.parse(row[field]);
                        }
                    });

                    return {
                        ...row,
                    } as BlogDraftsInfo
                });
                return formattedRows[0];
            }else{
                return null;
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

    public async LoadDraftInfo(draft_id: number): Promise<BlogDraftsInfo | null> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM blog_posts_drafts WHERE draft_id=? `, [draft_id]);
            //return rows.length ? rows[0] as BlogDraftsInfoParams : null
            if(rows.length){
                const formattedRows = rows.map((row) => {

                    ['header_image', 'show_on_menus'].forEach((field) => {
                        if (row[field] && row[field].length && typeof row[field] === 'string') {
                            row[field] = JSON.parse(row[field]);
                        }
                    });

                    return {
                        ...row,
                    } as BlogDraftsInfo
                });
                return formattedRows[0];
            }else{
                return null;
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

    public async UpdateBlogPost(params: AddBlogPostParams) : Promise<boolean>{

        const draft_id = params.draft_id
        const title = params.post_title
        const slug = params.slug
        const excerpt = params.excerpt
        const body = params.post_body
        const submit_type = params.submit_type
        const header_image = JSON.stringify(params.header_image)
        const categories = params.categories
        const menus = params.menus
        const date_added = params.date_added;
        let connection: PoolConnection | null = null;

        try{
            
            let isUpdated: boolean = false;
            connection = await pool.getConnection();
            if(submit_type == "Draft"){

                const [result] = await connection.query<ResultSetHeader>(`
                    UPDATE blog_posts_drafts SET post_title=?, slug=?, excerpt=?, post_body=?, header_image=?, show_on_menus=?, categories=?, 
                    is_dirty=? WHERE draft_id=? `, [title, slug, excerpt, body, header_image, menus, JSON.stringify(categories), "Yes", draft_id]
                );

                isUpdated = result.affectedRows >= 0;

                //Update published post
                const [update_result] = await connection.query<ResultSetHeader>(`
                    UPDATE blog_posts SET has_active_draft=? WHERE post_draft_id=? `, ["Yes", draft_id]
                );

            }else if(submit_type == "Publish"){

                //Delete old post with this draft_id
                const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM blog_posts WHERE post_draft_id=? `, [draft_id]);

                //Insert blog_post
                const [add_result] = await connection.query<ResultSetHeader>(`
                    INSERT INTO blog_posts(post_draft_id, post_title, slug, excerpt, post_body, date_added, header_image, 
                    show_on_menus, categories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) `, [draft_id, title, slug, excerpt, body, date_added, 
                    header_image, menus, JSON.stringify(categories)]
                );

                isUpdated = add_result.affectedRows > 0;
                const post_id = add_result.insertId;

                //Update draft post
                const [update_result] = await connection.query<ResultSetHeader>(`
                    UPDATE blog_posts_drafts SET post_id=?, post_title=?, slug=?, excerpt=?, post_body=?, header_image=?, 
                    published_header_image=?, show_on_menus=?, categories=?, published=?, is_dirty=?  WHERE draft_id=? `, [post_id, title, 
                    slug, excerpt, body, header_image, header_image, menus, JSON.stringify(categories), "Yes", "No", draft_id]
                );

            }
            
            return isUpdated;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadBlogPosts(params: LoadBlogPostsParams): Promise<BlogPostInfoParams[] | null> {

        const paginated = params.paginated
        const post_type = params.post_type
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            if(paginated){
                
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;
                
                if(post_type == "Draft"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM blog_posts_drafts) AS total_records FROM blog_posts_drafts ORDER BY date_added DESC LIMIT ${start_from}, ${limit}`);
                } else if(post_type == "Published"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM blog_posts) AS total_records FROM blog_posts ORDER BY date_added DESC LIMIT ${start_from}, ${limit}`);
                } else if(post_type == "Published By Cats"){
                    const cat_id = params?.category_id;
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM blog_posts WHERE JSON_CONTAINS(categories,'"${cat_id}"','$')) AS total_records FROM blog_posts WHERE JSON_CONTAINS(categories,'"${cat_id}"','$') ORDER BY date_added DESC LIMIT ${start_from}, ${limit}`);
                } else if(post_type == "Post Search"){
                    const keyword = params?.keyword;
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM blog_posts WHERE post_title LIKE '%${keyword}%') AS total_records FROM blog_posts WHERE post_title LIKE '%${keyword}%' ORDER BY date_added DESC LIMIT ${start_from}, ${limit}`);
                }

            }else{
                if(post_type == "Draft"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM blog_posts_drafts ORDER BY date_added DESC `);
                }else if(post_type == "Published"){ 
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM blog_posts ORDER BY date_added DESC `);
                }
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
                    } as BlogPostInfoParams
                });
                
                return formattedRows;
            }else{
                return null;
            }
        
        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        //return rows as BlogPostInfoParams[] | null

    }

    public async LoadPostComments(params: LoadPostCommentsParams): Promise<BlogCommentsListsParams[] | null> {

        const paginated = params.paginated
        const draft_id = params.post_id; //Actually draft_id
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            if(paginated){
                
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;

                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM blog_post_comments WHERE post_id=?) 
                AS total_records FROM blog_post_comments WHERE post_id=? ORDER BY date_added DESC LIMIT ?, ?`, [draft_id, draft_id,start_from, limit]);
            
            }else{
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM blog_post_comments WHERE post_id=? ORDER BY date_added ASC `, [draft_id]);
            }

            return rows as BlogCommentsListsParams[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddPostComment(params: AddPostCommetsParams): Promise<boolean> {

        const draft_id = params.draft_id
        const comments = params.comments
        const name = params?.name
        const email = params?.email
        const reply_by = params.reply_by
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO blog_post_comments(post_id, comment_body, name, email, reply_by, 
                date_added) VALUES (?, ?, ?, ?, ?, ?) `, [draft_id, comments, name, email, reply_by, now]);

            const [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS num_of_comms FROM blog_post_comments WHERE post_id=? `, [draft_id]);
            let num_of_posts = parseInt(rows[0].num_of_comms);
            
            const [update_comms] = await connection.query<ResultSetHeader>(`UPDATE blog_posts SET comments=? WHERE post_draft_id=? `, [num_of_posts, draft_id]);

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

    public async AddPostReply(params: AddPostReplyParams): Promise<boolean>{

        const comment_id = params.comment_id
        const draft_id = params.draft_id
        const comment_parent = params?.comment_parent
        const comments = params.comments
        const reply_by = params.reply_by
        const name = params?.name
        const email = params?.email
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO blog_post_comments(post_id, comment_body, comment_parent, 
            name, email, reply_by, date_added) VALUES (?, ?, ?, ?, ?, ?, ?) `, [draft_id, comments, comment_parent, name, email, 
            reply_by, now]);
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

    public async DeleteBlogPost(draft_id: number): Promise<boolean> {
        
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [del_draft] = await connection.query<ResultSetHeader>(`DELETE FROM blog_posts_drafts WHERE draft_id=? `, [draft_id]);
            const [del_post] = await connection.query<ResultSetHeader>(`DELETE FROM blog_posts WHERE post_draft_id=? `, [draft_id]);
            
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

    public async DeleteBlogCategory(category_id: number): Promise<boolean> {
        
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [del_cat] = await connection.query<ResultSetHeader>(`DELETE FROM blog_categories WHERE category_id=? `, [category_id]);
            
            const [update_drafts] = await connection.query<ResultSetHeader>(`UPDATE blog_posts_drafts SET categories=JSON_REMOVE(categories, 
                replace(JSON_SEARCH(categories, 'all', ?), '\"', '')) WHERE JSON_SEARCH(categories, 'all', ?) IS NOT NULL `, 
                [category_id, category_id]);

            const [updte_posts] = await connection.query<ResultSetHeader>(`UPDATE blog_posts SET categories=JSON_REMOVE(categories, 
                replace(JSON_SEARCH(categories, 'all', ?), '\"', '')) WHERE JSON_SEARCH(categories, 'all', ?) IS NOT NULL `, 
                [category_id, category_id]);

            return del_cat.affectedRows >= 0;

        }catch(e: any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async updateCategoryCounts(category_id: string): Promise<boolean> {
        
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            let num_of_posts = 0;
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS num_of_posts FROM blog_posts_drafts 
            WHERE JSON_SEARCH(categories, 'all', ?) IS NOT NULL`, [category_id]);

            if(rows.length){
                num_of_posts = rows[0].num_of_posts;
            }

            const [updte_cat] = await connection.query<ResultSetHeader>(`UPDATE blog_categories SET number_of_posts=? WHERE category_id=? `, 
                [num_of_posts, category_id]);
            return updte_cat.affectedRows >= 0;

        }catch(e: any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }
        
    }

    public async AddBlogView(slug: string, logged_id: string): Promise<boolean> {
        
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT views FROM blog_posts WHERE slug=? `, [slug]);
            let new_views = parseInt(rows[0].views) + 1;

            const [updte_cat] = await connection.query<ResultSetHeader>(`UPDATE blog_posts SET views=? WHERE slug=? `, [new_views, slug]);
            return updte_cat.affectedRows > 0;

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