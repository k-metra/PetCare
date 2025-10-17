import pet_medics_logo from "../assets/home/pet_medics_logo.png"
import pet_medics_symbol from "../assets/home/pet_medics_symbol.png"

export default function HeroIcon() {
    return (
        <>
        <img src={pet_medics_logo} alt="Pet Medics Logo" className="hidden md:block object-fill h-14 cursor-pointer hover:bg-black/20 transition-all duration-200 ease-out bg-transparent"></img>

        <img src={pet_medics_symbol} alt="Pet Medics Symbol" className="md:hidden block object-fill h-14 "></img>
        </>
    )
}