-- handle_new_user() es una función de trigger (SECURITY DEFINER). No debe ser
-- invocable vía /rest/v1/rpc por los roles anon/authenticated. El trigger
-- on_auth_user_created sigue ejecutándose igual: disparar el INSERT no requiere
-- EXECUTE sobre la función de trigger.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
