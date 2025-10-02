// src/app/(dashboard)/commands/deleted/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Commands } from "@prisma/client";
import DeletedCommandActions from "@/components/Commands/DeletedCommandActions";
import { formatDate } from "@/utils/date-formatter";

export const getColumns = (): ColumnDef<Commands>[] => [
  {
    accessorKey: "input",
    header: "Input",
  },
  {
    accessorKey: "deletedAt",
    header: "Deleted At",
    cell: ({ row }) => (
      <span>
        {row.original.deletedAt && formatDate(row.original.deletedAt)}
      </span>
    ),
  },
  {
    accessorKey: "deletedAtExpiration",
    header: "Expires At",
    cell: ({ row }) => (
      <span>
        {row.original.deletedAtExpiration &&
          formatDate(row.original.deletedAtExpiration)}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span>
        {row.original.createdAt && formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DeletedCommandActions command={row.original} />,
  },
];
