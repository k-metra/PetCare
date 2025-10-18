import HeroIcon from "../components/HeroIcon"
import NavBar from "../components/navbar"
import NavItem from "../components/navitem"

import home_image from "../assets/home/home_image.png"

export default function Home() {
    return (
        <>
        <header className="fixed p-4 px-7 left-0 bg-[#1BA3AB] flex flex-row justify-between items-center top-0 w-screen h-16 md:h-20 z-50">
            <HeroIcon />

            <NavBar />
        </header>

        <main className="h-screen w-screen top-16 md:top-20 pt-4 md:pt-8 bg-gradient-to-b from-[#1BA3AB] to-[#145956]">
            <div className="w-full h-3/4 flex flex-col md:flex-row md:justify-normal justify-center items-center">
                <img src={home_image} alt="Home Image" className="object-cover h-full w-full"></img>

                <div className="w-full self-center md:w-1/2 md:ml-12 h-full absolute flex flex-col justify-center items-center px-4 md:px-8 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">Comprehensive Pet Care at Your Fingertips</h1>
                    <p className="text-lg md:text-xl text-white drop-shadow-md mb-6">Your one-stop solution for all your pet's health needs. Schedule appointments, access medical records, and get expert advice from licensed veterinarians—all in one convenient app.</p>

                    <button className="mt-4 md:mt-0 bg-brand-primary-500 hover:bg-brand-primary-600 text-white font-semibold py-3 px-6 text-lg rounded-md shadow-lg transition-all duration-200 ease-out">Get Started</button>
                </div>
            </div>
        </main>
        </>
    )
}