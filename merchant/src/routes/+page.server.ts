import { postUpi } from '$lib/api/upiCollect';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async () => {
		try {
			const data = await postUpi();
			console.log(data, 'data');

			return {
				success: true,
				response: data
			};
		} catch (error) {
			console.error('Server error:', error); // Server-side error logging
			const mockResponse = {
				checkoutUrl:
					'http://localhost:3003/payins/checkout/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW5jeSI6IklOUiIsImN1c3RvbWVyRW1haWwiOiIiLCJjdXN0b21lck5hbWUiOiIiLCJjdXN0b21lclBob25lTnVtYmVyIjoiOTMwNTk2NzA1OCIsImV4cCI6MTc2ODM5OTY0NSwiaWF0IjoxNzY4MzEzMjQ1LCJpc3MiOiJGbGlwb3BheSIsImp0aSI6ImRkY2Y3ZTkwLTVlN2MtNDdmMy1iMTBiLTdiYTgxNmEyYTBkOSIsIm1lcmNoYW50UmVkaXJlY3RVcmwiOiIiLCJvcmRlcklkIjoiWVFUUTIzMjQyMTkzMTA5MjkyIiwib3JnSWQiOiIxMDAwMyIsInB1cnBvc2UiOiJwYXlpbl9jaGVja291dCIsInRyYW5zYWN0aW9uQW1vdW50IjoiNTAwIn0.noRhYg4dn_VOGv6QcWxnfmed_6RJX8WPfrR4mYatFt0'
				// 'http://localhost:3003/payins/checkout/eyJjdXJyZW5jeSI6IklOUiIsImhhc2giOiJEakNfNXZVZDZwbW5SVXN5ZmZwY0ZsaFA3ZVRudi1qQ0xGLWw3UkJlbTFnIiwib3JkZXJJZCI6IllRVFEyMzI0MjE5MzEwOTI5MiIsIm9yZ0lkIjoiMTAwMDMiLCJ0cmFuc2FjdGlvbkFtb3VudCI6IjUwMCIsInVuaXF1ZUN1c3RvbWVyUmVmZXJlbmNlIjoidG9qc2FqYUBnbWFpbC5jb20ifQ'
			};

			return {
				success: true,
				response: mockResponse
			};
			// return {
			// 	success: false,
			// 	error: error instanceof Error ? error.message : 'Unknown error'
			// };
		}
	}
};
