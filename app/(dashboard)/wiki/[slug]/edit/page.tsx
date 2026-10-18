/** Edit form for one wiki page at `/wiki/[slug]/edit`. Placeholder until wiki-06. */
export default async function EditWikiPage({
  params,
}: PageProps<"/wiki/[slug]/edit">) {
  const { slug } = await params;

  return <h1 className="text-2xl font-semibold">Edit {slug}</h1>;
}
