import { APIResponseProps } from '@/components/types';
import { useSession } from 'next-auth/react';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const useFetchListings = (searchParams: ReadonlyURLSearchParams | null, list_type: string, curr_page: number, page_size: number) => {

    const { data: session } = useSession();
    const user = session?.user as any;
    let user_id: any = null;
    if (user) {
        user_id = user.user_id;
    }

    const [isLoading, setIsLoading] = useState(true);
    const [listings, setListings] = useState<any[]>([]);
    const [props_loaded, setPropsLoaded] = useState(false);
    const [total_page, setTotalPage] = useState(0);

    useEffect(() => {

        const fetchListings = async () => {

            setPropsLoaded(false);
            setTotalPage(0);

            const price_range = searchParams?.get("price-range");
            let min_price = "";
            let max_price = "";

            if (price_range && price_range != "") {

                min_price = price_range.split("-")[0];
                max_price = price_range.split("-")[1];

                //under-1,000,000
                if (min_price == "under") {
                    min_price = "";
                }

                //over-1,000,000
                if (min_price == "over") {
                    min_price = max_price;
                    max_price = "";
                }

            } else {
                min_price = searchParams?.get("min-price") as string || "";
                max_price = searchParams?.get("max-price") as string || "";
            }

            const payload = {
                "search_by": list_type,
                "user_id": user_id,
                "min_bed": searchParams?.get("min-bed") || "",
                "max_bed": searchParams?.get("max-bed") || "",
                "min_bath": searchParams?.get("min-bath") || "",
                "max_bath": searchParams?.get("max-bath") || "",
                "min_price": min_price,
                "max_price": max_price,
                "sort_by": searchParams?.get("sort-by") || "",
                "page": curr_page,
                "limit": page_size
            }

            setIsLoading(true);

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/(listings)/load-properties`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }).then((resp): Promise<APIResponseProps> => {
                setIsLoading(false);
                return resp.json();
            }).then(data => {
                if (data.success) {

                    const properties = data.data?.properties;
                    if (properties && properties.length > 0) {
                        const total_records = properties[0].total_records;
                        setTotalPage(Math.ceil(total_records / page_size));
                    }

                    setListings(data.data?.properties);
                    setPropsLoaded(true);
                }
            });

        }

        fetchListings();

    }, [searchParams, list_type, curr_page, page_size]);

    return { listings, props_loaded, total_page, isLoading };

}

export default useFetchListings;