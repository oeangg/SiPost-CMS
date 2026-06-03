"use client";

import {
  BarChart3,
  ChevronRight,
  FileText,
  GalleryVerticalEnd,
  LayoutDashboard,
  Link2,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const sidebarMenu = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Content",
    url: "/dashboard/content",
    icon: FileText,
    items: [
      {
        title: "Daftar Konten",
        url: "/dashboard/content",
      },
      {
        title: "Buat Konten",
        url: "/dashboard/content/new",
      },
    ],
  },
  {
    title: "Post Metrics",
    url: "/dashboard/input-metrics",
    icon: BarChart3,
  },
  {
    title: "Affiliate Summary",
    url: "/dashboard/input-metrics",
    icon: Link2,
  },
  {
    title: "Pengaturan",
    url: "/dashboard",
    icon: Settings,
  },
];

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex min-w-0 items-center gap-2 text-sm font-bold text-foreground">
      <Link href="/dashboard" className="hidden hover:underline md:block">
        Dashboard
      </Link>
      {pathSegments.slice(1).map((segment, index) => {
        const isLast = index === pathSegments.length - 2;
        const href = `/${pathSegments.slice(0, index + 2).join("/")}`;

        return (
          <div
            key={`${segment}-${href}`}
            className="flex min-w-0 items-center gap-2"
          >
            <ChevronRight
              className="hidden h-4 w-4 shrink-0 md:block"
              aria-hidden="true"
            />
            {isLast ? (
              <span className="truncate font-black text-foreground">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link href={href} className="truncate hover:underline">
                {formatSegment(segment)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function HeaderSidebar() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="border-2 border-border bg-primary shadow-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-md border-2 border-border bg-accent text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" aria-hidden="true" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-black ">SiPost CMS.</span>
            <span className="truncate text-xs font-bold">
              Content Intelligence
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {sidebarMenu.map((item) => {
          const Icon = item.icon;
          const hasSubItems = Boolean(item.items?.length);
          const isSubItemActive = item.items?.some(
            (subItem) => pathname === subItem.url,
          );
          const isParentActive =
            pathname === item.url ||
            (item.url !== "/dashboard" && pathname.startsWith(item.url));

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isParentActive}
                  className="font-black"
                >
                  <Link href={item.url}>
                    <Icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={Boolean(isSubItemActive)}
                className="font-black"
              >
                <Link href={item.url}>
                  <Icon aria-hidden="true" />
                  <span>{item.title}</span>
                  <ChevronRight
                    className="ml-auto transition-transform group-data-[collapsible=icon]:hidden"
                    aria-hidden="true"
                  />
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.items?.map((subItem) => {
                  const isCurrent = pathname === subItem.url;

                  return (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isCurrent}
                        className="font-bold"
                      >
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r-2 border-border bg-sidebar">
      <SidebarHeader className="mb-8 p-3">
        <HeaderSidebar />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SignOutButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function DashboardShell({
  children,
  userEmail,
  userName,
}: {
  children: ReactNode;
  userEmail: string;
  userName: string;
}) {
  const firstName = userName.split(" ")[0] || userEmail;

  return (
    <SidebarProvider className="bg-transparent">
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b-2 border-border bg-primary shadow-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 bg-foreground data-[orientation=vertical]:h-6 data-[orientation=vertical]:w-0.5"
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <DashboardBreadcrumb />
              <div className="hidden min-w-0 border-2 border-border bg-card px-3 py-1 text-right shadow-xs sm:block">
                <p className="truncate text-sm font-black">{firstName}</p>
                <p className="truncate text-xs font-bold text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
