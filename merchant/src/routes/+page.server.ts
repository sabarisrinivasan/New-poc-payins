import { postUpi } from '$lib/api/upiCollect';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const params = {
			amount: formData.get('amount') as string,
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			phone: formData.get('phone') as string,
			addressLine1: formData.get('addressLine1') as string,
			addressLine2: formData.get('addressLine2') as string,
			city: formData.get('city') as string,
			state: formData.get('state') as string,
			zipCode: formData.get('zipCode') as string
		};

		try {
			const data = await postUpi(params);
			console.log(data, 'data');
            
			return {
				success: true,
				response: data
			};
		} catch (error) {
			console.error('Server error:', error); // Server-side error logging
				// 'http://localhost:3003/payins/checkout/eyJjdXJyZW5jeSI6IklOUiIsImhhc2giOiJEakNfNXZVZDZwbW5SVXN5ZmZwY0ZsaFA3ZVRudi1qQ0xGLWw3UkJlbTFnIiwib3JkZXJJZCI6IllRVFEyMzI0MjE5MzEwOTI5MiIsIm9yZ0lkIjoiMTAwMDMiLCJ0cmFuc2FjdGlvbkFtb3VudCI6IjUwMCIsInVuaXF1ZUN1c3RvbWVyUmVmZXJlbmNlIjoidG9qc2FqYUBnbWFpbC5jb20ifQ'
			};

			return {
				success: false,
				
			};
			// return {
			// 	success: false,
			// 	error: error instanceof Error ? error.message : 'Unknown error'
			// };
		}
	}

