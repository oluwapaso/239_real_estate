import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MYSQLCompanyRepo } from "@/_repo/company_repo";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
export const authConfig: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credential Provider",
            credentials:{
                email: {
                    label:"Email",
                    placeholder: "Email",
                    type:"email"
                },
                password:{
                    type: "password",
                    label: "Password"
                }
            },
            async authorize(credentials, req) {
                const res = await fetch(`${apiBaseUrl}/api/(auths)/login`, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                })
                const user = await res.json();

                // If no error and we have user data, return it
                if (res.ok && user.success) {
                    return user.data;
                }else {
                    // Return an object that will pass error information through to the client-side.
                    throw new Error(user.message);
                }
                // Return null if user data could not be retrieved
                //return null;
            }
        }),
        GoogleProvider({
            clientId: "",
            clientSecret: "",
        }),
    ],
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
    session: {
        maxAge: 365 * 24 * 60 * 60, // 1 year
    },
    callbacks: {
        session: async ({session, user}) => {

            let accnt_email = "";
            let name = "";

            if(session?.user?.email){
                accnt_email = session?.user?.email;
                if(session.user.name){
                    name = session.user.name;
                }
            }

            const res = await fetch(`${apiBaseUrl}/api/(auths)/third-party-auth`, {
                method: 'POST',
                body: JSON.stringify({"email": accnt_email, "name": name}),
                headers: { "Content-Type": "application/json" }
            })
            const logged_user = await res.json();
            // If no error and we have user data, return it
            if (res.ok && logged_user.success) {
                session.user = logged_user.data;
            }else {
                // Return an object that will pass error information through to the client-side.
                throw new Error(logged_user.message);
            }
            
            return Promise.resolve(session);
        },
    },
    
}

// Update clientId and clientSecret asynchronously
async function updateGoogleProvider() {

    const compRepo = new MYSQLCompanyRepo();
    const clientCredentials = await compRepo.GetApiInfo();
    authConfig.providers[1].options.clientId = clientCredentials.data.google_auth_client_id;
    authConfig.providers[1].options.clientSecret = clientCredentials.data.google_auth_client_secret;
    
}

// Call the update function
updateGoogleProvider().then(() => {
    console.log('Google provider updated successfully');
}).catch((error) => {
    console.error('Failed to update Google provider:', error);
});