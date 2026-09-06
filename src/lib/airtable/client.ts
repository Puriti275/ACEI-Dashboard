import "server-only";

/**
 * Thin wrapper over the Airtable REST API.
 *
 * Reads go through `fetch` with `next: { revalidate, tags }` so responses land
 * in the Next.js Data Cache and can be busted per-table with `revalidateTag`.
 * Airtable stays the system of record; nothing is mirrored locally.
 */

const API_ROOT = "https://api.airtable.com/v0";
const REVALIDATE_SECONDS = 60 * 60; // hourly ceiling; the daily cron busts tags
const PAGE_SIZE = 100; // Airtable maximum
const PAGE_DELAY_MS = 220; // stay under Airtable's 5 req/s per-base limit

export type AirtableRecord<TFields> = {
  id: string;
  createdTime: string;
  fields: Partial<TFields>;
};

export type SelectParams<TFields> = {
  fields?: (keyof TFields & string)[];
  filterByFormula?: string;
  view?: string;
  sort?: { field: keyof TFields & string; direction?: "asc" | "desc" }[];
};

function baseId(): string {
  const value = process.env.AIRTABLE_BASE_ID;
  if (!value) throw new Error("AIRTABLE_BASE_ID is not set");
  return value;
}

function apiKey(): string {
  const value = process.env.AIRTABLE_API_KEY;
  if (!value) throw new Error("AIRTABLE_API_KEY is not set");
  return value;
}

function buildQuery<TFields>(params: SelectParams<TFields>, offset?: string): string {
  const query = new URLSearchParams();
  query.set("pageSize", String(PAGE_SIZE));
  params.fields?.forEach((field) => query.append("fields[]", field));
  if (params.filterByFormula) query.set("filterByFormula", params.filterByFormula);
  if (params.view) query.set("view", params.view);
  params.sort?.forEach((rule, index) => {
    query.set(`sort[${index}][field]`, rule.field);
    if (rule.direction) query.set(`sort[${index}][direction]`, rule.direction);
  });
  if (offset) query.set("offset", offset);
  return query.toString();
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Fetch every record from a table (following pagination), cached under `tags`. */
export async function airtableSelect<TFields>(
  table: string,
  params: SelectParams<TFields>,
  tags: string[],
): Promise<AirtableRecord<TFields>[]> {
  const records: AirtableRecord<TFields>[] = [];
  let offset: string | undefined;
  let page = 0;

  do {
    if (page > 0) await sleep(PAGE_DELAY_MS);
    const url = `${API_ROOT}/${baseId()}/${encodeURIComponent(table)}?${buildQuery(params, offset)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey()}` },
      next: { revalidate: REVALIDATE_SECONDS, tags },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Airtable read "${table}" failed (${response.status}): ${body.slice(0, 300)}`);
    }

    const json = (await response.json()) as {
      records: AirtableRecord<TFields>[];
      offset?: string;
    };
    records.push(...json.records);
    offset = json.offset;
    page += 1;
  } while (offset);

  return records;
}

export async function airtableCreate<TFields>(
  table: string,
  fields: Partial<TFields>,
): Promise<string> {
  const response = await fetch(`${API_ROOT}/${baseId()}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields, typecast: true }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Airtable create "${table}" failed (${response.status}): ${await response.text()}`);
  }

  const json = (await response.json()) as { id: string };
  return json.id;
}

export async function airtableUpdate<TFields>(
  table: string,
  recordId: string,
  fields: Partial<TFields>,
): Promise<void> {
  const response = await fetch(
    `${API_ROOT}/${baseId()}/${encodeURIComponent(table)}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, typecast: true }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Airtable update "${table}" failed (${response.status}): ${await response.text()}`);
  }
}
