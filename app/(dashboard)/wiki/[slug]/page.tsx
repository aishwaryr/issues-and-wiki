/** One wiki page at `/wiki/[slug]`. Placeholder until wiki-04. */
export default async function WikiPageDetail({
  params,
}: PageProps<"/wiki/[slug]">) {
  const { slug } = await params;

  return <h1 className="text-2xl font-semibold">{slug}</h1>;
}
