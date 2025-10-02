"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Group } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import GroupActions from "@/components/Groups/GroupActions";
import { Checkbox } from "@/components/ui/checkbox";

export const getColumns = (): ColumnDef<Group>[] => [
  {
    accessorKey: "serializedId",
    header: "Serialized ID",
  },
  {
    accessorKey: "isIgnored",
    header: "Is Ignored",
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.isIgnored}
        aria-readonly
        className="cursor-default"
      />
    ),
  },
  {
    accessorKey: "adminSerializedIds",
    header: "Admin IDs",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.adminSerializedIds.map((id, index) => (
          <Badge key={index} variant="secondary">
            {id}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <GroupActions group={row.original} />,
  },
];
