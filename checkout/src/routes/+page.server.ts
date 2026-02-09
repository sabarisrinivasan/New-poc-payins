// import { redirect } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({url}) => {
     if (url.pathname ==="/"){
        throw error(404,"page not found")
     }
};