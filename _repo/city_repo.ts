import pool from "@/_lib/db_conn";
import { APIResponseProps, CityDetails, CityInfo, LoadCitiesParams, LoadCommunitiesParams, UpdateCityParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface CityRepo {
    LoadCityInfo(keyword: string, search_by: string): Promise<CityDetails | null>
    UpdateCity(params: UpdateCityParams) : Promise<boolean>
    LoadCities(params: LoadCommunitiesParams): Promise<CityInfo[] | null>
    LoadCityStats(community: string): Promise<APIResponseProps>
}

export class MYSQLCityRepo implements CityRepo { 

    public async LoadCityInfo(keyword: string, search_by: string): Promise<CityDetails | null> {

        let connection: PoolConnection | null = null;
        try{

            let rows: RowDataPacket[] = [];
            connection = await pool.getConnection();

            if(search_by == "City Id"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM cities WHERE city_id=? `, [keyword]);
            }else if(search_by == "Slug"){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM cities WHERE slug=? `, [keyword]);
            }

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    
                    ['header_image', 'draft_header_image', 'show_on_menus'].forEach((field) => {
                        if (row[field] && row[field].length && typeof row[field] === 'string') {
                            row[field] = JSON.parse(row[field]);
                        }
                    });

                    return {
                        ...row,
                    } as CityDetails
                });
                return formattedRows[0];
            }else{
                return null
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return e.sqlMessage;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    } 

    public async UpdateCity(params: UpdateCityParams) : Promise<boolean>{

        const city_id = params.city_id
        const mls_name = params.mls_name
        const friendly_name = params.friendly_name
        const excerpt = params.excerpt
        const body = params.post_body
        const submit_type = params.submit_type
        const header_image = JSON.stringify(params.header_image)
        const menus = params.menus;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            let isUpdated: boolean = false;
            if(submit_type == "Draft"){

                const [result] = await connection.query<ResultSetHeader>(`
                    UPDATE cities SET mls_name=?, friendly_name=?, excerpt=?, draft_content=?, draft_header_image=?, show_on_menus=?,
                    is_dirty=? WHERE city_id=? `, [mls_name, friendly_name, excerpt, body, header_image, menus, "Yes", city_id]
                );

                isUpdated = result.affectedRows >= 0;

            }else if(submit_type == "Publish"){
 
                const [update_result] = await connection.query<ResultSetHeader>(`
                    UPDATE cities SET  mls_name=?, friendly_name=?, excerpt=?, draft_content=?, published_content=?, header_image=?, 
                    draft_header_image=?, show_on_menus=?, is_published=?, is_dirty=? WHERE city_id=? `, [mls_name, friendly_name, excerpt, 
                    body, body, header_image, header_image, menus, "Yes", "No", city_id]
                );

                isUpdated = update_result.affectedRows >= 0;

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

    public async LoadCities(params: LoadCitiesParams): Promise<CityInfo[] | null> {

        const paginated = params.paginated;
        const post_type = params.post_type;
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        connection = await pool.getConnection();
        try {
            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;

                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM cities) AS total_records 
                FROM cities ORDER BY friendly_name ASC LIMIT ${start_from}, ${limit}`);
                
            }else{

                if(post_type == "Published"){ 
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM cities ORDER BY friendly_name ASC `);
                } else if(post_type == "Featured Communities"){ 
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM cities WHERE JSON_EXTRACT(show_on_menus, '$.home_page')=? ORDER BY friendly_name ASC `, ["Yes"]);
                }

            }

            const formattedRows = rows.map((row) => {

                ['header_image', 'draft_header_image', 'show_on_menus'].forEach((field) => {
                    if (row[field] && row[field].length && typeof row[field] === 'string') {
                        row[field] = JSON.parse(row[field]);
                    }
                });

                return {
                    ...row,
                }

            });

            return formattedRows as CityInfo[] | null;

        } catch (e: any) {

            console.log("e.sqlMessage", e.sqlMessage)
            return null;

        }finally{
            if (connection) { 
                connection.release();
            }
        }


    }

    public async LoadCityStats(slug: string): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const city_info = await this.LoadCityInfo(slug, "Slug");

            if(city_info && city_info.mls_name){
                const mls_name = city_info?.mls_name;

                const [data] = await connection.query<RowDataPacket[]>(`SELECT
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Lot & Land' AND Status='Active' AND City='${mls_name}') as Lands,
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Residential' AND Status='Active' AND City='${mls_name}') as Residentials,
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Commercial' AND Status='Active' AND City='${mls_name}') as Commercial_Sale,
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Residential Income' AND Status='Active' AND City='${mls_name}') as Residential_Income,
                (SELECT COUNT(*) FROM properties WHERE PropertyType='Boat Dock' AND Status='Active' AND City='${mls_name}') as Docks,
                (SELECT AVG(CAST(ListPrice AS DECIMAL)) FROM properties WHERE Status='Active' AND City='${mls_name}') as AVG_Price,
                (SELECT MAX(CAST(ListPrice AS DECIMAL)) FROM properties WHERE Status='Active' AND City='${mls_name}' AND ListPrice > 0) as Highest_Price,
                (SELECT MIN(CAST(ListPrice AS DECIMAL)) FROM properties WHERE Status='Active' AND City='${mls_name}' AND ListPrice > 0) as Lowest_Price,
                (SELECT AVG(CAST(PricePerAcre AS DECIMAL)) FROM properties WHERE Status='Active' AND City='${mls_name}') as AVG_Price_Per_SqFt,
                (SELECT COUNT(*) FROM properties WHERE Status='Active' AND City='${mls_name}') as Total_Listings`);

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