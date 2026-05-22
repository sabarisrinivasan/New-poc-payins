

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  
  console.log('NetBanking Callback:', Object.fromEntries(formData));

  const status = formData.get('status');       // bank's status field
  const txnId  = formData.get('txnid');        // transaction ID
  // add your other fields (hash, amount, etc.)

  // ✅ TODO: Verify hash signature here before trusting status

  if (status === 'success') {
    throw redirect(303, `/payment/success?txn=${txnId}`);
  }

  throw redirect(303, `/payment/failure?txn=${txnId}`);
};