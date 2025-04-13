import type { APIRoute } from "astro";
import { supabase } from '~/providers/supabaseAuth'
import * as store from "~/store";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    //return new Response('Email and password are required', { status: 400 })
    store.messageStore.set("Email and password are required");
    return redirect("/build/register");
  

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    //return new Response(error.message, { status: 500 });
    store.messageStore.set(`Error: ${error.message}`)
    return redirect("/build/register")
  }

  return redirect("/build/login")
};
