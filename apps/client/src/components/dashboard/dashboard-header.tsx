"use client"
import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@roro-ai/ui/components/ui/breadcrumb'
import GithubStarButton from '../landing-page/github-start-button'
import { Separator } from '@roro-ai/ui/components/ui/separator'
import { SidebarTrigger } from '@roro-ai/ui/components/ui/sidebar'
import { usePathname } from 'next/navigation'

export default function DashboardHeader() {
  const pathname = usePathname()

  
  const pathSegments = pathname.split('/').filter(segment => segment)
    .map((segment, index, array) => {
      const href = `/${array.slice(0, index + 1).join('/')}`
      return {
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href
      }
    })
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4 border-b">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {pathSegments.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}

            {pathSegments.map((segment, index) => (
              <React.Fragment key={segment.href}>
                <BreadcrumbItem>
                  {index === pathSegments.length - 1 ? (
                    <BreadcrumbPage>{segment.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={segment.href}>{segment.name}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <GithubStarButton />
      </div>
    </header>
  )
}
