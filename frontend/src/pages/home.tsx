

import home_image from "../assets/home/home_image.png"
import bg_service from "../assets/home/bg_service.jpg"

import Header from "../components/header"

import { motion } from "framer-motion"
import Service from "../components/service"

import { TbCheckupList } from "react-icons/tb";
import { MdOutlineVaccines } from "react-icons/md";
import { RiScissorsFill } from "react-icons/ri";
import { TbDental } from "react-icons/tb";
import { FaPhone } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { FaArrowCircleRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom"
import Product from "../components/product"

import { productsList } from "../config/ProductsList"
import { useState } from "react"

export default function Home() {
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleAppointmentClick =() => {
        navigate('/set-appointment');
    }

    const onContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        const formData = Object.fromEntries(new FormData(e.currentTarget).entries());

        await fetch(`${apiUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(async (res) => {
            const responseData = await res.json();
            if (res.ok) {
                alert(responseData.message);

                if (e.currentTarget) e.currentTarget.reset();
                
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message || 'Failed to send message.'}`);
            }
        }).catch((err) => {
            alert(`Error: ${err.message || 'Failed to send message.'}`);
        }).finally(() => {
            setLoading(false);
        })
    }

    return (
        <>
        <title>Pet Medics - Veterinary Clinic</title>
        <Header />

        <main className="h-screen w-full max-w-full top-16 md:top-20 pt-4 md:pt-8 bg-gradient-to-b from-[#1BA3AB] to-[#145956]">
            <section id="home" className="w-full min-h-screen flex flex-col md:flex-row md:justify-normal justify-center items-center">
                <img src={home_image} alt="Home Image" className="w-full h-screen object-cover object-center md:h-full"></img>

                <motion.div className="w-full self-center md:w-1/2 md:ml-12 h-full absolute flex flex-col justify-center items-center px-4 md:px-8 text-center md:text-left"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">Comprehensive Pet Care at Your Fingertips</h1>
                    <p className="text-lg md:text-xl text-white drop-shadow-md mb-6">Your one-stop solution for all your pet's health needs. Schedule appointments, access medical records, and get expert advice from licensed veterinarians.</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    className="mt-4 md:mt-0 bg-brand-primary-500 hover:bg-brand-primary-600 text-white py-3 px-6 text-lg rounded-md shadow-lg transition-all duration-200 ease-out md:self-start"
                    onClick={handleAppointmentClick}>Set An Appointment <FaArrowCircleRight className="inline ml-2"/> </motion.button>
                </motion.div>
            </section>

             <section id="products" className="min-h-screen w-full bg-gradient-to-b px-6 md:px-32 from-[#145956] to-[#0E3B3E] items-center justify-center flex flex-col py-12">
                {/* Products Section */}
                <motion.div
                    className="w-full text-white"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg text-center mb-8">Our Products</h2>
                    <p className="text-center mb-8">Explore our range of high-quality pet care products designed to keep your furry friends happy and healthy.</p>

                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 place-content-center place-items-center justify-center">
                        {productsList.map((product, idx) => (
                            <Product
                                key={idx}
                                img={product.img}
                                title={product.title}
                                description={product.description}
                                price={product.price}
                            />
                        ))}
                    </div>
                </motion.div>
            </section>


            <section id="about" className="min-h-screen w-full text-center flex flex-col justify-center items-center bg-gradient-to-b px-6 md:px-32 from-[#145956] to-[#0E3B3E]">
                {/* About Section */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }}
                    viewport={{ once: true }}>
                    <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center mb-8">About Us</h2>
                    <p className="text-md md:text-lg text-white drop-shadow-md mb-6">Pet Medics Veterinary Clinic is a trusted veterinary healthcare provider based in Muntinlupa City, dedicated to delivering high-quality, compassionate, and professional care for companion animals. With a commitment to animal wellness, our clinic offers a safe and supportive environment where pets receive thorough medical attention, and pet owners are guided with empathy and expertise.</p>
                    <p className="text-md md:text-lg text-white drop-shadow-md mb-6">We are dedicated to providing the best care for your pets. Our team of experienced veterinarians and support staff are here to help you with all your pet's needs.</p>
                </motion.div>
            </section>

            <section id="services" className="min-h-screen w-full text-center flex flex-col justify-center items-center bg-gradient-to-b px-6 md:px-32 from-[#0E3B3E] to-[#082726]">
                {/* Services Section */}
                <img src={bg_service} alt="Background Service" className="absolute w-full h-full object-cover opacity-20 pointer-events-none"></img>

                <motion.div
                    className="w-full text-white"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg text-center mb-8">Our Services</h2>
                </motion.div>
                <motion.div
                    className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 place-content-center place-items-center justify-center text-white"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Service
                        icon={<TbCheckupList className="text-4xl mx-auto mb-4"/>}
                        title="General Check-ups"
                        description="Comprehensive health examinations to ensure your pet's well-being."
                        />
                    <Service 
                        icon={<MdOutlineVaccines className="text-4xl mx-auto mb-4"/>}
                        title="Vaccinations"
                        description="Stay up-to-date with your pet's vaccinations and preventive care."
                    />
                    <Service 
                        icon={<RiScissorsFill className="text-4xl mx-auto mb-4"/>}
                        title="Grooming Services"
                        description="Professional grooming to keep your pet looking and feeling great."
                    />
                    <Service 
                        icon={<TbDental className="text-4xl mx-auto mb-4"/>}
                        title="Dental Care"
                        description="Maintain your pet's oral health with our dental care services."
                        additional="col-span-full"
                    />
                </motion.div>
            </section>
            

            <section id="contact" className="min-h-screen mt-11 w-full text-center flex flex-col justify-center items-center bg-gradient-to-b px-6 md:px-32 from-[#fbfbfb] to-black]">
                {/* Contact Section */}
                <motion.div
                    className="w-full text-[#444444]"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }}
                >
                    <h2 className="text-lg md:text-xl font-semibold text-center mb-1">Contact Us</h2>
                    <p className="text-sm md:text-md drop-shadow-md mb-8">Have questions or need assistance? Reach out to our friendly team for support and information about our services.</p>
                    
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <div className="flex flex-col md:max-w-sm">
                            <div className="flex flex-col text-left">
                                <h3 className="text-lg mb-4">ADDRESS</h3>
                                <p className="text-sm md:text-md drop-shadow-md"><FaHouse className="inline mr-1" /> Blk98 L8b, C.Arellano St. Ph2. Katarungan Village, Poblacion, Muntinlupa City</p>
                            </div>
                            <div className="flex flex-col text-left">
                                <h3 className="text-lg mb-4 mt-4">CONTACT</h3>
                                <p className="text-sm md:text-md drop-shadow-md"><FaPhone className="inline mr-1"/> (+63) 968 388 2727</p>
                                <p className="text-sm md:text-md drop-shadow-md"><FaEnvelope className="inline mr-1"/> petmedicsvetclinic21@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex flex-col w-full md:w-3/4">
                            <form onSubmit={onContactSubmit}>
                                <div className="flex flex-col text-left mb-4">
                                    <label htmlFor="name" className="mb-2">Name *</label>
                                    <input type="text" id="name" name="name" placeholder="Enter your name" className="w-full p-3 font-light text-sm border border-gray-300 bg-black/5 rounded-md" required/>
                                </div>
                                <div className="flex flex-col text-left mb-4">
                                    <label htmlFor="email" className="mb-2">Email *</label>
                                    <input type="email" id="email" name="email" placeholder="Enter your email" className="w-full p-3 font-light text-sm border border-gray-300 bg-black/5 rounded-md" required/>
                                </div>
                                <div className="flex flex-col text-left mb-4">
                                    <label htmlFor="message" className="mb-2">Message *</label>
                                    <textarea id="message" name="message" rows={4} placeholder="Enter your message" className="w-full p-3 font-light text-sm border border-gray-300 bg-black/5 rounded-md" required></textarea>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={loading}
                                className="disabled:cursor-not-allowed cursor-pointer mt-4 md:mt-0 bg-brand-primary-500 hover:bg-brand-primary-600 disabled:bg-brand-primary-900 text-white font-semibold py-3 px-6 text-lg rounded-md shadow-lg transition-all duration-200 ease-out">{`${loading ? 'Sending...' : 'Send Message'}`}</motion.button>
                            </form>                        
                        </div>
                    </div>
                </motion.div>
            </section>

            <footer className="w-full mt-8 h-16 bottom-0 relative">
                <div className="w-full h-full bg-[#145956] flex justify-center items-center">
                    <p className="text-white text-center text-sm md:text-md">© 2025 Pet Medics Veterinary Clinic. All rights reserved.</p>
                </div>
            </footer>   
            </main>
        </>
    )
}