export default function NavItem({ children, onClick, href } : { children: React.ReactNode, onClick?: () => void, href?: string }) {
    return (
        <li className="list-none block">
            <a className="hover:underline underline-offset-8 text-left block decoration-2 decoration-white/70 transition-all duration-200 ease-out cursor-pointer px-3" href={href} onClick={onClick}>
                {children}
            </a>
        </li>
    )
}