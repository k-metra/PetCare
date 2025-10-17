export default function NavItem({ children, href }) {
    return (
        <li><a className="hover:underline underline-offset-8 decoration-2 decoration-white/70 transition-all duration-200 ease-out cursor-pointer px-3" href={href}>{children}</a></li>
    )
}