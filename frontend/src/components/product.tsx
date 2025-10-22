import { motion } from "framer-motion";

type ProductDetails = {
    img: string;
    title: string;
    description?: string | null;
    price: string;
}

export default function Product({ img, title, description, price }: ProductDetails) {
    return (
        <motion.div 
        whileHover={{scale: 1.03, y: -5, transition: { duration: 0.3, ease: "easeOut" }}}
        className="border border-gray-300 drop-shadow-lg cursor-pointer bg-white rounded-lg p-4 flex flex-col items-center shadow-md hover:shadow-lg max-w-72 transition-shadow duration-300">
            <img src={img} alt={title} className="min-w-32 min-h-32 max-h-full max-w-full object-cover mb-4" />
            <hr className="border-t border-black/20 w-full mb-4"/>
            <h3 className="text-lg text-zinc-800 font-semibold text-ellipsis whitespace-nowrap mb-2">{title}</h3>
            {description && <p className="text-gray-600 text-sm mb-4 text-center">{description}</p>}
            <span className="text-xl font-bold text-green-600">{price}</span>
        </motion.div>
    )
}