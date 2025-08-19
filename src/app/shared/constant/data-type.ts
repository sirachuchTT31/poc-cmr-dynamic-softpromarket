export const pgDataTypes = [
  { label: "String (text)", value: "TEXT" },
  { label: "String (varchar)", value: "VARCHAR(255)" },
  { label: "Integer", value: "INTEGER" },
  { label: "Big Integer", value: "BIGINT" },
  { label: "Decimal / Float", value: "DECIMAL" },
];

export const pgTypeMap: Record<string, string> = {
  integer: "INTEGER",
  bigint: "BIGINT",
  numeric: "DECIMAL",
  text: "TEXT",
  "character varying": "VARCHAR(255)",
  date: "DATE",
  "timestamp without time zone": "TIMESTAMP",
  jsonb: "JSONB",
};
