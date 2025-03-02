"use client"
 
import { ColumnDef } from "@tanstack/react-table"

export type RoomSession = {
    id: string,
    roomName: string,
    topic: string,
    date: Date
}

export const columns: ColumnDef<RoomSession>[] = [
    {
        accessorKey: "roomName",
        header: "Room Name",
    },
    {
        accessorKey: "topic",
        header: "Topic",
    },
    {
        accessorKey: "date",
        header: "Date",
    },   
]