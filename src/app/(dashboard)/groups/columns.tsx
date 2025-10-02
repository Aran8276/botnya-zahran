"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Group } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import GroupActions from "@/components/Groups/GroupActions";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/utils/date-formatter";

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
      <div className="flex flex-wrap gap-1 max-w-xs">
        {row.original.adminSerializedIds.map((id, index) => (
          <Badge key={index} variant="secondary">
            {id}
          </Badge>
        ))}
      </div>
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
    cell: ({ row }) => <GroupActions group={row.original} />,
  },
];
