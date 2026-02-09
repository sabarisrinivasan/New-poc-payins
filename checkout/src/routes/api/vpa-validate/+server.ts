import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';


export const POST: RequestHandler = async ({ request }) => {
  const { vpa } = await request.json();
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/payins/${10094}/vpa/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({vpa:vpa})
      }
    );
    const data = await res.json();
    console.log(data,"data  ")
    if (data.statusCode === 200) {
      return json({ success: true, message: data.message })
    } else {
      return json({ success: false, message: data.message })
    }

  } catch (error) {
    console.log(error)
    return json({ success: false }, { status: 500 });
  }
}
