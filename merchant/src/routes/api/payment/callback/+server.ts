

export async function POST({ request }) {
  const formData = await request.formData();
  
 console.log(formData,"NetBanking")

 return new Response(String("hello"));
}