"use client";

import { ColumnDef } from "@tanstack/react-table";
import DeletedCommandActions from "@/components/Commands/DeletedCommandActions";
import { formatDate } from "@/utils/date-formatter";
import { CommandWithOwner } from "./page";
import { Role } from "@prisma/client";

export const getColumns = (): ColumnDef<CommandWithOwner>[] => [
  {
    accessorKey: "input",
    header: "Input",
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const owner = row.original.owner;
      if (!owner) return "-";
      return owner.role === Role.AWAIT_REGISTER ? "-" : owner.username || "-";
    },
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
