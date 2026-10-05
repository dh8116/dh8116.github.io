// Structured data for search engines and AI assistants. Rendered as a plain
// <script type="application/ld+json">, which browsers never execute, so the
// export's script CSP does not apply to it.
//
// The "<" escape stops a string inside the data from closing the script tag.

import { site, projects } from "@/data/site";

export const ORIGIN = "https://dh8116.github.io";
export const PERSON_ID = `${ORIGIN}/#person`;

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    alternateName: "dh8116",
    url: `${ORIGIN}/`,
    image: `${ORIGIN}${site.avatar}`,
    description: site.bio,
    homeLocation: {
      "@type": "Place",
      name: site.location,
    },
    sameAs: [site.github.replace(/\/$/, ""), site.x],
    knowsAbout: [
      "GPU kernels",
      "Triton",
      "PyTorch",
      "LoRA fine-tuning",
      "Reinforcement learning with verifiable rewards",
      "Full-stack web development",
    ],
    award: [
      "HiMCM Honorable Mention",
      "IMMC regional round Honorable Mention",
      "AMC 12 Honor Roll",
      "Australian Mathematics Competition High Distinction",
    ],
  };
}

// The products, each pointing back at the person, so the three read as one
// connected entity rather than three unrelated names.
export function projectSchemas() {
  return projects.map((p) => ({
    "@type": "SoftwareApplication",
    "@id": `${p.url}#app`,
    name: p.name,
    url: p.url,
    description: p.description,
    applicationCategory: "WebApplication",
    operatingSystem: "Web browser",
    creator: { "@id": PERSON_ID },
  }));
}
