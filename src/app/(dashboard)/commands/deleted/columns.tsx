// src/app/(dashboard)/commands/deleted/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Commands } from "@prisma/client";
import DeletedCommandActions from "@/components/Commands/DeletedCommandActions";

export const getColumns = (): ColumnDef<Commands>[] => [
  {
    accessorKey: "input",
    header: "Input",
  },
  {
    accessorKey: "deletedAt",
    header: "Deleted At",
    cell: ({ row }) => (
      <span>{row.original.deletedAt?.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "deletedAtExpiration",
    header: "Expires At",
    cell: ({ row }) => (
      <span>{row.original.deletedAtExpiration?.toLocaleString()}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DeletedCommandActions command={row.original} />,
  },
];