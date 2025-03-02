"use client"

import { useState, useEffect, useCallback } from "react"
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import { format } from "date-fns"

import { Button } from "@roro-ai/ui/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roro-ai/ui/components/ui/table"
import { useHistoryStore } from "../store/history-store"
import { columns } from "./columns"

export function RoomHistoryTable() {
  const { rooms, total, page, pageSize, fetchRooms } = useHistoryStore()
  const [isLoading, setIsLoading] = useState(false)
  const pageCount = Math.ceil(total / pageSize)

  const data = rooms.map((room) => ({
    id: room.id,
    roomName: room.name,
    topic: room.topic,
    date: room.createdAt,
  }))

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: {
        pageIndex: page - 1, 
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const { pageIndex, pageSize: newPageSize } = updater({
          pageIndex: page - 1,
          pageSize,
        })
        loadRooms(pageIndex + 1, newPageSize)
      }
    },
  })

  const loadRooms = useCallback(
    async (newPage: number, newPageSize: number) => {
      setIsLoading(true)
      await fetchRooms(newPage, newPageSize)
      setIsLoading(false)
    },
    [fetchRooms],
  )

  useEffect(() => {
    loadRooms(page, pageSize)
  }, [page, pageSize, loadRooms])

  return (
    <div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === "date"
                         ? (cell.getValue() 
                            ? format(new Date(cell.getValue() as string), "PPP") 
                            : "No date")
                            : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {data.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, total)} of {total}{" "}
          entries
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

