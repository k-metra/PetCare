import HeroIcon from "../components/HeroIcon"
import NavBar from "../components/navbar"
import NavItem from "../components/navitem"

export default function Home() {
    return (
        <header className="fixed p-4 px-7 left-0 bg-[#1BA3AB] flex flex-row justify-between items-center top-0 w-screen h-16 md:h-20 ">
            <HeroIcon />

            <NavBar />
        </header>
    )
}