import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { APIResponseProps } from "@/components/types";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";

// API route to fetch a long-lived access token and page access token
export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>) {
  const { short_token, facebook_page_app_secret,  facebook_page_app_id} = req.body; // Assume you send short-lived token from frontend

  if (!short_token) {
    return resp.status(400).json({ success: false, message: 'No short-lived token provided' });
  }

  try {
    // Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${facebook_page_app_id}&client_secret=${facebook_page_app_secret}&fb_exchange_token=${short_token}`
    );
    const longLivedTokenData = await longLivedTokenResponse.json();

    if (longLivedTokenData.error) {
      throw new Error(longLivedTokenData.error.message);
    }

    const longLivedUserToken = longLivedTokenData.access_token;
    // Get the page access token
    const pageAccessTokenResponse = await fetch(
      `https://graph.facebook.com/v15.0/me/accounts?access_token=${longLivedUserToken}`
    );
    const pageAccessTokenData = await pageAccessTokenResponse.json();

    if (pageAccessTokenData.error) {
      throw new Error(pageAccessTokenData.error.message);
    }

    const pageAccessToken = pageAccessTokenData.data[0].access_token;
    const expiry_date = moment().add(60, "days").format("YYYY-MM-DD");
    const comp_repo = new MYSQLCompanyRepo();
    const is_updated = await comp_repo.Update_FB_Tokens(pageAccessToken, longLivedUserToken, short_token, expiry_date);
    
    // Return the page access token
    resp.status(200).json({ 
      success: true, 
      data: {
        "page_access_token": pageAccessToken,
        "long_token": longLivedUserToken,
        "short_token": short_token,
        "expiry_date": expiry_date,
      }, 
      message: "Success." 
    });

  } catch (error: any) {
    console.error('Error fetching access token:', error);
    resp.status(500).json({ message: error.message });
  }
}
