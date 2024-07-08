import pool from "@/_lib/db_conn";
import { APIResponseProps, AddNotesParams } from "@/components/types";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextApiRequest } from "next";
import { MYSQLCompanyRepo } from "./company_repo";
import { MYSQLNotesRepo } from "./notes_repo";
import { Helpers } from "@/_lib/helpers";
import { PoolConnection } from "mysql2/promise";
import { resolve } from "path";

export interface ListingsRepo {
    GetNextReplicateLink(): Promise<string>
    UpdateNextLink(next_link: string): Promise<boolean>
    LoadListings(req: NextApiRequest, search_filter: string, order_by: string): Promise<any[]>
    LoadSingleProperty(prop_key: string): Promise<any>
    LoadSimilarListings(req: NextApiRequest): Promise<any[]>
    UpdateFavorites(req: NextApiRequest): Promise<any[]>
    LoadSavedSearches(req: NextApiRequest): Promise<any>
    DeleteSavedSearches(req: NextApiRequest): Promise<boolean>
    UpdateAlertedSearches(searh_ids: string): Promise<boolean>
    LogSearch(req: NextApiRequest): Promise<boolean>
}

//https://api.mlsgrid.com/v2/Property?$filter=OriginatingSystemName eq 'ranw' and Status eq 'Active' and MlgCanView eq true&$expand=Media,Rooms,UnitTypes&$top=3

export class MysqlListingsRepo implements ListingsRepo {
    
    note_repo = new MYSQLNotesRepo();
    helper = new Helpers();

