import NavItem from "./navitem"

export default function NavBar() {
    return (
        <nav>
            <ul className="hidden md:flex flex-row text-center gap-2 text-white">
                <NavItem href="/">Home</NavItem>
                <NavItem href="/about">About</NavItem>
                <NavItem href="/services">Services</NavItem>
                <NavItem href="/contact">Contact</NavItem>
            </ul>
        </nav>
    )
}