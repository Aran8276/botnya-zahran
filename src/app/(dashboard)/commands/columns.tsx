"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import CommandActions from "@/components/Commands/CommandActions";
import { formatDate } from "@/utils/date-formatter";
import { CommandWithOwner } from "./page";
import { Role } from "@prisma/client";

export const getColumns = (): ColumnDef<CommandWithOwner>[] => [
  {
    accessorKey: "input",
    header: "Input",
  },
  {
    accessorKey: "outputType",
    header: "Output Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.outputType}
      </Badge>
    ),
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
    accessorKey: "commandUsageCount",
    header: "Usage Count",
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
    cell: ({ row }) => <CommandActions command={row.original} />,
  },
];
