"use client";

import React, { useEffect } from "react";
import HistoryCard from "./history-card";
import { useHistoryStore } from "../store/history-store";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis, PaginationLink } from "@roro-ai/ui/components/ui/pagination";
import PracticeButton from "@/components/dashboard/practice-button";

export default function History() {
  const { rooms, total, page, pageSize, fetchRooms } = useHistoryStore();

  useEffect(() => {
    fetchRooms(page, pageSize);
  }, [fetchRooms, page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchRooms(newPage, pageSize);
    }
  };

  return (
    <div className="space-y-6 mb-4">
      <div className="flex flex-col space-y-4">
        {rooms.map((room) => (
          <HistoryCard key={room.id} title={room.topic} description={room.prompt} time={room.createdAt} />
        ))}
      </div>
      {total > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {page !== 1 && (
                <PaginationItem>
                <PaginationPrevious size="sm" onClick={() => handlePageChange(page - 1)} />
              </PaginationItem>
              )}

              {page > 2 && (
                <PaginationItem>
                  <PaginationLink size="sm" onClick={() => handlePageChange(1)}>1</PaginationLink>
                </PaginationItem>
              )}

              {page > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {Array.from({ length: 3 }, (_, i) => page - 1 + i)
                .filter((p) => p >= 1 && p <= totalPages)
                .map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink size="sm" isActive={p === page} onClick={() => handlePageChange(p)}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {page < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink size="sm" onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
              )}

              {!(page >= totalPages) && (
                <PaginationItem>
                <PaginationNext size="sm" onClick={() => handlePageChange(page + 1)} />
              </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold text-center">No History Available</h2>
          <p className="text-center text-muted-foreground">Create a session to start practicing</p>
          <PracticeButton />
        </div>
      )}
    </div>
  );
}
