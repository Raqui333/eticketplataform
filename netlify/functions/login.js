const LOGIN = process.env.LOGIN || 'admin';
const PASSW = process.env.PASSW || 'admin';

export default async (request) => {
  const data = await request.json();

  // default login admin/admin
  // simples login logic on purpose
  if (data.login === LOGIN && data.password === PASSW) {
    return new Response(JSON.stringify('login approved'), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify('wrong login'), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
