"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Commands } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import CommandActions from "@/components/Commands/CommandActions";
import { formatDate } from "@/utils/date-formatter";

export const getColumns = (): ColumnDef<Commands>[] => [
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
