

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."artikel_service" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tittel" "text" NOT NULL,
    "ingress" "text",
    "innhold" "text" NOT NULL,
    "forfatterid" "uuid",
    "forfatternavn" "text",
    "kategori" "text",
    "bilde" "text",
    "godkjent" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."artikel_service" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brukere" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "navn" "text",
    "rolle" "text",
    "opprettet" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "klasse" "text",
    "godkjent" boolean DEFAULT false
);


ALTER TABLE "public"."brukere" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."website_settings" (
    "id" bigint DEFAULT 1 NOT NULL,
    "lockdown" boolean DEFAULT false,
    "full_lockdown" boolean DEFAULT false,
    "note" "text" DEFAULT ''::"text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_by" "uuid"
);


ALTER TABLE "public"."website_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."artikel_service"
    ADD CONSTRAINT "artikler_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brukere"
    ADD CONSTRAINT "brukere_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."website_settings"
    ADD CONSTRAINT "website_settings_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."artikel_service" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_website_settings_updated_at" BEFORE UPDATE ON "public"."website_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."artikel_service"
    ADD CONSTRAINT "artikler_forfatterid_fkey" FOREIGN KEY ("forfatterid") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."website_settings"
    ADD CONSTRAINT "website_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow public read access" ON "public"."website_settings" FOR SELECT USING (true);



CREATE POLICY "Allow technical leader to update settings" ON "public"."website_settings" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."brukere"
  WHERE (("brukere"."id" = "auth"."uid"()) AND ("brukere"."rolle" = 'teknisk_leder'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."brukere"
  WHERE (("brukere"."id" = "auth"."uid"()) AND ("brukere"."rolle" = 'teknisk_leder'::"text")))));



CREATE POLICY "Forfattere kan oppdatere sine egne ikke-godkjente artikler" ON "public"."artikel_service" FOR UPDATE TO "authenticated" USING ((("forfatterid" = "auth"."uid"()) AND ("godkjent" = false))) WITH CHECK ((("forfatterid" = "auth"."uid"()) AND ("godkjent" = false)));



CREATE POLICY "Forfattere kan se sine egne artikler" ON "public"."artikel_service" FOR SELECT TO "authenticated" USING (("forfatterid" = "auth"."uid"()));



CREATE POLICY "Godkjente artikler er synlige for alle" ON "public"."artikel_service" FOR SELECT USING (("godkjent" = true));



CREATE POLICY "Innlogget bruker kan opprette artikler" ON "public"."artikel_service" FOR INSERT TO "authenticated" WITH CHECK (("forfatterid" = "auth"."uid"()));



CREATE POLICY "Redaktører og admin kan oppdatere alle artikler" ON "public"."artikel_service" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."brukere"
  WHERE (("brukere"."id" = "auth"."uid"()) AND (("brukere"."rolle" = 'admin'::"text") OR ("brukere"."rolle" = 'redaktør'::"text") OR ("brukere"."rolle" = 'teknisk_leder'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."brukere"
  WHERE (("brukere"."id" = "auth"."uid"()) AND (("brukere"."rolle" = 'admin'::"text") OR ("brukere"."rolle" = 'redaktør'::"text") OR ("brukere"."rolle" = 'teknisk_leder'::"text"))))));



CREATE POLICY "Redaktører og admin kan se alle artikler" ON "public"."artikel_service" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."brukere"
  WHERE (("brukere"."id" = "auth"."uid"()) AND (("brukere"."rolle" = 'admin'::"text") OR ("brukere"."rolle" = 'redaktør'::"text") OR ("brukere"."rolle" = 'teknisk_leder'::"text"))))));



ALTER TABLE "public"."website_settings" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."artikel_service" TO "anon";
GRANT ALL ON TABLE "public"."artikel_service" TO "authenticated";
GRANT ALL ON TABLE "public"."artikel_service" TO "service_role";



GRANT ALL ON TABLE "public"."brukere" TO "anon";
GRANT ALL ON TABLE "public"."brukere" TO "authenticated";
GRANT ALL ON TABLE "public"."brukere" TO "service_role";



GRANT ALL ON TABLE "public"."website_settings" TO "anon";
GRANT ALL ON TABLE "public"."website_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."website_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
