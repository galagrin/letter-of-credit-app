import Link from "next/link";

interface DashboardNavLinkProps {
    href: string;
    children: React.ReactNode;
}

export function DashboardNavLink({ href, children }: DashboardNavLinkProps) {
    return (
        <Link
            href={href}
            className="
        block w-full
        rounded-md border border-gray-300
        px-4 py-3
        text-center text-md font-medium
        hover:bg-gray-50 hover:border-gray-400
        transition-colors
      "
        >
            {children}
        </Link>
    );
}
