import HeroIcon from "../components/HeroIcon"
import NavBar from "../components/navbar"
import NavItem from "../components/navitem"

import home_image from "../assets/home/home_image.png"

import { motion } from "framer-motion"

export default function Home() {
    return (
        <>
        <header className="fixed p-4 px-7 left-0 bg-[#1BA3AB] flex flex-row justify-between items-center top-0 w-screen h-16 md:h-20 z-50">
            <HeroIcon />

            <NavBar />
        </header>

        <main className="h-screen w-full max-w-full top-16 md:top-20 pt-4 md:pt-8 bg-gradient-to-b from-[#1BA3AB] to-[#145956]">
            <section id="home" className="w-full h-3/4 flex flex-col md:flex-row md:justify-normal justify-center items-center">
                <img src={home_image} alt="Home Image" className="object-cover h-full w-full"></img>

                <motion.div className="w-full self-center md:w-1/2 md:ml-12 h-full absolute flex flex-col justify-center items-center px-4 md:px-8 text-center md:text-left"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">Comprehensive Pet Care at Your Fingertips</h1>
                    <p className="text-lg md:text-xl text-white drop-shadow-md mb-6">Your one-stop solution for all your pet's health needs. Schedule appointments, access medical records, and get expert advice from licensed veterinarians—all in one convenient app.</p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    className="mt-4 md:mt-0 bg-brand-primary-500 hover:bg-brand-primary-600 text-white font-semibold py-3 px-6 text-lg rounded-md shadow-lg transition-all duration-200 ease-out">Get Started</motion.button>
                </motion.div>
            </section>


            <section id="about" className="h-full w-full text-center flex flex-col justify-center items-center bg-gradient-to-b px-6 md:px-32 from-[#145956] to-[#0E3B3E]">
                {/* About Section */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}>
                    <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center mb-8">About Us</h2>
                    <p className="text-md md:text-lg text-white drop-shadow-md mb-6">Pet Medics Veterinary Clinic is a trusted veterinary healthcare provider based in Muntinlupa City, dedicated to delivering high-quality, compassionate, and professional care for companion animals. With a commitment to animal wellness, our clinic offers a safe and supportive environment where pets receive thorough medical attention, and pet owners are guided with empathy and expertise.</p>
                    <p className="text-md md:text-lg text-white drop-shadow-md mb-6">We are dedicated to providing the best care for your pets. Our team of experienced veterinarians and support staff are here to help you with all your pet's needs.</p>
                </motion.div>
            </section>
            </main>
        </>
    )
}