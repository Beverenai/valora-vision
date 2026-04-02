import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

interface AgentBreadcrumbsProps {
  agentName: string;
  provincia?: string | null;
  ciudad?: string | null;
  agencyName?: string | null;
  agencySlug?: string | null;
}

export default function AgentBreadcrumbs({
  agentName,
  provincia,
  ciudad,
  agencyName,
  agencySlug,
}: AgentBreadcrumbsProps) {
  const isMobile = useIsMobile();

  // Build middle crumbs
  const middleCrumbs = [
    provincia ? { label: provincia, href: `/agentes?provincia=${encodeURIComponent(provincia)}` } : null,
    ciudad ? { label: ciudad, href: `/agentes?ciudad=${encodeURIComponent(ciudad)}` } : null,
    agencyName && agencySlug ? { label: agencyName, href: `/agentes/${agencySlug}` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <Breadcrumb className="mb-2">
      <BreadcrumbList className="text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="font-serif hover:text-[#D4713B] transition-colors">
              Inicio
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/agentes" className="font-serif hover:text-[#D4713B] transition-colors">
              Agentes
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {middleCrumbs.length > 0 && (
          <>
            <BreadcrumbSeparator />
            {isMobile && middleCrumbs.length > 1 ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbEllipsis className="h-6 w-6" />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {/* Show last middle crumb on mobile */}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={middleCrumbs[middleCrumbs.length - 1].href}
                      className="font-serif hover:text-[#D4713B] transition-colors"
                    >
                      {middleCrumbs[middleCrumbs.length - 1].label}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : (
              middleCrumbs.map((crumb, i) => (
                <span key={crumb.label} className="contents">
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        to={crumb.href}
                        className="font-serif hover:text-[#D4713B] transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </span>
              ))
            )}
          </>
        )}

        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-serif text-[#D4713B] font-medium">
            {agentName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