    public async GetNextReplicateLink(): Promise<string>{
        
        let connection: PoolConnection | null = null;
        try{
            connection = await pool.getConnection();
            const [row] = await connection.query<RowDataPacket[]>(`SELECT next_link FROM fetch_listings WHERE next_link!='' `);
            return row.length ? row[0].next_link as string : "No link found"
        }catch(e: any){
            return e.sqlMessage
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }


    public async UpdateNextLink(next_link: string): Promise<boolean> {
        
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE fetch_listings SET next_link=? `, [next_link]);
            return true;

        }catch(e: any){
            console.log(e.sqlMessage);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }


    public async AddNewListing(fields: string, values: any[], placeholders: string, update_cond: string): Promise<boolean> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            //console.log("fields:", fields, "values", values);
            const dateAdded = moment().format("YYYY-MM-DD");
            const [add_result] = await connection.query<ResultSetHeader>(`INSERT INTO listings(${fields},DateAdded) VALUES(${placeholders},?) 
            ON DUPLICATE KEY UPDATE ${update_cond}`, [...values, dateAdded]);

            if(add_result.affectedRows > 0) {
                return true;
            } else{
                console.log("Unable to add property with value:", values);
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadListings(req: NextApiRequest, search_filter: string, order_by: string): Promise<any> { //any[]

        const params = req.body;
        const search_by = params.search_by;
        let rows: any[] = [];
        let total_row: any[] = [];
        let list_rows: any[] = [];
            
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const page = params.page;
            const limit = params.limit;
            const start_from = (page - 1) * limit;

            let fields = `property_id, matrix_unique_id, MLSNumber, BedsTotal, BathsTotal, ListPrice, OriginalListPrice, LastChangeTimestamp, 
            LastChangeType, OwnershipDesc, PropertyType, DefaultPic, Images, FullAddress, MatrixModifiedDT, TotalArea, ForSaleYN, Status, City, 
            StateOrProvince, PostalCode`;

            let query = "";
            if(search_by == "List"){

                // [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties WHERE Status='Active' ${search_filter} 
                // ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`);

                // [total_row] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties WHERE Status='Active' ${search_filter} `);
                
                [[rows], [total_row]] = await Promise.all([
                    connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties WHERE Status='Active' ${search_filter} ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`),
                    connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties WHERE Status='Active' ${search_filter} `),
                ])

            }else if(search_by == "Featured Listings"){

                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties WHERE Status='Active' ${search_filter} 
                ORDER BY ${order_by} LIMIT ${limit}`);

            } else if(search_by == "Community List" || search_by == "Houses"){

                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields}, (SELECT COUNT(*) AS total_records FROM properties WHERE 
                PropertyType='Residential' ${search_filter}) AS total_records FROM properties WHERE PropertyType='Residential' ${search_filter} 
                ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`);

            } else if(search_by == "Condos"){
                
                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields}, (SELECT COUNT(*) AS total_records FROM properties WHERE 
                OwnershipDesc='Condominium' ${search_filter}) AS total_records FROM properties WHERE OwnershipDesc='Condominium' ${search_filter} 
                ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`);
            
            } else if(search_by == "Favorites-Active" || search_by == "Favorites-Sold"){
                
                const user_id = params.user_id;
                const field_array = fields.split(",");
                const fieldsRslt = field_array.map(entry => 'L.' + entry).join(', ');

                let status = "Active";
                if(search_by == "Favorites-Active"){
                    status = "Active";
                }else{
                    status = "Closed";
                }
                
                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fieldsRslt}, (SELECT COUNT(*) AS total_records FROM properties AS L 
                JOIN favorites AS F on L.matrix_unique_id=F.matrix_unique_id WHERE L.Status='${status}' AND F.user_id='${user_id}') AS total_records 
                FROM properties AS L JOIN favorites AS F on L.matrix_unique_id=F.matrix_unique_id WHERE L.Status='${status}' AND F.user_id='${user_id}'
                LIMIT ${start_from}, ${limit}`);
            
            }else if(search_by == "SoldByUs"){

                const com_repo = new MYSQLCompanyRepo();
                const comp_info = await com_repo.GetCompayInfo();
                
                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields}, (SELECT COUNT(*) AS total_records FROM properties WHERE 
                Status='Closed' AND ListOfficeMlsId=?) AS total_records FROM properties WHERE Status='Closed' AND ListOfficeMlsId=? 
                LIMIT ${start_from}, ${limit}`, [comp_info.data.mls_office_key, comp_info.data.mls_office_key]);

            } else if(search_by == "Alerts"){

                let last_alert = params.last_alert;
                let alert_frequency = params.alert_frequency;
                last_alert = moment(last_alert);

                let sub_dur = 1;
                let sub_range = "hours";
                if(alert_frequency == "Hourly"){
                    sub_dur = 4;
                    sub_range = "hours";
                }else if(alert_frequency == "Daily"){
                    sub_dur = 1;
                    sub_range = "days";
                }else if(alert_frequency == "Weekly"){
                    sub_dur = 1;
                    sub_range = "weeks";
                }else if(alert_frequency == "Monthly"){
                    sub_dur = 1;
                    sub_range = "months";
                }
                
                const lastAlert = last_alert.subtract(sub_dur, sub_range).format('YYYY-MM-DD HH:mm:ss');

                console.log("last_alert", params.last_alert, "lastAlert", lastAlert);
                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields}, (SELECT COUNT(*) AS total_records FROM properties WHERE 
                Status='Active' AND MatrixModifiedDT >= '${lastAlert}' ${search_filter}) AS total_records FROM properties WHERE 
                Status='Active' AND MatrixModifiedDT >= '${lastAlert}' ${search_filter} 
                ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`);

            } else if(search_by == "Map"){
                
                fields += `, Latitude, Longitude, StatusType`;
                //fields = fields.replace("Images,", ""); //This should speed up things, also each listings have default pix map could use

                const north = params.map_bounds.north;
                const south = params.map_bounds.south;
                const east = params.map_bounds.east;
                const west = params.map_bounds.west;

                let map_filter = `Latitude>=${south} AND Latitude<=${north} AND Longitude<=${east} AND Longitude>=${west}`;
                let drawn_filter = "";
                if(params.poly_list.length > 0){

                    // Convert each point to the format required by MySQL
                    const formattedPoints = params.poly_list.map((point: string) => {
                    const [latitude, longitude] = point.split(',').map(parseFloat);
                        return `${latitude.toFixed(6)} ${longitude.toFixed(6)} `;
                    });

                    // Close the polygon by adding the first point at the end
                    formattedPoints.push(formattedPoints[0]);
                    
                    // Join the points to create the polygon string
                    const snappedPoly = formattedPoints.join(',');

                    map_filter = ` ST_CONTAINS(ST_GeomFromText('POLYGON((${snappedPoly}))'), POINT(Latitude, Longitude))`;
                    drawn_filter = ` AND ${map_filter}`;
                }
                
                console.log("Map queries entry time:", moment().format("HH:mm:ss"));

                if(params.mobile_view == "Map"){
                    console.log("Map entry time:", moment().format("HH:mm:ss"));
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties WHERE City!="0" ${search_filter} AND ${map_filter} 
                    ORDER BY ${order_by} LIMIT 500`);
                    console.log("Map done time:", moment().format("HH:mm:ss"));
                }

                if((params.mobile_view == "List" && params.screen_width <= 960) || (params.mobile_view == "Map" && params.screen_width > 960)){
                    console.log("List entry time:", moment().format("HH:mm:ss"));
                    [list_rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties WHERE City!="0" ${search_filter} 
                    ${drawn_filter} ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`);
                    //AND Latitude>=$minLat AND Latitude<=$maxLat AND Longitude<=$maxLng AND Longitude>=$minLng
                    console.log("List done time:", moment().format("HH:mm:ss"));

                    console.log("Total entry time:", moment().format("HH:mm:ss"));
                    [total_row] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties WHERE City!="0" 
                    ${search_filter} ${drawn_filter}`);
                    console.log("Total done time:", moment().format("HH:mm:ss"));
                }

            }else{
                console.log("Invalid search type:", search_by)
            }
            
            let total_records = 0;
            if(total_row.length){
                total_records = total_row[0]["total_records"];
            }

            console.log("total_records:", total_records)
            if(search_by == "Map"){

                if(rows.length || list_rows.length){
                    
                    const formattedRows = rows.map((row) => {
                        
                        if(row.Images && row.Images.length && typeof row.Images === 'string'){
                            row.Images = JSON.parse(row.Images);
                        }
                        
                        return {
                            ...row,
                            total_records: total_records,
                        }

                    });

                    const formattedLists = list_rows.map((l_row) => {
                        
                        if(l_row.Images && l_row.Images.length && typeof l_row.Images === 'string'){
                            l_row.Images = JSON.parse(l_row.Images);
                        }

                        return {
                            ...l_row,
                            total_records: total_records,
                        }
                    });

                    return {"map_data":formattedRows, "list_data": formattedLists, total_records: total_records, "query": query}
                    //return formattedRows;
                }else{
                    return [];
                }

            } else{

                console.log("Process time:",moment().format("HH:mm:ss"));
                if(rows.length){
                    const formattedRows = rows.map((row) => {
                        
                        if(row.Images && row.Images.length && typeof row.Images === 'string'){
                            row.Images = JSON.parse(row.Images);
                        }

                        return {
                            ...row,
                            total_records: total_records,
                        }

                    });

                    console.log("Return time:",moment().format("HH:mm:ss"));
                    return formattedRows;
                }else{
                    return [];
                }

            }

            
        } catch (error) {
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LiveSearch(keyword: string, search_by: string): Promise<any[]>{

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            let rows: RowDataPacket[] = [];

            if(search_by == "City"){
                //Try OR for this instead of UNION (09/05/2024){Remove comment when done}
                [rows] = await connection.query<RowDataPacket[]>(`
                (SELECT DISTINCT City AS location, 'City' as TABLE_NAME FROM properties WHERE City LIKE '%${keyword}%' LIMIT 20)
                UNION
                (SELECT DISTINCT FullAddress AS location, 'Address' as TABLE_NAME FROM properties WHERE FullAddress LIKE '%${keyword}%' LIMIT 20)
                UNION
                (SELECT DISTINCT PostalCode AS location, 'PostalCode' as TABLE_NAME FROM properties WHERE PostalCode LIKE '%${keyword}%' LIMIT 20)
                UNION
                (SELECT DISTINCT MLSNumber AS location, 'MLSNumber' as TABLE_NAME FROM properties WHERE MLSNumber LIKE '%${keyword}%' LIMIT 20)`);
            }else if(search_by == "County"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT DISTINCT CountyOrParish AS location, 'CountyOrParish' as TABLE_NAME FROM properties 
                WHERE CountyOrParish LIKE '%${keyword}%' LIMIT 20`);
            }

            if(rows.length){
                
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    }
                });
                
                return formattedRows;

            }else{
                return [];
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetPropsWithoutImage(limit: number): Promise<any[]>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT property_id, Media, FullAddress, City FROM properties WHERE MediaLoaded='No' 
            AND Status='Active' AND (SELECT COUNT(*) AS curr_loading  FROM properties WHERE MediaLoaded='Loading') < 2 ORDER BY LastImageSync ASC LIMIT ${limit}`);
            const property_ids: any[] = [];

            if(rows.length){
                
                const formattedRows = rows.map((row) => {
                    property_ids.push(row.property_id);
                    return {
                        ...row,
                    }
                });
                
                if(property_ids.length){

                    const implodedString = property_ids.join("', '");
                    const [up_result] = await connection.query<ResultSetHeader>(`UPDATE listings SET MediaLoaded='Loading' WHERE property_id IN('${implodedString}')`);

                }

                return formattedRows;

            }else{
                return [];
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    }

    public async AddUploadedImages(property_id:number, medias: any[]): Promise<boolean> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const images: any[] = [];
            if(medias && medias.length){
                medias.forEach(media => {
                    let path = media.imagePath;
                    if(path){
                        path = path.replace("../",`${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/`);
                        images.push(path);
                    }
                })
            }

            const synched = moment().format('YYYY-MM-DD HH:mm:ss');
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE listings SET MediaLoaded=?, Images=?, LastImageSync=? 
            WHERE property_id=?`, ["Yes", JSON.stringify(images), synched, property_id]);

            if(up_result.affectedRows > 0) {
                return true;
            } else{
                console.log("Unable to update property image");
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async ResetUploadImageStatus(property_id:number): Promise<boolean> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const synched = moment().format('YYYY-MM-DD HH:mm:ss');
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE listings SET MediaLoaded=?, Images=NULL, LastImageSync=? 
            WHERE property_id=?`, ["No", synched, property_id]);

            if(up_result.affectedRows > 0) {
                console.log("Property image status reset.")
                return true;
            } else{
                console.log("Unable to reset property image status");
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadSingleProperty(prop_key: string): Promise<any>{
        
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM properties WHERE MLSNumber=? `, [prop_key]);
            if(rows && rows.length){

                const formattedRows = rows.map((row) => {

                    if(row.Images && row.Images.length && typeof row.Images === 'string'){
                        row.Images = JSON.parse(row.Images);
                    }

                    return {
                        ...row,
                    }
                    
                });

                return {...formattedRows[0], "found": true};

            }else{
                console.log("Not found");
                return {"found": false, "message":"Not found"};
            }
        }catch(e: any){
            console.log(e)
            return {"found": false, "message":e.sqlMessage }
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadSimilarListings(req: NextApiRequest): Promise<any[]> {

        const params = req.body;
        const prop_key = params.prop_key;
        const prop_type = params.prop_type;
        const similar_by = params.similar_by;
        const price = parseFloat(params.price as string);
        const beds = params.beds || 0;
        const baths = params.baths || 0;
        const location = params.location;
        let rows: any[] = [];

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            let fields = `property_id, matrix_unique_id, MLSNumber, BedsTotal, BathsTotal, ListPrice, OriginalListPrice, LastChangeTimestamp, 
            LastChangeType, OwnershipDesc, PropertyType, DefaultPic, Images, FullAddress, MatrixModifiedDT, TotalArea, ForSaleYN, Status, 
            City, StateOrProvince, PostalCode, VirtualTourURL, VirtualTourURL2`;

            let search_filter = "";
            let order_by = "ListPrice DESC";
            if(similar_by == "Price"){
                search_filter = ` AND (ListPrice=${price} OR ListPrice < ${price} OR ListPrice > ${price})`;
                order_by = `ABS(${price} - ListPrice), ListPrice DESC`;
            }else if(similar_by == "Beds"){
                search_filter = ` AND (BedsTotal=${beds} OR BedsTotal < ${beds} OR BedsTotal > ${beds})`;
                order_by = `ABS(${beds} - BedsTotal), BedsTotal DESC`;
            }else if(similar_by == "Baths"){ 
                search_filter = ` AND (BathsTotal=${baths} OR BathsTotal < ${baths} OR BathsTotal > ${baths})`;
                order_by = `ABS(${baths} - BathsTotal), BathsTotal DESC`;
            }else if(similar_by == "Location"){
                search_filter = ` AND PostalCode='${location}' `;
                order_by = "PostalCode DESC";
            }

            [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties WHERE Status='Active' 
            AND PropertyType='${prop_type}' AND matrix_unique_id!='${prop_key}' ${search_filter} ORDER BY ${order_by} LIMIT 3`);
            
            if(rows.length){
                const formattedRows = rows.map((row) => {

                    if(row.Images && row.Images.length && typeof row.Images === 'string'){
                        row.Images = JSON.parse(row.Images);
                    }

                    return {
                        ...row,
                    }
                });
                return formattedRows;
            }else{
                return [];
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }


    public async UpdateFavorites(req: NextApiRequest): Promise<any[]> {

        const req_body = req.body;
        const listing_id = req_body.listing_id;
        const user_id = req_body.user_id;
        const type = req_body.type;
        const mls_number = req_body.mls_number;
        const property_address = req_body.property_address;
        
        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            let up_result: ResultSetHeader | null = null;
            if(type == "Add") {
                let now = moment().format("YYYY-MM-DD H:m:s");
                [up_result] = await connection.query<ResultSetHeader>(`INSERT INTO favorites(matrix_unique_id, user_id, date_added) VALUES(?, ?, ?)`, [listing_id, user_id, now]);
            }else if(type == "Remove") {
                [up_result] = await connection.query<ResultSetHeader>(`DELETE FROM favorites WHERE matrix_unique_id=? AND user_id=?`, [listing_id, user_id]);
            }
            
            let upResult = "";
            if(up_result && up_result.affectedRows > 0) {
                
                upResult = "success.";
                let notes = "";
                let notes_type = "";
                if(type == "Add") {
                    notes = "Added property {{property_id}} to favorites";
                    notes_type = "Favorite a Property";
                }else{
                    notes = "Removed property {{property_id}} from favorites";
                    notes_type = "Unfavorite a Property";
                }
                
                const notes_payload: AddNotesParams = {
                    user_id: user_id,
                    notes: notes,
                    notes_type: notes_type,
                    property_id: mls_number,
                    property_address: property_address
                }

                const fav_prms = await this.note_repo.AddNewNote(notes_payload);

            } else{
                upResult = "Unable to update property favorite status";
            }

            const [fav_row] = await connection.query<RowDataPacket[]>(`SELECT matrix_unique_id FROM favorites WHERE user_id=?`, [user_id]);
            const favs: any[] = [];
            if(fav_row.length){
                fav_row.forEach(fav=> {
                    favs.push(fav.matrix_unique_id);
                });
            }

            return favs;

        }catch(e: any){
            console.log(e.sqlMessage);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async SaveSearches(req: NextApiRequest): Promise<APIResponseProps> {

        const default_resp:APIResponseProps = {
            message:"",
            success:false,
            data: null
        }

        const req_body = req.body;
        const search_title = req_body.search_title;
        const user_id = req_body.user_id;
        const email_frequency = req_body.email_frequency;
        const query_link = req_body.query_link;
        const email_immediately = req_body.email_immediately;
        let sales_type = req_body.sales_type;
        let home_type = req_body.home_type;
        let query_type = req_body.query_type;

        if(!sales_type){
            sales_type = "For Sale";
        }

        if(home_type && home_type!=""){
            home_type = JSON.stringify(home_type);
        }else{
            home_type ="{}";
        }
        
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [srch_row] = await connection.query<RowDataPacket[]>(`SELECT(SELECT COUNT(search_id) FROM saved_searches WHERE user_id=? AND search_title=?) AS TitleExist,
            (SELECT COUNT(search_id) FROM saved_searches WHERE user_id=? AND query_link=? AND email_frequency=?) AS SearchExist`, 
            [user_id, search_title, user_id, query_link, email_frequency]);
            
            if( srch_row.length > 0){

                const TitleExist = srch_row[0].TitleExist;
                const SearchExist = srch_row[0].SearchExist;

                if(TitleExist>0){
                    default_resp.message = "This title already exist, change search title to continue.";
                    return default_resp;
                }

                if(SearchExist>0){
                    default_resp.message = "This search critarial already exist, change search critarials to continue.";
                    return default_resp;
                }

                let today = moment().format("YYYY-MM-DD H:m:s");
                let last_alert = today;
                let started = "No";
                
                if(email_immediately == true){
                    started = "Yes";
                    last_alert = moment().subtract(2, 'months').format("YYYY-MM-DD H:m:s");
                }

                let addResult = "";
                try{
                    const [add_result] = await connection.query<ResultSetHeader>(`INSERT INTO saved_searches(user_id, search_title, query_link, query_type, 
                    email_frequency, location, county, sales_type, min_price, max_price, min_bed, max_bed, min_bath, max_bath, max_hoa, 
                    include_incomp_hoa_data, virtual_tour, garage, basement, pool, ac, waterfront, photos, min_square_feet, max_square_feet, 
                    min_lot, max_lot, min_year, max_year, parking_spots, home_type, sort_by, date_saved, last_alert, started) 
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [user_id, search_title, query_link, query_type, email_frequency, req_body.location, req_body.county, sales_type, 
                    req_body.min_price, req_body.max_price, req_body.min_bed, req_body.max_bed, req_body.min_bath, req_body.max_bath, 
                    req_body.max_hoa, req_body.include_incomp_hoa_data, req_body.virtual_tour, req_body.garage, req_body.basement, req_body.pool, 
                    req_body.ac, req_body.waterfront, req_body.photos, req_body.min_square_feet, req_body.max_square_feet, req_body.min_lot, 
                    req_body.max_lot, req_body.min_year, req_body.max_year, req_body.parking_spots, home_type, req_body.sort_by, today, 
                    last_alert, started]);

                    if(add_result && add_result.affectedRows > 0) {
                        default_resp.success = true;
                        addResult = "Your Search was Successfully Saved!";
                    } else{
                        addResult = "Unable to save your search, please try again later.";
                    }
                }catch(e: any){
                    addResult = e.sqlMessage;
                }

                default_resp.message = addResult;

            }else{
                default_resp.message = "Unable to load searches";
            }
            
            return default_resp


        }catch(e: any){
            console.log(e.sqlMessage);
            return default_resp;
        }finally{
            if (connection) { 
                connection.release();
            }
        }
        
    }

    public async LoadSavedSearches(req: NextApiRequest): Promise<any> {

        const params = req.body;
            
        const page = params.page;
        const limit = params.limit;
        const user_id = params.user_id;
        const start_from = (page - 1) * limit;
        const field = "search_id, search_title, query_link, query_type, email_frequency, date_saved, last_alert, started";

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT ${field}, (SELECT COUNT(*) AS total_records FROM saved_searches WHERE 
            user_id=?) AS total_records FROM saved_searches WHERE user_id=? LIMIT ${start_from}, ${limit}`, [user_id, user_id]);

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    }
                });
                return formattedRows;
            }else{
                return [];
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    
    }

    public async DeleteSavedSearches(req: NextApiRequest): Promise<boolean> {

        const params = req.body;
        const search_id = params.search_id;
        const user_id = params.user_id;

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [del_srch] = await connection.query<ResultSetHeader>(`DELETE FROM saved_searches WHERE search_id=? AND user_id=? `, [search_id, user_id]);
            return del_srch.affectedRows >= 0;

        }catch(e: any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    
    }

    public async GetAlerts(): Promise<any> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(` SELECT * FROM saved_searches WHERE 
            (email_frequency = 'Hourly' AND last_alert < NOW() - INTERVAL 1 HOUR) OR 
            (email_frequency = 'Daily' AND last_alert < NOW() - INTERVAL 1 DAY) OR 
            (email_frequency = 'Weekly' AND last_alert < NOW() - INTERVAL 1 WEEK) OR 
            (email_frequency = 'Monthly' AND last_alert < NOW() - INTERVAL 1 MONTH) LIMIT 10`); //10

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    }
                });
                return formattedRows;
            }else{
                return [];
            }

        }catch(e: any){
            console.log(e.message);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    
    }

    public async UpdateAlertedSearches(searh_ids: string): Promise<boolean> {
        
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const now = moment().format("YYYY-MM-DD H:m:s")
            const [del_srch] = await connection.query<ResultSetHeader>(`UPDATE saved_searches SET last_alert=?, started=? WHERE search_id IN(${searh_ids}) `, [now, "Yes"]);
            return del_srch.affectedRows >= 0;

        }catch(e: any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    
    }

    public async UpdateFeaturedListingsSettings(req: NextApiRequest): Promise<boolean> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const params = req.body;
            const settings = params.settings;

            const [update] = await connection.query<ResultSetHeader>(`UPDATE company_info SET featured_listings=?  WHERE company_id=?`, [settings, "1"]);
            return update.affectedRows >= 0;

        }catch(e: any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    
    }

    public async LogSearch(req: NextApiRequest): Promise<boolean> {

        const params = req.body;
        const user_id = params.user_id;
        const sales_type = params.sales_type.toLowerCase();
        const location = params.location;
        const save_via = params.save_via;

        let query_link = "";
        let default_title = "Homes "+sales_type;
        if(location && location!=""){
            default_title += " in "+location.toLowerCase();
            query_link += `location=${location}&`;
        }

        //Just set data
        const pricesFilter = { min: params.min_price, max: params.max_price }
        const bedsFilter = { min: params.min_bed, max: params.max_bed }
        const bathsFilter = { min: params.min_bath, max: params.max_bath }

        if (pricesFilter) {
            if (pricesFilter.min && pricesFilter?.min > 0 && pricesFilter.max && pricesFilter?.max > 0) {
                default_title += `, from ${this.helper.formatPrice(pricesFilter.min)} to ${this.helper.formatPrice(pricesFilter.max)}`;
            } else if (pricesFilter.min && pricesFilter?.min > 0 && !pricesFilter.max) {
                default_title += `, ${this.helper.formatPrice(pricesFilter.min)} and over`;
            } else if (pricesFilter.max && pricesFilter?.max > 0 && !pricesFilter.min) {
                default_title += `, ${this.helper.formatPrice(pricesFilter.max)} and under`;
            }
            query_link += `min_price=${pricesFilter?.min}&max_price=${pricesFilter?.max}&`;
        }

        if (bedsFilter) {
            if (bedsFilter.min && bedsFilter?.min > 0 && bedsFilter.max && bedsFilter?.max > 0) {
                default_title += `, ${this.helper.formatPrice(bedsFilter.min)}-${this.helper.formatPrice(bedsFilter.max)} beds`;
            } else if (bedsFilter.min && bedsFilter?.min > 0 && !bedsFilter.max) {
                default_title += `, ${this.helper.formatPrice(bedsFilter.min)}+ beds`;
            } else if (bedsFilter.max && bedsFilter?.max > 0 && !bedsFilter.min) {
                default_title += `, <=${this.helper.formatPrice(bedsFilter.max)} beds`;
            }
            query_link += `min_bed=${bedsFilter?.min}&max_bed=${bedsFilter?.max}&`;
        }

        if (bathsFilter) {
            if (bathsFilter.min && bathsFilter?.min > 0 && bathsFilter.max && bathsFilter?.max > 0) {
                default_title += `, ${this.helper.formatPrice(bathsFilter.min)}-${this.helper.formatPrice(bathsFilter.max)} baths`;
            } else if (bathsFilter.min && bathsFilter?.min > 0 && !bathsFilter.max) {
                default_title += `, ${this.helper.formatPrice(bathsFilter.min)}+ baths`;
            } else if (bathsFilter.max && bathsFilter?.max > 0 && !bathsFilter.min) {
                default_title += `, <=${this.helper.formatPrice(bathsFilter.max)} baths`;
            }
            query_link += `min_bath=${bathsFilter?.min}&max_bath=${bathsFilter?.max}&`;
        }

        const paramMappings = {
            home_type: JSON.stringify(params.home_type),
            sales_type: params.sales_type,
            max_hoa: params.max_hoa,
            include_incomp_hoa_data: params.include_incomp_hoa_data,
            virtual_tour: params.virtual_tour,
            garage: params.garage,
            basement: params.basement,
            pool: params.pool,
            waterfront: params.waterfront,
            photos: params.photos,
            min_square_feet: params.min_square_feet,
            max_square_feet: params.max_square_feet,
            min_lot: params.min_lot,
            max_lot: params.max_lot,
            min_year: params.min_year,
            max_year: params.max_year,
            parking_spots: params.parking_spots
        };

        Object.entries(paramMappings).forEach(([key, value]) => {
            if (value !== undefined) {
                query_link += `${key}=${value}&`;
            }
        });

        query_link = this.helper.rTrim(query_link, "&");

        let home_type ="{}";
        if(params.home_type && params.home_type!=""){
            home_type = JSON.stringify(params.home_type);
        }

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [srch_row] = await connection.query<RowDataPacket[]>(`SELECT (SELECT COUNT(search_id) FROM saved_searches WHERE user_id=? AND query_link=?
            AND save_type=?) AS SearchExist`, [user_id, query_link, "Automated"]);
            
            if( srch_row.length > 0){

                const SearchExist = srch_row[0].SearchExist;
                if(SearchExist>0){
                    console.log("This title already exist, change search title to continue.")
                    return false;
                }

                let today = moment().format("YYYY-MM-DD H:m:s");
                let last_alert = today;
                let started = "No";

                let addResult = "";
                try{
                    const [add_result] = await connection.query<ResultSetHeader>(`INSERT INTO saved_searches(user_id, search_title, query_link, query_type, 
                    email_frequency, location, county, sales_type, min_price, max_price, min_bed, max_bed, min_bath, max_bath, max_hoa, 
                    include_incomp_hoa_data, virtual_tour, garage, basement, pool, ac, waterfront, photos, min_square_feet, max_square_feet, 
                    min_lot, max_lot, min_year, max_year, parking_spots, home_type, sort_by, date_saved, last_alert, started, save_type) 
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [user_id, default_title, query_link, "search", "Hourly", params.location, params.county, sales_type, 
                    params.min_price, params.max_price, params.min_bed, params.max_bed, params.min_bath, params.max_bath, 
                    params.max_hoa, params.include_incomp_hoa_data, params.virtual_tour, params.garage, params.basement, params.pool, 
                    params.ac, params.waterfront, params.photos, params.min_square_feet, params.max_square_feet, params.min_lot, 
                    params.max_lot, params.min_year, params.max_year, params.parking_spots, home_type, params.sort_by, today, 
                    last_alert, started, "Automated"]);

                    if(add_result && add_result.affectedRows > 0) {
                        addResult = "Your Search was Successfully Saved!";
                    } else{
                        addResult = "Unable to save your search, please try again later.";
                    }
                }catch(e: any){
                    addResult = e.sqlMessage;
                }

                console.log("addResult:", addResult)

            }
    
            return true;

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