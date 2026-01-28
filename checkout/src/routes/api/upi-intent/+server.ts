import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    const qrRequest = await request.json();

    try {

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/payins/upi/intent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(qrRequest)
            }
        );

        const data = await res.json();
        console.log(data);

        if (data.ok) {
            return json({ success: true, data: data })
        } else {
            return json({ success: false, message: "Failed to generate QR" })
        }

    } catch (error) {
        console.log(error)
        return json({ success: false }, { status: 500 });
    }
}
