import { useSelector } from "react-redux";

import axios from "axios";



const DEFAULT_BASE_URL = import.meta.env.VITE_BASE_URI;



export const useApiRequests = () => {

    const lang = useSelector((state) => state.data.languages);

    const language = lang?.code;

    // const language = localStorage.getItem("Aiecommercelanguage");

    // Internal API call function

    const apiCall = async ({

        method = "POST",

        endpoint = "",

        headers = {},

        body = {},

        params = {},

        base = DEFAULT_BASE_URL,

    }) => {

        const isGet = method.toUpperCase() === "GET";

        const config = {

            method,

            url: `${base}${endpoint}`,

            headers: {

                "Content-Type": "application/json",

                ...headers,

            },

            ...(isGet ? { params } : { data: body }),

        };

        try {

            const response = await axios(config);

            return response;

        } catch (error) {

            // console.error("API Call Error:", error.response || error);

            throw error;

        }

    };



    // Wrapper function that auto-injects language if needed

    const callApi = async ({

        method = "POST",

        endpoint,

        headers = {},

        body = {},

        params = {},

        passLang = true,

        base,

    }) => {

        if (!language && passLang === true) return;

        const langData = passLang && language ? { language } : {};

        const isGet = method.toUpperCase() === "GET";

        return apiCall({

            method,

            endpoint,

            headers,

            body: isGet ? {} : { ...body, ...langData },

            params: isGet ? { ...params, ...langData } : {},

            base,

        });

    };



    //-----Call Auth APIS----------//

    const loginAPI = (options = {}) =>

        callApi({

            ...options,

            endpoint: "/user/login",

        });

    const verifyAPI = (options = {}) =>

        callApi({

            ...options,

            endpoint: "/user/verify",

        });

    return {
        callApi,

        loginAPI,

        verifyAPI,

        updateprofileAPI,

        getuserprofileAPI,

    };
};     