import { motion } from "framer-motion"

export default function Service({ title, description, icon, additional }: { title: string; description: string; icon: React.ReactNode, additional?: string | null }) {
    return (
        <motion.div 
        whileHover={{ scale: 1.05 }}
        transition= {{ type: "tween", duration: 0.2 }}
        className={`bg-white/10 drop-shadow-xl rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 ease-out ${additional ?? ''}`}>
            {icon}
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <p>{description}</p>
        </motion.div>
    )
}