import { site } from "@/data/site";

export default function PersonalDetailsCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-6">
      <h3 className="text-lg font-semibold">Personal Details</h3>
      <dl className="mt-4 flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Name</dt>
          <dd className="text-right text-zinc-300">{site.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Location</dt>
          <dd className="text-right text-zinc-300">{site.location}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Status</dt>
          <dd className="text-right text-zinc-300">{site.status}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Email</dt>
          <dd className="text-right">
            <a
              href={`mailto:${site.email}`}
              className="text-brand-blue-light hover:underline"
            >
              {site.email}
            </a>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">GitHub</dt>
          <dd className="text-right">
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue-light hover:underline"
            >
              github.com/dh8116
            </a>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">X</dt>
          <dd className="text-right">
            <a
              href={site.x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue-light hover:underline"
            >
              @RicaV42
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
