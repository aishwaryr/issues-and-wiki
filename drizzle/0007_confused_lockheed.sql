CREATE TABLE "issue_wiki_links" (
	"issue_id" uuid NOT NULL,
	"wiki_page_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_wiki_links_issue_id_wiki_page_id_pk" PRIMARY KEY("issue_id","wiki_page_id")
);
--> statement-breakpoint
ALTER TABLE "issue_wiki_links" ADD CONSTRAINT "issue_wiki_links_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_wiki_links" ADD CONSTRAINT "issue_wiki_links_wiki_page_id_wiki_pages_id_fk" FOREIGN KEY ("wiki_page_id") REFERENCES "public"."wiki_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_wiki_links_wiki_page_id_idx" ON "issue_wiki_links" USING btree ("wiki_page_id");