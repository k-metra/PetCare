import HeroIcon from "./HeroIcon"
import NavBar from "./navbar"

export default function Header() {
    return (
        <header className="fixed p-4 px-7 left-0 bg-[#1BA3AB] flex flex-row justify-between items-center top-0 w-screen h-16 md:h-20 z-50">
            <HeroIcon />

            <NavBar />
        </header>
    )
}