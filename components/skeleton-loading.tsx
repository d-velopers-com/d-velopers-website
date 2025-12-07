"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

/**
 * Generic skeleton loading component
 * Shows a clean, static skeleton that simulates a typical page layout
 * No shimmer animation, no scrollbars
 */
export function SkeletonLoading() {
  return (
    <div className="flex flex-col items-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
      <div className="max-w-7xl w-full space-y-6">
        {/* Header skeleton */}
        <Card className="w-full">
          <CardBody className="py-6 px-6">
            <div className="text-center space-y-3">
              <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
              <Skeleton className="h-4 w-72 mx-auto rounded-lg" />
            </div>
          </CardBody>
        </Card>

        {/* Search bar skeleton */}
        <Skeleton className="h-14 w-full rounded-2xl" />

        {/* Grid of cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-default-200">
                <Skeleton className="h-5 w-48 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </CardHeader>
              <CardBody className="p-0">
                <Skeleton className="h-48 w-full" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard skeleton loading
 */
export function DashboardSkeletonLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 overflow-hidden">
      <div className="max-w-4xl w-full space-y-6">
        <Card className="w-full">
          <CardBody className="p-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="rounded-full w-24 h-24" />
              <Skeleton className="rounded-lg w-48 h-6" />
              <Skeleton className="rounded-lg w-64 h-4" />
            </div>
          </CardBody>
        </Card>

        <Card className="w-full">
          <CardBody className="p-6 space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/**
 * Table skeleton loading
 */
export function TableSkeletonLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 overflow-hidden">
      <div className="max-w-6xl w-full space-y-6">
        <Card className="w-full">
          <CardHeader className="px-6 py-4">
            <Skeleton className="h-8 w-48 rounded-lg" />
          </CardHeader>
        </Card>

        <Card className="w-full">
          <CardBody className="p-4">
            <div className="space-y-3">
              {/* Table header */}
              <div className="flex gap-4 pb-3 border-b border-default-200">
                <Skeleton className="h-4 w-1/4 rounded-lg" />
                <Skeleton className="h-4 w-1/4 rounded-lg" />
                <Skeleton className="h-4 w-1/4 rounded-lg" />
                <Skeleton className="h-4 w-1/4 rounded-lg" />
              </div>
              {/* Table rows */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 py-3">
                  <Skeleton className="h-4 w-1/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/4 rounded-lg" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
